import { RegEx } from "../../../models/regex/RegEx.ts";
import { Union } from "../../../models/regex/Union.ts";
import { Epsilon } from "../../../models/regex/Epsilon.ts";
import { Star } from "../../../models/regex/Star.ts";
import { AlgebraicRule } from "../AlgebraicRule.ts";

export class UnionEpsilon extends AlgebraicRule {
      static override apply(expression: RegEx): RegEx | null {
            if (!(expression instanceof Union)) return null;

            const alts = expression.alternatives;

            const hasEpsilon = alts.some(alt => alt instanceof Epsilon);
            if (!hasEpsilon) return null;

            const noEpsilon = alts.filter(alt => !(alt instanceof Epsilon));

            // E | E | E = E
            if (noEpsilon.length === 0) return new Epsilon();

            // a* | E = a*
            if (noEpsilon.some(alt => alt instanceof Star)) {
                  return noEpsilon.length === 1 ? noEpsilon[0] : new Union(noEpsilon);
            }

            // a+ | E = a*
            const plusIndex = noEpsilon.findIndex(alt => alt.asPlus() !== null);

            if (plusIndex !== -1) {
                  const plusNode = noEpsilon[plusIndex].asPlus()!;

                  const replaced = [...noEpsilon];
                  replaced[plusIndex] = new Star(plusNode.expression);

                  return replaced.length === 1 ? replaced[0] : new Union(replaced);
            }

            return null;
      }
}
