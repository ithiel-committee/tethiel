import type React from "react";

interface KeycapProps {
  children: React.ReactNode;
  size?: "xs" | "sm" | "md";
  variant?: "red" | "subtle" | "accent";
  className?: string;
  title?: string;
}

/**
 * メカニカルゲーミングキーボードの立体キートップをリアルに再現したサイバーUIコンポーネント。
 * 二重レイヤー（外側キースカート台座 + 内側ディンプルフェイス）構造により、
 * 四角枠にとどまらない圧倒的な立体感と押し心地を提供します。
 */
export const Keycap: React.FC<KeycapProps> = ({
  children,
  size = "sm",
  variant = "red",
  className = "",
  title,
}) => {
  // サイズ別クラス（外側コンテナ）
  const sizeClasses = {
    xs: "min-w-[20px] h-[21px] px-1 text-[9px] rounded-[5px]",
    sm: "min-w-[24px] h-[25px] px-1.5 text-[10px] rounded-[6px]",
    md: "min-w-[30px] h-[30px] px-2 text-[11px] rounded-[7px]",
  }[size];

  // バリアント別スタイル（外枠スカート＆シャドウ、および内面フェイス）
  const variantStyles = {
    red: {
      outer:
        "bg-gradient-to-b from-[#4a1628] via-[#240813] to-[#120308] border border-rose-500/80 shadow-[0_3px_0_#150309,0_4px_0_#090104,0_5px_8px_rgba(0,0,0,0.8),0_0_8px_rgba(255,26,75,0.35)]",
      inner:
        "bg-gradient-to-b from-[#38101e] via-[#220712] to-[#16040b] text-rose-100 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),inset_0_-1px_2px_rgba(0,0,0,0.8)] border-t border-rose-400/50",
      active:
        "active:translate-y-[2px] active:shadow-[0_1px_0_#150309,0_2px_4px_rgba(0,0,0,0.6),0_0_4px_rgba(255,26,75,0.2)]",
    },
    accent: {
      outer:
        "bg-gradient-to-b from-[#4e2210] via-[#2b1208] to-[#150702] border border-amber-500/80 shadow-[0_3px_0_#1a0802,0_4px_0_#0a0301,0_5px_8px_rgba(0,0,0,0.8),0_0_8px_rgba(245,158,11,0.35)]",
      inner:
        "bg-gradient-to-b from-[#3d1a0b] via-[#250d04] to-[#170602] text-amber-100 shadow-[inset_0_1px_1px_rgba(255,255,255,0.45),inset_0_-1px_2px_rgba(0,0,0,0.8)] border-t border-amber-400/50",
      active:
        "active:translate-y-[2px] active:shadow-[0_1px_0_#1a0802,0_2px_4px_rgba(0,0,0,0.6),0_0_4px_rgba(245,158,11,0.2)]",
    },
    subtle: {
      outer:
        "bg-gradient-to-b from-slate-700 via-slate-800 to-slate-950 border border-slate-600 shadow-[0_3px_0_#0f172a,0_4px_0_#020617,0_5px_8px_rgba(0,0,0,0.8)]",
      inner:
        "bg-gradient-to-b from-slate-750 via-slate-850 to-slate-900 text-slate-200 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),inset_0_-1px_2px_rgba(0,0,0,0.8)] border-t border-slate-500/50",
      active:
        "active:translate-y-[2px] active:shadow-[0_1px_0_#0f172a,0_2px_4px_rgba(0,0,0,0.6)]",
    },
  }[variant];

  return (
    <kbd
      title={title}
      className={`inline-flex items-center justify-center p-[2px] font-['DotGothic16',monospace] font-bold tracking-wider select-none align-middle transition-all duration-75 ${sizeClasses} ${variantStyles.outer} ${variantStyles.active} ${className}`}
    >
      {/* キートップ上面（ディンプル刻印フェイス） */}
      <span
        className={`w-full h-full flex items-center justify-center px-1 rounded-[4px] leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)] ${variantStyles.inner}`}
      >
        {children}
      </span>
    </kbd>
  );
};
