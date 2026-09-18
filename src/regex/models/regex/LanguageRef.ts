import { AlphabetSymbol } from "../todo/Alphabet.ts";
import { RegEx } from "./RegEx.ts";

export class LanguageRef extends RegEx {
      constructor( public readonly name : AlphabetSymbol) {
            super();
      }

      equals(other: RegEx): boolean {
            return other instanceof LanguageRef && this.name === other.name;
      }

      toString() { return `${this.name}` }
}
