import { RegEx } from "./RegEx.ts";

export class Plus extends RegEx {
      constructor( public readonly expression : RegEx) {
            super();
      }

      toString() { return `${this.expression}+` }

}
