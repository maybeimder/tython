import { BaseExpression, ExpressionKind } from "../Expression.ts";
import { TokenType } from "../../Tokens/Token.ts";
import { Expression } from "../Expression.ts";

export class BinaryExpression implements BaseExpression {
      kind: ExpressionKind
      operator: TokenType
      left: Expression
      right: Expression

      constructor(left: Expression, right: Expression) {
            this.kind = ExpressionKind.Binary;
            this.operator = TokenType.Operator;
            this.left = left;
            this.right = right;
      }

      toString(): string { return `${this.left}\n${this.operator}\n${this.right}`}

}
