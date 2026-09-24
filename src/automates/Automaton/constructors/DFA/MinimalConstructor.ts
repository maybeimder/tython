import { Concatenation } from "../../../../regex/models/regex/Concatenation.ts";
import { Epsilon } from "../../../../regex/models/regex/Epsilon.ts";
import { LanguageRef } from "../../../../regex/models/regex/LanguageRef.ts";
import { Optional } from "../../../../regex/models/regex/Optional.ts";
import { Plus } from "../../../../regex/models/regex/Plus.ts";
import { RegEx } from "../../../../regex/models/regex/RegEx.ts";
import { Star } from "../../../../regex/models/regex/Star.ts";
import { Union } from "../../../../regex/models/regex/Union.ts";
import { Automaton } from "../../Automaton.ts";
import { Fragment, GraphConstructor } from "../GraphConstructor.ts";

interface Info {
      nullable: boolean;
      firstpos: Set<number>;
      lastpos: Set<number>;
}

/**
 * Construcción directa del DFA (mínimo en la práctica) a partir de la regex,
 * usando followpos + construcción de subconjuntos (subset construction) en
 * un solo paso, sin pasar primero por un NFA separado.
 *
 * A diferencia de Thompson y Glushkov, esto NO es composicional por nodo:
 * cada estado del DFA es un CONJUNTO de posiciones, y ese conjunto solo se
 * puede calcular con el followpos de TODO el árbol ya completo. Por eso hay
 * dos fases bien separadas:
 *
 *   Fase 1 (analyze):     recorre el árbol y calcula nullable/firstpos/
 *                         lastpos por nodo, llenando followpos y el símbolo
 *                         de cada posición (posSymbol) como efecto
 *                         secundario. Aquí NO se crean estados del
 *                         automaton todavía -- las posiciones son solo
 *                         números internos de contabilidad.
 *
 *   Fase 2 (determinize): construcción de subconjuntos clásica. Cada
 *                         conjunto de posiciones alcanzable se convierte en
 *                         UN estado real (automaton.createState()), con
 *                         como máximo una arista de salida por símbolo
 *                         (totalmente determinista).
 *
 * Aceptación: se aumenta la regex con un marcador de fin interno ('#' en tu
 * notación a mano) que NO es un símbolo real ni un estado visible -- solo
 * sirve para detectar, dentro de un conjunto, si se puede terminar ahí.
 * Como tu Automaton/Fragment esperan UN solo estado de aceptación (el
 * `.right` del fragmento raíz), todos los conjuntos de aceptación se
 * conectan con una arista null hacia un único estado final sintético,
 * igual que en tus dibujos a mano donde todo termina apuntando a un solo `#`.
 *
 * Nota sobre "mínimo": followpos + subset construction ya suele dar el DFA
 * mínimo o muy cercano (para (a|b)*abb da exactamente los 4 estados
 * esperados, sin pasos extra). No hay garantía matemática de minimalidad
 * absoluta en el caso general -- para esa garantía haría falta correr
 * Hopcroft/Moore sobre el resultado. Se puede agregar como paso opcional
 * después si lo necesitas.
 */
export class MinimalDFAConstructor implements GraphConstructor<Automaton, RegEx> {
      private posSymbol = new Map<number, string>();
      private followpos = new Map<number, Set<number>>();
      private alphabet = new Set<string>();
      private posCounter = 0;
      private endMarkerPosition = -1;

      public build(automaton: Automaton, node: RegEx): Fragment {
            this.posSymbol.clear();
            this.followpos.clear();
            this.alphabet.clear();
            this.posCounter = 0;

            const rootInfo = this.analyze(node);

            this.posCounter += 1;
            this.endMarkerPosition = this.posCounter;
            this.followpos.set(this.endMarkerPosition, new Set());

            for (const position of rootInfo.lastpos) {
                  this.followpos.get(position)!.add(this.endMarkerPosition);
            }

            const rootFirstpos = rootInfo.nullable
                  ? this.union(
                          rootInfo.firstpos,
                          new Set([this.endMarkerPosition]),
                    )
                  : rootInfo.firstpos;

            const raw = this.determinize(rootFirstpos);
            const minimized = this.minimize(raw);

            return this.materialize(automaton, minimized);
      }

      // ---------------------------------------------------------------
      // FASE 1: análisis (nullable, firstpos, lastpos, followpos)
      // idéntico al de GlushkovConstructor / MinimalDfaConstructor
      // ---------------------------------------------------------------

