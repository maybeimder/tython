import { ReactNode } from "react";

type SideButtonProps = {
      visible: boolean;
      onClick: () => void;
      label: string;
      children: ReactNode;
};

export default function SideButton({
      visible,
      onClick,
      label,
      children,
}: SideButtonProps) {
      return (
            <div
                  className={`flex justify-center p-1 overflow-x-hidden transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                        visible ? "w-14 opacity-100 mr-1" : "w-0 opacity-0 mr-0"
                  }`}
            >
                  <button
                        onClick={onClick}
                        aria-label={label}
                        tabIndex={visible ? 0 : -1}
                        className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-mono font-semibold text-sm bg-surface-lighter text-foreground border border-white/10 shadow-md transition-all duration-300 ${
                              visible ? "scale-100" : "scale-0"
                        }`}
                  >
                        {children}
                  </button>
            </div>
      );
}
