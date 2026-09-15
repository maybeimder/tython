export default class Node<T> {
      private _data: T;
      private _adjacents: Record<string, number|string>;

      constructor(data: any) {
            this._data = data;
            this._adjacents = [];
      }

      addAdjacent(nodeRef: string) : void {
            if (!this._adjacents.includes(nodeRef)) {

            }
      }

      toString() { return `${this._data}`}
}