      private analyze(node: RegEx): Info {
            if (node instanceof Epsilon)
                  return {
                        nullable: true,
                        firstpos: new Set(),
                        lastpos: new Set(),
                  };
            if (node instanceof LanguageRef)
                  return this.analyzeLanguageRef(node);
            if (node instanceof Union) return this.analyzeUnion(node);
            if (node instanceof Concatenation)
                  return this.analyzeConcatenation(node);
            if (node instanceof Star) return this.analyzeStar(node);
            if (node instanceof Plus) return this.analyzePlus(node);
            if (node instanceof Optional) return this.analyzeOptional(node);

            throw new Error(
                  `Regex class not supported: ${node.constructor.name}`,
            );
      }

      private analyzeLanguageRef(node: LanguageRef): Info {
            this.posCounter += 1;
            const position = this.posCounter;

            this.posSymbol.set(position, node.name);
            this.followpos.set(position, new Set());
            this.alphabet.add(node.name);

            return {
                  nullable: false,
                  firstpos: new Set([position]),
                  lastpos: new Set([position]),
            };
      }

      private analyzeUnion(node: Union): Info {
            let nullable = false;
            const firstpos = new Set<number>();
            const lastpos = new Set<number>();

            for (const alternative of node.alternatives) {
                  const info = this.analyze(alternative);
                  nullable = nullable || info.nullable;
                  info.firstpos.forEach((p) => firstpos.add(p));
                  info.lastpos.forEach((p) => lastpos.add(p));
            }

            return { nullable, firstpos, lastpos };
      }

      private analyzeConcatenation(node: Concatenation): Info {
            let acc: Info | null = null;

            for (const expression of node.expressions) {
                  const info = this.analyze(expression);

                  if (acc === null) {
                        acc = info;
                        continue;
                  }

                  for (const position of acc.lastpos) {
                        info.firstpos.forEach((p) =>
                              this.followpos.get(position)!.add(p),
                        );
                  }

                  acc = {
                        nullable: acc.nullable && info.nullable,
                        firstpos: acc.nullable
                              ? this.union(acc.firstpos, info.firstpos)
                              : acc.firstpos,
                        lastpos: info.nullable
                              ? this.union(info.lastpos, acc.lastpos)
                              : info.lastpos,
                  };
            }

            return acc!;
      }

      private analyzeStar(node: Star): Info {
            const info = this.analyze(node.expression);
            this.addLoop(info);
            return {
                  nullable: true,
                  firstpos: info.firstpos,
                  lastpos: info.lastpos,
            };
      }

      private analyzePlus(node: Plus): Info {
            const info = this.analyze(node.expression);
            this.addLoop(info);
            return {
                  nullable: info.nullable,
                  firstpos: info.firstpos,
                  lastpos: info.lastpos,
            };
      }

      private analyzeOptional(node: Optional): Info {
            const info = this.analyze(node.expression);
            return {
                  nullable: true,
                  firstpos: info.firstpos,
                  lastpos: info.lastpos,
            };
      }

      private addLoop(info: Info): void {
            for (const position of info.lastpos) {
                  info.firstpos.forEach((p) =>
                        this.followpos.get(position)!.add(p),
                  );
            }
      }

      private union(a: Set<number>, b: Set<number>): Set<number> {
            return new Set([...a, ...b]);
      }

      // ---------------------------------------------------------------
      // FASE 2: construcción de subconjuntos -> AFD determinista y
      // COMPLETO (con estado trampa explícito para que la minimización
      // funcione correctamente sobre una función de transición total)
      // ---------------------------------------------------------------

      private determinize(startSet: Set<number>) {
            const key = (set: Set<number>) =>
                  [...set].sort((a, b) => a - b).join(",");

            const idOf = new Map<string, number>();
            const setOf: Set<number>[] = [];
            const pending: number[] = [];

            const getOrCreate = (set: Set<number>): number => {
                  const k = key(set);
                  const existing = idOf.get(k);
                  if (existing !== undefined) return existing;

                  const id = setOf.length;
                  idOf.set(k, id);
                  setOf.push(set);
                  pending.push(id);
                  return id;
            };

            const start = getOrCreate(startSet);
            const transitions = new Map<number, Map<string, number>>();
            const accepting = new Set<number>();

            while (pending.length > 0) {
                  const id = pending.shift()!;
                  const currentSet = setOf[id];
                  if (currentSet.has(this.endMarkerPosition)) accepting.add(id);

                  const bySymbol = new Map<string, number>();
                  for (const symbol of this.alphabet) {
                        const relevant = [...currentSet].filter(
                              (p) => this.posSymbol.get(p) === symbol,
                        );
                        if (relevant.length === 0) continue;

                        const nextSet = new Set<number>();
                        relevant.forEach((p) =>
                              this.followpos
                                    .get(p)!
                                    .forEach((q) => nextSet.add(q)),
                        );
                        if (nextSet.size === 0) continue;

                        bySymbol.set(symbol, getOrCreate(nextSet));
                  }
                  transitions.set(id, bySymbol);
            }

            // Estado trampa: recibe todas las transiciones que faltaban,
            // y se queda pegado a sí mismo (nunca acepta).
            const trap = setOf.length;
            transitions.set(
                  trap,
                  new Map([...this.alphabet].map((s) => [s, trap])),
            );

            for (const [id, bySymbol] of transitions) {
                  if (id === trap) continue;
                  for (const symbol of this.alphabet) {
                        if (!bySymbol.has(symbol)) bySymbol.set(symbol, trap);
                  }
            }

            return {
                  totalStates: trap + 1,
                  transitions,
                  accepting,
                  start,
                  trap,
            };
      }

