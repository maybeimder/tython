import { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";

type AutomatonData = Record<string, Record<string, string[]>>;

type NodeState = "normal" | "accept" | "start" | "both";

type GraphNode = d3.SimulationNodeDatum & {
      id: string;
      state: NodeState;
};

type GraphEdge = {
      id: string;
      source: string;
      target: string;
      label: string;
};

type AutomatonGraphProps = {
      data: AutomatonData;
      width?: number;
      height?: number;
};

const NODE_RADIUS = 26;
const ACCEPT_RING_GAP = 5;
const SELF_LOOP_SIZE = NODE_RADIUS * 2.4;
const PAIR_OFFSET_STEP = 34;

function buildGraph(data: AutomatonData): {
      nodes: GraphNode[];
      edges: GraphEdge[];
} {
      const ids = new Set<string>();
      Object.entries(data).forEach(([from, targets]) => {
            ids.add(from);
            Object.keys(targets).forEach((to) => ids.add(to));
      });

      const nodes: GraphNode[] = Array.from(ids).map((id) => ({
            id,
            state: "normal",
      }));

      const edges: GraphEdge[] = [];
      Object.entries(data).forEach(([from, targets]) => {
            Object.entries(targets).forEach(([to, symbols]) => {
                  symbols.forEach((symbol, i) => {
                        edges.push({
                              id: `${from}->${to}:${symbol}:${i}`,
                              source: from,
                              target: to,
                              label: symbol,
                        });
                  });
            });
      });

      return { nodes, edges };
}

function cycleState(state: NodeState): NodeState {
      if (state === "normal") return "accept";
      if (state === "accept") return "start";
      if (state === "start") return "both";
      return "normal";
}

export default function AutomatonGraph({
      data,
      width = 640,
      height = 420,
}: AutomatonGraphProps) {
      const svgRef = useRef<SVGSVGElement>(null);
      const nodesRef = useRef<GraphNode[]>([]);
      const edgesRef = useRef<GraphEdge[]>([]);
      const simulationRef = useRef<d3.Simulation<GraphNode, undefined> | null>(null);
      const [, forceRender] = useState(0);
      const tick = useCallback(() => forceRender((n) => n + 1), []);

      useEffect(() => {
            const { nodes, edges } = buildGraph(data);
            nodesRef.current = nodes;
            edgesRef.current = edges;

            const linkPairs = edges.map((e) => ({
                  source: e.source,
                  target: e.target,
            }));

            const simulation = d3
                  .forceSimulation(nodes)
                  .force(
                        "link",
                        d3
                              .forceLink(linkPairs as any)
                              .id((d: any) => d.id)
                              .distance(160)
                              .strength(0.4),
                  )
                  .force("charge", d3.forceManyBody().strength(-900))
                  .force("center", d3.forceCenter(width / 2, height / 2))
                  .force("collide", d3.forceCollide(NODE_RADIUS + 20))
                  .on("tick", tick);

            simulationRef.current = simulation;

            return () => {
                  simulation.stop();
            };
            // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [data, width, height]);

      const handleNodeState = useCallback(
            (id: string) => {
                  const node = nodesRef.current.find((n) => n.id === id);
                  if (!node) return;
                  node.state = cycleState(node.state);
                  tick();
            },
            [tick],
      );

      useEffect(() => {
            if (!svgRef.current) return;

            const dragBehavior = d3
                  .drag<SVGGElement, GraphNode>()
                  .on("start", function (event, d) {
                        (d as any).__dragDistance = 0;
                        if (!event.active)
                              simulationRef.current?.alphaTarget(0.3).restart();
                        d.fx = d.x;
                        d.fy = d.y;
                  })
                  .on("drag", function (event, d) {
                        (d as any).__dragDistance +=
                              Math.abs(event.dx) + Math.abs(event.dy);
                        d.fx = event.x;
                        d.fy = event.y;
                  })
                  .on("end", function (event, d) {
                        if (!event.active)
                              simulationRef.current?.alphaTarget(0);
                        const moved = (d as any).__dragDistance ?? 0;
                        if (moved < 5) {
                              handleNodeState(d.id);
                        }
                        // El nodo queda fijo donde se soltó; para liberarlo de nuevo,
                        // se podría poner d.fx = d.fy = null aquí.
                  });

            d3.select(svgRef.current)
                  .selectAll<SVGGElement, GraphNode>("g.node")
                  .data(nodesRef.current, function(this: Element, d: any) {
                        // 'd' existe para los datos nuevos, pero es undefined para los elementos DOM de React
                        return d ? d.id : this.getAttribute("data-id");
                  })
                  .call(dragBehavior as any);
      });

      const nodes = nodesRef.current;
      const edges = edgesRef.current;

      // --- Agrupar edges para calcular curvatura y evitar solapes ---
      const selfLoopsByNode = new Map<string, GraphEdge[]>();
      const pairGroups = new Map<string, GraphEdge[]>();

      edges.forEach((e) => {
            if (e.source === e.target) {
                  const list = selfLoopsByNode.get(e.source) ?? [];
                  list.push(e);
                  selfLoopsByNode.set(e.source, list);
            } else {
                  const key = [e.source, e.target].sort().join("|");
                  const list = pairGroups.get(key) ?? [];
                  list.push(e);
                  pairGroups.set(key, list);
            }
      });

      const getNode = (id: string) => nodes.find((n) => n.id === id);

      return (
            <svg
                  ref={svgRef}
                  width={width}
                  height={height}
                  className="rounded-3xl bg-surface border border-white/10 w-full h-full"
            >
                  <defs>
                        <marker
                              id="arrow"
                              viewBox="0 0 10 10"
                              refX="9"
                              refY="5"
                              markerWidth="7"
                              markerHeight="7"
                              orient="auto-start-reverse"
                        >
                              <path
                                    d="M0,0 L10,5 L0,10 Z"
                                    style={{ fill: "var(--color-muted)" }}
                              />
                        </marker>

                        <filter
                              id="node-shadow"
                              x="-60%"
                              y="-60%"
                              width="220%"
                              height="220%"
                        >
                              <feDropShadow
                                    dx="0"
                                    dy="3"
                                    stdDeviation="4"
                                    floodColor="rgba(0,0,0,0.35)"
                              />
                        </filter>

                        <filter
                              id="chip-shadow"
                              x="-80%"
                              y="-80%"
                              width="260%"
                              height="260%"
                        >
                              <feDropShadow
                                    dx="0"
                                    dy="1"
                                    stdDeviation="2"
                                    floodColor="rgba(0,0,0,0.3)"
                              />
                        </filter>
                  </defs>

                  {/* ---- Aristas entre nodos distintos ---- */}
                  {Array.from(pairGroups.entries()).map(([key, group]) =>
                        group.map((edge, i) => {
                              const source = getNode(edge.source);
                              const target = getNode(edge.target);
                              if (!source?.x || !target?.x) return null;

                              const [a, b] = key.split("|");
                              const baseFrom = getNode(a)!;
                              const baseTo = getNode(b)!;

                              const dx = (baseTo.x ?? 0) - (baseFrom.x ?? 0);
                              const dy = (baseTo.y ?? 0) - (baseFrom.y ?? 0);
                              const len = Math.hypot(dx, dy) || 1;
                              const perpX = -dy / len;
                              const perpY = dx / len;

                              const offsetIndex = i - (group.length - 1) / 2;
                              const offset = offsetIndex * PAIR_OFFSET_STEP;

                              const midX =
                                    ((source.x ?? 0) + (target.x ?? 0)) / 2 +
                                    perpX * offset;
                              const midY =
                                    ((source.y ?? 0) + (target.y ?? 0)) / 2 +
                                    perpY * offset;

                              // Recortar inicio/fin en el borde del círculo, no en el centro
                              const trim = (
                                    from: GraphNode,
                                    ctrlX: number,
                                    ctrlY: number,
                              ) => {
                                    const vx = ctrlX - (from.x ?? 0);
                                    const vy = ctrlY - (from.y ?? 0);
                                    const vLen = Math.hypot(vx, vy) || 1;
                                    return {
                                          x:
                                                (from.x ?? 0) +
                                                (vx / vLen) * NODE_RADIUS,
                                          y:
                                                (from.y ?? 0) +
                                                (vy / vLen) * NODE_RADIUS,
                                    };
                              };

                              const start = trim(source, midX, midY);
                              const end = trim(target, midX, midY);
                              // Compensar un poco más el punto final por el tamaño de la flecha
                              const endTrimmed = trim(target, midX, midY);
                              const arrowGap = 3;
                              const evx = endTrimmed.x - midX;
                              const evy = endTrimmed.y - midY;
                              const evLen = Math.hypot(evx, evy) || 1;
                              const finalEnd = {
                                    x:
                                          endTrimmed.x +
                                          (evx / evLen) * arrowGap * 0,
                                    y:
                                          endTrimmed.y +
                                          (evy / evLen) * arrowGap * 0,
                              };

                              const path = `M ${start.x} ${start.y} Q ${midX} ${midY} ${finalEnd.x} ${finalEnd.y}`;

                              const labelX =
                                    0.25 * start.x +
                                    0.5 * midX +
                                    0.25 * finalEnd.x;
                              const labelY =
                                    0.25 * start.y +
                                    0.5 * midY +
                                    0.25 * finalEnd.y;

                              return (
                                    <g key={edge.id}>
                                          <path
                                                d={path}
                                                fill="none"
                                                style={{
                                                      stroke: "var(--color-muted)",
                                                      strokeWidth: 1.5,
                                                      opacity: 0.6,
                                                }}
                                                markerEnd="url(#arrow)"
                                          />
                                          <g
                                                transform={`translate(${labelX}, ${labelY})`}
                                                filter="url(#chip-shadow)"
                                          >
                                                <rect
                                                      x={-14}
                                                      y={-11}
                                                      width={28}
                                                      height={22}
                                                      rx={11}
                                                      style={{
                                                            fill: "var(--color-surface-lighter)",
                                                      }}
                                                />
                                                <text
                                                      textAnchor="middle"
                                                      dominantBaseline="central"
                                                      className="font-mono font-semibold"
                                                      style={{
                                                            fill: "var(--color-subforeground)",
                                                            fontSize: 11,
                                                      }}
                                                >
                                                      {edge.label}
                                                </text>
                                          </g>
                                    </g>
                              );
                        }),
                  )}

                  {/* ---- Bucles (self-loops) ---- */}
                  {Array.from(selfLoopsByNode.entries()).flatMap(
                        ([nodeId, loops]) =>
                              loops.map((edge, i) => {
                                    const node = getNode(nodeId);
                                    if (!node?.x) return null;

                                    const angleStep =
                                          (2 * Math.PI) /
                                          Math.max(loops.length, 1);
                                    const baseAngle = -Math.PI / 2; // empieza arriba del nodo
                                    const theta = baseAngle + i * angleStep;
                                    const spread = 0.5;

                                    const cx = node.x ?? 0;
                                    const cy = node.y ?? 0;

                                    const startAngle = theta - spread;
                                    const endAngle = theta + spread;

                                    const start = {
                                          x:
                                                cx +
                                                NODE_RADIUS *
                                                      Math.cos(startAngle),
                                          y:
                                                cy +
                                                NODE_RADIUS *
                                                      Math.sin(startAngle),
                                    };
                                    const end = {
                                          x:
                                                cx +
                                                NODE_RADIUS *
                                                      Math.cos(endAngle),
                                          y:
                                                cy +
                                                NODE_RADIUS *
                                                      Math.sin(endAngle),
                                    };

                                    const ctrl1Angle = theta - spread * 1.6;
                                    const ctrl2Angle = theta + spread * 1.6;
                                    const ctrl1 = {
                                          x:
                                                cx +
                                                SELF_LOOP_SIZE *
                                                      Math.cos(ctrl1Angle),
                                          y:
                                                cy +
                                                SELF_LOOP_SIZE *
                                                      Math.sin(ctrl1Angle),
                                    };
                                    const ctrl2 = {
                                          x:
                                                cx +
                                                SELF_LOOP_SIZE *
                                                      Math.cos(ctrl2Angle),
                                          y:
                                                cy +
                                                SELF_LOOP_SIZE *
                                                      Math.sin(ctrl2Angle),
                                    };

                                    const path = `M ${start.x} ${start.y} C ${ctrl1.x} ${ctrl1.y}, ${ctrl2.x} ${ctrl2.y}, ${end.x} ${end.y}`;

                                    const labelX =
                                          cx +
                                          (NODE_RADIUS +
                                                SELF_LOOP_SIZE * 0.55) *
                                                Math.cos(theta);
                                    const labelY =
                                          cy +
                                          (NODE_RADIUS +
                                                SELF_LOOP_SIZE * 0.55) *
                                                Math.sin(theta);

                                    return (
                                          <g key={edge.id}>
                                                <path
                                                      d={path}
                                                      fill="none"
                                                      style={{
                                                            stroke: "var(--color-muted)",
                                                            strokeWidth: 1.5,
                                                            opacity: 0.6,
                                                      }}
                                                      markerEnd="url(#arrow)"
                                                />
                                                <g
                                                      transform={`translate(${labelX}, ${labelY})`}
                                                      filter="url(#chip-shadow)"
                                                >
                                                      <rect
                                                            x={-14}
                                                            y={-11}
                                                            width={28}
                                                            height={22}
                                                            rx={11}
                                                            style={{
                                                                  fill: "var(--color-surface-lighter)",
                                                            }}
                                                      />
                                                      <text
                                                            textAnchor="middle"
                                                            dominantBaseline="central"
                                                            className="font-mono font-semibold"
                                                            style={{
                                                                  fill: "var(--color-subforeground)",
                                                                  fontSize: 11,
                                                            }}
                                                      >
                                                            {edge.label}
                                                      </text>
                                                </g>
                                          </g>
                                    );
                              }),
                  )}

                  {/* ---- Nodos ---- */}
                  {nodes.map((node) => {
                        const x = node.x ?? 0;
                        const y = node.y ?? 0;
                        const isAccept =
                              node.state === "accept" || node.state === "both";
                        const isStart =
                              node.state === "start" || node.state === "both";

                        return (
                              <g
                                    key={node.id}
                                    className="node cursor-grab active:cursor-grabbing"
                                    transform={`translate(${x}, ${y})`}
                                    data-id={node.id}
                              >
                                    {isStart && (
                                          <path
                                                d={`M ${-NODE_RADIUS - 26} 0 L ${-NODE_RADIUS - 6} -8 L ${-NODE_RADIUS - 6} 8 Z`}
                                                style={{
                                                      fill: "var(--color-foreground)",
                                                }}
                                                filter="url(#chip-shadow)"
                                          />
                                    )}

                                    <circle
                                          r={NODE_RADIUS}
                                          style={{
                                                fill: "var(--color-surface-lighter)",
                                          }}
                                          filter="url(#node-shadow)"
                                    />

                                    {isAccept && (
                                          <path
                                                fillRule="evenodd"
                                                d={[
                                                      `M ${NODE_RADIUS - ACCEPT_RING_GAP} 0 A ${NODE_RADIUS - ACCEPT_RING_GAP} ${NODE_RADIUS - ACCEPT_RING_GAP} 0 1 0 ${-(NODE_RADIUS - ACCEPT_RING_GAP)} 0 A ${NODE_RADIUS - ACCEPT_RING_GAP} ${NODE_RADIUS - ACCEPT_RING_GAP} 0 1 0 ${NODE_RADIUS - ACCEPT_RING_GAP} 0 Z`,
                                                      `M ${NODE_RADIUS - ACCEPT_RING_GAP - 4} 0 A ${NODE_RADIUS - ACCEPT_RING_GAP - 4} ${NODE_RADIUS - ACCEPT_RING_GAP - 4} 0 1 0 ${-(NODE_RADIUS - ACCEPT_RING_GAP - 4)} 0 A ${NODE_RADIUS - ACCEPT_RING_GAP - 4} ${NODE_RADIUS - ACCEPT_RING_GAP - 4} 0 1 0 ${NODE_RADIUS - ACCEPT_RING_GAP - 4} 0 Z`,
                                                ].join(" ")}
                                                style={{
                                                      fill: "var(--color-foreground)",
                                                      opacity: 0.25,
                                                }}
                                          />
                                    )}

                                    <text
                                          textAnchor="middle"
                                          dominantBaseline="central"
                                          className="font-mono font-bold select-none"
                                          style={{
                                                fill: "var(--color-foreground)",
                                                fontSize: 14,
                                          }}
                                    >
                                          {node.id}
                                    </text>
                              </g>
                        );
                  })}
            </svg>
      );
}
