import GraphEditor from "./views/GraphEditor";
import { MinimalDFAConstructor } from "../../src/automates/Automaton/constructors/DFA/MinimalConstructor"
import { MinimalNFAConstructor } from "../../src/automates/Automaton/constructors/NFA/MinimalNFAConstructor"
import EngineTranslator from "../core/EngineTranslator";

const api = new EngineTranslator();

api.graphConstructor = new MinimalDFAConstructor();
api.setRegexSnippet("b+ a+ b+");
const graph = api.translate();

console.dir(graph, { depth: null })

export default function App() {
      return (
            <div className="w-screen h-screen">
                  <GraphEditor automaton={graph} />
            </div>
      )

}
