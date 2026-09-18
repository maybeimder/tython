import { Compiler } from "./compiler/Compiler.ts"
import { AstPrinter } from "./compiler/helpers/ASTPrinter.ts"
import { RegexCompiler } from "./regex/models/engine/RegexCompiler/RegexCompiler.ts"
import { SimplificationLogger } from "./regex/simplifier/result/SimplificationLogger.ts"
import { SimplificationPrinter } from "./regex/simplifier/result/SimplificationPrinter.ts"

/*
const myCompiler = Compiler.instance
myCompiler.snippet = "6*a/b^3*c+4*b^2*(2*d^4*(5*b^4^2-9/c*d^3)-7*a^2/c)-9*d^2/3"
const printer = new AstPrinter()
printer.print(myCompiler.parser.parseExpression())
*/

const myRegexCompiler = RegexCompiler.instance
myRegexCompiler.snippet = "a? a* a+ a?"

const startRegex = myRegexCompiler.parser.parseExpression();
myRegexCompiler.simplifier.logger = new SimplificationLogger(startRegex);
const resultRegex = myRegexCompiler.compile();

if (resultRegex)
      console.log(SimplificationPrinter.print(myRegexCompiler.simplifier.logger.getResult(resultRegex)));
