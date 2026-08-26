import { Concatenation } from "../../../models/regex/Concatenation.ts";
import { Plus } from "../../../models/regex/Plus.ts";
import { RegEx } from "../../../models/regex/RegEx.ts";
import { Star } from "../../../models/regex/Star.ts";
import { AlgebraicRule } from "../AlgebraicRule.ts";

export class PlusToStar implements AlgebraicRule {
      apply(expression: RegEx): RegEx | null {
            if (!(expression instanceof Plus)) return null;

            return new Concatenation([
                  expression.expression,
                  new Star(expression.expression)
            ]);
      }
}
