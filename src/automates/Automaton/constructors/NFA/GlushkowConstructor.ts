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

// Info que se calcula por cada nodo del árbol (nullable / firstpos / lastpos)
interface Info {
      nullable: boolean;
      firstpos: Set<number>;
      lastpos: Set<number>;
}

export class GlushkovConstructor implements GraphConstructor<Automaton, RegEx> {
      private posSymbol = new Map<number, string>();
      private posState = new Map<number, string>();
      private followpos = new Map<number, Set<number>>();
      private posCounter = 0;

      public build(automaton: Automaton, node: RegEx): Fragment {
            // reset por si build() se reutiliza para otra regex
            this.posSymbol.clear();
            this.posState.clear();
            this.followpos.clear();
            this.posCounter = 0;

            const rootInfo = this.analyze(automaton, node);

            return this.assemble(automaton, rootInfo);
      }


      private analyze(automaton: Automaton, node: RegEx): Info {
            if (node instanceof Epsilon) return this.analyzeEpsilon();
            if (node instanceof LanguageRef)
                  return this.analyzeLanguageRef(automaton, node);
            if (node instanceof Union)
                  return this.analyzeUnion(automaton, node);
            if (node instanceof Concatenation)
                  return this.analyzeConcatenation(automaton, node);
            if (node instanceof Star) return this.analyzeStar(automaton, node);
            if (node instanceof Plus) return this.analyzePlus(automaton, node);
            if (node instanceof Optional)
                  return this.analyzeOptional(automaton, node);

            throw new Error(
                  `Regex class not supported: ${node.constructor.name}`,
            );
      }

      private analyzeEpsilon(): Info {
            return { nullable: true, firstpos: new Set(), lastpos: new Set() };
      }

      private analyzeLanguageRef( automaton: Automaton, node: LanguageRef ): Info {
            this.posCounter += 1;
            const position = this.posCounter;

            const state = automaton.createState();

            this.posSymbol.set(position, node.name);
            this.posState.set(position, state);
            this.followpos.set(position, new Set());

            return {
                  nullable: false,
                  firstpos: new Set([position]),
                  lastpos: new Set([position]),
            };
      }

      private analyzeUnion(automaton: Automaton, node: Union): Info {
            let nullable = false;
            const firstpos = new Set<number>();
            const lastpos = new Set<number>();

            for (const alternative of node.alternatives) {
                  const info = this.analyze(automaton, alternative);

                  nullable = nullable || info.nullable;
                  info.firstpos.forEach((p) => firstpos.add(p));
                  info.lastpos.forEach((p) => lastpos.add(p));
            }

            return { nullable, firstpos, lastpos };
      }

      private analyzeConcatenation(
            automaton: Automaton,
            node: Concatenation,
      ): Info {
            let acc: Info | null = null;

            for (const expression of node.expressions) {
                  const info = this.analyze(automaton, expression);

                  if (acc === null) {
                        acc = info;
                        continue;
                  }

                  // Regla "una salida y luego otra": lastpos(izq) -> firstpos(der)
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

      private analyzeStar(automaton: Automaton, node: Star): Info {
            const info = this.analyze(automaton, node.expression);

            // Regla "el estado se apunta a sí mismo": el ciclo lastpos -> firstpos
            this.addLoop(info);

            return {
                  nullable: true,
                  firstpos: info.firstpos,
                  lastpos: info.lastpos,
            };
      }

      private analyzePlus(automaton: Automaton, node: Plus): Info {
            const info = this.analyze(automaton, node.expression);

            // Mismo ciclo que Star, pero exige al menos una repetición
            this.addLoop(info);

            return {
                  nullable: info.nullable,
                  firstpos: info.firstpos,
                  lastpos: info.lastpos,
            };
      }

      private analyzeOptional(automaton: Automaton, node: Optional): Info {
            const info = this.analyze(automaton, node.expression);

            // a? = (a | epsilon): no agrega ciclo, solo se puede saltar
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

      private assemble(automaton: Automaton, rootInfo: Info): Fragment {
            const start = automaton.createState();
            const end = automaton.createState();

            // start -> primeras posiciones posibles (con su símbolo real)
            for (const position of rootInfo.firstpos) {
                  automaton.addEdge(
                        start,
                        this.posState.get(position)!,
                        this.posSymbol.get(position)!,
                  );
            }

            // Si la raíz acepta la cadena vacía, el propio start también acepta
            if (rootInfo.nullable) {
                  automaton.addEdge(start, end, null);
            }

            // followpos(p) = a qué posiciones se puede pasar después de p
            for (const [position, follows] of this.followpos) {
                  for (const next of follows) {
                        automaton.addEdge(
                              this.posState.get(position)!,
                              this.posState.get(next)!,
                              this.posSymbol.get(next)!,
                        );
                  }
            }

            // lastpos(raíz) = posiciones desde las que se puede terminar -> end
            for (const position of rootInfo.lastpos) {
                  automaton.addEdge(this.posState.get(position)!, end, null);
            }

            return new Fragment(start, end);
      }
}
