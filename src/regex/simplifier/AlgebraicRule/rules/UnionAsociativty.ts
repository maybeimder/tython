import { RegEx } from "../../../models/regex/RegEx.ts";
import { Union } from "../../../models/regex/Union.ts";
import { AlgebraicRule } from "../AlgebraicRule.ts";

export class UnionAsociativity extends AlgebraicRule {
      static apply(expression: RegEx): RegEx | null {
            if (!(expression instanceof Union)) return null;

            const simplified = expression.alternatives.flatMap(internal_expression => {
                    if (internal_expression instanceof Union)
                          return (this.apply(internal_expression) as Union).alternatives;

                    return internal_expression;
            });

            return new Union(simplified);
      }
}
