import type { StageData, TetrominoType } from "../types/game";

export const GRID_WIDTH = 10;
export const GRID_HEIGHT = 20;
export const GOAL_ROW = 1; // 行0〜1にミノが設置されたらゴール到達

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
    color: "#ff2a6d", // ネオンピンク/レッド
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
  gridLine: "rgba(0, 240, 255, 0.08)",
  obstacle: "#475569",
  obstacleBorder: "#94a3b8",
  goalArea: "rgba(0, 255, 200, 0.15)",
  goalBorder: "#00ffc8",
  virusArea: "rgba(255, 0, 80, 0.35)",
  virusLine: "#ff0055",
  itemBomb: "#ff3366",
  itemFreeze: "#00d4ff",
  itemHeal: "#10b981",
  connectedGlow: "#00ffff",
};

// ステージデータ定義
export const STAGES: StageData[] = [
  {
    id: 1,
    name: "STAGE 1",
    codeName: "FIREWALL GATEWAY",
    subtitle: "市ヶ谷外郭ファイアウォール",
    description:
      "侵入したウイルスがキャンパス回線を圧迫中。障害物を突破して回線をサーバーへ接続せよ！",
    isUnlocked: true,
    virusRiseIntervalMs: 4500, // 4.5秒ごとに1マス上昇
    damagePerSecondInVirus: 15,
    initialObstacles: [
      // 行11・12の中央付近に壁。左右に抜け道あり。
      [11, 3],
      [11, 4],
      [11, 5],
      [11, 6],
      [12, 3],
      [12, 4],
      [12, 5],
      [12, 6],
      // 行6の左寄りに壁
      [6, 1],
      [6, 2],
      [6, 3],
    ],
    initialItems: [
      { pos: [14, 2], skill: "bomb" }, // 下部の拾いやすい位置にボム
      { pos: [9, 7], skill: "bomb" }, // 中盤の右ルートにボム
      { pos: [4, 8], skill: "heal" }, // ゴール手前に回復
    ],
  },
  {
    id: 2,
    name: "STAGE 2",
    codeName: "COMMUNICATION HUB",
    subtitle: "通信ハブ回線の迂回路",
    description:
      "多重プロキシで迂回を強いられる難関ルート。巧妙にブロックを繋いで突破せよ。（Coming Soon）",
    isUnlocked: false,
    virusRiseIntervalMs: 3800,
    damagePerSecondInVirus: 20,
    initialObstacles: [],
    initialItems: [],
  },
  {
    id: 3,
    name: "STAGE 3",
    codeName: "MAIN SERVER CORE",
    subtitle: "市ヶ谷田町メインサーバー中枢",
    description:
      "ウイルス本体との最終決戦。あらゆるスキルを駆使してキャンパス全域を防衛せよ！（Coming Soon）",
    isUnlocked: false,
    virusRiseIntervalMs: 3000,
    damagePerSecondInVirus: 25,
    initialObstacles: [],
    initialItems: [],
  },
];
