export interface Point {
      x: number;
      y: number;
}

export function quadraticPointAt(
      p0: Point,
      control: Point,
      p2: Point,
      t: number,
): Point {
      const mt = 1 - t;
      return {
            x: mt * mt * p0.x + 2 * mt * t * control.x + t * t * p2.x,
            y: mt * mt * p0.y + 2 * mt * t * control.y + t * t * p2.y,
      };
}

/**
 * Normal perpendicular entre dos centros, ORDEN-INDEPENDIENTE: da el mismo
 * resultado sin importar cuál punto se pase primero. Así, dos edges entre
 * los mismos dos nodos (uno A→B, otro B→A) comparten el mismo eje de
 * referencia para curvarse, y con curvature de signo opuesto forman una
 * almendra simétrica real, en vez de depender de quién es source/target.
 */
export function canonicalNormal(a: Point, b: Point): Point {
      const key = (p: Point) => p.x * 1e7 + p.y;
      const [p1, p2] = key(a) <= key(b) ? [a, b] : [b, a];

      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const distance = Math.hypot(dx, dy) || 1;

      return { x: -dy / distance, y: dx / distance };
}

/**
 * Aproxima un arco de círculo real con uno o más segmentos bezier cúbicos
 * (constante estándar 4/3·tan(Δθ/4)), recorriendo fromAngle → toAngle en
 * sentido creciente. Evita la ambigüedad de large-arc-flag/sweep-flag de
 * SVG, que es muy fácil de dejar mal orientada.
 */
export function circleArcPath(
      center: Point,
      radius: number,
      fromAngle: number,
      toAngle: number,
): string {
      const totalSweep = toAngle - fromAngle;
      const segments = Math.max(
            1,
            Math.ceil(Math.abs(totalSweep) / (Math.PI / 2)),
      );
      const step = totalSweep / segments;

      let d = "";

      for (let i = 0; i < segments; i++) {
            const a0 = fromAngle + step * i;
            const a1 = fromAngle + step * (i + 1);

            const p0 = {
                  x: center.x + radius * Math.cos(a0),
                  y: center.y + radius * Math.sin(a0),
            };
            const p1 = {
                  x: center.x + radius * Math.cos(a1),
                  y: center.y + radius * Math.sin(a1),
            };

            const alpha = (4 / 3) * Math.tan((a1 - a0) / 4);
            const c1 = {
                  x: p0.x - alpha * radius * Math.sin(a0),
                  y: p0.y + alpha * radius * Math.cos(a0),
            };
            const c2 = {
                  x: p1.x + alpha * radius * Math.sin(a1),
                  y: p1.y - alpha * radius * Math.cos(a1),
            };

            d += i === 0 ? `M${p0.x},${p0.y} ` : "";
            d += `C${c1.x},${c1.y} ${c2.x},${c2.y} ${p1.x},${p1.y} `;
      }

      return d.trim();
}

export function averageDirection(a: Point, b: Point): Point {
      const sum = { x: a.x + b.x, y: a.y + b.y };
      const length = Math.hypot(sum.x, sum.y);
      return length < 1e-6 ? a : { x: sum.x / length, y: sum.y / length };
}
