import { RegEx } from "../../../models/regex/RegEx.ts";
import { Union } from "../../../models/regex/Union.ts";
import { Plus } from "../../../models/regex/Plus.ts";
import { AlgebraicRule } from "../AlgebraicRule.ts";
import { Star } from "../../../models/regex/Star.ts";
import { Concatenation } from "../../../models/regex/Concatenation.ts";
import { Optional } from "../../../models/regex/Optional.ts";
import { Epsilon } from "../../../models/regex/Epsilon.ts";


export type Run = { base: RegEx; min: number; max: number };

function toRun(node: RegEx): Run {
      if (node instanceof Star) return { base: node.expression, min: 0, max: Infinity };
      if (node instanceof Plus) return { base: node.expression, min: 1, max: Infinity };
      if (node instanceof Optional) return { base: node.expression, min: 0, max: 1 };
      if (node instanceof Union && node.alternatives.some(a => a instanceof Epsilon)) {
            const rest = node.alternatives.filter(a => !(a instanceof Epsilon));
            if (rest.length > 0)
                  return { base: rest.length === 1 ? rest[0] : new Union(rest), min: 0, max: 1 };
      }
      return { base: node, min: 1, max: 1 };
}

export function toRuns(node: RegEx): Run[] {
      const items = node instanceof Concatenation ? node.expressions : [node];
      const runs: Run[] = [];
      for (const item of items) {
            const r = toRun(item);
            const last = runs[runs.length - 1];
            if (last && last.base.equals(r.base)) {
                  last.min += r.min;
                  last.max += r.max;
            } else runs.push({ ...r });
      }
      return runs;
}

export function fromRuns(runs: Run[]): RegEx[] {
      const out: RegEx[] = [];
      for (const { base, min, max } of runs) {
            for (let i = 0; i < min; i++) out.push(base);
            if (max === Infinity) out.push(new Star(base));
            else for (let i = min; i < max; i++) out.push(new Union([base, new Epsilon()]));
      }
      return out;
}

export function runsContained(a: Run[], b: Run[]): boolean {
      return a.length === b.length && a.every((r, i) =>
            r.base.equals(b[i].base) && r.min >= b[i].min && r.max <= b[i].max);
}

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
            return runsContained(toRuns(a), toRuns(b))
      }
}
