import GraphEditor from "./views/GraphEditor";
import { MinimalDFAConstructor } from "../../src/automates/Automaton/constructors/DFA/MinimalConstructor"
import { MinimalNFAConstructor } from "../../src/automates/Automaton/constructors/NFA/MinimalNFAConstructor"
import EngineTranslator from "../core/EngineTranslator";

const api = new EngineTranslator();

api.graphConstructor = new MinimalDFAConstructor();
api.setRegexSnippet("[a|b]* a b b", "A", ["D"]);
const graph = api.translate();

console.dir(graph, { depth: null })

export default function App() {
      return <div className="w-screen h-screen"> <GraphEditor automaton={graph} /> </div>
}
