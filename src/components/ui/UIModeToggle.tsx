import { sounds } from "../../audio/soundSystem";
import { useUIText } from "../../context/UIModeContext";

interface UIModeToggleProps {
  className?: string;
  size?: "sm" | "md";
}

export const UIModeToggle = ({
  className = "",
  size = "md",
}: UIModeToggleProps) => {
  const { mode, setMode } = useUIText();

  const handleSelect = (newMode: "standard" | "kids") => {
    if (mode === newMode) return;
    try {
      sounds.playRotate();
    } catch {
      // 無視
    }
    setMode(newMode);
  };

  const isSmall = size === "sm";

  return (
    <div
      className={`ui-mode-toggle-group inline-flex items-center rounded-full p-1 bg-slate-950/80 border border-rose-500/40 backdrop-blur-sm select-none ${
        isSmall ? "text-xs" : "text-xs sm:text-sm"
      } ${className}`}
      role="group"
      aria-label="表示モード切り替え"
    >
      <button
        type="button"
        onClick={() => handleSelect("standard")}
        className={`ui-mode-toggle-btn flex items-center gap-1.5 rounded-full font-bold transition-all duration-150 cursor-pointer ${
          isSmall ? "px-2.5 py-1" : "px-3 py-1.5"
        } ${
          mode === "standard"
            ? "bg-gradient-to-r from-red-600 to-rose-500 text-white shadow-[0_0_12px_rgba(255,26,75,0.7)]"
            : "text-slate-400 hover:text-slate-200"
        }`}
      >
        <span>🎮</span>
        <span>つうじょう</span>
      </button>

      <button
        type="button"
        onClick={() => handleSelect("kids")}
        className={`ui-mode-toggle-btn flex items-center gap-1.5 rounded-full font-bold transition-all duration-150 cursor-pointer ${
          isSmall ? "px-2.5 py-1" : "px-3 py-1.5"
        } ${
          mode === "kids"
            ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-[0_0_14px_rgba(251,191,36,0.8)]"
            : "text-slate-400 hover:text-slate-200"
        }`}
      >
        <span>🐣</span>
        <span>ひらがな</span>
      </button>
    </div>
  );
};
