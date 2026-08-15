import { BaseExpression, ExpressionKind } from "../Expression.ts";
import { TokenType } from "../../Tokens/Token.ts";
import { Expression } from "../Expression.ts";
import { OperatorType } from "../../Tokens/OperatorTypes.ts";

export class BinaryExpression implements BaseExpression {
      kind: ExpressionKind
      operator: OperatorType
      left: Expression
      right: Expression

      constructor(operator: OperatorType, left: Expression, right: Expression) {
            this.kind = ExpressionKind.Binary;
            this.operator = operator;
            this.left = left;
            this.right = right;
      }

      toString(): string { return `${this.left}\n${this.operator}\n${this.right}`}

}
