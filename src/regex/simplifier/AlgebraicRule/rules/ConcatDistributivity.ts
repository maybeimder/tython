import { RegEx } from "../../../models/regex/RegEx.ts";
import { Concatenation } from "../../../models/regex/Concatenation.ts";
import { Union } from "../../../models/regex/Union.ts";
import { AlgebraicRule } from "../AlgebraicRule.ts";

export class ConcatDistributivity extends AlgebraicRule {
      static override apply(expression: RegEx): RegEx | null {
            if (!(expression instanceof Concatenation)) return null;

            const exprs = expression.expressions;

            const unionIndex = exprs.findIndex((exp) => exp instanceof Union);
            if (unionIndex === -1) return null;

            const unionNode = exprs[unionIndex] as Union;
            const left = exprs.slice(0, unionIndex);
            const right = exprs.slice(unionIndex + 1);

            // A · (B | C) · D  --->  (A · B · D) | (A · C · D)
            const newAlternatives = unionNode.alternatives.map((alt) => {
                  const newConcatExprs = [...left, alt, ...right];
                  return newConcatExprs.length === 1
                        ? newConcatExprs[0]
                        : new Concatenation(newConcatExprs);
            });

            return new Union(newAlternatives);
      }
}
