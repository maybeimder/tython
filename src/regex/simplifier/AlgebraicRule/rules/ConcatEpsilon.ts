import { Concatenation } from "../../../models/regex/Concatenation.ts";
import { Epsilon } from "../../../models/regex/Epsilon.ts";
import { RegEx } from "../../../models/regex/RegEx.ts";
import { AlgebraicRule } from "../AlgebraicRule.ts";

export class ConcatEpsilon extends AlgebraicRule {
      static apply(expression: RegEx): RegEx | null {
            if (!(expression instanceof Concatenation)) return null;

            const noEpsilon = expression.expressions.filter(exp => !(exp instanceof Epsilon));

            if (noEpsilon.length === expression.expressions.length) return null;
            if (noEpsilon.length === 0) return new Epsilon();

            return noEpsilon.length === 1
                  ? noEpsilon[0]
                  : new Concatenation(noEpsilon)
      }
}
