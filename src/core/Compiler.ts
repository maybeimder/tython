import { Lexer } from "./Lexer.ts";

export class Compiler {
      static #instance: Compiler
      private _lexer: Lexer
      private _snippet: string;

      private constructor(snippet:string="") {
            this._lexer = new Lexer(snippet);
            this._snippet = "";
      }

      public static get instance() : Compiler {
            if (!Compiler.#instance) {
                  Compiler.#instance = new Compiler();
            }
            return Compiler.#instance
      }

      public get lexer(): Lexer { return this._lexer;}
      public get snippet() { return this._snippet; }


      public set snippet(snippet: string) {
            this._snippet = snippet;
            this.lexer.snippet = snippet;
      }

}
