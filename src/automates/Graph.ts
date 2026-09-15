import { Node } from "./Node.ts";

/**
 * @param NodeLike the type of primitives nodes saves
 * @param W the type of primitives weight's edges uses to traverse.
*/
export default class Graph<NodeLike extends Node<any>, W> {
      protected _nodes: Record<string, NodeLike>;
      protected _adjacency_list: Record<string, Record<string, W[] >>;
      protected _isDirected : boolean

      constructor( isDirected : boolean = true ) {
            this._nodes = {};
            this._adjacency_list = {};
            this._isDirected = isDirected;
      }

      addNode(label: string, node: NodeLike): NodeLike {
            this._nodes[label] = node;
            return node;
      }

      addEdge(from: string, to: string, weight: W) {
            if (!this._nodes[from] || !this._nodes[to]) return;

            const newEdge = (nfrom:string, nto:string) => {

                  if (!this._adjacency_list[nfrom]) {
                        this._adjacency_list[nfrom] = {}
                  }

                  if (!this._adjacency_list[nfrom][nto]) {
                        this._adjacency_list[nfrom][nto] = [weight]
                  }

                  if (!this._adjacency_list[nfrom][nto].includes(weight)) {
                        this._adjacency_list[nfrom][nto].push(weight)
                  }
            }

            newEdge(from, to);

            if (!this._isDirected && from !== to) newEdge(to, from);
      }

      get adjacencyList() { return this._adjacency_list }
}
