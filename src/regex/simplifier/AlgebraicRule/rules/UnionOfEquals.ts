import { RegEx } from "../../../models/regex/RegEx.ts";
import { Union } from "../../../models/regex/Union.ts";
import { AlgebraicRule } from "../AlgebraicRule.ts";

export class UnionOfEquals extends AlgebraicRule {
      static apply(expression: RegEx): RegEx | null {
                  if (!(expression instanceof Union)) return null;

                  const alts = expression.alternatives;
                  const unique: RegEx[] = [];
                  let changed = false;

                  for (const alt of alts) {
                        if (!unique.some(u => u.equals(alt))) {
                              unique.push(alt);
                        } else {
                              changed = true;
                        }
                  }

                  if (!changed) return null;

                  return unique.length === 1 ? unique[0] : new Union(unique);
            }
}
