import { SCORE_CONFIG } from "./constants.ts";

export interface StageClearScoreInput {
  baseScore: number;
  isBonusClear: boolean;
  elapsedTimeMs: number;
  minoCount: number;
  bonusStars: number;
  hearts: number;
}

export interface StageClearScoreResult {
  finalScore: number;
  timePenalty: number;
  minoBonus: number;
  clearBonus: number;
  starBonus: number;
  heartBonus: number;
}

// ステージクリア時のスコアおよびボーナス・ペナルティ内訳の計算
export function calculateStageClearScore(
  input: StageClearScoreInput,
): StageClearScoreResult {
  // 1. クリア基本ボーナス
  const clearBonus = input.isBonusClear
    ? SCORE_CONFIG.CLEAR_BONUS
    : SCORE_CONFIG.CLEAR_NORMAL;

  // 2. 時間によるマイナス補正 (1秒ごとにタイムペナルティ)
  const clearSec = Math.floor(input.elapsedTimeMs / 1000);
  const timePenalty = clearSec * SCORE_CONFIG.TIME_PENALTY_PER_SEC;

  // 3. ミノ数評価 (基準パースコアに対し少ないほどボーナス加算)
  const minoBonus = Math.max(
    0,
    (SCORE_CONFIG.MINO_PAR_COUNT - input.minoCount) *
      SCORE_CONFIG.MINO_BONUS_PER_MINO,
  );

  // 4. 星ボーナス
  const starBonus = input.bonusStars * SCORE_CONFIG.STAR_CLEAR_BONUS;

  // 5. 残りハートボーナス
  const heartBonus = input.hearts * SCORE_CONFIG.HEART_BONUS;

  let score = input.baseScore + clearBonus;
  score = Math.max(0, score - timePenalty);
  score += minoBonus + starBonus + heartBonus;

  return {
    finalScore: score,
    timePenalty,
    minoBonus,
    clearBonus,
    starBonus,
    heartBonus,
  };
}
