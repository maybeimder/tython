import { TokenType } from "../../../../../compiler/models/Tokens/Token.ts";
import { Parser } from "../../../../../compiler/Parser.ts";
import { Concatenation } from "../../../regex/Concatenation.ts";
import { Optional } from "../../../regex/Optional.ts";
import { Plus } from "../../../regex/Plus.ts";
import { RegEx } from "../../../regex/RegEx.ts";
import { Star } from "../../../regex/Star.ts";
import { Union } from "../../../regex/Union.ts";
import { LanguageRef } from "../../../regex/LanguageRef.ts";
import { RegexToken } from "../../RegexToken.ts";

export class RegexParser extends Parser {

      constructor(tokens: RegexToken[]=[]) {
            super();
            this._tokens = tokens;
            this._current = 0;
      }

      advance() { return this._tokens[this._current++]; }
      peek() { return this._tokens[this._current]; }
      isAtEnd() { return this._current >= this._tokens.length; }

      parseUnitary(): RegEx {
            const token = this.advance();

            if (token.type === TokenType.Reference)
                  return new LanguageRef(token.lexeme);


            if (token.type === TokenType.RegexDelimiter && token.lexeme === "[") {
                  const internalExpression = this.parseExpression();

                  const closingParenthesis = this.advance();
                  if (!closingParenthesis || closingParenthesis.lexeme !== "]") {
                        throw new Error("Expected ')' but not found");
                  }
                  return internalExpression;
            }

            throw new Error(`Unexpected token: ${token.lexeme}`);
      }

      // Operadores
      private parsePostfix(): RegEx {
            let left = this.parseUnitary();

            while (
                  !this.isAtEnd() &&
                  this.peek().type === TokenType.Abreviature &&
                  (this.peek().lexeme === "*" || this.peek().lexeme === "+" || this.peek().lexeme === "?")
            ) {
                  const operatorToken = this.advance();

                  if (operatorToken.lexeme === "*") {
                        left = new Star(left);
                  } else if (operatorToken.lexeme === "+") {
                        left = new Plus(left);
                  } else if (operatorToken.lexeme === "?") {
                        left = new Optional(left);
                  }
            }

            return left;
      }

      // Concatenación implicita
      private parseConcatenation(): RegEx {
            let left = this.parsePostfix();

            while (
                  !this.isAtEnd() &&
                  this.peek().lexeme !== "|" &&
                  this.peek().lexeme !== ")" &&
                  (
                        this.peek().type === TokenType.Reference ||
                        (this.peek().type === TokenType.Delimiter && this.peek().lexeme === "(")
                  )
            ) {
                  const right = this.parsePostfix();
                  left = new Concatenation([left, right]);
            }

            return left;
      }

      private parseAlternation(): RegEx {
            let left = this.parseConcatenation();

            while (!this.isAtEnd() && this.peek().lexeme === "|") {
                  this.advance()
                  const right = this.parseConcatenation();
                  left = new Union([left, right]);
            }

            return left;
      }

      public parseExpression(): RegEx {
            return this.parseAlternation();
      }

      set tokens(tokens: RegexToken[]) {
          this._tokens = tokens;
          this._current = 0;
      }
}
