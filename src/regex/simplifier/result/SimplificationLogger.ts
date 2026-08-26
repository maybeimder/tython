import { RegEx } from "../../models/regex/RegEx.ts";
import { Concatenation } from "../../models/regex/Concatenation.ts";
import { Union } from "../../models/regex/Union.ts";
import { Star } from "../../models/regex/Star.ts";
import { Plus } from "../../models/regex/Plus.ts";
import { Optional } from "../../models/regex/Optional.ts";
import { AlgebraicRule } from "../AlgebraicRule/AlgebraicRule.ts";
import { SimplificationStep } from "./SimplificationStep.ts";
import { SimplificationResult } from "./SimplificationResult.ts";

export class SimplificationLogger {
      private steps: SimplificationStep[] = [];
      private initial: RegEx;
      private currentGlobalState: RegEx;

      constructor(initial: RegEx) {
            this.initial = initial;
            this.currentGlobalState = initial;
      }

      public logStep(before: RegEx, after: RegEx, rule: typeof AlgebraicRule): void {
            const newGlobalState = this.replaceFirst(this.currentGlobalState, before, after).result;

            this.steps.push({
                  step: this.steps.length + 1,
                  before,
                  after,
                  globalState: newGlobalState,
                  rule
            });

            this.currentGlobalState = newGlobalState;
      }

      public getResult(finalResult: RegEx): SimplificationResult {
            return {
                  initial: this.initial,
                  steps: this.steps,
                  result: finalResult
            };
      }

      private replaceFirst(root: RegEx, target: RegEx, replacement: RegEx): { result: RegEx, replaced: boolean } {
            if (root.equals(target)) {
                  return { result: replacement, replaced: true };
            }

            if (root instanceof Concatenation) {
                  const newExprs: RegEx[] = [];
                  let replaced = false;
                  for (const exp of root.expressions) {
                        if (!replaced) {
                              const res = this.replaceFirst(exp, target, replacement);
                              newExprs.push(res.result);
                              replaced = res.replaced;
                        } else {
                              newExprs.push(exp);
                        }
                  }
                  return { result: replaced ? new Concatenation(newExprs) : root, replaced };
            }

            if (root instanceof Union) {
                  const newAlts: RegEx[] = [];
                  let replaced = false;
                  for (const alt of root.alternatives) {
                        if (!replaced) {
                              const res = this.replaceFirst(alt, target, replacement);
                              newAlts.push(res.result);
                              replaced = res.replaced;
                        } else {
                              newAlts.push(alt);
                        }
                  }
                  return { result: replaced ? new Union(newAlts) : root, replaced };
            }

            if (root instanceof Star) {
                  const res = this.replaceFirst(root.expression, target, replacement);
                  return { result: res.replaced ? new Star(res.result) : root, replaced: res.replaced };
            }

            if (root instanceof Plus) {
                  const res = this.replaceFirst(root.expression, target, replacement);
                  return { result: res.replaced ? new Plus(res.result) : root, replaced: res.replaced };
            }

            if (root instanceof Optional) {
                  const res = this.replaceFirst(root.expression, target, replacement);
                  return { result: res.replaced ? new Optional(res.result) : root, replaced: res.replaced };
            }

            return { result: root, replaced: false };
      }
}
