import React from "react";
import { NodeRepresentation } from "../../models/representations/NodeRepresentation";
import { Render } from "./Render";

export class NodeRender implements Render<NodeRepresentation> {
      render(model: NodeRepresentation): React.ReactNode {
            return (
                  <div
                        className="hover:shadow-[0px_0px_8px_var(--color-foreground)] outline-foreground/40 border-foreground/40 border transition cursor-grab z-1 select-none bg-surface-lighter font-mono font-bold absolute inset-0 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full shadow-md outline-offset-4"
                        style={{
                              width: `${model.size * 2}px`,
                              height: `${model.size * 2}px`,
                              left: model.x,
                              top: model.y,
                              borderStyle: model.isEndState ? "solid" : "none",
                              outlineStyle: model.isEndState ? "solid" : "none",
                              outlineWidth: "1px",
                        }}
                        onPointerDown={(e) => {
                              e.preventDefault();
                              e.currentTarget.setPointerCapture(e.pointerId);
                              model.pointerDown.emit({
                                    x: e.clientX,
                                    y: e.clientY,
                              });
                        }}
                        onPointerUp={(e) =>
                              e.currentTarget.releasePointerCapture(e.pointerId)
                        }
                  >
                        {model.isStartState && (
                              <span className="absolute left-0 font-bold text-foreground/40 text-3xl -translate-x-5">
                                    →
                              </span>
                        )}

                        {model.label}
                  </div>
            );
      }
}
