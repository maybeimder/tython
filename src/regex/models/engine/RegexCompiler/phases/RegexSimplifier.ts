import { ConcatAsociativity } from "../../../../simplifier/AlgebraicRule/rules/ConcatAsociativity.ts";
import { OptionalToUnion } from "../../../../simplifier/AlgebraicRule/rules/OptionalToUnion.ts";
import { PlusToStar } from "../../../../simplifier/AlgebraicRule/rules/PlusToStar.ts";
import { UnionAsociativity } from "../../../../simplifier/AlgebraicRule/rules/UnionAsociativty.ts";
import { Concatenation } from "../../../regex/Concatenation.ts";
import { Optional } from "../../../regex/Optional.ts";
import { Plus } from "../../../regex/Plus.ts";
import { RegEx } from "../../../regex/RegEx.ts";
import { Star } from "../../../regex/Star.ts";
import { Union } from "../../../regex/Union.ts";
import { LanguageRef } from "../../../regex/LanguageRef.ts";
import { StarIdempotency } from "../../../../simplifier/AlgebraicRule/rules/StarIdempotence.ts";
import { ConcatStar } from "../../../../simplifier/AlgebraicRule/rules/ConcatStar.ts";
import { UnionContainment } from "../../../../simplifier/AlgebraicRule/rules/UnionContainment.ts";
import { UnionEpsilon } from "../../../../simplifier/AlgebraicRule/rules/UnionEpsilon.ts";
import { SimplificationLogger } from "../../../../simplifier/result/SimplificationLogger.ts";
import { AlgebraicRule } from "../../../../simplifier/AlgebraicRule/AlgebraicRule.ts";
import { ConcatMerge } from "../../../../simplifier/AlgebraicRule/rules/ConcatMerge.ts";
import { ConcatEpsilon } from "../../../../simplifier/AlgebraicRule/rules/ConcatEpsilon.ts";
import { ConcatDistributivity } from "../../../../simplifier/AlgebraicRule/rules/ConcatDistributivity.ts";
import { UnionOfEquals } from "../../../../simplifier/AlgebraicRule/rules/UnionOfEquals.ts";
import { StarOfRuns } from "../../../../simplifier/AlgebraicRule/rules/StarOfRuns.ts";

export class RegexSimplifier {
      logger: SimplificationLogger | null

      constructor() { this.logger = null }

      simplify(expression: RegEx): RegEx {
            let actualState = expression;

            while (true) {
                  let withSimplifiedChildren = this.simplifyChildren(actualState);
                  const nextState = this.simplifyUsingRules(withSimplifiedChildren);

                  if (this.equals(actualState, nextState)) return nextState;
                  actualState = nextState
            }
      }

      private simplifyChildren(subexpression: RegEx): RegEx {
            if (subexpression instanceof Concatenation)
                  return new Concatenation(subexpression.expressions.map(exp => this.simplify(exp)));

            if (subexpression instanceof Union)
                  return new Union(subexpression.alternatives.map(alt => this.simplify(alt)));

            if (subexpression instanceof Star)
                  return new Star(this.simplify(subexpression.expression));

            if (subexpression instanceof Plus)
                  return new Plus(this.simplify(subexpression.expression));

            if (subexpression instanceof Optional)
                  return new Optional(this.simplify(subexpression.expression));

            return subexpression;
      }

      useRule = (rule: typeof AlgebraicRule, target: RegEx): RegEx | null => {
            const res = rule.apply(target);
            if (res === null || res.equals(target)) return null;
            if (res !== null && this.logger) this.logger.logStep(target, res, rule);
            return res
      };

      private simplifyUsingRules(expression: RegEx): RegEx {
            if (expression instanceof LanguageRef)
                  return expression;

            if (expression instanceof Plus)
                  return this.useRule(PlusToStar, expression) ?? expression;

            if (expression instanceof Optional)
                  return this.useRule(OptionalToUnion, expression) ?? expression;

            if (expression instanceof Star){
                  for (const rule of [StarOfRuns, StarIdempotency]) {
                        const res = this.useRule(rule, expression);
                        if (res !== null) return res;
                  }
                  return expression;
            }

            if (expression instanceof Concatenation) {
                  for (const rule of [ConcatAsociativity, ConcatStar, ConcatMerge, ConcatEpsilon]) {
                        const res = this.useRule(rule, expression);
                        if (res !== null) return res;
                  }
                  return this.tryDistribute(expression) ?? expression;
            }

            if (expression instanceof Union) {
                  for (const rule of [UnionAsociativity, UnionOfEquals, UnionContainment, UnionEpsilon]) {
                        const res = this.useRule(rule, expression);
                        if (res !== null) return res;
                  }
                  return expression;
            }

            if (expression instanceof Plus) return expression;
            if (expression instanceof Optional) return expression;

            return expression;
      }


      private equals(a: RegEx, b: RegEx): boolean {
            return a.equals(b);
      }

      private size(e: RegEx): number {
            return e.toString().length;
      }

      private tryDistribute(expr: Concatenation): RegEx | null {
            const distributed = ConcatDistributivity.apply(expr);
            if (distributed === null) return null;

            const logger = this.logger;
            this.logger = null;
            const simplified = this.simplify(distributed);
            this.logger = logger;

            if (this.size(simplified) >= this.size(expr)) return null;

            if (this.logger) this.logger.logStep(expr, simplified, ConcatDistributivity);
            return simplified;
      }
}
