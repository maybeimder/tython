import { Compiler } from "../../../../compiler/Compiler.ts";
import { RegEx } from "../../regex/RegEx.ts";
import { Alphabet } from "../../todo/Alphabet.ts";
import { RegexLexer } from "./phases/RegexLexer.ts";
import { RegexParser } from "./phases/RegexParser.ts";
import { RegexSimplifier } from "./phases/RegexSimplifier.ts";

export class RegexCompiler extends Compiler {
      protected static _instance: RegexCompiler;
      protected override _parser: RegexParser;
      protected override _lexer: RegexLexer;
      protected _simplifier: RegexSimplifier;
      protected _alphabet?: Alphabet;

      protected constructor(options: { snippet?: string, alphabet?: Alphabet } = {}) {
            const snippet = options.snippet ?? ""
            super("");
            this._alphabet = options.alphabet
            this._lexer = new RegexLexer(snippet);
            this._parser = new RegexParser();
            this._simplifier = new RegexSimplifier();

            this._snippet = snippet;
            if (snippet) this.compile();
      }

      public override compile() : RegEx | undefined {
            if (!this._snippet) return;

            this._lexer.snippet = this._snippet;
            this._lexer.extractTokens();
            this._parser.tokens = this._lexer.tokens;

            return this._simplifier.simplify(this._parser.parseExpression())
      }

      public static override get instance(): RegexCompiler {
            if (!RegexCompiler._instance) {
                  RegexCompiler._instance = new RegexCompiler();
            }
            return RegexCompiler._instance;
      }

      get parser() { return this._parser }


      get simplifier() { return this._simplifier }
      get alphabet() { return this._alphabet; }

      public set alphabet(alphabet: Alphabet | undefined) { this._alphabet = alphabet }

      toString() { return "RegexCompiler" }
}
