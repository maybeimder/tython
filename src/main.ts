import { Compiler } from "./compiler/Compiler.ts"
import { RegexCompiler } from "./regex/models/engine/RegexCompiler/RegexCompiler.ts"
import { SimplificationLogger } from "./regex/simplifier/result/SimplificationLogger.ts"
import { SimplificationPrinter } from "./regex/simplifier/result/SimplificationPrinter.ts"

const myCompiler = Compiler.instance
// const printer = new AstPrinter()
// printer.print(myCompiler.parser.parseExpression())


const myRegexCompiler = RegexCompiler.instance
myRegexCompiler.snippet = "a+ a* | a?"

const startRegex = myRegexCompiler.parser.parseExpression();
myRegexCompiler.simplifier.logger = new SimplificationLogger(startRegex);
const resultRegex = myRegexCompiler.compile();

if (resultRegex)
      console.log(SimplificationPrinter.print(myRegexCompiler.simplifier.logger.getResult(resultRegex)));
