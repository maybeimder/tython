import { RegEx } from "../../models/regex/RegEx.ts"
import { AlgebraicRule } from "../rules/AlgebraicRule.ts"

export interface SimplificationStep {
      step: number
      before: RegEx
      after: RegEx
      rule: AlgebraicRule
}
