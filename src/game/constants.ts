import type { StageData, TetrominoType } from "../types/game";

export const GRID_WIDTH = 12; // PDF 5pに合わせたマス幅
export const GRID_HEIGHT = 22; // PDF 5pに合わせたマス高
export const GOAL_ROW = 2; // 行0〜2がGOALエリア
export const START_ROW = 21; // 最下部START行
export const START_COLS = [5, 6]; // START地点(中央下部)
export const START_CENTER_X = (START_COLS[0] + START_COLS[1] + 1) / 2; // 5.5 (中央初期位置)
export const BONUS_GOAL_COLS = [10, 11]; // 右上のBONUSゴール列

// ゲーム基本ルール定数
export const GAME_RULES = {
  INITIAL_HEARTS: 5,
  MAX_HEARTS: 5,
  INFECTION_DELAY_MINO_COUNT: 2, // ウイルス感染開始までに必要な配置ミノ数
  ENDLESS_SAFE_ROWS: 4, // エンドレス開始時の足元安全行数
} as const;

// スコア計算・ボーナス定数設定
export const SCORE_CONFIG = {
  PLACED_MINO: 10,
  SOFT_DROP_PER_ROW: 1,
  HARD_DROP_PER_ROW: 2,
  STAR_COLLECT: 100,
  ENDLESS_SCROLL_PER_ROW: 50,
  BOMB_BREAK_PER_BLOCK: 50,
  CLEAR_NORMAL: 5000,
  CLEAR_BONUS: 10000,
  TIME_PENALTY_PER_SEC: 30,
  MINO_PAR_COUNT: 20,
  MINO_BONUS_PER_MINO: 200,
  STAR_CLEAR_BONUS: 200,
  HEART_BONUS: 300,
} as const;

// ゲーム進行・アニメーションタイミング定数設定
export const TIMING_CONFIG = {
  DEFAULT_DROP_INTERVAL_MS: 900,
  DEFAULT_INFECTION_INTERVAL_MS: 3800,
  LOCK_DELAY_MS: 500,
  INFECTED_DAMAGE_INTERVAL_MS: 1000,
  GOAL_CELEBRATION_WAIT_MS: 1000,
  CHAR_MOVE_SPEED_NORMAL: 9.0,
  CHAR_MOVE_SPEED_GOAL: 12.0,
} as const;

// サイバーネオン調カラーパレット
export const TETROMINO_SHAPES: Record<
  TetrominoType,
  { matrix: number[][]; color: string; glowColor: string }
> = {
  I: {
    matrix: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    color: "#00f0ff", // シアン
    glowColor: "rgba(0, 240, 255, 0.6)",
  },
  O: {
    matrix: [
      [1, 1],
      [1, 1],
    ],
    color: "#ffe600", // イエロー
    glowColor: "rgba(255, 230, 0, 0.6)",
  },
  T: {
    matrix: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: "#a855f7", // パープル
    glowColor: "rgba(168, 85, 247, 0.6)",
  },
  S: {
    matrix: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    color: "#00ff88", // ネオングリーン
    glowColor: "rgba(0, 255, 136, 0.6)",
  },
  Z: {
    matrix: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    color: "#ff2a6d", // ネオンピンク
    glowColor: "rgba(255, 42, 109, 0.6)",
  },
  J: {
    matrix: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: "#0070f3", // ディープブルー
    glowColor: "rgba(0, 112, 243, 0.6)",
  },
  L: {
    matrix: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: "#ff9900", // オレンジ
    glowColor: "rgba(255, 153, 0, 0.6)",
  },
};

export const COLORS = {
  background: "#0a0407",
  fieldBg: "#12060c",
  gridLine: "rgba(255, 40, 80, 0.08)",
  obstacle: "#475569",
  obstacleBorder: "#94a3b8",
  goalArea: "#ff1a4b",
  goalBonusArea: "#ffaa00",
  startArea: "#ffffff",
  circuitLine: "#ffffff",
  circuitGlow: "rgba(255, 50, 90, 0.9)",
  infectedBlack: "#050103",
  infectedBorder: "#ff0040",
  star: "#ffdd00",
  starGlow: "rgba(255, 221, 0, 0.8)",
};

