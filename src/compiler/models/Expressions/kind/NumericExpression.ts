import { BaseExpression, ExpressionKind } from "../Expression.ts";
import { TokenType, type TokenTypeMap } from "../../Tokens/Token.ts";

export class NumericExpression implements BaseExpression {
      kind: ExpressionKind
      value: TokenTypeMap[TokenType.Number]

      constructor(value: TokenTypeMap[TokenType.Number]) {
            this.kind = ExpressionKind.Numeric;
            this.value = value;
      }

      toString(): string { return `${this.kind}(${this.value})`}
}
