import { useState, useEffect } from "react";
import AppInput from "../components/AppInput";
import SideButton from "../components/SideButton";
import SimplifyButton from "../components/SimplifyButton";
import SimplificationLog from "../components/SimplificationLog";

import {
      RegexCompiler,
      SimplificationLogger,
      SimplificationResult,
} from "../../../src/index";
import { formatRegex } from "../lib/RegexFormatter";
import AutomatonGraph from "../components/AutomatonGraph";

const AUTOMATON_DATA = {
  "0": { "0": ["a", "b"], "1": ["a"] },
  "1": { "2": ["b"] },
  "2": { "3": ["b"] },
};

export default function AutomatonView() {
      const [isRegex, setIsRegex] = useState(false);
      const [value, setValue] = useState("");
      const [result, setResult] = useState<SimplificationResult | null>(null);
      const [collapsed, setCollapsed] = useState(false);
      const [showGraph, setShowGraph] = useState(false);


      const [isDark, setIsDark] = useState(false);

      useEffect(() => {
            document.documentElement.classList.toggle("dark", isDark);
      }, [isDark]);

      const handleModeToggle = () => {
            setIsRegex((prev) => {
                  const next = !prev;
                  if (!next) {
                        // Al volver a modo matemático, se limpia todo el estado de regex
                        setValue("");
                        setResult(null);
                        setCollapsed(false);
                  }
                  return next;
            });
      };

      const handleSimplify = () => {
            if (!value.trim()) return;

            const myRegexCompiler = RegexCompiler.instance;
            myRegexCompiler.snippet = value;

            const startRegex = myRegexCompiler.parser.parseExpression();
            const logger = new SimplificationLogger(startRegex);
            myRegexCompiler.simplifier.logger = logger;

            const resultRegex = myRegexCompiler.compile();
            if (!resultRegex) {
                  console.error("La compilación no produjo un resultado.");
                  return;
            }

            setResult(logger.getResult(resultRegex));
            setValue(formatRegex(resultRegex));
            setCollapsed(false);
      };

      const handleClear = () => {
            setValue("");
            setResult(null);
            setCollapsed(false);
      };

      return (
            <div className="relative w-full h-full bg-surface transition-colors duration-300 flex flex-col items-center gap-6 p-8">
                  <button
                        onClick={() => setIsDark(!isDark)}
                        className={`absolute top-6 right-8 w-12 h-12 rounded-full border-none flex items-center justify-center text-2xl transition-all duration-300 cursor-pointer ${
                              isDark
                                    ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.4)] hover:shadow-[0_0_25px_rgba(255,255,255,0.6)]"
                                    : "bg-black text-white shadow-[0_0_15px_rgba(0,0,0,0.4)] hover:shadow-[0_0_25px_rgba(0,0,0,0.6)]"
                        }`}
                        title="Toggle Theme"
                  >
                        {isDark ? "☼" : "☾"}
                  </button>

                  <div className="flex items-center gap-1 mt-8">
                        <div className="h-full flex align-top">
                              <SimplifyButton
                                    visible={isRegex}
                                    onClick={handleSimplify}
                              />
                        </div>

                        <div className="flex flex-col w-fit">
                              <AppInput
                                    isRegex={isRegex}
                                    onToggle={handleModeToggle}
                                    value={value}
                                    onChange={setValue}
                                    hasLog={!!result && !collapsed}
                              />

                              <SimplificationLog
                                    result={result}
                                    collapsed={collapsed}
                                    onToggleCollapse={() =>
                                          setCollapsed((c) => !c)
                                    }
                              />
                        </div>

                        <div className="h-full flex align-middle">
                              <SideButton visible={isRegex} onClick={() => setShowGraph((v) => !v)} label="Draw Graph">
                                ⌘
                              </SideButton>
                        </div>
                  </div>

                  {showGraph && <AutomatonGraph data={AUTOMATON_DATA} />}
            </div>
      );
}
