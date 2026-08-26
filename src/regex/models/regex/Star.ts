import { RegEx } from "./RegEx.ts";

export class Star extends RegEx {
      constructor( public readonly expression : RegEx) {
            super();
      }

      toString() { return `${this.expression}*` }

}
