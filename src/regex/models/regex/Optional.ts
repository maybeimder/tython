import { RegEx } from "./RegEx.ts";

export class Optional extends RegEx {
      constructor( public readonly expression : RegEx) {
            super();
      }

      toString() { return `${this.expression}?` }
}
