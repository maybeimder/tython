import { LanguageRef } from "../../regex/models/regex/LanguageRef.ts";
import { Alphabet, AutomatonSymbol } from "../../regex/models/todo/Alphabet.ts";
import Graph from "../Graph.ts";
import { StateIDGenerator } from "./constructors/StateIDGenerator.ts";
import { State } from "./State.ts";

export class Automaton extends Graph<State, AutomatonSymbol> {
      private _alphabet: Alphabet;
      private _initialStateIdx: string | null;
      private _finalStateIdx: string | null;
      private _stateLabeler = new StateIDGenerator();

      constructor(alphabet: Alphabet) {
            super();
            this._alphabet = alphabet;
            this._initialStateIdx = null;
            this._finalStateIdx = null;
      }

      override addEdge(from: string, to: string, symbol: AutomatonSymbol): void {
            if (symbol === null) {
                  super.addEdge(from, to, null);
                  return;
            }

            const automatonSymbol = this._alphabet.get(symbol);
            if (!automatonSymbol) return;

            super.addEdge(from, to, symbol);
      }

      createState(): string {
            const id = this._stateLabeler.next();
            this.addNode(id, new State(id));
            return id;
      }

      private get _states(): Record<string, State> {
            return this._nodes;
      }
      private set _states(states: Record<string, State>) {
            this._nodes = states;
      }
}
