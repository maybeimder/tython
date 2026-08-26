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
import { SimplificationResult } from "../../../../simplifier/result/SimplificationResult.ts";

export class RegexSimplifier {
      private logger: SimplificationLogger = new SimplificationLogger();

      simplify(expression: RegEx): RegEx {
            let actualState = expression;

            while (true) {
                  let withSimplifiedChildren = this.simplifyChildren(actualState);

                  const nextState = this.simplifyUsingRules(withSimplifiedChildren);

                  if (this.equals(actualState, nextState)) return nextState;

                  actualState = nextState
            }
      }
      verboseSimplify(expression: RegEx): SimplificationResult {
            this.logger.reset();
            const result = this.simplify(expression);
            return {
                  initial: expression,
                  steps: this.logger.getSteps(),
                  result,
            };
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

      private simplifyUsingRules(expression: RegEx): RegEx {
            if (expression instanceof LanguageRef)
                return expression;

            if (expression instanceof Plus)
                  return PlusToStar.apply(expression) ?? expression;

            if (expression instanceof Optional)
                  return OptionalToUnion.apply(expression) ?? expression;

            if (expression instanceof Concatenation) {
                  let res = ConcatAsociativity.apply(expression) ?? expression;

                  if (res instanceof Concatenation) {
                        res = ConcatStar.apply(res) ?? res;
                        // res = ConcatToPlus.apply(res) ?? res;
                  }
                return res;
            }

            if (expression instanceof Union) {
                  let res = UnionAsociativity.apply(expression) ?? expression;

                  if (res instanceof Union)
                           res = UnionEpsilon.apply(res) ?? res;

                  if (res instanceof Union)
                           res = UnionContainment.apply(res) ?? res;

                  return res;
            }

            if (expression instanceof Star)
                return StarIdempotency.apply(expression) ?? expression;

            return expression;
      }


      private equals(a: RegEx, b: RegEx): boolean {
            return a.equals(b);
      }
}
