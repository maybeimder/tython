import { RegEx } from "./RegEx.ts";

export class Optional extends RegEx {
      constructor( public readonly expression : RegEx) {
            super();
      }

      equals(other: RegEx): boolean {
            return other instanceof Optional && this.expression.equals(other.expression);
      }

      toString() { return `${this.expression}?` }
}
