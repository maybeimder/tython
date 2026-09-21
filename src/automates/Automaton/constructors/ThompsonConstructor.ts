import { Concatenation } from "../../../regex/models/regex/Concatenation.ts";
import { Epsilon } from "../../../regex/models/regex/Epsilon.ts";
import { LanguageRef } from "../../../regex/models/regex/LanguageRef.ts";
import { Optional } from "../../../regex/models/regex/Optional.ts";
import { Plus } from "../../../regex/models/regex/Plus.ts";
import { RegEx } from "../../../regex/models/regex/RegEx.ts";
import { Star } from "../../../regex/models/regex/Star.ts";
import { Union } from "../../../regex/models/regex/Union.ts";
import { Automaton } from "../Automaton.ts";

export class Fragment {
      readonly left: string;
      readonly right: string;

      constructor(left: string, right: string) {
            this.left = left;
            this.right = right;
      }
}

export class ThompsonConstructor {

      public build(automaton:Automaton, node: RegEx): Fragment {
            if (node instanceof Epsilon)        return this.constructEpsilon(automaton, node);
            if (node instanceof LanguageRef)    return this.constructLanguageRef(automaton, node);
            if (node instanceof Union)          return this.constructUnion(automaton, node);
            if (node instanceof Concatenation) return this.constructConcatenation(automaton, node);
            if (node instanceof Star)           return this.constructStar(automaton, node);
            if (node instanceof Plus)           return this.constructPlus(automaton, node);
            if (node instanceof Optional)       return this.constructOptional(automaton, node);

            throw new Error(`Regex class not supported: ${node.constructor.name}`);
      }

      private constructEpsilon(automaton:Automaton, node: Epsilon): Fragment {
            const start = automaton.createState();
            const end = automaton.createState();

            automaton.addEdge(start, end, null);

            return new Fragment(start, end);
      }

      private constructLanguageRef(automaton: Automaton, node: LanguageRef): Fragment {
            const start = automaton.createState();
            const end = automaton.createState();

            automaton.addEdge(start, end, node.name);

            return new Fragment(start, end);
      }

      private constructConcatenation(automaton:Automaton, node: Concatenation): Fragment {
            const fragments = node.expressions.map(expression => this.build(automaton, expression));

            for (let i = 0; i < fragments.length - 1; i++) {
                const current = fragments[i];
                const next = fragments[i + 1];

                automaton.addEdge(current.right, next.left, null);
            }

            return new Fragment( fragments[0].left, fragments[fragments.length - 1].right);
      }

      private constructUnion(automaton: Automaton, node: Union): Fragment {
            const start = automaton.createState();
            const end = automaton.createState();

            for (const alternative of node.alternatives) {
                const fragment = this.build(automaton, alternative);

                automaton.addEdge(start, fragment.left, null);
                automaton.addEdge(fragment.right, end,null);
            }

            return new Fragment(start, end);
      }

      private constructStar(automaton: Automaton, node: Star): Fragment {
            const fragment = this.build(automaton, node.expression);

            const start = automaton.createState();
            const end = automaton.createState();

            // i -> ir con Epsilon
            automaton.addEdge(start, fragment.left, null);

            // i -> f con Epsilon
            automaton.addEdge(start, end, null);

            // El ciclo fr -> ir
            automaton.addEdge(fragment.right, fragment.left, null);

            // fr -> f
            automaton.addEdge( fragment.right, end, null);

            return new Fragment(start, end);
      }

      private constructPlus(automaton: Automaton, node: Plus): Fragment {
            const fragment = this.build(automaton, node.expression);

            const start = automaton.createState();
            const end = automaton.createState();

            // i -> ir con Epsilon
            automaton.addEdge(start, fragment.left, null);

            // El ciclo fr -> ir
            automaton.addEdge(fragment.right, fragment.left, null);

            // fr -> f
            automaton.addEdge( fragment.right, end, null);

            return new Fragment(start, end);
      }

      private constructOptional(automaton: Automaton, node: Optional): Fragment {
            const fragment = this.build(automaton, node.expression);

            const start = automaton.createState();
            const end = automaton.createState();

            // i -> ir con Epsilon
            automaton.addEdge(start, fragment.left, null);

            // i -> f con Epsilon
            automaton.addEdge(start, end, null);

            // El ciclo fr -> ir
            automaton.addEdge(fragment.right, fragment.left, null);

            // fr -> f
            automaton.addEdge( fragment.right, end, null);

            return new Fragment(start, end);
      }

}
