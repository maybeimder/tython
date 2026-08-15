import { Compiler } from "./core/Compiler.ts"

const code = "2 + 3 * 4"

const myCompiler = Compiler.instance

myCompiler.snippet = code
console.log(myCompiler.parser.tokens)
