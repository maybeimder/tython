import { Epsilon } from "../../../models/regex/Epsilon.ts";
import { RegEx } from "../../../models/regex/RegEx.ts";
import { Star } from "../../../models/regex/Star.ts";
import { Union } from "../../../models/regex/Union.ts";
import { AlgebraicRule } from "../AlgebraicRule.ts";
import { toRuns } from "./UnionContainment.ts";

export class StarOfRuns extends AlgebraicRule {
      static override apply(expression: RegEx): RegEx | null {
            if (!(expression instanceof Star)) return null;

            const inner = expression.expression;
            const alts = inner instanceof Union ? inner.alternatives : [inner];
            const runs = alts
                  .filter((alt) => !(alt instanceof Epsilon))
                  .map(toRuns);

            if (runs.length === 0 || runs.some((r) => r.length !== 1))
                  return null;

            const base = runs[0][0].base;
            if (!runs.every((r) => r[0].base.equals(base))) return null;

            const hasSingle = runs.some((r) => r[0].min <= 1 && r[0].max >= 1);
            return hasSingle ? new Star(base) : null;
      }
}
