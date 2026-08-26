import { ExpressionKind } from "../../../compiler/models/Expressions/Expression.ts"

export abstract class RegEx {
      kind: ExpressionKind

      constructor() {
            this.kind = ExpressionKind.Regex
      }

      toString(): string { return `${this.kind}`}
}
