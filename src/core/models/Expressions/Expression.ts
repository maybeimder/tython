import { NumericExpression } from "./kind/NumericExpression.ts"
import { BinaryExpression } from "./kind/BinaryExpression.ts"

export interface BaseExpression {
      kind: ExpressionKind,
      toString(): string,
}

export enum ExpressionKind {
      "Numeric",
      "Binary"
}

export type Expression = NumericExpression | BinaryExpression
