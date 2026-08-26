import { Lexer } from "./Lexer.ts";
import { Parser } from "./Parser.ts";

export class Compiler {
      protected static _instance: Compiler
      protected _lexer: Lexer
      protected _parser: Parser
      protected _snippet: string;

      protected constructor(snippet:string="") {
            this._snippet = snippet;
            this._lexer = new Lexer(snippet);
            this._parser = new Parser();
      }

      c

      public static get instance() : Compiler {
            if (!Compiler._instance) {
                  Compiler._instance = new Compiler();
            }
            return Compiler._instance
      }

      public get lexer(): Lexer { return this._lexer;}
      public get parser(): Parser { return this._parser;}
      public get snippet() { return this._snippet; }

      public set snippet(snippet: string) {
            this._snippet = snippet;
            this._lexer.snippet = snippet;
            this._lexer.extractTokens();
            this._parser.tokens = this._lexer.tokens;
      }

}
