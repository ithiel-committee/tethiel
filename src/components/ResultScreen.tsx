import confetti from "canvas-confetti";
import {
  Award,
  ChevronRight,
  Home,
  Layers,
  Play,
  RotateCcw,
} from "lucide-react";
import { useEffect } from "react";
import tethielCursor from "../assets/character/tethiel_cursor.png";
import { useUIText } from "../context/UIModeContext";
import type { GameStats, StageData } from "../types/game";
import { calculateRank } from "../utils/scoreStorage";
import { CyberCard, UIModeToggle } from "./ui";

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

  const { t, isKids } = useUIText();

  const rank = calculateRank(
    isCleared,
    isBonusClear,
    hearts,
    stats.bonusStars,
    stats.totalStars,
  );

  return (
    <CyberCard
      variant="default"
      className="w-full max-w-lg p-6 md:p-8 space-y-6 text-center animate-fadeIn shadow-[0_0_35px_rgba(255,26,75,0.2)]"
    >
      {/* 右上 モード切り替えトグル (未就学児/通常) */}
      <div className="result-mode-toggle-wrap">
        <UIModeToggle size="sm" />
      </div>

      <div className="space-y-3">
        {/* イティエル カーソルアイコン (フチ・背景なし) */}
        <div className="inline-flex items-center justify-center">
          <img
            src={tethielCursor}
            alt="イティエル"
            className="w-20 h-20 sm:w-24 sm:h-24 object-contain select-none pointer-events-none drop-shadow-[0_4px_16px_rgba(255,26,75,0.35)] transition-transform hover:scale-105"
            style={{ imageRendering: "pixelated" }}
          />
        </div>

        {stats.gameMode === "endless" ? (
          <>
            <h2 className="font-['Press_Start_2P'] text-xl md:text-2xl text-rose-400 tracking-wider">
              {t("endlessRecord")}
            </h2>
            <p className="text-sm text-amber-300 font-bold">
              {t("climbedHeight")}: {stats.climbedHeight ?? 0} m
            </p>
            <p className="text-xs text-rose-300">
              {gameOverReason || t("virusCaught")}
            </p>
          </>
        ) : isCleared ? (
          <>
            <h2 className="font-['Press_Start_2P'] text-xl md:text-2xl text-amber-300 tracking-wider">
              {isBonusClear ? "BONUS CLEAR!" : t("stageClear")}
            </h2>
            <p className="text-sm text-rose-200">
              {isKids
                ? isBonusClear
                  ? "すごい！ とくべつなゴールへ いけたよ！"
                  : "イティエルが ぶじにゴールへ ついたよ！"
                : isBonusClear
                  ? "最高難度のBONUSゴールへイティエルを到達させました！"
                  : "イティエルが無事にGOALサーバーへ到達しました！"}
            </p>
          </>
        ) : (
          <>
            <h2 className="font-['Press_Start_2P'] text-xl md:text-2xl text-rose-500 tracking-wider">
              {t("gameOver")}
            </h2>
            <p className="text-xs md:text-sm text-rose-300">
              {gameOverReason || (isKids ? "ウイルスにおいつかれちゃった… もういちどあそぼう！" : "ウイルスに追いつかれました")}
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
              {t("evaluationRank")}
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
                {t("evaluationRank")}
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
              {t("finalScore")}
            </span>
            <span className="font-['Press_Start_2P'] text-rose-300">
              {stats.score.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">{t("time")}</span>
            <span className="font-['Press_Start_2P'] text-slate-300">
              {Math.floor(stats.clearTimeSeconds / 60)}:
              {(stats.clearTimeSeconds % 60).toString().padStart(2, "0")}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">
              {t("minoCount")}
            </span>
            <span className="font-['Press_Start_2P'] text-pink-400">
              {stats.minoCount}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">
              {t("bonusStars")}
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
              <span>・{t("timePenalty")}:</span>
              <span className="text-rose-400 font-['Press_Start_2P'] text-[10px]">
                -{stats.timePenalty?.toLocaleString() ?? 0} pts
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>・{t("minoBonus")}:</span>
              <span className="text-amber-300 font-['Press_Start_2P'] text-[10px]">
                +{(stats.minoBonus ?? 0).toLocaleString()} pts
              </span>
            </div>
          </div>
        )}
      </CyberCard>

      {/* 操作アクションボタン群 (統一デザイン・縦並び・マージン確保) */}
      <div className="result-actions-container">
        {/* 1. 次のレベルへ進むボタン (ステージクリア時かつ次ステージ存在時に最上部で強力ハイライト) */}
        {isCleared && nextStage && onNextStage && (
          <button
            type="button"
            onClick={onNextStage}
            className="result-action-btn result-action-btn-primary animate-pulse"
          >
            <Play size={16} fill="currentColor" className="text-amber-300 shrink-0" />
            <span>
              {isKids
                ? `${t("nextLevel")} (${nextStage.name})`
                : `${t("nextLevel")} : ${nextStage.name}`}
            </span>
            <ChevronRight size={18} className="text-amber-200 shrink-0" />
          </button>
        )}

        {/* 2. リトライボタン */}
        <button
          type="button"
          onClick={onRetry}
          className={`result-action-btn ${
            isCleared && nextStage
              ? "result-action-btn-secondary"
              : "result-action-btn-primary"
          }`}
        >
          <RotateCcw size={16} className="shrink-0" />
          <span>{t("retry")}</span>
        </button>

        {/* 3. ステージ選択画面へ直行 */}
        <button
          type="button"
          onClick={onSelectStage}
          className="result-action-btn result-action-btn-secondary"
        >
          <Layers size={16} className="shrink-0" />
          <span>{t("stageSelect")}</span>
        </button>

        {/* 4. ホーム画面へ戻る */}
        <button
          type="button"
          onClick={onGoHome}
          className="result-action-btn result-action-btn-secondary"
        >
          <Home size={16} className="shrink-0" />
          <span>{t("home")}</span>
        </button>
      </div>
    </CyberCard>
  );
};
