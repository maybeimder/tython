import { CharHelper } from "../../../compiler/helpers/CharHelper.ts";
import { Lexer } from "../../../compiler/Lexer.ts";
import { TokenType } from "../../../compiler/models/Tokens/Token.ts";
import { RegEx } from "../regex/RegEx.ts";
import { RegexToken } from "./RegexToken.ts";

export class RegexLexer extends Lexer{
      protected _regexs: RegEx[];

      constructor(snippet: string) {
            super(snippet);
            this._snippet = snippet;
            this._regexs = [];
            this._tokens = [];
            this._current = 0;
      }

      advance() { return this._snippet.charAt(this._current++) }
      peek() { return this._snippet.charAt(this._current) }
      reverse() { return this._snippet.charAt(--this._current) }

      extractTokens(): RegexToken[] {
            this._tokens = []; // Limpiamos tokens anteriores
            this._current = 0; // Reiniciamos el cursor

            while (this._current < this._snippet.length) {
                  let actual = this.peek();

                  // whitespace como separador
                  if (CharHelper.isWhitespace(actual)) {
                        this.advance();
                        continue;
                  }

                  // '+', '*', '?'
                  else if (CharHelper.isRegexAbreviature(actual)) {
                        this._tokens.push(
                              new RegexToken(TokenType.Abreviature, actual)
                        );
                        this.advance();
                        continue;
                  }

                  // '[' ']'
                  else if (CharHelper.isDelimiter(actual)) {
                        this._tokens.push(
                              new RegexToken(TokenType.Delimiter, actual)
                        );
                        this.advance();
                        continue;
                  }


                  // Si es una referencia
                  else if (CharHelper.isLetter(actual) || CharHelper.isDigit(actual)) {
                        let referencia = "";

                        // Seguir leyendo letras hasta encontrar una abreviatura, espacio o unknown
                        while (
                              this._current < this._snippet.length &&
                              (CharHelper.isLetter(this.peek()) || CharHelper.isDigit(this.peek()))
                        ) {
                              referencia += this.advance();
                        }

                        this._tokens.push(
                              new RegexToken(TokenType.Reference, referencia)
                        );
                        continue;
                  }

                  // fallback
                  else {
                        console.warn(`NOT IDENTIFIED TOKEN: '${actual}' at position ${this._current}`);
                        this.advance();
                  }
            }

            return this._tokens;
      }

      get snippet() { return this._snippet }
      get RegExs() { return this._regexs }

      set snippet(snippet: string) { this._snippet = snippet;}

}
