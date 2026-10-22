import { Trophy } from "lucide-react";
import { useState } from "react";
import { useUIText } from "../../context/UIModeContext";
import type { ScoreLogEntry, StageBestRecord } from "../../utils/scoreStorage";
import { ModalShell } from "../ui/ModalShell";

interface RankingModalProps {
  isOpen: boolean;
  onClose: () => void;
  stageBests: Record<number, StageBestRecord>;
  scoreLogs: ScoreLogEntry[];
  onResetRecords: () => void;
}

export const RankingModal: React.FC<RankingModalProps> = ({
  isOpen,
  onClose,
  stageBests,
  scoreLogs,
  onResetRecords,
}) => {
  const { t, isKids } = useUIText();
  const [rankingTab, setRankingTab] = useState<"bests" | "logs">("bests");

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="DEFENSE SYSTEM RANKING & LOG"
      icon={<Trophy size={16} className="text-amber-400" />}
    >
      {/* タブ切り替え */}
      <div className="ranking-tabs-bar">
        <button
          type="button"
          onClick={() => setRankingTab("bests")}
          className={`ranking-tab-btn ${
            rankingTab === "bests"
              ? "ranking-tab-btn-active"
              : "ranking-tab-btn-inactive"
          }`}
        >
          {t("bestRecords")}
        </button>
        <button
          type="button"
          onClick={() => setRankingTab("logs")}
          className={`ranking-tab-btn ${
            rankingTab === "logs"
              ? "ranking-tab-btn-active"
              : "ranking-tab-btn-inactive"
          }`}
        >
          {t("scoreLogs")}
        </button>
      </div>

      {/* BEST RECORDS タブ */}
      {rankingTab === "bests" && (
        <div className="space-y-2 text-xs">
          {[
            {
              id: 1,
              name: isKids
                ? "ステージ 1: はじめての みちづくり"
                : "STAGE 1: 入門・回路接続",
              isEndless: false,
            },
            {
              id: 2,
              name: isKids
                ? "ステージ 2: トゲをよけて すすもう"
                : "STAGE 2: サイバー迂回ルート",
              isEndless: false,
            },
            {
              id: 3,
              name: isKids
                ? "ステージ 3: さいごの たたかい"
                : "STAGE 3: 最終防衛戦",
              isEndless: false,
            },
            {
              id: 99,
              name: isKids
                ? "★ エンドレス: どこまでも のぼろう"
                : "★ ENDLESS MODE: 無限クライミング",
              isEndless: true,
            },
          ].map((stg) => {
            const best = stageBests[stg.id];
            const hasRecord = Boolean(
              best &&
                ((best.highScore ?? 0) > 0 || (best.maxAltitude ?? 0) > 0),
            );

            // 統一バッジ判定
            let badgeClass = "ranking-badge-none";
            let badgeText = t("noRecord");

            if (stg.isEndless) {
              if (hasRecord) {
                badgeClass = "ranking-badge-purple";
                badgeText = t("survivor");
              }
            } else if (hasRecord && best?.bestRank) {
              badgeText = `RANK ${best.bestRank}`;
              if (best.bestRank === "S+" || best.bestRank === "S") {
                badgeClass = "ranking-badge-gold";
              } else if (best.bestRank === "A") {
                badgeClass = "ranking-badge-rose";
              } else {
                badgeClass = "ranking-badge-cyan";
              }
            }

            return (
              <div key={stg.id} className="ranking-card">
                <div className="ranking-card-header">
                  <span className="ranking-card-title">{stg.name}</span>
                  <span className={`ranking-badge ${badgeClass}`}>
                    {badgeText}
                  </span>
                </div>
                <div className="ranking-card-metrics">
                  <div className="ranking-metric-item">
                    <span className="ranking-metric-label">
                      {t("bestScoreLabel")}
                    </span>
                    <span
                      className={`ranking-metric-value ${
                        hasRecord && best?.highScore
                          ? "text-amber-400"
                          : "text-slate-600"
                      }`}
                    >
                      {hasRecord && best?.highScore
                        ? `${best.highScore.toLocaleString()} pts`
                        : "--"}
                    </span>
                  </div>
                  <div className="ranking-metric-item">
                    <span className="ranking-metric-label">
                      {stg.isEndless
                        ? t("maxAltitudeLabel")
                        : t("clearTimeLabel")}
                    </span>
                    <span
                      className={`ranking-metric-value ${
                        hasRecord
                          ? stg.isEndless
                            ? "text-emerald-400"
                            : "text-sky-300"
                          : "text-slate-600"
                      }`}
                    >
                      {hasRecord
                        ? stg.isEndless
                          ? `${best?.maxAltitude ?? 0}m`
                          : `${best?.bestTimeSeconds ?? 0}s`
                        : "--"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SCORE LOGS タブ */}
      {rankingTab === "logs" && (
        <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
          {scoreLogs.length === 0 ? (
            <div className="text-center py-8 text-slate-500 font-pixel-en text-xs">
              NO PLAY LOGS RECORDED YET
            </div>
          ) : (
            scoreLogs.map((log) => {
              const date = new Date(log.timestamp);
              const timeStr = `${date.getMonth() + 1}/${date.getDate()} ${date
                .getHours()
                .toString()
                .padStart(2, "0")}:${date
                .getMinutes()
                .toString()
                .padStart(2, "0")}`;

              let statusBadgeClass = "ranking-badge-none";
              let statusText = "PLAYED";
              if (log.isBonusClear) {
                statusBadgeClass = "ranking-badge-gold";
                statusText = "BONUS";
              } else if (log.isCleared) {
                statusBadgeClass = "ranking-badge-rose";
                statusText = "CLEARED";
              }

              return (
                <div key={log.id} className="ranking-card py-2">
                  <div className="ranking-card-header">
                    <div className="flex items-center gap-2">
                      <span className={`ranking-badge ${statusBadgeClass}`}>
                        {statusText}
                      </span>
                      <span className="ranking-card-title text-[11px]">
                        {log.stageName}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {timeStr}
                      </span>
                    </div>
                    <span className="text-amber-400 font-bold font-mono text-[11px]">
                      {log.score.toLocaleString()} pts
                    </span>
                  </div>
                  <div className="ranking-card-metrics text-[10px] text-slate-400">
                    <div className="flex items-center gap-3">
                      <span>
                        TIME: {Math.floor(log.clearTimeSeconds / 60)}:
                        {(log.clearTimeSeconds % 60)
                          .toString()
                          .padStart(2, "0")}
                      </span>
                      {log.climbedHeight ? (
                        <span>
                          {t("altitudeUnit")}: {log.climbedHeight}m
                        </span>
                      ) : (
                        <span>
                          {t("minoUnit")}: {log.minoCount}
                          {t("movesUnit")}
                        </span>
                      )}
                      <span>★ {log.bonusStars}</span>
                    </div>
                    <span className="text-rose-300 font-bold text-[10px]">
                      RANK {log.rank}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* フッター */}
      <div className="ranking-footer">
        <button
          type="button"
          className="ranking-reset-btn"
          onClick={() => {
            if (
              window.confirm(
                isKids
                  ? "これまでの きろくを ぜんぶ けしても いいですか？"
                  : "これまでの記録を初期化しますか？",
              )
            ) {
              onResetRecords();
            }
          }}
        >
          {t("resetRecords")}
        </button>
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
