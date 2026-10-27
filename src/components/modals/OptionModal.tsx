import { useState } from "react";
import { Music, Settings, Volume2, VolumeX } from "lucide-react";
import { bgm } from "../../audio/bgmManager.ts";
import { sounds } from "../../audio/soundSystem.ts";
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
  const [bgmVol, setBgmVol] = useState<number>(() =>
    Math.round(bgm.getVolume() * 100),
  );
  const [seVol, setSeVol] = useState<number>(() =>
    Math.round(sounds.getVolume() * 100),
  );

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

  const handleBgmVolumeChange = (newVal: number) => {
    const clamped = Math.max(0, Math.min(100, newVal));
    setBgmVol(clamped);
    bgm.setVolume(clamped / 100);
    if (isMuted && clamped > 0) {
      onToggleMute();
    }
  };

  const handleSeVolumeChange = (newVal: number) => {
    const clamped = Math.max(0, Math.min(100, newVal));
    setSeVol(clamped);
    sounds.setVolume(clamped / 100);
    if (isMuted && clamped > 0) {
      onToggleMute();
    }
    sounds.playRotate();
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

        {/* サウンド設定 (BGM / SE 独立スライダー) */}
        <div className="p-3 bg-slate-900/80 rounded border border-rose-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-200 flex items-center gap-2">
                <Volume2 size={15} className="text-rose-400" />
                <span>{isKids ? "おとの せってい" : "音量設定"}</span>
              </div>
              <div className="text-[11px] text-slate-400">
                {isKids
                  ? "スライダーでおとのおおきさを かえられるよ"
                  : "BGMと効果音(SE)の音量を個別に調整"}
              </div>
            </div>
            <button
              type="button"
              onClick={onToggleMute}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-pixel-en text-[11px] transition-all ${
                isMuted
                  ? "bg-rose-950/90 text-rose-300 border border-rose-500/80 shadow-[0_0_8px_rgba(255,26,75,0.4)]"
                  : "bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700"
              }`}
              title={isMuted ? "ミュート解除" : "全音量をミュート"}
            >
              {isMuted ? (
                <>
                  <VolumeX size={13} className="text-rose-400" />
                  <span>{isKids ? "消音ちゅう" : "MUTE (消音)"}</span>
                </>
              ) : (
                <>
                  <Volume2 size={13} className="text-slate-400" />
                  <span>{isKids ? "おと ON" : "ALL ON"}</span>
                </>
              )}
            </button>
          </div>

          <div className="space-y-3 pt-1">
            {/* BGM音量スライダー */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-bold text-rose-300">
                  <Music size={13} className="text-rose-400" />
                  <span>{isKids ? "BGM (おんがく)" : "BGM 音量"}</span>
                </span>
                <span className="font-pixel-en text-[11px] text-rose-300 font-bold tracking-wider">
                  {bgmVol}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={bgmVol}
                onChange={(e) =>
                  handleBgmVolumeChange(Number.parseInt(e.target.value, 10))
                }
                className="cyber-slider cyber-slider-rose"
                aria-label="BGM Volume"
              />
            </div>

            {/* SE音量スライダー */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-bold text-sky-300">
                  <Volume2 size={13} className="text-sky-400" />
                  <span>{isKids ? "SE (こうかおん)" : "SE 音量 (効果音)"}</span>
                </span>
                <span className="font-pixel-en text-[11px] text-sky-300 font-bold tracking-wider">
                  {seVol}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={seVol}
                onChange={(e) =>
                  handleSeVolumeChange(Number.parseInt(e.target.value, 10))
                }
                className="cyber-slider cyber-slider-sky"
                aria-label="SE Volume"
              />
            </div>
          </div>
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
