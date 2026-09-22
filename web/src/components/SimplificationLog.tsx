import type { SimplificationResult } from "../../../src";
import { formatRegex } from "../lib/RegexFormatter";

type SimplificationLogProps = {
      result: SimplificationResult | null;
      collapsed: boolean;
      onToggleCollapse: () => void;
};

const GRID_COLS = "grid-cols-[minmax(0,3fr)_minmax(0,2fr)]";

export default function SimplificationLog({
      result,
      collapsed,
      onToggleCollapse,
}: SimplificationLogProps) {
      const hasResult = !!result;
      const open = hasResult && !collapsed;

      const steps = (result?.steps ?? []).filter(
            (step) => formatRegex(step.before) !== formatRegex(step.after),
      );

      return (
            <div
                  className={`grid w-full transition-all duration-300 ease-out ${
                        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
            >
                  <div className="overflow-hidden">
                        <div
                              className={`w-full rounded-b-3xl bg-surface-lighter/60 border border-white/10 border-t-white/5 font-mono text-sm transition-opacity duration-200 ${
                                    open ? "opacity-100 delay-100" : "opacity-0"
                              }`}
                        >
                              {result && (
                                    <>
                                          <div
                                                className={`grid ${GRID_COLS} gap-x-4 pl-4 pr-2 py-2 text-foreground/40 text-[11px] border-b border-white/5 items-center`}
                                          >
                                                <span>Regex</span>
                                                <div className="flex items-center justify-between">
                                                      <span>Cambio</span>
                                                      <button
                                                            onClick={
                                                                  onToggleCollapse
                                                            }
                                                            aria-label="Collapse simplification steps"
                                                            className="w-5 h-5 flex items-center justify-center rounded-full text-foreground/50 hover:text-foreground hover:bg-white/5 transition-colors duration-200"
                                                      >
                                                            <span className="text-[10px] leading-none translate-y-[-1px]">
                                                                  ⌃
                                                            </span>
                                                      </button>
                                                </div>
                                          </div>

                                          <div
                                                className={`grid ${GRID_COLS} gap-x-4 auto-rows-min overflow-y-auto max-h-[7.5rem] px-4
                [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.15)_transparent]
                [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/15
                [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent`}
                                          >
                                                {steps.map((step, i) => (
                                                      <div
                                                            key={i}
                                                            className="contents"
                                                      >
                                                            <span className="py-3 text-foreground/80 truncate border-b border-white/5">
                                                                  {formatRegex(
                                                                        step.globalState,
                                                                  )}
                                                            </span>
                                                            <span className="py-1.5 text-muted truncate border-b border-white/5 spacing leading-8">
                                                                  {formatRegex(
                                                                        step.before,
                                                                  )}{" "}
                                                                  <span className="text-foreground/30">
                                                                        →
                                                                  </span>{" "}
                                                                  {formatRegex(
                                                                        step.after,
                                                                  )}
                                                            </span>
                                                      </div>
                                                ))}
                                          </div>

                                          <div className="px-4 py-3 border-t border-white/10 font-semibold text-foreground">
                                                Resultado:{" "}
                                                {formatRegex(result.result)}
                                          </div>
                                    </>
                              )}
                        </div>
                  </div>
            </div>
      );
}
