export class Alphabet {
      private _symbols: string[]

      constructor(symbols: string[]) {
            this._symbols = symbols;
      }

      get symbols() { return this._symbols }
}
