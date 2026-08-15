import { Expression } from "./models/Expressions/Expression.ts";
import { BinaryExpression } from "./models/Expressions/kind/BinaryExpression.ts";
import { NumericExpression } from "./models/Expressions/kind/NumericExpression.ts";
import { toOperatorType } from "./models/Tokens/OperatorTypes.ts";
import { Token, TokenType } from "./models/Tokens/Token.ts";
import { BinaryTree } from "./models/Tree/BinaryTree.ts";


/* TODO:
“Omg tengo 2, omg le sigue un +, es una suma entonces! Que tengo a la derecha? Un 3!!, espera, ese 3 hace parte de una expresion con mas prelacion que yo? Miremos a la derecha? Omg es un asterisco, es una multiplicacion, que tengo a la derecha? Ohh un 4, entonces 3*4 es lo que tengo a mi derecha de la suma”
*/
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

      parseUnit() : Expression {
            const token = this.advance();

            if (token.type === TokenType.Number ) {
                  return new NumericExpression(Number(token.lexeme))
            }

            throw new Error("Expected number")
      }

      parseBinary(): Expression {
            const left = this.parseUnit();
            const token = this.peek();

            if (token.type === TokenType.Operator ) {
                  const operator = this.advance();
                  const right = this.parseUnit();
                  return new BinaryExpression(toOperatorType(operator.lexeme), left, right)
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
