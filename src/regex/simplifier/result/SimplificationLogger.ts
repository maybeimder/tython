import { RegEx } from "../../models/regex/RegEx.ts";
import { AlgebraicRule } from "../AlgebraicRule/AlgebraicRule.ts";
import { SimplificationResult } from "./SimplificationResult.ts";
import { SimplificationStep } from "./SimplificationStep.ts";

export class SimplificationLogger {
      private steps: SimplificationStep[] = [];
      private initial: RegEx;

      constructor(initial: RegEx) {
            this.initial = initial;
      }

      public logStep(before: RegEx, after: RegEx, rule: typeof AlgebraicRule): void {
            this.steps.push({
                  step: this.steps.length + 1,
                  before,
                  after,
                  rule
            });
      }

      public getResult(finalResult: RegEx): SimplificationResult {
            return {
                  initial: this.initial,
                  steps: this.steps,
                  result: finalResult
            };
      }
}
