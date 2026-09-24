import { EdgeRepresentation } from "./EdgeRepresentation";
import { NodeRepresentation } from "./NodeRepresentation";

export class GraphRepresentation {
      id: string = crypto.randomUUID();
      nodes: NodeRepresentation[];
      edges: EdgeRepresentation[];

      constructor(nodes: NodeRepresentation[], edges: EdgeRepresentation[]) {
            this.nodes = nodes;
            this.edges = edges;
      }
}
