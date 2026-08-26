// SimplificationLogger.ts
import { RegEx } from "../../models/regex/RegEx.ts";
import { SimplificationStep } from "./SimplificationStep.ts";

export class SimplificationLogger {
      private steps: SimplificationStep[] = [];
      private counter = 0;

      record(before: RegEx, after: RegEx, ruleName: string): void {
            this.counter++;
            this.steps.push({
                  step: this.counter,
                  before,
                  after,
                  rule: ruleName,
            });
      }

      getSteps(): SimplificationStep[] {
            return this.steps;
      }

      reset(): void {
            this.steps = [];
            this.counter = 0;
      }
}
