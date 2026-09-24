import React from "react";
import { EdgeRepresentation } from "../../models/representations/EdgeRepresentation";
import { Render } from "./Render";
import { EdgeGeometryCalculator } from "../../utils/EdgeGeometry";

export class EdgeRender implements Render<EdgeRepresentation> {
      private calculator = new EdgeGeometryCalculator();

      render(model: EdgeRepresentation): React.ReactNode {
            const geometry = this.calculator.calculate(model);

            return (
                  <g>
                        <path
                              d={geometry.path}
                              className="stroke-muted"
                              fill="none"
                              strokeWidth={2}
                              markerEnd="url(#arrow)"
                        />

                        <circle
                              cx={geometry.handleX}
                              cy={geometry.handleY}
                              r={10}
                              fill="transparent"
                              className="pointer-events-auto stroke-0 cursor-grab"
                              onPointerDown={(e) => {
                                    e.preventDefault();
                                    e.currentTarget.setPointerCapture(
                                          e.pointerId,
                                    );
                                    model.vertexPointerDown.emit({
                                          x: e.clientX,
                                          y: e.clientY,
                                    });
                              }}
                        />

                        <text
                              x={geometry.labelX}
                              y={geometry.labelY}
                              textAnchor="middle"
                              dominantBaseline="middle"
                              className="fill-muted font-mono text-sm select-none pointer-events-none"
                              style={{
                                    paintOrder: "stroke",
                                    stroke: "var(--color-surface, #171717)",
                                    strokeWidth: 20,
                                    strokeLinejoin: "round",
                              }}
                        >
                              {model.label}
                        </text>
                  </g>
            );
      }
}
