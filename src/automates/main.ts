import { Compiler } from "../compiler/Compiler.ts";
import { RegexCompiler } from "../regex/models/engine/RegexCompiler/RegexCompiler.ts";
import { RegEx } from "../regex/models/regex/RegEx.ts";
import { Alphabet } from "../regex/models/todo/Alphabet.ts";
import { Automaton } from "./Automaton/Automaton.ts";
import { State } from "./Automaton/State.ts";

const myRegexCompiler = RegexCompiler.instance
myRegexCompiler.snippet = "[a|b]* abb"


const Σ: Alphabet = new Alphabet(new Set(["a", "b"]))

const reg: RegEx = myRegexCompiler.parser.parseExpression();

const AFND = new Automaton(Σ)
AFND.addNode("0", new State("0"));
AFND.addNode("1", new State("1"));
AFND.addNode("2", new State("2"));
AFND.addNode("3", new State("3"));

AFND.addEdge("0", "1", "a")
AFND.addEdge("0", "0", "a")
AFND.addEdge("0", "0", "b")

AFND.addEdge("1", "2", "b")
AFND.addEdge("2", "3", "b")

console.dir(AFND.adjacencyList, { depth: null })
