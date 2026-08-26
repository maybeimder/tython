import { NumericExpression } from "./kind/NumericExpression.ts"
import { BinaryExpression } from "./kind/BinaryExpression.ts"
import { IdentifierExpression } from "./kind/IdentifierExpression.ts"
import { RegEx } from "../../../regex/models/regex/RegEx.ts"

export interface BaseExpression {
      kind: ExpressionKind,
      toString(): string,
}

export enum ExpressionKind {
      "Numeric",
      "Binary",
      "Identifier",
      "Regex"
}

export type Expression = NumericExpression | BinaryExpression | IdentifierExpression | RegEx
