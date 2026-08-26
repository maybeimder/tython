import { Concatenation } from "../../../models/regex/Concatenation.ts";
import { Plus } from "../../../models/regex/Plus.ts";
import { RegEx } from "../../../models/regex/RegEx.ts";
import { Star } from "../../../models/regex/Star.ts";
import { AlgebraicRule } from "../AlgebraicRule.ts";

export class PlusToStar extends AlgebraicRule {
      static apply(expression: RegEx): RegEx | null {
            if (!(expression instanceof Concatenation)) return null;

            const exprs = expression.expressions;
            if (exprs.length !== 2) return null;

            const [left, right] = exprs;

            // r r*
            if (right instanceof Star && left.equals(right.expression)) {
                  return new Plus(left);
            }

            return null;
      }
}
