import confetti from "canvas-confetti";
import {
  Award,
  CheckCircle2,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Trophy,
} from "lucide-react";
import { useEffect } from "react";
import type { GameStats, StageData } from "../types/game";

interface ResultScreenProps {
  isCleared: boolean;
  isBonusClear?: boolean;
  gameOverReason?: string;
  stage: StageData;
  stats: GameStats;
  hearts: number;
  onRetry: () => void;
  onSelectStage: () => void;
}

export const ResultScreen = ({
  isCleared,
  isBonusClear = false,
  gameOverReason,
  stage,
  stats,
  hearts,
  onRetry,
  onSelectStage,
}: ResultScreenProps) => {
  useEffect(() => {
    if (isCleared) {
      confetti({
        particleCount: isBonusClear ? 150 : 80,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#00f0ff", "#00ff88", "#ffe600", "#ff007f", "#ffffff"],
      });
    }
  }, [isCleared, isBonusClear]);

  // ランク計算
  const calculateRank = () => {
    if (!isCleared) return "F";
    if (isBonusClear && hearts >= 4) return "S+";
    if (hearts >= 4 && stats.bonusStars >= 3) return "S";
    if (hearts >= 2) return "A";
    return "B";
  };

  const rank = calculateRank();

  return (
    <div className="w-full max-w-lg bg-slate-900/95 border-2 rounded-2xl p-6 md:p-8 shadow-[0_0_35px_rgba(0,0,0,0.8)] font-['DotGothic16',sans-serif] space-y-6 text-center animate-fadeIn border-cyan-500/50">
      <div className="space-y-2">
        {isCleared ? (
          <>
            <div className="inline-flex p-3 bg-emerald-950/80 border border-emerald-500/60 rounded-full text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]">
              {isBonusClear ? (
                <Sparkles size={40} className="text-yellow-400" />
              ) : (
                <CheckCircle2 size={40} />
              )}
            </div>
            <h2 className="font-['Press_Start_2P'] text-xl md:text-2xl text-emerald-400 tracking-wider">
              {isBonusClear ? "BONUS CLEAR!" : "STAGE CLEAR!"}
            </h2>
            <p className="text-sm text-cyan-300">
              {isBonusClear
                ? "最高難度のBONUSゴールへイティエルを到達させました！"
                : "イティエルが無事にGOALサーバーへ到達しました！"}
            </p>
          </>
        ) : (
          <>
            <div className="inline-flex p-3 bg-rose-950/80 border border-rose-500/60 rounded-full text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.5)]">
              <ShieldAlert size={40} />
            </div>
            <h2 className="font-['Press_Start_2P'] text-xl md:text-2xl text-rose-500 tracking-wider">
              GAME OVER
            </h2>
            <p className="text-xs md:text-sm text-rose-300">
              {gameOverReason || "ウイルスに追いつかれました"}
            </p>
          </>
        )}
      </div>

      <div className="text-xs text-slate-400">
        {`// ${stage.name}: ${stage.subtitle}`}
      </div>

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
              {stats.score.toLocaleString()}
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
              MINO COUNT
            </span>
            <span className="font-['Press_Start_2P'] text-pink-400">
              {stats.minoCount}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">
              BONUS STARS
            </span>
            <span className="font-['Press_Start_2P'] text-amber-300">
              {`★ ${stats.bonusStars}/${stats.totalStars}`}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        <button
          type="button"
          onClick={onRetry}
          className="flex-1 py-3 px-4 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-[0_0_12px_rgba(0,240,255,0.4)] text-sm"
        >
          <RotateCcw size={16} />
          RETRY
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
