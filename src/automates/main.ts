import { LanguageRef } from "../regex/models/regex/LanguageRef.ts";
import { RegEx } from "../regex/models/regex/RegEx.ts";
import Graph from "./Graph.ts";
import Node from "./Node.ts";

const graph = new Graph<RegEx, LanguageRef>();

let aReference = new LanguageRef("a");
let bReference = new LanguageRef("b");

graph.addNode("A", new Node<RegEx>(aReference))
graph.addNode("B", new Node<RegEx>(aReference))
graph.addNode("C", new Node<RegEx>(aReference))
graph.addNode("D", new Node<RegEx>(bReference))

graph.addEdge("A", "B", aReference)
graph.addEdge("A", "B", bReference)
graph.addEdge("A", "C", aReference)
graph.addEdge("C", "D", bReference)

console.dir(graph.adjacencyList, {depth:null})
