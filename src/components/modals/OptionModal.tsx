import { useState } from "react";
import { Settings, Volume2, VolumeX } from "lucide-react";
import {
  type GameFlags,
  type PlayerSpriteMode,
  getGameFlags,
  setGameFlags,
} from "../../config/gameFlags.ts";
import { useUIText } from "../../context/UIModeContext";
import { KeyboardGuide } from "../KeyboardGuide";
import { ModalShell } from "../ui/ModalShell";
import { UIModeToggle } from "../ui/UIModeToggle";

interface OptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const OptionModal: React.FC<OptionModalProps> = ({
  isOpen,
  onClose,
  isMuted,
  onToggleMute,
}) => {
  const { t, isKids } = useUIText();
  const [flags, setFlagsState] = useState<GameFlags>(() => getGameFlags());

  const handleTogglePlayerSprite = () => {
    const nextMode: PlayerSpriteMode =
      flags.playerSpriteMode === "pixel" ? "deformed" : "pixel";
    const updated = setGameFlags({ playerSpriteMode: nextMode });
    setFlagsState({ ...updated });
  };

  const handleToggleShowStory = () => {
    const updated = setGameFlags({
      showStoryOnClear: !flags.showStoryOnClear,
    });
    setFlagsState({ ...updated });
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={t("settingsTitle")}
      icon={<Settings size={16} className="text-rose-400" />}
      isWide
    >
      <div className="space-y-3 text-xs">
        {/* 表示モード設定 (未就学児〜大人) */}
        <div className="flex items-center justify-between p-3 bg-slate-900/80 rounded border border-rose-500/30">
          <div>
            <div className="font-bold text-slate-200">
              {t("uiModeSetting")}
            </div>
            <div className="text-[11px] text-slate-400">
              {t("modeStandardLabel")} / {t("modeKidsLabel")}
            </div>
          </div>
          <UIModeToggle size="sm" />
        </div>

        {/* 自機キャラクター設定 */}
        <div className="flex items-center justify-between p-3 bg-slate-900/80 rounded border border-rose-500/30">
          <div>
            <div className="font-bold text-slate-200">
              {isKids ? "じき (プレイヤー) えらび" : "自機グラフィック"}
            </div>
            <div className="text-[11px] text-slate-400">
              {isKids
                ? "イラスト / ドットえ"
                : "デフォルメ立ち絵 / ドット絵カーソル"}
            </div>
          </div>
          <button
            type="button"
            onClick={handleTogglePlayerSprite}
            className="flex items-center gap-2 px-3 py-1.5 rounded font-pixel-en text-xs transition-all bg-rose-950/80 text-rose-300 border border-rose-500/60 shadow-[0_0_10px_rgba(255,26,75,0.3)] hover:bg-rose-900/80"
          >
            {flags.playerSpriteMode === "pixel" ? (
              <span>{isKids ? "ドットえ" : "ドット絵"}</span>
            ) : (
              <span>{isKids ? "イラスト" : "デフォルメ"}</span>
            )}
          </button>
        </div>

        {/* クリア後ストーリー設定 */}
        <div className="flex items-center justify-between p-3 bg-slate-900/80 rounded border border-rose-500/30">
          <div>
            <div className="font-bold text-slate-200">
              {isKids ? "クリア後のおはなし" : "クリア後ストーリー"}
            </div>
            <div className="text-[11px] text-slate-400">
              {isKids
                ? "おはなしをみる / スキップ"
                : "エピローグ表示 / スキップ"}
            </div>
          </div>
          <button
            type="button"
            onClick={handleToggleShowStory}
            className={`flex items-center gap-2 px-3 py-1.5 rounded font-pixel-en text-xs transition-all ${
              flags.showStoryOnClear
                ? "bg-rose-950/80 text-rose-300 border border-rose-500/60 shadow-[0_0_10px_rgba(255,26,75,0.3)] hover:bg-rose-900/80"
                : "bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700"
            }`}
          >
            <span>{flags.showStoryOnClear ? "ON" : "OFF (スキップ)"}</span>
          </button>
        </div>

        {/* サウンド設定 */}
        <div className="flex items-center justify-between p-3 bg-slate-900/80 rounded border border-rose-500/30">
          <div>
            <div className="font-bold text-slate-200">
              {t("audioSetting")}
            </div>
            <div className="text-[11px] text-slate-400">
              {t("soundEffectLabel")}
            </div>
          </div>
          <button
            type="button"
            onClick={onToggleMute}
            className={`flex items-center gap-2 px-3 py-1.5 rounded font-pixel-en text-xs transition-all ${
              isMuted
                ? "bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700"
                : "bg-rose-950/80 text-rose-300 border border-rose-500/60 shadow-[0_0_10px_rgba(255,26,75,0.3)] hover:bg-rose-900/80"
            }`}
          >
            {isMuted ? (
              <>
                <VolumeX size={14} />
                <span>{t("soundOff")}</span>
              </>
            ) : (
              <>
                <Volume2 size={14} className="text-rose-400" />
                <span>{t("soundOn")}</span>
              </>
            )}
          </button>
        </div>

        {/* キーボード操作ガイド */}
        <div className="p-3 bg-slate-900/80 rounded border border-rose-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <div className="font-bold text-slate-200">
              {t("controlsTitle")}
            </div>
            <div className="text-[11px] text-rose-400">
              {t("controlsSubtitle")}
            </div>
          </div>
          <div className="title-controls-modal-body">
            <KeyboardGuide />
          </div>
        </div>
      </div>

      <div className="ranking-footer">
        <div />
        <button
          type="button"
          className="ranking-close-btn"
          onClick={onClose}
        >
          {t("closeButton")}
        </button>
      </div>
    </ModalShell>
  );
};
