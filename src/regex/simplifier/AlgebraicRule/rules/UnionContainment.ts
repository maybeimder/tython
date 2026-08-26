import { RegEx } from "../../../models/regex/RegEx.ts";
import { Union } from "../../../models/regex/Union.ts";
import { Plus } from "../../../models/regex/Plus.ts";
import { AlgebraicRule } from "../AlgebraicRule.ts";
import { Star } from "../../../models/regex/Star.ts";

export class UnionContainment extends AlgebraicRule {

      static apply(expression: RegEx): RegEx | null {
            if (!(expression instanceof Union)) return null;

            const alts = expression.alternatives;
            const filtered = alts.filter((alt, index) => {
                  return !alts.some((other, otherIndex) => {
                        if (index === otherIndex) return false;
                        return this.isContained(alt, other);
                  });
            });

            if (filtered.length === alts.length) return null;

            return filtered.length === 1
                  ? filtered[0]
                  : new Union(filtered);
      }

      private static isContained(a: RegEx, b: RegEx): boolean {
            const bAsPlus = b.asPlus();
            const aAsPlus = a.asPlus();

            // a está contenida en a+
            if (bAsPlus && a.equals(bAsPlus.expression))
                  return true;

            // a está contenida en a*
            if (b instanceof Star && a.equals(b.expression))
                  return true;

            // a+ está contenida en a*
            if (aAsPlus && b instanceof Star && aAsPlus.expression.equals(b.expression))
                  return true;

            return false;
      }
}
