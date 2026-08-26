import { BaseExpression, ExpressionKind } from "../Expression.ts";
import { Expression } from "../Expression.ts";
import { TokenType, TokenTypeMap } from "../../Tokens/Token.ts";

export class IdentifierExpression implements BaseExpression {
      kind: ExpressionKind
      lexeme: string

      constructor(lexeme: string) {
            this.kind = ExpressionKind.Identifier;
            this.lexeme = lexeme;
      }

      toString(): string { return `${this.kind}(${this.lexeme})`}

}
