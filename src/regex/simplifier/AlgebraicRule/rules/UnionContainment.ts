import { RegEx } from "../../../models/regex/RegEx.ts";
import { Union } from "../../../models/regex/Union.ts";
import { Plus } from "../../../models/regex/Plus.ts";
import { AlgebraicRule } from "../AlgebraicRule.ts";
import { Star } from "../../../models/regex/Star.ts";
import { Concatenation } from "../../../models/regex/Concatenation.ts";
import { Optional } from "../../../models/regex/Optional.ts";

export class UnionContainment extends AlgebraicRule {

      static apply(expression: RegEx): RegEx | null {
                  if (!(expression instanceof Union)) return null;

                  const alts = expression.alternatives;

                  const filtered = alts.filter((alt, index) => {
                        return !alts.some((other, otherIndex) => {
                              if (index === otherIndex) return false;

                              const isAltContained = this.isContained(alt, other);

                              if (isAltContained) {
                                    const mutuallyContained = this.isContained(other, alt);

                                    if (mutuallyContained)
                                          return index > otherIndex;


                                    return true;
                              }

                              return false;
                        });
                  });

                  if (filtered.length === alts.length) return null;

                  return filtered.length === 1
                        ? filtered[0]
                        : new Union(filtered);
      }

      private static isContained(a: RegEx, b: RegEx): boolean {
            const getBase = (exp: RegEx): { base: RegEx, min: number } => {
                  if (exp instanceof Star) return { base: exp.expression, min: 0 };
                  if (exp instanceof Optional) return { base: exp.expression, min: 0 };
                  if (exp instanceof Plus) return { base: exp.expression, min: 1 };
                  return { base: exp, min: 1 };
            };

            const analyze = (exp: RegEx): { base: RegEx, min: number } | null => {
                  const list = exp instanceof Concatenation ? exp.expressions : [exp];
                  if (list.length === 0) return null;

                  const firstInfo = getBase(list[0]);
                  let totalMin = 0;

                  for (const item of list) {
                        const info = getBase(item);
                        if (!info.base.equals(firstInfo.base)) return null;
                        totalMin += info.min;
                  }

                  return { base: firstInfo.base, min: totalMin };
            };

            const infoA = analyze(a);
            const infoB = analyze(b);

            if (infoA && infoB && infoA.base.equals(infoB.base)) {
                  if (infoA.min >= infoB.min) return true;
            }

            return false;
      }
}
