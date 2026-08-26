import { Concatenation } from "../../../models/regex/Concatenation.ts";
import { RegEx } from "../../../models/regex/RegEx.ts";
import { AlgebraicRule } from "../AlgebraicRule.ts";

export class ConcatAsociativity extends AlgebraicRule {
      static apply(expression: RegEx): RegEx | null {
            if (!(expression instanceof Concatenation)) return null;

            const simplified = expression.expressions.flatMap(internal_expression => {
                    if (internal_expression instanceof Concatenation)
                          return (ConcatAsociativity.apply(internal_expression) as Concatenation).expressions;

                    return internal_expression;
            });

            return new Concatenation(simplified);
      }
}
