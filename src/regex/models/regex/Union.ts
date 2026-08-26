import { RegEx } from "./RegEx.ts";

export class Union extends RegEx {
      constructor( public readonly alternatives : RegEx[]) {
            super();
      }

      toString() { return `[${this.alternatives.join(" | ")}]` }

}
