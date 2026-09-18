import confetti from "canvas-confetti";
import {
  Award,
  CheckCircle2,
  RotateCcw,
  ShieldAlert,
  Trophy,
} from "lucide-react";
import { useEffect } from "react";
import type { GameStats, StageData } from "../types/game";

interface ResultScreenProps {
  isCleared: boolean;
  gameOverReason?: string;
  stage: StageData;
  stats: GameStats;
  hp: number;
  onRetry: () => void;
  onSelectStage: () => void;
}

export const ResultScreen = ({
  isCleared,
  gameOverReason,
  stage,
  stats,
  hp,
  onRetry,
  onSelectStage,
}: ResultScreenProps) => {
  useEffect(() => {
    if (isCleared) {
      // サイバーカラーの紙吹雪演出
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#00f0ff", "#00ff88", "#ffe600", "#a855f7"],
      });
    }
  }, [isCleared]);

  // ランク計算 (クリア時)
  const calculateRank = () => {
    if (!isCleared) return "F";
    const time = stats.clearTimeSeconds;
    if (time < 45 && hp >= 70) return "S";
    if (time < 75 && hp >= 40) return "A";
    if (time < 120) return "B";
    return "C";
  };

  const rank = calculateRank();

  return (
    <div className="w-full max-w-lg bg-slate-900/95 border-2 rounded-2xl p-6 md:p-8 shadow-[0_0_35px_rgba(0,0,0,0.8)] font-['DotGothic16',sans-serif] space-y-6 text-center animate-fadeIn border-cyan-500/50">
      {/* ヘッダーアイコン＆タイトル */}
      <div className="space-y-2">
        {isCleared ? (
          <>
            <div className="inline-flex p-3 bg-emerald-950/80 border border-emerald-500/60 rounded-full text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="font-['Press_Start_2P'] text-2xl md:text-3xl text-emerald-400 tracking-wider">
              MISSION COMPLETE!
            </h2>
            <p className="text-sm text-cyan-300">
              サーバーコアへの回路接続に成功しました！
            </p>
          </>
        ) : (
          <>
            <div className="inline-flex p-3 bg-rose-950/80 border border-rose-500/60 rounded-full text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.5)]">
              <ShieldAlert size={40} />
            </div>
            <h2 className="font-['Press_Start_2P'] text-2xl md:text-3xl text-rose-500 tracking-wider">
              MISSION FAILED
            </h2>
            <p className="text-xs md:text-sm text-rose-300">
              {gameOverReason || "システムがウイルスに侵食されました"}
            </p>
          </>
        )}
      </div>

      {/* ステージ名 */}
      <div className="text-xs text-slate-400">
        {`// ${stage.name}: ${stage.subtitle}`}
      </div>

      {/* スコア・スタッツ表 */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 text-left space-y-3">
        {isCleared && (
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Award size={14} className="text-yellow-400" />
              EVALUATION RANK
            </span>
            <span className="font-['Press_Start_2P'] text-2xl text-yellow-400">
              RANK {rank}
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 text-xs md:text-sm">
          <div>
            <span className="text-slate-500 block text-[11px]">
              FINAL SCORE
            </span>
            <span className="font-['Press_Start_2P'] text-cyan-300">
              {stats.score.toString().padStart(6, "0")}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">TIME</span>
            <span className="font-['Press_Start_2P'] text-slate-300">
              {Math.floor(stats.clearTimeSeconds / 60)}:
              {(stats.clearTimeSeconds % 60).toString().padStart(2, "0")}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">
              LINES CONNECTED
            </span>
            <span className="font-['Press_Start_2P'] text-emerald-400">
              {stats.linesConnected}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">
              REMAINING HP
            </span>
            <span className="font-['Press_Start_2P'] text-rose-400">
              {Math.round(hp)}%
            </span>
          </div>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        <button
          type="button"
          onClick={onRetry}
          className="flex-1 py-3 px-4 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-[0_0_12px_rgba(0,240,255,0.4)] text-sm"
        >
          <RotateCcw size={16} />
          RETRY MISSION
        </button>

        <button
          type="button"
          onClick={onSelectStage}
          className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all text-sm"
        >
          <Trophy size={16} />
          STAGE SELECT
        </button>
      </div>
    </div>
  );
};
