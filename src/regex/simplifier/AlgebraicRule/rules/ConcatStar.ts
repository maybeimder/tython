import { Concatenation } from "../../../models/regex/Concatenation.ts";
import { RegEx } from "../../../models/regex/RegEx.ts";
import { Star } from "../../../models/regex/Star.ts";
import { AlgebraicRule } from "../AlgebraicRule.ts";

export class ConcatStar extends AlgebraicRule {
  static apply(expression: RegEx): RegEx | null {
    if (!(expression instanceof Concatenation)) return null;
    const expressions = expression.expressions;
    const result: RegEx[] = [];
    let changed = false;

    for (let i = 0; i < expressions.length; i++) {
      const current = expressions[i];
      const next = expressions[i + 1];

      // a* a* = a*
      if (
        current instanceof Star &&
        next instanceof Star &&
        current.expression.equals(next.expression)
      ) {
        result.push(current);
        i++; // saltamos el next porque ya lo consumimos
        changed = true;
      } else {
        result.push(current);
      }
    }

    if (!changed) return null;
    if (result.length === 1) return result[0];
    return new Concatenation(result);
  }
}
