export class Node<T> {
      private _data: T;

      constructor(data: T) { this._data = data }

      toString() { return `${this._data}` }
}
