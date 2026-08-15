/*
      Analizador Léxico:
      Primera fase de un compilador. Lee los caracteres de entrada suministrados por un programa fuente
      y elabora una secuencia de componentes léxicos que toma el Analizador Sintáctico para hacer el análisis
*/
import { CharHelper } from "./helpers/CharHelper.ts";
import { Token, TokenType } from "./models/Tokens/Token.ts";

export class Lexer {
      private _snippet: string;
      private _tokens: Token[];
      private _current: number;

      constructor(snippet: string) {
            this._snippet = snippet;
            this._tokens = [];
            this._current = 0;
      }

      advance() { return this._snippet.charAt(this._current++) }
      peek() { return this._snippet.charAt(this._current) }
      reverse() { return this._snippet.charAt(this._current--) }

      extractTokens(): Token[] {
            while (this._current < this._snippet.length) {
                  let actual = this.peek();

                  // Si es un espacio, tab o derivado.
                  if (CharHelper.isWhitespace(actual)) {
                        this.advance();
                        continue;
                  }

                  // Si es un delimiter
                  else if (CharHelper.isDelimiter(actual)) {
                        this._tokens.push(
                              new Token(TokenType.Delimiter, actual))
                        this.advance();
                        continue;
                  }

                  // Si es un operador
                  else if (CharHelper.isOperator(actual)) {
                        this._tokens.push(
                              new Token(TokenType.Operator, actual))
                        this.advance();
                        continue;
                  }

                  // Si es un dígito
                  else if (CharHelper.isDigit(actual)) {
                        let number = ""
                        while (this._current < this._snippet.length && CharHelper.isDigit(this.peek())) {
                              number += this.advance();
                        }
                        this._tokens.push(
                              new Token(TokenType.Number, number))

                        continue;
                  }

                  // Si es un identificador
                  else if (CharHelper.isLetter(actual)) {
                        let identifier = ""
                        while (this._current < this._snippet.length && CharHelper.isDigit(this.peek()) || CharHelper.isLetter(this.peek())) {
                              identifier += this.advance();
                        }
                        this._tokens.push(
                              new Token(TokenType.Identifier, identifier))

                        continue;
                  }

                  else {
                        console.log("NOT IDENTIFIED")
                  }

            }
            return this._tokens
      }

      get snippet() { return this._snippet }
      get tokens() { return this._tokens }

      set snippet(snippet: string) { this._snippet = snippet;}

}
