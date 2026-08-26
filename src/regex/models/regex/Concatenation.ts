import { Plus } from "./Plus.ts";
import { RegEx } from "./RegEx.ts";
import { Star } from "./Star.ts";

export class Concatenation extends RegEx {
      constructor( public readonly expressions : RegEx[]) {
            super();
      }

      equals(other: RegEx): boolean {
            return other instanceof Concatenation &&
                  this.expressions.length === other.expressions.length &&
                  this.expressions.every((exp, i) => exp.equals(other.expressions[i]));
      }

      asPlus(): Plus | null {
            if (this.expressions.length === 2) {
                  const [left, right] = this.expressions;
                        // a a*
                        if (right instanceof Star && left.equals(right.expression)) {
                              return new Plus(left);
                        }
                        // a* a
                        if (left instanceof Star && right.equals(left.expression)) {
                              return new Plus(right);
                        }
                  }
                  return null;
      }

      toString() { return `[${this.expressions.join("")}]` }
}
