import { Expression } from "../Expressions/Expression.ts";

export enum TokenType {
      "Identifier" = "Identifier",
      "Number" = "Number",
      "Operator" = "Operator",
      "Delimiter" = "Delimiter",
}

export class Token {
      type: TokenType;
      lexeme: string;

      constructor(type: TokenType, lexeme: string) {
            this.type = type;
            this.lexeme = lexeme;
      }

      toString() {
            return `${this.type}(${this.lexeme})`
      }


}
