import { NodeRepresentation } from "../../models/representations/NodeRepresentation";
import { Unsubscribe } from "../../utils/Emitter";
import { GraphInteraction, PointerPosition } from "../GraphInteraction";

export class NodeDragController implements GraphInteraction {
      private unsubscribers: Unsubscribe[] = [];
      private draggingNode: NodeRepresentation | null = null;
      private offsetX = 0;
      private offsetY = 0;

      constructor(
            private container: HTMLElement,
            private nodes: NodeRepresentation[],
            private onChange: () => void,
      ) {}

      attach(): void {
            this.nodes.forEach((node) => {
                  const unsubscribe = node.pointerDown.subscribe((point) =>
                        this.handleStart(node, point),
                  );
                  this.unsubscribers.push(unsubscribe);
            });

            window.addEventListener("pointermove", this.handleMove);
            window.addEventListener("pointerup", this.handleEnd);
      }

      detach(): void {
            this.unsubscribers.forEach((unsubscribe) => unsubscribe());
            this.unsubscribers = [];

            window.removeEventListener("pointermove", this.handleMove);
            window.removeEventListener("pointerup", this.handleEnd);
      }

      private handleStart(node: NodeRepresentation, point:PointerPosition): void {
            const local = this.toLocalPoint(point);
            this.offsetX = local.x - node.x;
            this.offsetY = local.y - node.y;
            this.draggingNode = node;
      }

      private handleMove = (event: PointerEvent): void => {
            if (!this.draggingNode) return;

            const local = this.toLocalPoint(event);
            this.draggingNode.x = local.x - this.offsetX;
            this.draggingNode.y = local.y - this.offsetY;
            this.onChange();
      };

      private handleEnd = (): void => {
            this.draggingNode = null;
      };

      private toLocalPoint(point:PointerPosition) {
            const rect = this.container.getBoundingClientRect();
            return {
                  x: point.x - rect.left,
                  y: point.y - rect.top,
            };
      }
}
