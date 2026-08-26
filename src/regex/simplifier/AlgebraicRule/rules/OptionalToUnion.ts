import { Epsilon } from "../../../models/regex/Epsilon.ts";
import { Optional } from "../../../models/regex/Optional.ts";
import { RegEx } from "../../../models/regex/RegEx.ts";
import { Union } from "../../../models/regex/Union.ts";
import { AlgebraicRule } from "../AlgebraicRule.ts";

export class OptionalToUnion extends AlgebraicRule {
      static apply(expression: RegEx): RegEx | null {
            if (!(expression instanceof Optional)) return null;

            return new Union([
                  expression.expression,
                  new Epsilon()
            ]);
      }
}
