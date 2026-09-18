export type CellType =
  | "empty"
  | "placed"
  | "obstacle"
  | "item"
  | "glowing";

export type SkillType = "bomb" | "freeze" | "heal";

export interface Cell {
  type: CellType;
  color?: string;
  itemType?: SkillType;
  isGlow?: boolean;
}

export type TetrominoType = "I" | "O" | "T" | "S" | "Z" | "J" | "L";

export interface Tetromino {
  type: TetrominoType;
  matrix: number[][];
  x: number;
  y: number;
  color: string;
}

export interface SkillItem {
  id: string;
  type: SkillType;
  name: string;
  description: string;
  iconName: string;
}

export type GameStatus =
  | "ready"
  | "playing"
  | "paused"
  | "cleared"
  | "gameover";

export interface StageData {
  id: number;
  name: string;
  codeName: string;
  subtitle: string;
  description: string;
  isUnlocked: boolean;
  virusRiseIntervalMs: number; // ウイルスが1行上昇するミリ秒
  damagePerSecondInVirus: number; // 侵食エリア内のミノによるHP減少速度
  initialObstacles: [number, number][]; // [row, col]
  initialItems: {
    pos: [number, number]; // [row, col]
    skill: SkillType;
  }[];
}

export interface GameStats {
  score: number;
  linesConnected: number;
  itemsCollected: number;
  clearTimeSeconds: number;
  highestRow: number;
}
