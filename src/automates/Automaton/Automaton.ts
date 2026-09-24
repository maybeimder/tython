import { LanguageRef } from "../../regex/models/regex/LanguageRef.ts";
import { Alphabet, AutomatonSymbol } from "../../regex/models/todo/Alphabet.ts";
import Graph from "../Graph.ts";
import { StateIDGenerator } from "./constructors/StateIDGenerator.ts";
import { State } from "./State.ts";

export class Automaton extends Graph<State, AutomatonSymbol> {
      private _alphabet: Alphabet;
      public initialStateIdx: string | null;
      public finalStateIdxs: Set<string> = new Set<string>();
      private _stateLabeler = new StateIDGenerator();

      constructor(alphabet: Alphabet) {
            super();
            this._alphabet = alphabet;
            this.initialStateIdx = null;
            this.finalStateIdxs = new Set<string>();
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

      public get states(): Record<string, State> {
            return this._nodes;
      }

      private set states(states: Record<string, State>) {
            this._nodes = states;
      }

      private set _finalStates(finalStates: Set<string>) {
            this.finalStateIdxs = finalStates;
      }

      private get _finalStates(): Set<string> {
            return this.finalStateIdxs;
      }

      private set _initialState(initialState: string | null) {
            this.initialStateIdx = initialState;
      }

      private get _initialState(): string | null {
            return this.initialStateIdx;
      }
}
