import confetti from "canvas-confetti";
import {
  Award,
  ChevronRight,
  Home,
  Layers,
  Play,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Trophy,
} from "lucide-react";
import { useEffect } from "react";
import ithielStandingDefault from "../assets/character/ithiel_standing_default.png";
import ithielStandingSmile from "../assets/character/ithiel_standing_smile.png";
import ithielStandingSmug from "../assets/character/ithiel_standing_smug.png";
import type { GameStats, StageData } from "../types/game";
import { calculateRank } from "../utils/scoreStorage";
import { CyberButton, CyberCard } from "./ui";

interface ResultScreenProps {
  isCleared: boolean;
  isBonusClear?: boolean;
  gameOverReason?: string;
  stage: StageData;
  stats: GameStats;
  hearts: number;
  nextStage?: StageData | null;
  onRetry: () => void;
  onSelectStage: () => void;
  onGoHome: () => void;
  onNextStage?: () => void;
}

export const ResultScreen = ({
  isCleared,
  isBonusClear = false,
  gameOverReason,
  stage,
  stats,
  hearts,
  nextStage,
  onRetry,
  onSelectStage,
  onGoHome,
  onNextStage,
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

  const rank = calculateRank(
    isCleared,
    isBonusClear,
    hearts,
    stats.bonusStars,
    stats.totalStars,
  );

  // 表情アイコンの選択
  const avatarSrc = !isCleared
    ? ithielStandingDefault
    : isBonusClear
      ? ithielStandingSmug
      : ithielStandingSmile;

  return (
    <CyberCard
      variant="default"
      className="w-full max-w-lg p-6 md:p-8 space-y-6 text-center animate-fadeIn shadow-[0_0_35px_rgba(255,26,75,0.2)]"
    >
      <div className="space-y-3">
        {/* イティエルの丸型フェイスアバター */}
        <div className="relative inline-flex items-center justify-center">
          <div
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full p-[3px] transition-transform hover:scale-105 ${
              !isCleared
                ? "bg-gradient-to-b from-rose-700 via-rose-900 to-slate-900 border border-rose-500/80 shadow-[0_0_20px_rgba(244,63,94,0.5)]"
                : isBonusClear
                  ? "bg-gradient-to-b from-amber-400 via-rose-500 to-amber-300 border border-amber-300 shadow-[0_0_25px_rgba(251,191,36,0.7)]"
                  : "bg-gradient-to-b from-rose-500 via-rose-600 to-amber-500 border border-rose-400/90 shadow-[0_0_22px_rgba(255,26,75,0.65)]"
            }`}
          >
            <div className="w-full h-full rounded-full overflow-hidden bg-slate-950 flex items-center justify-center">
              <img
                src={avatarSrc}
                alt="イティエル"
                className="w-full h-full object-cover object-[50%_18%] scale-[1.7] transform select-none pointer-events-none"
              />
            </div>
          </div>
          {/* 右下ステータスバッジ */}
          <div
            className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center border shadow-md ${
              !isCleared
                ? "bg-rose-950 border-rose-500 text-rose-300"
                : isBonusClear
                  ? "bg-amber-950 border-amber-400 text-yellow-300 shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                  : "bg-red-950 border-rose-400 text-rose-300 shadow-[0_0_8px_rgba(255,26,75,0.6)]"
            }`}
          >
            {stats.gameMode === "endless" ? (
              <Trophy size={14} className="text-yellow-400" />
            ) : isBonusClear ? (
              <Sparkles size={14} className="text-yellow-400" />
            ) : isCleared ? (
              <span className="text-xs leading-none">♥</span>
            ) : (
              <ShieldAlert size={14} className="text-rose-400" />
            )}
          </div>
        </div>

        {stats.gameMode === "endless" ? (
          <>
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

      <CyberCard variant="subtle" className="p-4 text-left space-y-3">
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
      </CyberCard>

      {/* 操作アクションボタン群 (縦並び / Vertical Layout) */}
      <div className="flex flex-col gap-2.5 w-full pt-2">
        {/* 1. 次のレベルへ進むボタン (ステージクリア時かつ次ステージ存在時に最上部で強力ハイライト) */}
        {isCleared && nextStage && onNextStage && (
          <button
            type="button"
            onClick={onNextStage}
            className="w-full relative group overflow-hidden py-3 px-5 rounded-xl font-['DotGothic16',sans-serif] text-sm sm:text-base font-bold tracking-wider text-white transition-all duration-150 active:scale-[0.98] cursor-pointer border border-rose-400/90 bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 shadow-[0_0_22px_rgba(255,26,75,0.7),inset_0_0_12px_rgba(255,255,255,0.25)] hover:shadow-[0_0_32px_rgba(255,26,75,0.95),inset_0_0_16px_rgba(255,255,255,0.4)] hover:brightness-110 animate-pulse"
          >
            {/* サイバースキャンライン光沢演出 */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out pointer-events-none" />

            <div className="relative flex items-center justify-center gap-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              <Play size={16} fill="currentColor" className="text-amber-300 shrink-0" />
              <span>NEXT LEVEL : {nextStage.name}</span>
              <ChevronRight
                size={18}
                className="text-amber-200 group-hover:translate-x-1 transition-transform shrink-0"
              />
            </div>
          </button>
        )}

        {/* 2. リトライボタン */}
        <CyberButton
          variant={isCleared && nextStage ? "secondary" : "primary"}
          size="md"
          className="w-full justify-center"
          icon={<RotateCcw size={15} />}
          onClick={onRetry}
        >
          RETRY
        </CyberButton>

        {/* 3. ステージ選択画面へ直行 */}
        <CyberButton
          variant="secondary"
          size="md"
          className="w-full justify-center"
          icon={<Layers size={15} />}
          onClick={onSelectStage}
        >
          STAGE SELECT
        </CyberButton>

        {/* 4. ホーム画面へ戻る */}
        <CyberButton
          variant="secondary"
          size="md"
          className="w-full justify-center"
          icon={<Home size={15} />}
          onClick={onGoHome}
        >
          HOME
        </CyberButton>
      </div>
    </CyberCard>
  );
};
