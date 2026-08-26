import { RegEx } from "../../models/regex/RegEx.ts";

export interface AlgebraicRule {
      apply(expression: RegEx): RegEx | null;
}
