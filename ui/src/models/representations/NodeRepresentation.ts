import { PointerPosition } from "../../controllers/GraphInteraction";
import { Emitter } from "../../utils/Emitter";
import { Anchor } from "../connections/Anchor";

export class NodeRepresentation {
      readonly id: string;
      x: number;
      y: number;
      size: number;

      label: string;

      isStartState: boolean;
      isEndState: boolean;

      readonly pointerDown = new Emitter<PointerPosition>();

      constructor(init: Omit<NodeRepresentation, "id" | "pointerDown">) {
            this.id = init.label;
            this.x = init.x;
            this.y = init.y;
            this.label = init.label;
            this.size = init.size;
            this.isStartState = init.isStartState;
            this.isEndState = init.isEndState;
      }
}
