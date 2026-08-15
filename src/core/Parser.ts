import { Expression } from "./models/Expressions/Expression.ts";
import { BinaryExpression } from "./models/Expressions/kind/BinaryExpression.ts";
import { NumericExpression } from "./models/Expressions/kind/NumericExpression.ts";
import { Operator } from "./models/Operator/Operators.ts";
import { Token, TokenType } from "./models/Tokens/Token.ts";
import { BinaryTree } from "./models/Tree/BinaryTree.ts";



export class Parser {
      private _tokens: Token[];
      private _AST: BinaryTree | null;
      private _current: number;

      constructor() {
            this._tokens = [];
            this._AST = null;
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

            throw new Error("Expected number")
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
                  const right = this.parseExpression(minPrecedence + 1);

                  left = new BinaryExpression(operator.type, left, right)
            }

            return left
      }

      buildAST() {
            let index = 0
            let actual : Token = this._tokens[index++]
            while (index < this._tokens.length && actual) {
                  actual = this._tokens[index++]

            }
      }

      get tokens() { return this._tokens }
      get ast() { return this._AST }

      set tokens(tokens: Token[]) { this._tokens = tokens }
}
