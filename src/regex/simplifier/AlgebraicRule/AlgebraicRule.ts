import { RegEx } from "../../models/regex/RegEx.ts";

export abstract class AlgebraicRule {
      static apply(expression: RegEx): RegEx | null { return null }
}
