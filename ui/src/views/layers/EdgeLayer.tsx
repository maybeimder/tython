import React from "react";
import { EdgeRepresentation } from "../../models/representations/EdgeRepresentation";
import { EdgeRender } from "../renderers/EdgeRender";

export default function EdgeLayer({ edges }: { edges: EdgeRepresentation[] }) {
      const renderer = new EdgeRender();

      return (
            <svg id="edge-layer" className="absolute inset-0 w-full h-full overflow-visible pointer-events-none z-0 stroke-muted fill-muted">
                  <defs>
                        <marker
                              id="arrow"
                              markerWidth="10"
                              markerHeight="10"
                              refX="9"
                              refY="3"
                              orient="auto"
                              markerUnits="strokeWidth"
                        >
                              <path d="M0,0 L0,6 L5,3 z" />
                        </marker>
                  </defs>

                  {edges.map((edge, index) => (
                        <React.Fragment key={index}>
                              {renderer.render(edge)}
                        </React.Fragment>
                  ))}
            </svg>
      );
}
