export type CellType = "empty" | "placed" | "obstacle" | "star" | "glitched";

export type SkillType = "bomb" | "freeze" | "heal";

export interface Cell {
  type: CellType;
  color?: string;
  // STARTラインから隣接接続されているか
  isConnected?: boolean;
  // ウイルスに感染して黒く変化しているか
  isInfected?: boolean;
  // 回路パスの最前線（白く光る最上部ミノ）か
  isTopCircuit?: boolean;
  // グリッチ演出用シード値
  glitchSeed?: number;
}

export type TetrominoType = "I" | "O" | "T" | "S" | "Z" | "J" | "L";

export interface Tetromino {
  type: TetrominoType;
  matrix: number[][];
  x: number;
  y: number;
  color: string;
}

export type GameStatus =
  | "ready"
  | "playing"
  | "paused"
  | "cleared"
  | "gameover";

export interface CharacterPosition {
  x: number; // グリッド列 (col)
  y: number; // グリッド行 (row)
  targetX: number;
  targetY: number;
  isClimbing: boolean;
}

export interface StageData {
  id: number;
  name: string;
  codeName: string;
  subtitle: string;
  description: string;
  isUnlocked: boolean;
  // ウイルスが回路を1マス感染侵食するインターバル（ミリ秒）
  infectionIntervalMs: number;
  initialObstacles: [number, number][]; // [row, col]
  initialStars: [number, number][]; // [row, col]
  startCols: number[]; // 最下部START地点の列番号
  goalRow: number; // 最上部GOALラインの行番号
}

export interface GameStats {
  score: number;
  clearTimeSeconds: number;
  clearTimeMs: number;
  minoCount: number; // 置いたミノの数
  bonusStars: number; // 回収した星の数
  totalStars: number; // ステージ内の総星数
  stageNumber: number;
  bestScore: number;
}
