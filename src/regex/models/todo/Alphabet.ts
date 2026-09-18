export class Alphabet {
      private _symbols: Set<AlphabetSymbol>

      constructor(symbols: Set<AlphabetSymbol>) {
            this._symbols = symbols;
      }

      get symbols() { return this._symbols }

      get(AlphabetSymbol: AlphabetSymbol): AlphabetSymbol {
            if (!this._symbols.has(AlphabetSymbol))
                  throw new Error("AlphabetSymbol not in alphabet")

            return AlphabetSymbol as AlphabetSymbol
      }
}

export type AlphabetSymbol = string
export type EpsilonSymbol = null;
export type AutomatonSymbol = AlphabetSymbol | EpsilonSymbol
