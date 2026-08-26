import { Expression } from "./models/Expressions/Expression.ts";
import { BinaryExpression } from "./models/Expressions/kind/BinaryExpression.ts";
import { IdentifierExpression } from "./models/Expressions/kind/IdentifierExpression.ts";
import { NumericExpression } from "./models/Expressions/kind/NumericExpression.ts";
import { Operator } from "./models/Operator/Operators.ts";
import { Token, TokenType } from "./models/Tokens/Token.ts";



export class Parser {
      protected _tokens: Token[];
      protected _current: number;

      constructor() {
            this._tokens = [];
            this._current = 0;
      }

      advance() { return this._tokens[this._current++] }
      peek() { return this._tokens[this._current] }
      reverse() { return this._tokens[this._current--] }

      parseUnitary(): Expression {
            const token = this.advance();

            if (token.type === TokenType.Number) {
                  return new NumericExpression(Number(token.lexeme))
            }

            if (token.type === TokenType.Identifier) {
                  return new IdentifierExpression(token.lexeme)
            }

            if (token.type === TokenType.Delimiter && token.lexeme === "(") {
                  const internalExpression = this.parseExpression();

                  const closingParenthesis = this.advance();
                  if (closingParenthesis.type !== TokenType.Delimiter || closingParenthesis.lexeme !== ")") {
                        throw new Error("Expected ')' but not found")
                  }
                  return internalExpression;
            }

            throw new Error("Expected number or '('")
      }

      parseExpression(minPrecedence: number = 1): Expression {
            let left = this.parseUnitary();

            while (true) {
                  const token = this.peek();

                  if (!token || token.type !== TokenType.Operator)
                        break;

                  const operator = new Operator(token.lexeme);
                  const precedence = operator.precendece;

                  if (minPrecedence > precedence)
                        break;

                  this.advance();
                  const right = this.parseExpression(
                        operator.leftAssociativity
                              ? precedence + 1
                              : precedence
                        );

                  left = new BinaryExpression(operator, left, right)
            }

            return left
      }

      get tokens() { return this._tokens }
      set tokens(tokens: Token[]) { this._tokens = tokens; this._current=0 }
}
