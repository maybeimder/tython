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

export type Point = { x: number; y: number };

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
            const nodeCenter = { x: source.centerX, y: source.centerY };
            const nodeRadius = source.radius;
            const dir = averageDirection(source.outward, target.outward);

            const loopRadius = Math.max(nodeRadius * 0.9 + curvature, nodeRadius * 0.5);
            const overlap = Math.min(nodeRadius, loopRadius) * 0.4;
            const centerDistance = nodeRadius + loopRadius - overlap;

            const loopCenter = {
                  x: nodeCenter.x + dir.x * centerDistance,
                  y: nodeCenter.y + dir.y * centerDistance,
            };

            const angleToNode = Math.atan2(nodeCenter.y - loopCenter.y, nodeCenter.x - loopCenter.x);
            const farPoint = this.pointOnCircle(loopCenter, loopRadius, angleToNode + Math.PI);

            const intersections = this.circleIntersections(nodeCenter, nodeRadius, loopCenter, loopRadius);

            if (!intersections) {
                  // fallback: los círculos no se cruzan (loop demasiado chico), usamos un hueco fijo
                  const gapStart = angleToNode - LOOP_SPREAD;
                  const gapEnd = angleToNode + LOOP_SPREAD;
                  const path = circleArcPath(loopCenter, loopRadius, gapEnd, gapStart + Math.PI * 2);
                  return { path, labelX: farPoint.x, labelY: farPoint.y, handleX: farPoint.x, handleY: farPoint.y };
            }

            const [p1, p2] = intersections;
            const angle1 = Math.atan2(p1.y - loopCenter.y, p1.x - loopCenter.x);
            const angle2 = Math.atan2(p2.y - loopCenter.y, p2.x - loopCenter.x);

            const [gapStart, gapEnd] = this.arcContains(angleToNode, angle1, angle2) ? [angle2, angle1] : [angle1, angle2];

            const path = circleArcPath(loopCenter, loopRadius, gapEnd, gapStart + Math.PI * 2);

            return { path, labelX: farPoint.x, labelY: farPoint.y, handleX: farPoint.x, handleY: farPoint.y };
      }

      circleIntersections(c1: Point, r1: number, c2: Point, r2: number): [Point, Point] | null {
            const dx = c2.x - c1.x;
            const dy = c2.y - c1.y;
            const d = Math.hypot(dx, dy);

            if (d < 1e-6 || d > r1 + r2 || d < Math.abs(r1 - r2)) return null;

            const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
            const h = Math.sqrt(Math.max(r1 * r1 - a * a, 0));

            const midX = c1.x + (a * dx) / d;
            const midY = c1.y + (a * dy) / d;

            return [
                  { x: midX + (h * dy) / d, y: midY - (h * dx) / d },
                  { x: midX - (h * dy) / d, y: midY + (h * dx) / d },
            ];
      }

      normalizeAngle(angle: number): number {
            const twoPi = Math.PI * 2;
            return ((angle % twoPi) + twoPi) % twoPi;
      }

      arcContains(angle: number, from: number, to: number): boolean {
            const span = this.normalizeAngle(to - from);
            const pos = this.normalizeAngle(angle - from);
            return pos <= span;
      }

      pointOnCircle(center: Point, radius: number, angle: number): Point {
            return { x: center.x + radius * Math.cos(angle), y: center.y + radius * Math.sin(angle) };
      }
}
