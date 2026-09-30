import type React from "react";

interface CyberCardProps {
  children: React.ReactNode;
  variant?: "default" | "endless" | "interactive" | "subtle";
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

/**
 * サイバーパンク調の共通パネル・カード・バナーコンポーネント。
 * 学部テーマカラー（赤）のネオングローと境界線を一元管理し、
 * クラス未定義による色ズレやレイアウト崩れを完全に防止します。
 */
export const CyberCard: React.FC<CyberCardProps> = ({
  children,
  variant = "default",
  className = "",
  style,
  onClick,
}) => {
  const variantStyles = {
    default:
      "bg-slate-900/95 border-2 border-rose-500/50 shadow-[0_0_15px_rgba(255,26,75,0.15)] rounded-xl",
    endless:
      "border-2 border-rose-500/80 shadow-[0_0_24px_rgba(255,26,75,0.35)] rounded-xl bg-endless-banner",
    interactive:
      "bg-slate-900/90 hover:bg-slate-850 border border-rose-500/50 hover:border-rose-400 shadow-[0_0_15px_rgba(255,26,75,0.15)] hover:shadow-[0_0_20px_rgba(255,26,75,0.3)] rounded-xl cursor-pointer transition-all",
    subtle:
      "bg-slate-900/80 border border-slate-800 shadow-[0_0_10px_rgba(0,0,0,0.5)] rounded-xl",
  }[variant];

  // endless用のインラインフォールバック保証
  const mergedStyle: React.CSSProperties = {
    ...(variant === "endless"
      ? {
          background:
            "linear-gradient(135deg, rgba(32, 9, 20, 0.98) 0%, rgba(75, 14, 36, 0.95) 50%, rgba(22, 6, 14, 0.98) 100%)",
        }
      : {}),
    ...style,
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (onClick && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? handleKeyDown : undefined}
      style={mergedStyle}
      className={`relative overflow-hidden font-['DotGothic16',sans-serif] ${variantStyles} ${className}`}
    >
      {children}
    </div>
  );
};
