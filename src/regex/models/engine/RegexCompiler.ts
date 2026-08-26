import { Compiler } from "../../../compiler/Compiler.ts";
import { RegexLexer } from "./RegexLexer.ts";
import { RegexParser } from "./RegexParser.ts";

export class RegexCompiler extends Compiler {
      protected static _instance: RegexCompiler;

      protected constructor(snippet: string = "") {
            super(snippet);
            this._lexer = new RegexLexer(snippet);
            this._parser = new RegexParser();

            if (snippet) this.compile();
      }

      public static override get instance(): RegexCompiler {
            if (!RegexCompiler._instance) {
                  RegexCompiler._instance = new RegexCompiler();
            }
            return RegexCompiler._instance;
      }

      toString() { return "RegexCompiler" }
}
