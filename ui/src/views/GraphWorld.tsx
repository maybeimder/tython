import { useEffect, useRef, useState } from "react";
import EdgeLayer from "./layers/EdgeLayer";
import NodeLayer from "./layers/NodeLayer"
import { NodeDragController } from "../controllers/controls/NodeDragController";
import { EdgeDragController } from "../controllers/controls/EdgeDragController";
import { GraphRepresentation } from "../models/representations/GraphRepresentation";

export default function GraphWorld({ automaton }: {automaton:GraphRepresentation}) {
      const [_, reRender] = useState({});
      const containerRef = useRef<HTMLDivElement>(null);

      useEffect(() => {
            if (!containerRef.current) return;

            const controller = new NodeDragController(containerRef.current, automaton.nodes, () => reRender({}))
            const edgeController = new EdgeDragController(automaton.edges, () => reRender({}));

            controller.attach();
            edgeController.attach();

            return () => {
                  controller.detach();
                  edgeController.detach();
            };
      }, [])

      return (
            <div ref={containerRef} className="w-screen h-screen bg-surface absolute top-0 left-0">
                  <NodeLayer nodes={automaton.nodes} />
                  <EdgeLayer edges={automaton.edges} />
            </div>
      )
}
