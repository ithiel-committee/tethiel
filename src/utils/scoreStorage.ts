import type { GameMode, GameStats, StageData } from "../types/game";

export interface ScoreLogEntry {
  id: string;
  timestamp: number;
  stageId: number;
  stageName: string;
  gameMode: GameMode;
  score: number;
  clearTimeSeconds: number;
  isCleared: boolean;
  isBonusClear: boolean;
  rank: string;
  minoCount: number;
  bonusStars: number;
  totalStars: number;
  climbedHeight?: number;
  gameOverReason?: string;
}

export interface StageBestRecord {
  stageId: number;
  stageName: string;
  highScore: number;
  bestTimeSeconds?: number;
  maxAltitude?: number;
  bestRank?: string;
  playCount: number;
  clearCount: number;
  lastPlayedAt: number;
}

const STORAGE_KEY_BESTS = "tethiel_stage_bests_v1";
const STORAGE_KEY_LOGS = "tethiel_score_logs_v1";
const MAX_LOG_COUNT = 30;

// 初期デフォルトの記録 (初期状態は未プレイ)
const DEFAULT_BESTS: Record<number, StageBestRecord> = {};

/**
 * ステージ別の自己ベスト記録を取得する
 */
export function getStageBestRecords(): Record<number, StageBestRecord> {
  if (typeof window === "undefined") return DEFAULT_BESTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BESTS);
    if (!raw) return DEFAULT_BESTS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_BESTS, ...parsed };
  } catch (e) {
    console.warn("Failed to load stage best records from localStorage", e);
    return DEFAULT_BESTS;
  }
}

/**
 * プレイ履歴ログ (直近30件) を取得する
 */
export function getScoreLogs(): ScoreLogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LOGS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.warn("Failed to load score logs from localStorage", e);
    return [];
  }
}

/**
 * ランクを判定する
 */
export function calculateRank(
  isCleared: boolean,
  isBonusClear = false,
  hearts = 5,
  bonusStars = 0,
  totalStars = 5,
): string {
  if (!isCleared) return "F";
  if (isBonusClear && hearts >= 4) return "S+";
  const hasHighStars =
    totalStars > 0 ? bonusStars / totalStars >= 0.6 : bonusStars >= 3;
  if (hearts >= 4 && hasHighStars) return "S";
  if (hearts >= 2) return "A";
  return "B";
}

/**
 * ゲーム終了時にスコア結果を保存・更新する
 */
export function saveGameResult(params: {
  stage: StageData;
  stats: GameStats;
  hearts: number;
  isCleared: boolean;
  isBonusClear?: boolean;
  gameOverReason?: string;
}): { isNewRecord: boolean; entry: ScoreLogEntry } {
  const {
    stage,
    stats,
    hearts,
    isCleared,
    isBonusClear = false,
    gameOverReason,
  } = params;

  const rank = calculateRank(
    isCleared,
    isBonusClear,
    hearts,
    stats.bonusStars,
    stats.totalStars,
  );
  const now = Date.now();
  const stageId = stage.id;
  const gameMode = stage.mode ?? "stage";

  const entry: ScoreLogEntry = {
    id: `${now}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: now,
    stageId,
    stageName: stage.name,
    gameMode,
    score: stats.score,
    clearTimeSeconds: stats.clearTimeSeconds,
    isCleared,
    isBonusClear,
    rank,
    minoCount: stats.minoCount,
    bonusStars: stats.bonusStars,
    totalStars: stats.totalStars,
    climbedHeight: stats.climbedHeight,
    gameOverReason,
  };

  // 1. ログを保存
  try {
    const currentLogs = getScoreLogs();
    const updatedLogs = [entry, ...currentLogs].slice(0, MAX_LOG_COUNT);
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(updatedLogs));
  } catch (e) {
    console.warn("Failed to save score log", e);
  }

  // 2. ベスト記録を更新
  let isNewRecord = false;
  try {
    const currentBests = getStageBestRecords();
    const prev = currentBests[stageId] ?? {
      stageId,
      stageName: stage.name,
      highScore: 0,
      playCount: 0,
      clearCount: 0,
      lastPlayedAt: now,
    };

    if (stats.score > prev.highScore) {
      isNewRecord = true;
    }

    const updatedBest: StageBestRecord = {
      ...prev,
      stageName: stage.name,
      highScore: Math.max(prev.highScore, stats.score),
      playCount: (prev.playCount ?? 0) + 1,
      clearCount: (prev.clearCount ?? 0) + (isCleared ? 1 : 0),
      lastPlayedAt: now,
    };

    // 最速クリアタイムの更新 (クリア時のみ)
    if (isCleared) {
      if (
        !prev.bestTimeSeconds ||
        stats.clearTimeSeconds < prev.bestTimeSeconds
      ) {
        updatedBest.bestTimeSeconds = stats.clearTimeSeconds;
      }
    }

    // エンドレスの最大高度更新
    if (gameMode === "endless" && stats.climbedHeight) {
      const prevAlt = prev.maxAltitude ?? 0;
      if (stats.climbedHeight > prevAlt) {
        updatedBest.maxAltitude = stats.climbedHeight;
        isNewRecord = true;
      }
    }

    // ベストランクの更新
    const rankPriority: Record<string, number> = {
      "S+": 5,
      S: 4,
      A: 3,
      B: 2,
      F: 1,
    };
    if (
      !prev.bestRank ||
      (rankPriority[rank] ?? 0) > (rankPriority[prev.bestRank] ?? 0)
    ) {
      updatedBest.bestRank = rank;
    }

    currentBests[stageId] = updatedBest;
    localStorage.setItem(STORAGE_KEY_BESTS, JSON.stringify(currentBests));
  } catch (e) {
    console.warn("Failed to update best record", e);
  }

  return { isNewRecord, entry };
}
