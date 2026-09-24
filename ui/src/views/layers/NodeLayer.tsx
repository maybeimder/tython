import React from "react";
import { NodeRepresentation } from "../../models/representations/NodeRepresentation";
import { NodeRender } from "../renderers/NodeRender";

export default function NodeLayer({ nodes }: { nodes: NodeRepresentation[] }) {
      const nodeRenderer = new NodeRender();

      return (
            <>
                  {nodes.map((node, index) => (
                        <React.Fragment key={index}>
                              {nodeRenderer.render(node)}
                        </React.Fragment>
                  ))}
            </>
      );
}
