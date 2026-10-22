import type React from "react";
import { X } from "lucide-react";

export interface ModalShellProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  icon?: React.ReactNode;
  isWide?: boolean;
  children: React.ReactNode;
  className?: string;
}

/**
 * サイバーネオン調モーダルの共通レイアウトシェル。
 * オーバーレイ背景、ESCキー対応、タイトルヘッダー、閉じるボタンの構造を一元化します。
 */
export const ModalShell: React.FC<ModalShellProps> = ({
  isOpen,
  onClose,
  title,
  icon,
  isWide = false,
  children,
  className = "",
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="title-modal-overlay"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
      role="presentation"
    >
      <div
        className={`title-modal-box ${
          isWide ? "title-modal-box-wide" : ""
        } ${className}`.trim()}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <div className="title-modal-title">
          <div className="flex items-center gap-2">
            {icon}
            <span>{title}</span>
          </div>
          <button
            type="button"
            className="title-modal-close-btn"
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
