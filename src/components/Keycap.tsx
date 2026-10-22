import type React from "react";

export interface KeycapProps {
  children: React.ReactNode;
  variant?: "default" | "accent" | "subtle";
  wide?: boolean;
  className?: string;
  title?: string;
}

/**
 * サイバーネオン調キートップUIコンポーネント。
 * CSSの .keycap クラスとセマンティックな <kbd> タグを一元化します。
 */
export const Keycap: React.FC<KeycapProps> = ({
  children,
  variant = "default",
  wide = false,
  className = "",
  title,
}) => {
  const variantClass =
    variant === "accent"
      ? "keycap-accent"
      : variant === "subtle"
        ? "keycap-subtle"
        : "";
  const wideClass = wide ? "keycap-wide" : "";

  return (
    <kbd
      title={title}
      className={`keycap ${variantClass} ${wideClass} ${className}`.trim()}
    >
      {children}
    </kbd>
  );
};
