import { NumericExpression } from "./kind/NumericExpression.ts"
import { BinaryExpression } from "./kind/BinaryExpression.ts"
import { IdentifierExpression } from "./kind/IdentifierExpression.ts"

export interface BaseExpression {
      kind: ExpressionKind,
      toString(): string,
}

export enum ExpressionKind {
      "Numeric",
      "Binary",
      "Identifier"
}

export type Expression = NumericExpression | BinaryExpression | IdentifierExpression
