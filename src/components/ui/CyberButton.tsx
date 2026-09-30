import type React from "react";

interface CyberButtonProps {
  children?: React.ReactNode;
  variant?: "primary" | "secondary" | "danger" | "touch";
  size?: "xs" | "sm" | "md" | "lg";
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  type?: "button" | "submit" | "reset";
  title?: string;
}

/**
 * サイバーパンク調の共通ボタンスタイルコンポーネント。
 * ホバー発光、クリック時の押し込み感、ネオングローを一元化します。
 */
export const CyberButton: React.FC<CyberButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  icon,
  onClick,
  disabled = false,
  className = "",
  style,
  type = "button",
  title,
}) => {
  // サイズ別クラス
  const sizeClasses = {
    xs: "px-2 py-0.5 text-[10px] rounded",
    sm: "px-2.5 py-1 text-xs rounded-md",
    md: "px-4 py-2 text-xs rounded-lg",
    lg: "px-5 py-2.5 text-sm rounded-xl",
  }[size];

  // バリアント別スタイル
  const variantStyles = {
    primary:
      "text-white font-bold border border-rose-400/60 shadow-[0_0_15px_rgba(255,26,75,0.45)] hover:shadow-[0_0_22px_rgba(255,26,75,0.7)] hover:brightness-110",
    secondary:
      "bg-slate-850 hover:bg-slate-800 border border-slate-700 hover:border-rose-500/50 text-slate-200 hover:text-white shadow-[0_0_8px_rgba(0,0,0,0.4)]",
    danger:
      "bg-rose-950/70 hover:bg-rose-900 border border-rose-500/60 text-rose-200 hover:text-white shadow-[0_0_8px_rgba(255,26,75,0.25)]",
    touch:
      "bg-slate-800/80 hover:bg-red-950/80 active:bg-red-600/40 border border-rose-500/40 hover:border-rose-400 text-rose-200 hover:text-white font-bold shadow-[0_0_6px_rgba(255,26,75,0.15)] hover:shadow-[0_0_10px_rgba(255,26,75,0.3)]",
  }[variant];

  // primaryボタン用インライングラデーション（未定義クラスフォールバック対策）
  const mergedStyle: React.CSSProperties = {
    ...(variant === "primary"
      ? {
          background:
            "linear-gradient(to right, #dc2626 0%, #e11d48 50%, #ef4444 100%)",
        }
      : {}),
    ...style,
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={mergedStyle}
      className={`inline-flex items-center justify-center gap-1.5 font-['DotGothic16',sans-serif] select-none cursor-pointer transition-all duration-100 active:scale-[0.97] active:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses} ${variantStyles} ${className}`}
    >
      {icon && <span className="shrink-0 flex items-center">{icon}</span>}
      {children && <span>{children}</span>}
    </button>
  );
};
