import { Expression } from "../Expressions/Expression.ts";

export class Node {
      private _value: Expression;
      private _left: Node | null;
      private _right: Node | null;

      constructor(value: Expression) {
            this._value = value;
            this._left = null;
            this._right = null;
      }

      get value() { return this._value }
      get left() { return this._left }
      get right() { return this._right }

      set value(value:Expression) { this._value = value }
      set left(left:Node | null) { this._left = left }
      set right(right:Node | null) { this._right = right}
}
