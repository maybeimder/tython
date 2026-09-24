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
 * NFA mínimo (AFND) por fusión de posiciones equivalentes.
 *
 * Punto de partida: el NFA de Glushkov de siempre (un estado por posición,
 * más el estado 0 de arranque). Ese NFA suele tener estados REDUNDANTES:
 * dos posiciones distintas que, aunque tengan símbolos distintos, llevan
 * exactamente al mismo futuro (mismo followpos) -- son intercambiables.
 *
 * Algoritmo (fusión por equivalencia de transiciones / bisimulación hacia
 * adelante):
 *   1. Construir el grafo abstracto de Glushkov (nodo 0 = arranque, nodos
 *      1..n = posiciones), SIN crear todavía estados reales del automaton.
 *   2. Repetir hasta que no haya más fusiones posibles:
 *        buscar dos nodos u, v con:
 *          - misma "aceptación" (ambos aceptan o ninguno acepta), y
 *          - exactamente las mismas transiciones salientes (mismo símbolo
 *            -> mismos destinos)
 *        si existen, fusionarlos: todo lo que apuntaba a v ahora apunta a u,
 *        y v desaparece.
 *   3. Materializar: recién ahí se crean los estados reales
 *      (automaton.createState()) y las aristas reales (automaton.addEdge()),
 *      uno por cada nodo sobreviviente.
 *
 * Esto es seguro (nunca cambia el lenguaje reconocido, porque dos estados
 * con futuro idéntico son intercambiables) y sistemático, pero NO es una
 * garantía matemática del mínimo NFA absoluto en el caso general -- ese
 * problema es PSPACE-difícil. En la práctica, para regexes como
 * (a|b)*abb, esta fusión sí llega exactamente al mínimo real.
 */
export class MinimalNFAConstructor implements GraphConstructor<Automaton, RegEx> {
      private posSymbol = new Map<number, string>();
      private followpos = new Map<number, Set<number>>();
      private posCounter = 0;

      public build(automaton: Automaton, node: RegEx): Fragment {
            console.dir(automaton.states, {})
            this.posSymbol.clear();
            this.followpos.clear();
            this.posCounter = 0;

            const rootInfo = this.analyze(node);

            const { transitions, accepting } =
                  this.buildAbstractGraph(rootInfo);
            this.reduce(transitions, accepting);

            return this.materialize(automaton, transitions, accepting);
      }

      // ---------------------------------------------------------------
      // FASE 1: análisis (idéntico a Glushkov: nullable/firstpos/lastpos/
      // followpos). No se crean estados del automaton aquí todavía.
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
      // FASE 2: grafo abstracto de Glushkov (nodo 0 = arranque)
      // ---------------------------------------------------------------

      private buildAbstractGraph(rootInfo: Info) {
            const transitions = new Map<number, Map<string, Set<number>>>();
            const accepting = new Set<number>();

            const addEdge = (from: number, symbol: string, to: number) => {
                  if (!transitions.has(from)) transitions.set(from, new Map());
                  const bySymbol = transitions.get(from)!;
                  if (!bySymbol.has(symbol)) bySymbol.set(symbol, new Set());
                  bySymbol.get(symbol)!.add(to);
            };

            for (const p of rootInfo.firstpos) {
                  addEdge(0, this.posSymbol.get(p)!, p);
            }
            if (!transitions.has(0)) transitions.set(0, new Map());

            for (let p = 1; p <= this.posCounter; p++) {
                  if (!transitions.has(p)) transitions.set(p, new Map());
                  for (const next of this.followpos.get(p)!) {
                        addEdge(p, this.posSymbol.get(next)!, next);
                  }
            }

            for (const p of rootInfo.lastpos) accepting.add(p);
            if (rootInfo.nullable) accepting.add(0);

            return { transitions, accepting };
      }

      // ---------------------------------------------------------------
      // FASE 3: fusión de nodos equivalentes (hasta punto fijo)
      // ---------------------------------------------------------------

      private reduce(
            transitions: Map<number, Map<string, Set<number>>>,
            accepting: Set<number>,
      ): void {
            const signature = (id: number): string => {
                  const bySymbol = transitions.get(id)!;
                  const parts = [...bySymbol.keys()].sort().map((symbol) => {
                        const targets = [...bySymbol.get(symbol)!].sort(
                              (a, b) => a - b,
                        );
                        return `${symbol}:${targets.join(",")}`;
                  });
                  return `${accepting.has(id) ? "F" : "N"}|${parts.join(";")}`;
            };

            const redirect = (from: number, to: number) => {
                  for (const bySymbol of transitions.values()) {
                        for (const targets of bySymbol.values()) {
                              if (targets.has(from)) {
                                    targets.delete(from);
                                    targets.add(to);
                              }
                        }
                  }
            };

            let mergedSomething = true;
            while (mergedSomething) {
                  mergedSomething = false;
                  const ids = [...transitions.keys()];

                  outer: for (let i = 0; i < ids.length; i++) {
                        for (let j = i + 1; j < ids.length; j++) {
                              const a = ids[i];
                              const b = ids[j];

                              if (signature(a) !== signature(b)) continue;

                              // El estado 0 (arranque) siempre sobrevive si está en el par
                              const survivor = a === 0 ? a : b === 0 ? b : a;
                              const loser = survivor === a ? b : a;

                              redirect(loser, survivor);
                              transitions.delete(loser);
                              accepting.delete(loser); // ya no existe; su marca vivía en 'survivor' igual

                              mergedSomething = true;
                              break outer;
                        }
                  }
            }
      }

      // ---------------------------------------------------------------
      // FASE 4: materialización -> estados y aristas reales
      // ---------------------------------------------------------------

      private materialize(
            automaton: Automaton,
            transitions: Map<number, Map<string, Set<number>>>,
            accepting: Set<number>,
      ): Fragment {
            const realId = new Map<number, string>();
            for (const id of transitions.keys()) {
                  realId.set(id, automaton.createState());
            }

            for (const [from, bySymbol] of transitions) {
                  for (const [symbol, targets] of bySymbol) {
                        for (const to of targets) {
                              automaton.addEdge(
                                    realId.get(from)!,
                                    realId.get(to)!,
                                    symbol,
                              );
                        }
                  }
            }

            const start = realId.get(0)!;
            const acceptingReal = [...accepting].map((id) => realId.get(id)!);

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
