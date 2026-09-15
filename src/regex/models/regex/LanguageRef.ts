import { RegEx } from "./RegEx.ts";

export class LanguageRef extends RegEx {
      constructor( public readonly name : Symbol) {
            super();
      }

      equals(other: RegEx): boolean {
            return other instanceof LanguageRef && this.name === other.name;
      }

      toString() { return `${this.name}` }
}
