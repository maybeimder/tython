import { Compiler } from "./compiler/Compiler.ts"
import { RegexCompiler } from "./regex/models/engine/RegexCompiler/RegexCompiler.ts"

const myCompiler = Compiler.instance

const myRegexCompiler = RegexCompiler.instance
myRegexCompiler.snippet = "a+ a* | a?"
console.dir(myRegexCompiler.parser.parseExpression(), { depth: null });
console.dir(myRegexCompiler.compile(), { depth: null });

/*
const printer = new AstPrinter()
printer.print(myCompiler.parser.parseExpression())
*/
