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

// ステージデータ定義（PDF 5pの配置を忠実に反映）
export const STAGES: StageData[] = [
  {
    id: 1,
    name: "STAGE 1",
    codeName: "STAGE 1",
    subtitle: "",
    description:
      "START地点から回路を繋ぎ、ウイルスに追いつかれる前にGOALへイティエルを導け！",
    isUnlocked: true,
    infectionIntervalMs: 1400, // 1.4秒ごとに回路を1マス黒く感染
    goalRow: GOAL_ROW,
    startCols: START_COLS,
    initialObstacles: [
      // 1〜4ブロック程度の小型障害物クラスター配置
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
    id: 2,
    name: "STAGE 2",
    codeName: "STAGE 2",
    subtitle: "",
    description:
      "多重プロキシで迂回を強いられる難関ルート。（Coming Soon）",
    isUnlocked: false,
    infectionIntervalMs: 1100,
    goalRow: GOAL_ROW,
    startCols: START_COLS,
    initialObstacles: [],
    initialStars: [],
  },
  {
    id: 3,
    name: "STAGE 3",
    codeName: "STAGE 3",
    subtitle: "",
    description: "高速ウイルスとの最終決戦。（Coming Soon）",
    isUnlocked: false,
    infectionIntervalMs: 800,
    goalRow: GOAL_ROW,
    startCols: START_COLS,
    initialObstacles: [],
    initialStars: [],
  },
];
