import { RegEx } from "../../../models/regex/RegEx.ts";
import { Concatenation } from "../../../models/regex/Concatenation.ts";
import { Star } from "../../../models/regex/Star.ts";
import { Plus } from "../../../models/regex/Plus.ts";
import { Optional } from "../../../models/regex/Optional.ts";
import { AlgebraicRule } from "../AlgebraicRule.ts";

export class ConcatMerge extends AlgebraicRule {
      static override apply(expression: RegEx): RegEx | null {
            if (!(expression instanceof Concatenation)) return null;

            const exprs = expression.expressions;
            if (exprs.length < 2) return null;

            for (let i = 0; i < exprs.length - 1; i++) {
                  const left = exprs[i];
                  const right = exprs[i + 1];

                  const getInfo = (node: RegEx) => {
                        if (node instanceof Star) return { base: node.expression, mod: 'star' };
                        if (node instanceof Plus) return { base: node.expression, mod: 'plus' };
                        if (node instanceof Optional) return { base: node.expression, mod: 'optional' };
                        return { base: node, mod: 'exact' };
                  };

                  const l = getInfo(left);
                  const r = getInfo(right);

                  if (l.base.equals(r.base)) {
                        const base = l.base;
                        let merged: RegEx | null = null;

                        // r* · r* = r*
                        if (l.mod === 'star' && r.mod === 'star') merged = new Star(base);
                        // r · r* = r+  |  r* · r = r+
                        else if ((l.mod === 'exact' && r.mod === 'star') || (l.mod === 'star' && r.mod === 'exact')) merged = new Plus(base);
                        // r+ · r* = r+  |  r* · r+ = r+
                        else if ((l.mod === 'plus' && r.mod === 'star') || (l.mod === 'star' && r.mod === 'plus')) merged = new Plus(base);
                        // r* · r? = r*  |  r? · r* = r*
                        else if ((l.mod === 'star' && r.mod === 'optional') || (l.mod === 'optional' && r.mod === 'star')) merged = new Star(base);
                        // r+ · r? = r+  |  r? · r+ = r+
                        else if ((l.mod === 'plus' && r.mod === 'optional') || (l.mod === 'optional' && r.mod === 'plus')) merged = new Plus(base);

                        if (merged) {
                              const newExprs = [...exprs];
                              newExprs.splice(i, 2, merged);
                              return newExprs.length === 1 ? newExprs[0] : new Concatenation(newExprs);
                        }
                  }
            }
            return null;
      }
}
