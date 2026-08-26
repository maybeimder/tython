import { ExpressionKind } from "../../../compiler/models/Expressions/Expression.ts"
import { Plus } from "./Plus.ts"

export abstract class RegEx {
      kind: ExpressionKind

      constructor() {
            this.kind = ExpressionKind.Regex
      }

      equals(other: RegEx): boolean { return true };
      asPlus(): Plus | null { return null }
      toString(): string { return `${this.kind}`}
}
