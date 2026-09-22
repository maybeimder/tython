import { MODES } from "./AppInput";

type ToggleSwitchProps = {
      isRegex: boolean;
      onToggle: () => void;
};

export default function ToggleSwitch({ isRegex, onToggle }: ToggleSwitchProps) {
      const mode = isRegex ? MODES.regex : MODES.math;

      return (
            <button
                  onClick={onToggle}
                  role="switch"
                  aria-checked={isRegex}
                  aria-label={mode.label}
                  className="w-20 h-10 rounded-full relative bg-black/3 border border-white/10 shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)] outline-0 focus-visible:ring-2 focus-visible:ring-white/25 transition-colors duration-300"
            >
                  <span
                        className={`absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shadow-[0_2px_4px_rgba(0,0,0,0.35),0_1px_1px_rgba(0,0,0,0.2)] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${mode.dotBg} ${mode.dotText} ${
                              isRegex ? "left-11" : "left-1"
                        }`}
                  >
                        {mode.symbol}
                  </span>
            </button>
      );
}
