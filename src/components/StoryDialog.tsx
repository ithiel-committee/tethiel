import { AlertTriangle, ChevronRight, Terminal } from "lucide-react";
import { useEffect, useState } from "react";
import type { StageData } from "../types/game";

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
  const storyLines = [
    "【緊急通信】中央大学 iTL サイバーセキュリティ防衛本部より入電。",
    "市ヶ谷田町キャンパスのファイアウォール外郭に、強力なマルウェア群が侵入しました！",
    "ウイルスは猛スピードで回線を侵食し、最下部から上層サーバーへと迫っています。",
    "防衛オペレーター、上空から回路ブロックを投下し、最上部の【SERVER CORE】まで回路を直結してください！",
    "道中の赤いカプセルを接続すると【BOMB】が補充されます。邪魔な障害物を爆破して突破口を開いてください！",
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
    <div className="w-full max-w-xl bg-slate-900/95 border-2 border-cyan-500/60 rounded-xl p-5 md:p-7 shadow-[0_0_30px_rgba(0,240,255,0.2)] font-['DotGothic16',sans-serif] space-y-5">
      {/* ターミナルヘッダー */}
      <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3">
        <div className="flex items-center gap-2 text-cyan-400">
          <Terminal size={18} />
          <span className="font-['Press_Start_2P'] text-xs">
            iTL DEFENSE BRIEFING
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-950/60 border border-rose-500/40 px-2 py-0.5 rounded">
          <AlertTriangle size={12} />
          <span>SECURITY LEVEL: CRITICAL</span>
        </div>
      </div>

      {/* ステージ名 */}
      <div className="text-left space-y-0.5">
        <div className="text-xs text-slate-400">MISSION TARGET:</div>
        <div className="text-lg font-bold text-cyan-200">
          {stage.subtitle ? `${stage.name}: ${stage.subtitle}` : stage.name}
        </div>
      </div>

      {/* 会話・テキスト枠 */}
      <div className="min-h-[120px] bg-slate-950/90 border border-slate-800 rounded-lg p-4 text-left text-sm md:text-base leading-relaxed text-slate-200">
        <p className="animate-fadeIn">{storyLines[currentLineIndex]}</p>
      </div>

      {/* プログレスドット */}
      <div className="flex justify-center gap-1.5">
        {storyLines.map((line, idx) => (
          <div
            key={line.slice(0, 10)}
            className={`w-2 h-2 rounded-full transition-all ${
              idx === currentLineIndex
                ? "bg-cyan-400 w-5"
                : idx < currentLineIndex
                  ? "bg-cyan-700"
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
          className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 border border-slate-700 hover:border-slate-500 rounded cursor-pointer transition-colors"
        >
          BACK
        </button>

        {currentLineIndex < storyLines.length - 1 ? (
          <button
            type="button"
            onClick={() => setCurrentLineIndex((prev) => prev + 1)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-cyan-500/50 rounded-lg text-cyan-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>NEXT [Space]</span>
            <ChevronRight size={14} />
          </button>
        ) : (
          <button
            type="button"
            onClick={onStartGame}
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-['Press_Start_2P'] text-xs font-bold rounded-lg cursor-pointer transition-all shadow-[0_0_15px_rgba(0,240,255,0.5)] animate-pulse"
          >
            START MISSION
          </button>
        )}
      </div>
    </div>
  );
};
