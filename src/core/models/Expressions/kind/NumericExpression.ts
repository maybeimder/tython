import { BaseExpression, Expression, ExpressionKind } from "../Expression.ts";
import { TokenType } from "../../../Tokens/Token.ts";

export class NumericExpression implements BaseExpression {
      kind: ExpressionKind
      value: TokenType.Number

      constructor(value: TokenType.Number) {
            this.kind = ExpressionKind.Numeric;
            this.value = value;
      }

      toString(): string { return `${this.kind}(${this.value})`}
}
