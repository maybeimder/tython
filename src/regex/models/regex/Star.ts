import { RegEx } from "./RegEx.ts";

export class Star extends RegEx {
      constructor( public readonly expression : RegEx) {
            super();
      }

      equals(other: RegEx): boolean {
            return other instanceof Star && this.expression.equals(other.expression);
      }

      toString() { return `${this.expression}*` }

}
