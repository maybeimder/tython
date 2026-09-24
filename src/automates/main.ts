import { RegexCompiler } from "../regex/models/engine/RegexCompiler/RegexCompiler.ts";
import { RegEx } from "../regex/models/regex/RegEx.ts";
import { Alphabet } from "../regex/models/todo/Alphabet.ts";
import { Automaton } from "./Automaton/Automaton.ts";
import { GlushkovConstructor } from "./Automaton/constructors/GlushkowConstructor.ts";
import { ThompsonConstructor } from "./Automaton/constructors/ThompsonConstructor.ts";
import { State } from "./Automaton/State.ts";

const myRegexCompiler = RegexCompiler.instance


const Σ: Alphabet = new Alphabet(new Set(["a", "b"]))

myRegexCompiler.snippet = "[a|b]* a b b"
const reg: RegEx = myRegexCompiler.parser.parseExpression();
console.dir(reg, { depth: null })

const AFND = new Automaton(Σ)
const thompson = new ThompsonConstructor();
const glushkov = new GlushkovConstructor();
// thompson.build(AFND, reg)
glushkov.build(AFND, reg)

console.dir(AFND.adjacencyList, { depth: null })
