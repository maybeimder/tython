import { RegEx } from "../../models/regex/RegEx.ts";
import { AlgebraicRule } from "../AlgebraicRule/AlgebraicRule.ts";

export interface SimplificationStep {
      step: number;
      before: RegEx;
      after: RegEx;
      globalState: RegEx;
      rule: typeof AlgebraicRule;
}
