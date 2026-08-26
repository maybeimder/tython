import { RegEx } from "./RegEx.ts";

export class Union extends RegEx {
      constructor( public readonly alternatives : RegEx[]) {
            super();
      }

      equals(other: RegEx): boolean {
            return other instanceof Union &&
                  this.alternatives.length === other.alternatives.length &&
                  this.alternatives.every((exp, i) => exp.equals(other.alternatives[i]));
      }

      toString() { return `${this.alternatives.join(" | ")}` }

}
