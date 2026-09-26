import { useRef, useState } from "react";
import { MinimalDFAConstructor } from "../../src/automates/Automaton/constructors/DFA/MinimalConstructor";
import { RegexCompiler, SimplificationLogger, SimplificationResult } from "../../src/index";
import EngineTranslator from "../core/EngineTranslator";
import { GraphRepresentation } from "./models/representations/GraphRepresentation";
import { formatRegex } from "../core/RegexFormatter";

interface AppInputProps {
      onGraphChange: (graph: GraphRepresentation | null) => void;
      defaultExpression?: string;
}

const GRID_COLS = "grid-cols-[minmax(0,3fr)_minmax(0,2fr)]";

export default function AppInput({
      onGraphChange,
      defaultExpression = "[a [b a* b | a+ b]*]|[b a* b [ b a* b | a+ b]*]",
}: AppInputProps) {
      const [expression, setExpression] = useState(defaultExpression);
      const [result, setResult] = useState<SimplificationResult | null>(null);
      const [collapsed, setCollapsed] = useState(false);
      const [error, setError] = useState<string | null>(null);

      const lastRunRef = useRef<string | null>(null);

      const runPipeline = () => {
            const value = expression.trim();
            if (!value || value === lastRunRef.current) return;
            lastRunRef.current = value;

            try {
                  setError(null);

                  const compiler = RegexCompiler.instance;
                  compiler.snippet = value;

                  const startRegex = compiler.parser.parseExpression();
                  const logger = new SimplificationLogger(startRegex);
                  compiler.simplifier.logger = logger;

                  // .compile() -- no .simplify() -- es la que deja los pasos
                  // bien registrados en el logger para poder desplegarlos.
                  const resultRegex = compiler.compile();

                  if (!resultRegex) {
                        setResult(null);
                        setError("La compilación no produjo un resultado.");
                        onGraphChange(null);
                        return;
                  }

                  setResult(logger.getResult(resultRegex));
                  setCollapsed(false);

                  const api = new EngineTranslator();
                  api.graphConstructor = new MinimalDFAConstructor();
                  api.setRegexSnippet(value);

                  onGraphChange(api.translate());
            } catch (err) {
                  lastRunRef.current = null;
                  setResult(null);
                  onGraphChange(null);
                  setError(err instanceof Error ? err.message : String(err));
            }
      };

      const clearAll = () => {
            lastRunRef.current = null;
            setExpression("");
            setResult(null);
            setCollapsed(false);
            setError(null);
            onGraphChange(null);
      };

      const hasLog = !!result;
      const open = hasLog && !collapsed;
      const canSimplify = expression.trim().length > 0;

      const steps = result?.steps ?? [];

      return (
            <div className="flex flex-col items-center p-4 gap-1 relative z-20">
                  <div className="flex items-center">
                        <form
                              className={`flex items-center flex-1 min-w-0 h-fit p-1 gap-2 pl-4 bg-surface-lighter/60 border border-white/10 shadow-lg ring-1 ring-transparent focus-within:ring-white/15 transition-all duration-300 ${
                                    hasLog ? "rounded-t-3xl rounded-b-none border-b-0" : "rounded-full"
                              }`}
                              onSubmit={(e) => {
                                    e.preventDefault();
                                    runPipeline();
                              }}
                        >
                              <input
                                    type="text"
                                    value={expression}
                                    onChange={(e) => setExpression(e.target.value)}
                                    onBlur={runPipeline}
                                    placeholder="[a [b a* b | a+ b]*]|[b a* b [ b a* b | a+ b]*]"
                                    className="flex-1 min-w-[80vw] h-9 rounded-full px-4 placeholder:text-foreground/35 outline-0 text-foreground placeholder:font-medium font-bold font-mono bg-transparent"
                              />

                              <button
                                    type="button"
                                    onClick={clearAll}
                                    aria-label="Clear"
                                    tabIndex={canSimplify ? 0 : -1}
                                    className={`w-6 h-6 shrink-0 mr-1 rounded-full flex items-center justify-center text-foreground/50 hover:text-foreground hover:bg-white/10 transition-all duration-200 ${
                                          canSimplify ? "opacity-100 scale-100" : "opacity-0 scale-0 pointer-events-none"
                                    }`}
                              >
                                    <span className="text-sm leading-none">×</span>
                              </button>
                        </form>

                        <div
                              className={`flex justify-center p-1 overflow-x-hidden transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                                    canSimplify ? "w-14 opacity-100 ml-1" : "w-0 opacity-0 ml-0"
                              }`}
                        >
                              <button
                                    onClick={runPipeline}
                                    aria-label="Simplify"
                                    tabIndex={canSimplify ? 0 : -1}
                                    className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-mono font-bold text-sm bg-surface-lighter text-foreground shadow-[0_2px_8px_rgba(0,0,0,0.3)] transition-all duration-300 hover:bg-foreground hover:text-surface ${
                                          canSimplify ? "scale-100" : "scale-0"
                                    }`}
                              >
                                    S
                              </button>
                        </div>
                  </div>

                  {error && (
                        <div className="w-full max-w-[28rem] px-4 text-red-400 font-mono text-xs whitespace-pre-wrap">
                              {error}
                        </div>
                  )}

                  <div
                        className={`grid w-full max-w-[calc(80vw + 1rem)] min-h-0 transition-all duration-300 ease-out ${
                              open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                        }`}
                  >
                        <div className="overflow-hidden min-h-0">
                              <div
                                    className={`w-full rounded-b-3xl bg-surface-lighter/60 border border-white/10 border-t-white/5 font-mono text-sm transition-opacity duration-200 ${
                                          open ? "opacity-100 delay-100" : "opacity-0"
                                    }`}
                              >
                                    {result && (
                                          <>
                                                <div className={`grid ${GRID_COLS} gap-x-4 pl-4 pr-2 py-2 text-foreground/40 text-[11px] border-b border-white/5 items-center`}>
                                                      <span>Regex</span>
                                                      <div className="flex items-center justify-between">
                                                            <span>Cambio</span>
                                                            <button
                                                                  onClick={() => setCollapsed((prev) => !prev)}
                                                                  aria-label="Collapse simplification steps"
                                                                  className="w-5 h-5 flex items-center justify-center rounded-full text-foreground/50 hover:text-foreground hover:bg-white/5 transition-colors duration-200"
                                                            >
                                                                  <span className="text-[10px] leading-none translate-y-[-1px]">⌃</span>
                                                            </button>
                                                      </div>
                                                </div>

                                                <div
                                                      className={`grid ${GRID_COLS} gap-x-4 auto-rows-min overflow-y-scroll h-48 px-4
                                                      [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.35)_transparent]
                                                      [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-white/30
                                                      [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent`}
                                                >
                                                      {steps.map((step, i) => (
                                                            <div key={i} className="contents">
                                                                  <span className="py-3 text-foreground/80 truncate border-b border-white/5">
                                                                        {formatRegex(step.globalState)}
                                                                  </span>
                                                                  <span className="py-1.5 text-muted truncate border-b border-white/5 spacing leading-8">
                                                                        {formatRegex(step.before)}{" "}
                                                                        <span className="text-foreground/30">→</span>{" "}
                                                                        {formatRegex(step.after)}
                                                                  </span>
                                                            </div>
                                                      ))}
                                                </div>

                                                <div className="px-4 py-3 border-t border-white/10 font-semibold text-foreground">
                                                      Resultado: {formatRegex(result.result)}
                                                </div>
                                          </>
                                    )}
                              </div>
                        </div>
                  </div>
            </div>
      );
}
