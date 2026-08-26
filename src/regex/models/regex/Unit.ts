import { RegEx } from "./RegEx.ts";

export class LanguageRef extends RegEx {
      constructor( public readonly name : string) {
            super();
      }

      toString() { return `${this.name}` }
}
