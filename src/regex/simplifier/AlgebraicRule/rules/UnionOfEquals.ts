import { RegEx } from "../../../models/regex/RegEx.ts";
import { Union } from "../../../models/regex/Union.ts";
import { AlgebraicRule } from "../AlgebraicRule.ts";

export class UnionOfEquals extends AlgebraicRule {
      static apply(expression: RegEx): RegEx | null {
            if (!(expression instanceof Union)) return null;
            const [first, ...rest] = expression.alternatives;

            return rest.every(alt => alt.equals(first))
                  ? first
                  : null
      }
}
