import ToggleSwitch from "./ToggleSwitch";

export const MODES = {
      math: {
            symbol: "∑",
            label: "Math mode",
            dotBg: "bg-white",
            dotText: "text-black",
      },
      regex: {
            symbol: ".*",
            label: "Regex mode",
            dotBg: "bg-black",
            dotText: "text-white",
      },
};

type AppInputProps = {
      isRegex: boolean;
      onToggle: () => void;
      value: string;
      onChange: (value: string) => void;
      hasLog?: boolean;
};

export default function AppInput({
      isRegex,
      onToggle,
      value,
      onChange,
      hasLog,
}: AppInputProps) {
      return (
            <div
                  className={`flex items-center flex-1 min-w-0 h-fit p-1 gap-2 pl-4 bg-surface-lighter/60 border border-white/10 shadow-lg ring-1 ring-transparent focus-within:ring-white/15 transition-all duration-300 ${
                        hasLog
                              ? "rounded-t-3xl rounded-b-none border-b-0"
                              : "rounded-full"
                  }`}
            >
                  <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={isRegex ? "a+ a*" : "a+b"}
                        className="flex-1 min-w-[20rem] h-9 rounded-full px-4 placeholder:text-foreground/35 outline-0 text-foreground placeholder:font-medium font-bold font-mono bg-transparent"
                  />

                  <ToggleSwitch isRegex={isRegex} onToggle={onToggle} />
            </div>
      );
}
