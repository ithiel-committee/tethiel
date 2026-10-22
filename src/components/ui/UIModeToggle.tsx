import type React from "react";
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
  const { mode, isKids, setMode, toggleMode } = useUIText();

  const handleSelect = (newMode: "standard" | "kids", e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (mode === newMode) return;
    try {
      sounds.playRotate();
    } catch {
      // 無視
    }
    setMode(newMode);
  };

  const handleToggle = () => {
    try {
      sounds.playRotate();
    } catch {
      // 無視
    }
    toggleMode();
  };

  const isSmall = size === "sm";

  return (
    <div
      className={`cyber-mode-toggle ${isSmall ? "cyber-mode-toggle-sm" : ""} ${className}`}
      onClick={handleToggle}
      role="switch"
      aria-checked={isKids}
      aria-label="表示モード切り替え (通常 / ひらがな)"
      title="表示モード切り替え (通常 / ひらがな)"
    >
      {/* 左右にスライドするアクティブプレート (ノブ) */}
      <div
        className={`cyber-mode-toggle-thumb ${
          isKids ? "is-kids" : "is-standard"
        }`}
      />

      {/* 通常モードボタン */}
      <button
        type="button"
        onClick={(e) => handleSelect("standard", e)}
        className={`cyber-mode-toggle-option ${
          !isKids ? "is-active" : ""
        }`}
      >
        <span>🎮</span>
        <span>つうじょう</span>
      </button>

      {/* ひらがな (キッズ) モードボタン */}
      <button
        type="button"
        onClick={(e) => handleSelect("kids", e)}
        className={`cyber-mode-toggle-option ${
          isKids ? "is-active" : ""
        }`}
      >
        <span>🐣</span>
        <span>ひらがな</span>
      </button>
    </div>
  );
};
