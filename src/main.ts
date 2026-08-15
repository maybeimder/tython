import { Compiler } from "./core/Compiler.ts"
import { AstPrinter } from "./core/helpers/ASTPrinter.ts"

const code = "7*a^2/(b^2*3*(5*c/a+9/b^3)+4*c/b)-8*c/d^5"

const myCompiler = Compiler.instance
myCompiler.snippet = code

const printer = new AstPrinter()
printer.print(myCompiler.parser.parseExpression())
