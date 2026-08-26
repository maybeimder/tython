import { RegEx } from "./RegEx.ts";

export class Plus extends RegEx {
      constructor( public readonly expression : RegEx) {
            super();
      }

      equals(other: RegEx): boolean {
            return other instanceof Plus && this.expression.equals(other.expression);
      }

      asPlus(): Plus | null { return this }

      toString() { return `${this.expression}+` }

}
