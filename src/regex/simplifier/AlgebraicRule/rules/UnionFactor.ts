import { Concatenation } from "../../../models/regex/Concatenation.ts";
import { Epsilon } from "../../../models/regex/Epsilon.ts";
import { RegEx } from "../../../models/regex/RegEx.ts";
import { Union } from "../../../models/regex/Union.ts";
import { AlgebraicRule } from "../AlgebraicRule.ts";

export class UnionFactor extends AlgebraicRule {
      static override apply(expression: RegEx): RegEx | null {
            if (!(expression instanceof Union)) return null;

            const alts = expression.alternatives;
            const seq = (e: RegEx) => e instanceof Concatenation ? e.expressions : [e];
            const build = (items: RegEx[]): RegEx =>
                  items.length === 0 ? new Epsilon()
                  : items.length === 1 ? items[0]
                  : new Concatenation(items);

            for (let i = 0; i < alts.length; i++) {
                  for (let j = i + 1; j < alts.length; j++) {
                        const A = seq(alts[i]), B = seq(alts[j]);
                        const max = Math.min(A.length, B.length);

                        let p = 0;
                        while (p < max && A[p].equals(B[p])) p++;

                        let s = 0;
                        while (s < max - p && A[A.length - 1 - s].equals(B[B.length - 1 - s])) s++;

                        if (p + s === 0) continue;

                        const factored = build([
                              ...A.slice(0, p),
                              new Union([build(A.slice(p, A.length - s)), build(B.slice(p, B.length - s))]),
                              ...A.slice(A.length - s),
                        ]);

                        const rest = alts.filter((_, k) => k !== i && k !== j);
                        return rest.length === 0 ? factored : new Union([...rest, factored]);
                  }
            }
            return null;
      }
}
