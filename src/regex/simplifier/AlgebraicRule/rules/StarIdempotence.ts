import { Optional } from "../../../models/regex/Optional.ts";
import { Plus } from "../../../models/regex/Plus.ts";
import { RegEx } from "../../../models/regex/RegEx.ts";
import { Star } from "../../../models/regex/Star.ts";
import { AlgebraicRule } from "../AlgebraicRule.ts";

export class StarIdempotency extends AlgebraicRule {
      static apply(expression: RegEx): RegEx | null {
            if (!(expression instanceof Star)) return null;

            const inner_expression = expression.expression;

            // Si (a*)* = a* | (a+)* = a* | (a?)* = a*
            if (  inner_expression instanceof Star
                  || inner_expression instanceof Plus
                  || inner_expression instanceof Optional  )

                  return new Star(inner_expression.expression);


            return null;
      }
}
