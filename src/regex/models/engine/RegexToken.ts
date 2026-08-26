import { Token, TokenType } from "../../../compiler/models/Tokens/Token.ts";

export class RegexToken extends Token {

      constructor(type: TokenType, lexeme: string) {
            super(type, lexeme);
            this.type = type;
            this.lexeme = lexeme;
      }

      toString() {
            return `${this.type}(${this.lexeme})`
      }
}
