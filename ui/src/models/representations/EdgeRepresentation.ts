import { PointerPosition } from "../../controllers/GraphInteraction";
import { Emitter } from "../../utils/Emitter";
import { Anchor } from "../connections/Anchor";

export class EdgeRepresentation {
      source: Anchor;
      target: Anchor;
      label: string;
      curvature: number;

      readonly vertexPointerDown = new Emitter<PointerPosition>();

      constructor(init: { source: Anchor; target: Anchor; label: string; curvature?: number }) {
            this.source = init.source;
            this.target = init.target;
            this.label = init.label;
            this.curvature = init.curvature ?? 0;
      }
}
