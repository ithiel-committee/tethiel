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
import { useOverflowCheck } from "../utils/overflowChecker";
import { useUIText } from "../context/UIModeContext";
import type { GameStats, StageData } from "../types/game";
import { STAGE_TEXTS } from "../data/uiTexts";
import { calculateRank } from "../utils/scoreStorage";

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
  useOverflowCheck("ResultScreen");

  const stageInfo = STAGE_TEXTS[stage.id];
  const stageName = stageInfo
    ? isKids
      ? stageInfo.name.kids
      : stageInfo.name.standard
    : stage.name;
  const stageSubtitle = stageInfo
    ? isKids
      ? stageInfo.subtitle.kids
      : stageInfo.subtitle.standard
    : stage.subtitle;

  const nextStageInfo = nextStage ? STAGE_TEXTS[nextStage.id] : undefined;
  const nextStageName = nextStage
    ? nextStageInfo
      ? isKids
        ? nextStageInfo.name.kids
        : nextStageInfo.name.standard
      : nextStage.name
    : "";

  const rank = calculateRank(
    isCleared,
    isBonusClear,
    hearts,
    stats.bonusStars,
    stats.totalStars,
  );

  return (
    <div className="result-modal-card animate-fadeIn">
      <div className="result-header-area">
        {/* イティエル カーソルアイコン (フチ・背景なし) */}
        <div className="inline-flex items-center justify-center">
          <img
            src={tethielCursor}
            alt="イティエル"
            className="result-ithiel-avatar"
            style={{ imageRendering: "pixelated" }}
          />
        </div>

        {stats.gameMode === "endless" ? (
          <>
            <h2 className="result-title-text text-rose-400">
              {t("endlessRecord")}
            </h2>
            <p className="text-xs text-amber-300 font-bold">
              {t("climbedHeight")}: {stats.climbedHeight ?? 0} m
            </p>
            <p className="result-sub-text text-rose-300">
              {gameOverReason || t("virusCaught")}
            </p>
          </>
        ) : isCleared ? (
          <>
            <h2 className="result-title-text text-amber-300">
              {isBonusClear ? "BONUS CLEAR!" : t("stageClear")}
            </h2>
            <p className="result-sub-text text-rose-200">
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
            <h2 className="result-title-text text-rose-500">
              {t("gameOver")}
            </h2>
            <p className="result-sub-text text-rose-300">
              {gameOverReason || (isKids ? "ウイルスにおいつかれちゃった… もういちどあそぼう！" : "ウイルスに追いつかれました")}
            </p>
          </>
        )}

        <div className="result-stage-label">
          {stageSubtitle
            ? `// ${stageName}: ${stageSubtitle}`
            : `// ${stageName}`}
        </div>
      </div>

      {/* スコアサマリー部 */}
      <div className="result-summary-card">
        {stats.gameMode === "endless" ? (
          <div className="result-summary-rank-row">
            <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Award size={13} className="text-yellow-400" />
              {t("evaluationRank")}
            </span>
            <span className="result-summary-rank-val text-amber-300">
              {stats.climbedHeight ?? 0} m
            </span>
          </div>
        ) : (
          isCleared && (
            <div className="result-summary-rank-row">
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Award size={13} className="text-yellow-400" />
                {t("evaluationRank")}
              </span>
              <span className="result-summary-rank-val">
                RANK {rank}
              </span>
            </div>
          )
        )}

        <div className="result-summary-grid">
          <div>
            <span className="result-summary-item-label">
              {t("finalScore")}
            </span>
            <span className="result-summary-item-val text-rose-300">
              {stats.score.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="result-summary-item-label">{t("time")}</span>
            <span className="result-summary-item-val text-slate-300">
              {Math.floor(stats.clearTimeSeconds / 60)}:
              {(stats.clearTimeSeconds % 60).toString().padStart(2, "0")}
            </span>
          </div>
          <div>
            <span className="result-summary-item-label">
              {t("minoCount")}
            </span>
            <span className="result-summary-item-val text-pink-400">
              {stats.minoCount}
            </span>
          </div>
          <div>
            <span className="result-summary-item-label">
              {t("bonusStars")}
            </span>
            <span className="result-summary-item-val text-amber-300">
              {stats.gameMode === "endless"
                ? `★ ${stats.bonusStars}`
                : `★ ${stats.bonusStars}/${stats.totalStars}`}
            </span>
          </div>
        </div>

        {isCleared && (
          <div className="result-adjustments-row">
            <div>
              <span>・{t("timePenalty")}: </span>
              <span className="text-rose-400 font-mono">
                -{stats.timePenalty?.toLocaleString() ?? 0} pts
              </span>
            </div>
            <div>
              <span>・{t("minoBonus")}: </span>
              <span className="text-amber-300 font-mono">
                +{(stats.minoBonus ?? 0).toLocaleString()} pts
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 操作アクションボタン群 (縦並び) */}
      <div className="result-actions-container">
        {/* 1. 次のレベルへ進むボタン */}
        {isCleared && nextStage && onNextStage && (
          <button
            type="button"
            onClick={onNextStage}
            className="result-action-btn result-action-btn-primary animate-pulse"
          >
            <Play size={14} fill="currentColor" className="text-amber-300 shrink-0" />
            <span>
              {isKids
                ? `${t("nextLevel")} (${nextStageName})`
                : `${t("nextLevel")} : ${nextStageName}`}
            </span>
            <ChevronRight size={16} className="text-amber-200 shrink-0" />
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
          <RotateCcw size={14} className="shrink-0" />
          <span>{t("retry")}</span>
        </button>

        {/* 3. ステージ選択画面へ直行 */}
        <button
          type="button"
          onClick={onSelectStage}
          className="result-action-btn result-action-btn-secondary"
        >
          <Layers size={14} className="shrink-0" />
          <span>{t("stageSelect")}</span>
        </button>

        {/* 4. タイトル画面へ戻る */}
        <button
          type="button"
          onClick={onGoHome}
          className="result-action-btn result-action-btn-secondary"
          title={isKids ? "タイトルへもどる" : "タイトル画面へ戻る"}
        >
          <Home size={14} className="shrink-0" />
          <span className="tracking-wider">
            T<span style={{ color: "#ff1a4b" }}>i</span>TLE
          </span>
        </button>
      </div>
    </div>
  );
};
