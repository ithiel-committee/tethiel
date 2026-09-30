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
        colors: ["#ff1a4b", "#ff2a6d", "#ffdd00", "#ff9900", "#ffffff"],
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
    <div className="w-full max-w-lg bg-slate-900/95 border-2 rounded-2xl p-6 md:p-8 shadow-[0_0_35px_rgba(255,26,75,0.2)] font-['DotGothic16',sans-serif] space-y-6 text-center animate-fadeIn border-rose-500/50">
      <div className="space-y-2">
        {stats.gameMode === "endless" ? (
          <>
            <div className="inline-flex p-3 bg-red-950/80 border border-rose-500/60 rounded-full text-rose-400 shadow-[0_0_15px_rgba(255,26,75,0.5)]">
              <Trophy size={40} className="text-yellow-400" />
            </div>
            <h2 className="font-['Press_Start_2P'] text-xl md:text-2xl text-rose-400 tracking-wider">
              ENDLESS RECORD
            </h2>
            <p className="text-sm text-amber-300 font-bold">
              到達高度: {stats.climbedHeight ?? 0} m
            </p>
            <p className="text-xs text-rose-300">
              {gameOverReason || "ウイルスに追いつかれました"}
            </p>
          </>
        ) : isCleared ? (
          <>
            <div className="inline-flex p-3 bg-red-950/80 border border-rose-500/60 rounded-full text-amber-300 shadow-[0_0_15px_rgba(255,26,75,0.4)]">
              {isBonusClear ? (
                <Sparkles size={40} className="text-yellow-400" />
              ) : (
                <CheckCircle2 size={40} />
              )}
            </div>
            <h2 className="font-['Press_Start_2P'] text-xl md:text-2xl text-amber-300 tracking-wider">
              {isBonusClear ? "BONUS CLEAR!" : "STAGE CLEAR!"}
            </h2>
            <p className="text-sm text-rose-200">
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
        {stage.subtitle
          ? `// ${stage.name}: ${stage.subtitle}`
          : `// ${stage.name}`}
      </div>

      <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 text-left space-y-3">
        {stats.gameMode === "endless" ? (
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Award size={14} className="text-yellow-400" />
              CLIMBED ALTITUDE
            </span>
            <span className="font-['Press_Start_2P'] text-2xl text-amber-300">
              {stats.climbedHeight ?? 0} m
            </span>
          </div>
        ) : (
          isCleared && (
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <Award size={14} className="text-yellow-400" />
                EVALUATION RANK
              </span>
              <span className="font-['Press_Start_2P'] text-2xl text-yellow-400">
                RANK {rank}
              </span>
            </div>
          )
        )}

        <div className="grid grid-cols-2 gap-3 text-xs md:text-sm">
          <div>
            <span className="text-slate-500 block text-[11px]">
              FINAL SCORE
            </span>
            <span className="font-['Press_Start_2P'] text-rose-300">
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
              {stats.gameMode === "endless"
                ? `★ ${stats.bonusStars}`
                : `★ ${stats.bonusStars}/${stats.totalStars}`}
            </span>
          </div>
        </div>

        {isCleared && (
          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex justify-between items-center">
              <span>・タイム減点補正:</span>
              <span className="text-rose-400 font-['Press_Start_2P'] text-[10px]">
                -{stats.timePenalty?.toLocaleString() ?? 0} pts
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>・ミノ節約ボーナス:</span>
              <span className="text-amber-300 font-['Press_Start_2P'] text-[10px]">
                +{(stats.minoBonus ?? 0).toLocaleString()} pts
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        <button
          type="button"
          onClick={onRetry}
          className="flex-1 py-3 px-4 bg-gradient-to-r from-red-600 via-rose-600 to-red-500 hover:from-red-500 hover:to-rose-400 text-white font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-[0_0_15px_rgba(255,26,75,0.45)] text-sm"
        >
          <RotateCcw size={16} />
          RETRY
        </button>

        <button
          type="button"
          onClick={onSelectStage}
          className="flex-1 py-3 px-4 bg-slate-850 hover:bg-slate-800 border border-slate-700 hover:border-rose-500/40 text-slate-200 font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all text-sm"
        >
          <Trophy size={16} />
          STAGE SELECT
        </button>
      </div>
    </div>
  );
};
