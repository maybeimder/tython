import { useState } from "react";
import GraphEditor from "./views/GraphEditor";
import AppInput from "./AppInput";
import { GraphRepresentation } from "./models/representations/GraphRepresentation";

export default function App() {
      const [graph, setGraph] = useState<GraphRepresentation | null>(null);

      return (
            <div className="w-screen h-screen flex flex-col">
                  <AppInput onGraphChange={setGraph} />

                  <div className="relative flex-1">
                        {graph && <GraphEditor automaton={graph} />}
                  </div>
            </div>
      );
}
