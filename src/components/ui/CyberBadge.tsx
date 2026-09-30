import type React from "react";

interface CyberBadgeProps {
  children: React.ReactNode;
  variant?: "red" | "amber" | "subtle" | "danger";
  icon?: React.ReactNode;
  className?: string;
}

/**
 * サイバーパンク調のカプセル・ステータスバッジコンポーネント。
 */
export const CyberBadge: React.FC<CyberBadgeProps> = ({
  children,
  variant = "red",
  icon,
  className = "",
}) => {
  const variantStyles = {
    red: "bg-red-950/70 border border-rose-500/50 text-rose-300 shadow-[0_0_10px_rgba(255,26,75,0.2)]",
    amber:
      "bg-amber-950/70 border border-amber-500/50 text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.2)]",
    subtle: "bg-slate-900 border border-slate-700 text-slate-400",
    danger:
      "bg-rose-950/80 border border-rose-500/60 text-rose-200 shadow-[0_0_12px_rgba(255,26,75,0.35)]",
  }[variant];

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-['DotGothic16',sans-serif] tracking-wider select-none ${variantStyles} ${className}`}
    >
      {icon && <span className="shrink-0 flex items-center">{icon}</span>}
      <span>{children}</span>
    </div>
  );
};
