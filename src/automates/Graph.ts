import Node from "./Node.ts";

export default class Graph<T, W> {
      private _nodes: Record<string, Node<T>>;
      private _adjacency_list: Record<string, Record<string, W[] >>;
      private _isDirected : boolean

      constructor( isDirected : boolean = true ) {
            this._nodes = {};
            this._adjacency_list = {};
            this._isDirected = isDirected;
      }

      addNode(label:string, arg: T | Node<T>): Node<T> {
            let node;

            if (arg instanceof Node) {
                  node = arg;
            } else {
                  node = new Node<T>(arg);
            }

            this._nodes[label] = node
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
