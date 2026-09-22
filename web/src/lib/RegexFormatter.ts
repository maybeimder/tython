import { RegEx } from "../../../src/regex/models/regex/RegEx.ts";
import { Concatenation } from "../../../src/regex/models/regex/Concatenation";
import { Union } from "../../../src/regex/models/regex/Union";
import { Star } from "../../../src/regex/models/regex/Star";
import { Plus } from "../../../src/regex/models/regex/Plus";
import { Optional } from "../../../src/regex/models/regex/Optional";

function flattenConcat(exp: RegEx): RegEx[] {
      if (exp instanceof Concatenation)
            return exp.expressions.flatMap(flattenConcat);
      return [exp];
}

function flattenUnion(exp: RegEx): RegEx[] {
      if (exp instanceof Union) return exp.alternatives.flatMap(flattenUnion);
      return [exp];
}

function formatAtomic(exp: RegEx): string {
      if (exp instanceof Concatenation) return `[${formatRegex(exp)}]`;
      return formatTerm(exp);
}

function formatTerm(exp: RegEx): string {
      if (exp instanceof Union) {
            return `[${flattenUnion(exp).map(formatRegex).join("|")}]`;
      }
      if (exp instanceof Star) return `${formatAtomic(exp.expression)}*`;
      if (exp instanceof Plus) return `${formatAtomic(exp.expression)}+`;
      if (exp instanceof Optional) return `${formatAtomic(exp.expression)}?`;
      return exp.toString();
}

export function formatRegex(exp: RegEx): string {
      if (exp instanceof Concatenation) {
            return flattenConcat(exp).map(formatTerm).join("");
      }
      return formatTerm(exp);
}
