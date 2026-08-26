import { Alphabet } from "./Alphabet.ts";

export class Language {
      private _alphabet: Alphabet
      private _strings: String[]

      constructor(alphabet:Alphabet, strings: String[] = []) {
            this._alphabet = alphabet;
            this._strings = strings;
      }

      union(language: Language) {
            const union_symbols = [
                  ...new Set([...this._alphabet.symbols, ...language._alphabet.symbols])
            ]

            const union_strings = [
                  ...new Set([...this._strings, ...language._strings])
            ]

            return new Language(
                  new Alphabet(union_symbols),
                  union_strings
            )
      }

      get strings() { return this._strings }
      get alphabet() { return this._alphabet }

      set strings(strings:String[]) { this._strings = strings}
}
