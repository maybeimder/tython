import { BaseExpression, ExpressionKind } from "../Expression.ts";
import { Expression } from "../Expression.ts";
import { Operator } from "../../Operator/Operators.ts";

export class BinaryExpression implements BaseExpression {
      kind: ExpressionKind
      operator: Operator
      left: Expression
      right: Expression

      constructor(operator: Operator, left: Expression, right: Expression) {
            this.kind = ExpressionKind.Binary;
            this.operator = operator;
            this.left = left;
            this.right = right;
      }

      // Verbosa
      // toString(): string { return `${this.left}\n${this.operator}\n${this.right}`}
}
