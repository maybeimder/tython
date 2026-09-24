export type ConnectionSide = 'left' | 'right' | 'top' | 'bottom';

export interface AnchorHost {
      x: number;
      y: number;
      size: number;
}

export const OUTWARD: Record<ConnectionSide, { x: number; y: number }> = {
      top   : { x: 0, y: -1 },
      bottom: { x: 0, y: 1 },
      left  : { x: -1, y: 0 },
      right : { x: 1, y: 0 },
};

export class Anchor {
      constructor(private host: AnchorHost, readonly side: ConnectionSide) {}

      get centerX(): number { return this.host.x; }
      get centerY(): number { return this.host.y; }
      get outward(): { x: number; y: number } { return OUTWARD[this.side]; }

      get x(): number {
            const radius = this.host.size / 2;
            switch (this.side) {
                  case "left" : return this.host.x - radius;
                  case "right": return this.host.x + radius;
                  default     : return this.host.x;
            }
      }

      get y(): number {
            const radius = this.host.size / 2;
            switch (this.side) {
                  case "top"   : return this.host.y - radius;
                  case "bottom": return this.host.y + radius;
                  default      : return this.host.y;
            }
      }

      get radius(): number {
            return this.host.size / 2;
      }

      haveSameHostAs(other: Anchor): boolean {
            return this.host === other.host;
      }

}

export function anchorsOf(host: AnchorHost): Record<ConnectionSide, Anchor> {
      return {
            top   : new Anchor(host, "top"),
            right : new Anchor(host, "right"),
            bottom: new Anchor(host, "bottom"),
            left  : new Anchor(host, "left"),
      };
}
