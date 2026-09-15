import { LanguageRef } from "../../regex/models/regex/LanguageRef.ts";
import { Alphabet, AlphabetSymbol } from "../../regex/models/todo/Alphabet.ts";
import Graph from "../Graph.ts";
import { State } from "./State.ts";

export class Automaton extends Graph<State, AlphabetSymbol> {
      private _alphabet: Alphabet;
      private _initialStateIdx: string | null;
      private _finalStateIdx: string | null;

      constructor(alphabet: Alphabet) {
            super();
            this._alphabet = alphabet;
            this._initialStateIdx = null;
            this._finalStateIdx = null;
      }

      override addEdge(from: string, to: string, symbol: AlphabetSymbol): void {
            const alphabetSymbol = this._alphabet.get(symbol);

            if (!symbol) return;
            super.addEdge(from, to, symbol);
      }

      private get _states(): Record<string, State> {
            return this._nodes;
      }
      private set _states(states: Record<string, State>) {
            this._nodes = states;
      }
}