// ステージデータ定義
export const STAGES: StageData[] = [
  {
    id: 1,
    name: "STAGE 1",
    codeName: "STAGE 1",
    subtitle: "入門・回路接続",
    description: "回路を繋いでイティエルをGOALへ導こう！",
    isUnlocked: true,
    infectionIntervalMs: 4500, // 4.5秒ごと（2ミノ配置後から開始。落ち着いてプレイできるゆったり速度）
    goalRow: GOAL_ROW,
    startCols: START_COLS,
    initialObstacles: [
      // 初心者向け：中央のメインルートを塞がない、左右端のトゲ障害物
      [15, 1],
      [15, 2],
      [10, 9],
      [10, 10],
    ],
    initialStars: [
      // 登る途中で自然に回収できる★配置
      [17, 5],
      [13, 6],
      [9, 5],
      [4, 6],
    ],
    initialSkills: ["bomb", "bomb"],
  },
  {
    id: 2,
    name: "STAGE 2",
    codeName: "STAGE 2",
    subtitle: "サイバー迂回ルート",
    description: "トゲを巧みに回避し、迫り来るウイルスから守り抜け！",
    isUnlocked: true,
    infectionIntervalMs: 1400,
    goalRow: GOAL_ROW,
    startCols: START_COLS,
    initialSkills: ["bomb", "bomb"],
    initialObstacles: [
      // 1〜4ブロック程度の小型障害物クラスター配置（PDF 5p準拠）
      // 左上小型ブロック (1ブロック)
      [6, 3],
      // 右上L字障害物 (3ブロック)
      [9, 10],
      [9, 11],
      [10, 11],
      // 左側中段L字障害物 (3ブロック)
      [9, 2],
      [9, 3],
      [10, 2],
      // 中央浮遊障害物 (3ブロック)
      [13, 5],
      [13, 6],
      [14, 6],
      // 中下段ステップ (2ブロック)
      [16, 4],
      [16, 5],
      // 左下壁 (3ブロック)
      [18, 2],
      [19, 1],
      [19, 2],
      // 右下壁 (3ブロック)
      [18, 10],
      [19, 9],
      [19, 10],
    ],
    initialStars: [
      // PDF 5p の★配置
      [5, 6],
      [11, 1],
      [13, 8],
      [15, 11],
      [7, 10],
    ],
  },
  {
    id: 3,
    name: "STAGE 3",
    codeName: "STAGE 3",
    subtitle: "最終防衛戦",
    description: "サーバー中枢の最終防衛戦！迫る高速ウイルスを突破せよ！",
    isUnlocked: true,
    infectionIntervalMs: 1600, // 1.6秒ごと (手応えと操作余裕を両立した適正スピード)
    goalRow: GOAL_ROW,
    startCols: START_COLS,
    initialSkills: ["bomb", "bomb"],
    initialObstacles: [
      // 1. 低層セクション (スタート直上の左右分岐と外側アクセント)
      [19, 1],
      [19, 10],
      [18, 5],
      [18, 6],

      // 2. 中下層セクション (クランク状の迂回ルートと足場スペース)
      [16, 2],
      [16, 9],
      [14, 5],
      [14, 6],

      // 3. 中層セクション (左右端の絞りと千鳥ピン)
      [12, 1],
      [12, 10],
      [11, 4],
      [11, 7],

      // 4. 中上層セクション (S字切り返しと中央ゲート)
      [9, 2],
      [9, 9],
      [8, 5],
      [8, 6],

      // 5. 上層・ゴール直前セクション (通常ゴール前ゲートとボーナス見張り)
      [6, 1],
      [6, 10],
      [4, 5],
      [4, 6],
      [3, 8],
    ],
    initialStars: [
      [17, 1], // 左下
      [14, 10], // 右下
      [11, 5], // 中央島
      [7, 2], // 左上
      [3, 11], // BONUS GOAL最奥
    ],
  },
];

// エンドレスモード設定 (無限縦スクロールクライミング)
export const ENDLESS_STAGE: StageData = {
  id: 99,
  name: "ENDLESS",
  codeName: "ENDLESS",
  subtitle: "無限クライミング",
  description: "天井のないサイバー空間をどこまでも登り続けろ！",
  isUnlocked: true,
  infectionIntervalMs: 3800, // 初期3.8秒。高度に応じて加速
  goalRow: -999, // ゴールなし (無限進行)
  startCols: START_COLS,
  mode: "endless",
  initialSkills: ["bomb", "bomb"],
  initialObstacles: [
    [16, 2],
    [16, 9],
    [12, 4],
    [12, 7],
  ],
  initialStars: [
    [18, 5],
    [14, 6],
    [10, 5],
  ],
};

/**
 * 現在のステージの次にプレイ可能なステージを取得する
 */
export const getNextStage = (currentStage: StageData): StageData | null => {
  if (currentStage.mode === "endless" || currentStage.id === ENDLESS_STAGE.id) {
    return null;
  }
  const currentIndex = STAGES.findIndex((s) => s.id === currentStage.id);
  if (currentIndex !== -1) {
    const nextNormalStage = STAGES[currentIndex + 1];
    if (nextNormalStage?.isUnlocked) {
      return nextNormalStage;
    }
    // 次の通常ステージがない、またはロックされている場合はエンドレスモードへ
    if (ENDLESS_STAGE.isUnlocked) {
      return ENDLESS_STAGE;
    }
  }
  return null;
};
