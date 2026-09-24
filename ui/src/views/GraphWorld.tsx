import { useEffect, useRef, useState } from "react";
import { EdgeRepresentation } from "../models/representations/EdgeRepresentation";
import { NodeRepresentation } from "../models/representations/NodeRepresentation";
import EdgeLayer from "./layers/EdgeLayer";
import NodeLayer from "./layers/NodeLayer"
import { NodeDragController } from "../controllers/controls/NodeDragController";
import { anchorsOf } from "../models/connections/Anchor";
import { EdgeDragController } from "../controllers/controls/EdgeDragController";

const nodeA = new NodeRepresentation({ x: 500, y: 500, label: "A", size: 20, isEndState: false, isStartState: true });
const nodeB = new NodeRepresentation({ x: 700, y: 500, label: "B", size: 20, isEndState: false, isStartState: false });
const nodeC = new NodeRepresentation({ x: 900, y: 500, label: "C", size: 20, isEndState: true, isStartState: false });

const nodes: NodeRepresentation[] = [nodeA, nodeB, nodeC]

const edges: EdgeRepresentation[] = [
      new EdgeRepresentation({ source: anchorsOf(nodeA).left, target: anchorsOf(nodeA).left,   label: "a" }),
      new EdgeRepresentation({ source: anchorsOf(nodeB).left, target: anchorsOf(nodeB).left,   label: "a" }),
      new EdgeRepresentation({ source: anchorsOf(nodeB).right, target: anchorsOf(nodeA).left,  label: "a", curvature: -45 }),
      new EdgeRepresentation({ source: anchorsOf(nodeA).right, target: anchorsOf(nodeB).left,  label: "b", curvature:  45 }),
      new EdgeRepresentation({ source: anchorsOf(nodeB).right, target: anchorsOf(nodeC).left,  label: "b" }),
];

export default function GraphWorld() {
      const [_, reRender] = useState({});
      const containerRef = useRef<HTMLDivElement>(null);

      useEffect(() => {
            if (!containerRef.current) return;

            const controller = new NodeDragController(containerRef.current, nodes, () => reRender({}))
            const edgeController = new EdgeDragController(edges, () => reRender({}));

            controller.attach();
            edgeController.attach();

            return () => {
                  controller.detach();
                  edgeController.detach();
            };
      }, [])

      return (
            <div ref={containerRef} className="w-screen h-screen bg-surface absolute top-0 left-0">
                  <NodeLayer nodes={nodes} />
                  <EdgeLayer edges={edges} />
            </div>
      )
}
