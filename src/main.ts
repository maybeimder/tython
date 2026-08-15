import { Compiler } from "./core/Compiler.ts"

const code = "7*a"

const myCompiler = Compiler.instance

myCompiler.snippet = code
console.log(myCompiler.parser.parseExpression())
