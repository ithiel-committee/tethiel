import { AlertTriangle, ChevronRight, Terminal } from "lucide-react";
import { useEffect, useState } from "react";
import type { StageData } from "../types/game";
import { Keycap } from "./Keycap";

interface StoryDialogProps {
  stage: StageData;
  onStartGame: () => void;
  onBackToTitle: () => void;
}

export const StoryDialog = ({
  stage,
  onStartGame,
  onBackToTitle,
}: StoryDialogProps) => {
  const isEndless = stage.mode === "endless";
  const storyLines = isEndless
    ? [
        "【無限迎撃命令】未曾有の大規模サイバー侵攻を検知しました！",
        "ウイルスの侵食は天井知らず。防衛ラインの高さ制限を解除し、無限高度への緊急接続を開始します。",
        "下からせりあがるウイルスを警戒しつつ、どこまでも高くブロックを積み上げてください！",
        "オペレーター、持てるすべての技術を尽くし、前人未到の最高到達高度を記録してください！",
      ]
    : [
        "【緊急通信】中央大学 iTL サイバーセキュリティ防衛本部より入電。",
        "市ヶ谷田町キャンパスのファイアウォール外郭に、強力なマルウェア群が侵入しました！",
        "ウイルスは猛スピードで回線を侵食し、最下部から上層サーバーへと迫っています。",
        "防衛オペレーター、上空から回路ブロックを投下し、最上部の【SERVER CORE】まで回路を直結してください！",
      ];

  const [currentLineIndex, setCurrentLineIndex] = useState(0);

  useEffect(() => {
    // スペースキーまたはEnterキーで次へ
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        if (currentLineIndex < storyLines.length - 1) {
          setCurrentLineIndex((prev) => prev + 1);
        } else {
          onStartGame();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentLineIndex, onStartGame, storyLines.length]);

  return (
    <div className="w-full max-w-xl bg-slate-900/95 border-2 border-rose-500/60 rounded-xl p-5 md:p-7 shadow-[0_0_30px_rgba(255,26,75,0.25)] font-['DotGothic16',sans-serif] space-y-5">
      {/* ターミナルヘッダー */}
      <div className="flex items-center justify-between border-b border-rose-500/30 pb-3">
        <div className="flex items-center gap-2 text-rose-400">
          <Terminal size={18} />
          <span className="font-['Press_Start_2P'] text-xs tracking-wider">
            iTL DEFENSE BRIEFING
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-rose-300 bg-rose-950/70 border border-rose-500/50 px-2.5 py-0.5 rounded shadow-[0_0_8px_rgba(255,26,75,0.2)]">
          <AlertTriangle size={12} className="text-rose-400" />
          <span>SECURITY LEVEL: CRITICAL</span>
        </div>
      </div>

      {/* ステージ名 */}
      <div className="text-left space-y-0.5">
        <div className="text-xs text-slate-400">MISSION TARGET:</div>
        <div className="text-lg font-bold text-rose-200">
          {stage.subtitle
            ? `${stage.name}: ${stage.subtitle}`
            : stage.name}
        </div>
      </div>

      {/* 会話・テキスト枠 */}
      <div className="min-h-[120px] bg-slate-950/90 border border-slate-800 rounded-lg p-4 text-left text-sm md:text-base leading-relaxed text-slate-200 shadow-inner">
        <p className="animate-fadeIn">{storyLines[currentLineIndex]}</p>
      </div>

      {/* プログレスドット */}
      <div className="flex justify-center gap-1.5">
        {storyLines.map((line, idx) => (
          <div
            key={line.slice(0, 10)}
            className={`w-2 h-2 rounded-full transition-all ${
              idx === currentLineIndex
                ? "bg-rose-500 w-5 shadow-[0_0_8px_rgba(255,26,75,0.7)]"
                : idx < currentLineIndex
                  ? "bg-rose-800"
                  : "bg-slate-700"
            }`}
          />
        ))}
      </div>

      {/* ボタンフッター */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBackToTitle}
          className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 border border-slate-700 hover:border-rose-500/50 rounded cursor-pointer transition-colors"
        >
          BACK
        </button>

        {currentLineIndex < storyLines.length - 1 ? (
          <button
            type="button"
            onClick={() => setCurrentLineIndex((prev) => prev + 1)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-rose-500/50 hover:border-rose-400 rounded-lg text-rose-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-[0_0_8px_rgba(255,26,75,0.15)]"
          >
            <span>NEXT</span>
            <Keycap size="xs" variant="accent">
              SPACE
            </Keycap>
            <ChevronRight size={14} className="text-rose-400" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onStartGame}
            className="px-5 py-2.5 bg-gradient-to-r from-red-600 via-rose-600 to-red-500 hover:from-red-500 hover:to-rose-400 text-white font-['Press_Start_2P'] text-xs font-bold rounded-lg cursor-pointer transition-all shadow-[0_0_18px_rgba(255,26,75,0.6)] animate-pulse"
          >
            START MISSION
          </button>
        )}
      </div>
    </div>
  );
};
