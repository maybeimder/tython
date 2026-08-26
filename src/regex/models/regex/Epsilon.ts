import { RegEx } from "./RegEx.ts";

export class Epsilon extends RegEx {
      toString() { return "ε" }

      equals(other: RegEx): boolean {
            return other instanceof Epsilon;
      }
}
