import type { StageData, TetrominoType } from "../types/game";

export const GRID_WIDTH = 12; // PDF 5pに合わせたマス幅
export const GRID_HEIGHT = 22; // PDF 5pに合わせたマス高
export const GOAL_ROW = 2; // 行0〜2がGOALエリア
export const START_ROW = 21; // 最下部START行
export const START_COLS = [5, 6]; // START地点（中央下部）
export const BONUS_GOAL_COLS = [10, 11]; // 右上のBONUSゴール列

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
  background: "#080c18",
  fieldBg: "#0d1326",
  gridLine: "rgba(0, 240, 255, 0.07)",
  obstacle: "#475569",
  obstacleBorder: "#94a3b8",
  goalArea: "#00e5ff",
  goalBonusArea: "#ff007f",
  startArea: "#00ff88",
  circuitLine: "#ffffff",
  circuitGlow: "rgba(0, 255, 200, 0.8)",
  infectedBlack: "#05070d",
  infectedBorder: "#ff0055",
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
    description:
      "回路を繋いでイティエルをGOALへ導こう！小さなお子様やご家族連れでも楽しめるやさしい難易度。",
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
  },
  {
    id: 2,
    name: "STAGE 2",
    codeName: "STAGE 2",
    subtitle: "サイバー迂回ルート",
    description:
      "トゲ障害物を巧みに回避しながら回路を繋ぎ、迫り来るウイルスからイティエルを守り抜け！",
    isUnlocked: true,
    infectionIntervalMs: 1400,
    goalRow: GOAL_ROW,
    startCols: START_COLS,
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
    description: "高速ウイルスとの最終決戦。（Coming Soon）",
    isUnlocked: false,
    infectionIntervalMs: 2200, // 2.2秒ごと
    goalRow: GOAL_ROW,
    startCols: START_COLS,
    initialObstacles: [],
    initialStars: [],
  },
];

// エンドレスモード設定（無限縦スクロールクライミング）
export const ENDLESS_STAGE: StageData = {
  id: 99,
  name: "ENDLESS",
  codeName: "ENDLESS",
  subtitle: "無限クライミング",
  description:
    "天井のないサイバー空間をどこまでも登り続けろ！登った総高度とスコアの極限を目指すサバイバルモード。",
  isUnlocked: true,
  infectionIntervalMs: 3800, // 初期3.8秒。高度に応じて加速
  goalRow: -999, // ゴールなし（無限進行）
  startCols: START_COLS,
  mode: "endless",
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
