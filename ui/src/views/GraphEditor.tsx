import { Automaton } from "../../../src/automates/Automaton/Automaton";
import { GraphRepresentation } from "../models/representations/GraphRepresentation";
import GraphViewport from "./GraphViewport";
import GraphWorld from "./GraphWorld";

export default function GraphEditor({ automaton }: {automaton:GraphRepresentation}) {
      return (
            <GraphViewport>
                  <GraphWorld automaton={automaton} />
            </GraphViewport>
      )
}
