type SimplifyButtonProps = {
      visible: boolean;
      onClick: () => void;
};

export default function SimplifyButton({
      visible,
      onClick,
}: SimplifyButtonProps) {
      return (
            <div
                  className={`flex justify-center p-1 overflow-x-hidden transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]${
                        visible ? "w-14 opacity-100 ml-1" : "w-0 opacity-0 ml-0"
                  }`}
            >
                  <button
                        onClick={onClick}
                        aria-label="Simplify"
                        tabIndex={visible ? 0 : -1}
                        className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-mono font-bold text-sm bg-surface-lighter text-foreground shadow-[0_2px_8px_rgba(0,0,0,0.3)] transition-all duration-300 hover:bg-foreground hover:text-surface ${
                              visible ? "scale-100" : "scale-0"
                        }`}
                  >
                        S
                  </button>
            </div>
      );
}
