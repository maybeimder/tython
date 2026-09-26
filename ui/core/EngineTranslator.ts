import { Automaton } from "../../src/automates/Automaton/Automaton";
import { MinimalDFAConstructor } from "../../src/automates/Automaton/constructors/DFA/MinimalConstructor";
import { GraphConstructor } from "../../src/automates/Automaton/constructors/GraphConstructor";
import { GlushkovConstructor } from "../../src/automates/Automaton/constructors/NFA/GlushkowConstructor";
import { ThompsonConstructor } from "../../src/automates/Automaton/constructors/NFA/ThompsonConstructor";
import { RegexCompiler } from "../../src/regex/models/engine/RegexCompiler/RegexCompiler";
import { RegEx } from "../../src/regex/models/regex/RegEx";
import { Alphabet } from "../../src/regex/models/todo/Alphabet";
import { anchorsOf } from "../src/models/connections/Anchor";
import { EdgeRepresentation } from "../src/models/representations/EdgeRepresentation";
import { GraphRepresentation } from "../src/models/representations/GraphRepresentation";
import { NodeRepresentation } from "../src/models/representations/NodeRepresentation";

export default class EngineTranslator {
      /*const myRegexCompiler = RegexCompiler.instance
      const Σ: Alphabet = new Alphabet(new Set(["a", "b"]))

      myRegexCompiler.snippet = "[a|b]* a b b"
      const reg: RegEx = myRegexCompiler.parser.parseExpression();
      console.dir(reg, { depth: null })

      const AFND = new Automaton(Σ)
      const thompson = new ThompsonConstructor();
      const glushkov = new GlushkovConstructor();
      // thompson.build(AFND, reg)
      glushkov.build(AFND, reg)
 */

      private _alphabet: Alphabet | null = null;
      private _regex: RegEx | null = null;
      private _regexCompiler = RegexCompiler.instance;

      private _automaton: Automaton | null = null;
      private _constructor: GraphConstructor<Automaton, RegEx> =
            new MinimalDFAConstructor();

      private _graphRepresentation: GraphRepresentation | null = null;

      constructor(alphabet?: Alphabet) {
            this._alphabet = alphabet ?? new Alphabet(new Set(["a", "b", "z"]));
            this._automaton = new Automaton(this._alphabet);
      }

      translate(): GraphRepresentation {
            if (!this._automaton)
                  throw new Error(
                        "No existe aun un automata, primero se debe establecer un regexSnippet.",
                  );

            const nodes = this.translateAllNodes(this._automaton);
            console.log(nodes, this._automaton.adjacencyList);
            const edges = this.translateAllEdges(this._automaton, nodes);

            this._graphRepresentation = new GraphRepresentation(nodes, edges);
            return this._graphRepresentation;
      }

      translateAllNodes(automaton: Automaton): NodeRepresentation[] {
            const baseSize = 20;

            return Object.keys(automaton.states).map((state, index) => {
                  return new NodeRepresentation({
                        label: state,
                        x: 10 * baseSize * index + 100,
                        y: 200,
                        isEndState: automaton.finalStateIdxs.has(state),
                        isStartState: automaton.initialStateIdx === state,
                        size: baseSize,
                  });
            });
      }

      translateAllEdges(
            automaton: Automaton,
            nodes: NodeRepresentation[],
      ): EdgeRepresentation[] {
            const nodeByLabel: Record<string, NodeRepresentation> = {};
            nodes.forEach((node) => (nodeByLabel[node.label] = node));

            const adjacency = automaton.adjacencyList;
            const edges: EdgeRepresentation[] = [];

            for (const from of Object.keys(adjacency)) {
                  for (const to of Object.keys(adjacency[from])) {
                        const sourceNode = nodeByLabel[from];
                        const targetNode = nodeByLabel[to];
                        if (!sourceNode || !targetNode) continue;

                        const symbols = adjacency[from][to];
                        const label = symbols
                              .map((s) => (s === null ? "ε" : s))
                              .join(", ");

                        if (from === to) {
                              const top = anchorsOf(sourceNode).top;
                              edges.push(
                                    new EdgeRepresentation({
                                          source: top,
                                          target: top,
                                          label,
                                          curvature: 60,
                                    }),
                              );
                              continue;
                        }

                        const forward = targetNode.x >= sourceNode.x;
                        const source = forward
                              ? anchorsOf(sourceNode).right
                              : anchorsOf(sourceNode).left;
                        const target = forward
                              ? anchorsOf(targetNode).left
                              : anchorsOf(targetNode).right;
                        const hasReverseEdge = !!adjacency[to]?.[from];

                        edges.push(
                              new EdgeRepresentation({
                                    source,
                                    target,
                                    label,
                                    curvature: hasReverseEdge
                                          ? forward
                                                ? 30
                                                : -30
                                          : 0,
                              }),
                        );
                  }
            }

            return edges;
      }

      setRegexSnippet(snippet: string, initialState?: string, finalStates?: string[]) {
            this._regexCompiler.snippet = snippet;
            this._regex = this._regexCompiler.parser.parseExpression();
            console.dir(this._regex, { depth: null });

            this._automaton = new Automaton(this._alphabet!);

            // this._thompson.build(this._automaton, this._regex) :
            this._constructor.build(this._automaton, this._regex);

            if (initialState) this._automaton.initialStateIdx = initialState;
            if (finalStates) this._automaton.finalStateIdxs = new Set(finalStates);
      }

      set alphabet(alphabet: Alphabet) {
            this._alphabet = alphabet;
      }

      set automaton(automaton: Automaton) {
            this._automaton = automaton;
      }

      set graphConstructor(constructor: GraphConstructor<Automaton, RegEx>) {
            this._constructor = constructor;
      }

      get automaton(): Automaton | null {
            return this._automaton;
      }

      get graphRepresentation(): GraphRepresentation | null {
            return this._graphRepresentation;
      }
}
