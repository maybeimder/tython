import { Anchor, ConnectionSide } from "../models/connections/Anchor";
import { EdgeRepresentation } from "../models/representations/EdgeRepresentation";
import { averageDirection, canonicalNormal, circleArcPath, quadraticPointAt } from "./geometry";

export type EdgeSVGString = {
      path: string;
      labelX: number;
      labelY: number;
      handleX: number;
      handleY: number;
};

const LOOP_SPREAD = 0.45;

export class EdgeGeometryCalculator {
      calculate(edge: EdgeRepresentation): EdgeSVGString {
            return edge.source.haveSameHostAs(edge.target)
                  ? this.selfLoop(edge.source, edge.target, edge.curvature)
                  : this.curve(edge.source, edge.target, edge.curvature);
      }

      private curve(source: Anchor, target: Anchor, curvature: number): EdgeSVGString {
            const distance = Math.hypot(target.x - source.x, target.y - source.y) || 1;
            const offset = curvature || Math.min(distance * 0.25, 60);

            const n = canonicalNormal(
                  { x: source.centerX, y: source.centerY },
                  { x: target.centerX, y: target.centerY },
            );

            const mid = { x: (source.x + target.x) / 2, y: (source.y + target.y) / 2 };
            const control = { x: mid.x + n.x * offset, y: mid.y + n.y * offset };

            const point = quadraticPointAt({ x: source.x, y: source.y }, control, { x: target.x, y: target.y }, 0.5);

            return {
                  path: `M${source.x},${source.y} Q${control.x},${control.y} ${target.x},${target.y}`,
                  labelX: point.x, labelY: point.y,
                  handleX: point.x, handleY: point.y,
            };
      }


      private selfLoop(source: Anchor, target: Anchor, curvature: number): EdgeSVGString {
            const center = { x: source.centerX, y: source.centerY };
            const nodeRadius = source.radius;
            const dir = averageDirection(source.outward, target.outward);

            const loopRadius = Math.max(nodeRadius * 1.3 + curvature, nodeRadius * 0.6);
            const loopCenter = {
                  x: center.x + dir.x * (nodeRadius + loopRadius),
                  y: center.y + dir.y * (nodeRadius + loopRadius),
            };

            const angleToNode = Math.atan2(center.y - loopCenter.y, center.x - loopCenter.x);
            const gapStart = angleToNode - LOOP_SPREAD;
            const gapEnd   = angleToNode + LOOP_SPREAD;

            const path = circleArcPath(loopCenter, loopRadius, gapEnd, gapStart + Math.PI * 2);

            const farPoint = { x: loopCenter.x + dir.x * loopRadius, y: loopCenter.y + dir.y * loopRadius };

            return {
                  path,
                  labelX: farPoint.x, labelY: farPoint.y,
                  handleX: farPoint.x, handleY: farPoint.y,
            };
      }
}
