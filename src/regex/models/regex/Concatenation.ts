import { RegEx } from "./RegEx.ts";

export class Concatenation extends RegEx {
      constructor( public readonly expressions : RegEx[]) {
            super();
      }

      toString() { return `[${this.expressions.join("")}]` }
}
