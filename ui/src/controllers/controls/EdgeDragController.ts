import { EdgeRepresentation } from "../../models/representations/EdgeRepresentation";
import { Unsubscribe } from "../../utils/Emitter";
import { canonicalNormal } from "../../utils/geometry";
import { GraphInteraction, PointerPosition } from "../GraphInteraction";

export class EdgeDragController implements GraphInteraction {
      private unsubscribers: Unsubscribe[] = [];
      private draggingEdge: EdgeRepresentation | null = null;
      private startCurvature = 0;
      private startClientX = 0;
      private startClientY = 0;

      constructor(
            private edges: EdgeRepresentation[],
            private onChange: () => void,
      ) {}

      attach(): void {
            this.edges.forEach((edge) => {
                  const unsubscribe = edge.vertexPointerDown.subscribe(
                        (point) => this.handleStart(edge, point),
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

      private handleStart(
            edge: EdgeRepresentation,
            point: PointerPosition,
      ): void {
            this.draggingEdge = edge;
            this.startCurvature = edge.curvature;
            this.startClientX = point.x;
            this.startClientY = point.y;
      }

      private handleMove = (event: PointerEvent): void => {
            if (!this.draggingEdge) return;
            const edge = this.draggingEdge;

            let nx: number, ny: number;

            if (edge.source.haveSameHostAs(edge.target)) {
                  nx = edge.source.outward.x;
                  ny = edge.source.outward.y;
            } else {
                  const n = canonicalNormal(
                        { x: edge.source.centerX, y: edge.source.centerY },
                        { x: edge.target.centerX, y: edge.target.centerY },
                  );
                  nx = n.x; ny = n.y;
            }

            const movedX = event.clientX - this.startClientX;
            const movedY = event.clientY - this.startClientY;

            edge.curvature = this.startCurvature + (movedX * nx + movedY * ny);
            this.onChange();
      };

      private handleEnd = (): void => {
            this.draggingEdge = null;
      };
}