      // ---------------------------------------------------------------
      // FASE 3: minimización por llenado de tablas (Myhill-Nerode)
      // ---------------------------------------------------------------

      private minimize(raw: ReturnType<typeof this.determinize>) {
            const { totalStates, transitions, accepting, start, trap } = raw;

            // distinguishable[i][j] (i < j) = true si i y j son distinguibles
            const distinguishable: boolean[][] = Array.from(
                  { length: totalStates },
                  () => new Array(totalStates).fill(false),
            );

            for (let i = 0; i < totalStates; i++) {
                  for (let j = i + 1; j < totalStates; j++) {
                        if (accepting.has(i) !== accepting.has(j)) {
                              distinguishable[i][j] = true;
                        }
                  }
            }

            let changed = true;
            while (changed) {
                  changed = false;
                  for (let i = 0; i < totalStates; i++) {
                        for (let j = i + 1; j < totalStates; j++) {
                              if (distinguishable[i][j]) continue;

                              for (const symbol of this.alphabet) {
                                    const ti = transitions.get(i)!.get(symbol)!;
                                    const tj = transitions.get(j)!.get(symbol)!;
                                    if (ti === tj) continue;

                                    const a = Math.min(ti, tj);
                                    const b = Math.max(ti, tj);
                                    if (distinguishable[a][b]) {
                                          distinguishable[i][j] = true;
                                          changed = true;
                                          break;
                                    }
                              }
                        }
                  }
            }

            // Agrupar estados NO distinguibles en la misma clase
            const classOf = new Array<number>(totalStates).fill(-1);
            let classCount = 0;
            for (let i = 0; i < totalStates; i++) {
                  if (classOf[i] !== -1) continue;
                  classOf[i] = classCount;
                  for (let j = i + 1; j < totalStates; j++) {
                        if (classOf[j] === -1 && !distinguishable[i][j])
                              classOf[j] = classCount;
                  }
                  classCount++;
            }

            const classTransitions = new Map<number, Map<string, number>>();
            const classAccepting = new Set<number>();
            for (let i = 0; i < totalStates; i++) {
                  const c = classOf[i];
                  if (accepting.has(i)) classAccepting.add(c);
                  if (!classTransitions.has(c)) {
                        const bySymbol = new Map<string, number>();
                        for (const symbol of this.alphabet) {
                              bySymbol.set(
                                    symbol,
                                    classOf[transitions.get(i)!.get(symbol)!],
                              );
                        }
                        classTransitions.set(c, bySymbol);
                  }
            }

            return {
                  startClass: classOf[start],
                  trapClass: classOf[trap],
                  classTransitions,
                  classAccepting,
            };
      }

      // ---------------------------------------------------------------
      // FASE 4: materialización -> se descarta la clase trampa
      // (una arista ausente ya significa "rechazar")
      // ---------------------------------------------------------------

      private materialize(
            automaton: Automaton,
            minimized: ReturnType<typeof this.minimize>,
      ): Fragment {
            const { startClass, trapClass, classTransitions, classAccepting } =
                  minimized;

            const dropTrap = trapClass !== startClass; // si el lenguaje fuera vacío, no hay nada más que dejar
            const realId = new Map<number, string>();

            for (const c of classTransitions.keys()) {
                  if (dropTrap && c === trapClass) continue;
                  realId.set(c, automaton.createState());
            }

            for (const [c, bySymbol] of classTransitions) {
                  if (dropTrap && c === trapClass) continue;
                  for (const [symbol, target] of bySymbol) {
                        if (dropTrap && target === trapClass) continue; // sin arista = rechazar
                        automaton.addEdge(
                              realId.get(c)!,
                              realId.get(target)!,
                              symbol,
                        );
                  }
            }

            const start = realId.get(startClass)!;
            const acceptingReal = [...classAccepting].map((c) =>
                  realId.get(c)!,
            );

            if (acceptingReal.length === 1) {
                  return new Fragment(start, acceptingReal[0]);
            }

            const end = automaton.createState();
            for (const acceptingId of acceptingReal) {
                  automaton.addEdge(acceptingId, end, null);
            }

            return new Fragment(start, end);
      }
}
