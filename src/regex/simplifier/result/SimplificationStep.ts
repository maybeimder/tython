import { RegEx } from "../../models/regex/RegEx.ts";
import { AlgebraicRule } from "../AlgebraicRule/AlgebraicRule.ts";

export interface SimplificationStep {
      step: number;
      before: RegEx;
      after: RegEx;
      rule: string; // nombre de la regla, ej. "ConcatStar"
}
