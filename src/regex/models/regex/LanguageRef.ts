import { RegEx } from "./RegEx.ts";

export class LanguageRef extends RegEx {
      constructor( public readonly name : string) {
            super();
      }

      equals(other: RegEx): boolean {
            return other instanceof LanguageRef && this.name === other.name;
      }

      toString() { return `${this.name}` }
}
