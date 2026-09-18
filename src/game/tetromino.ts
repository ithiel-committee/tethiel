import type { Cell, Tetromino, TetrominoType } from "../types/game";
import { GRID_HEIGHT, GRID_WIDTH, TETROMINO_SHAPES } from "./constants";

// 7-bag方式のテトリミノ生成器
export class TetrominoBag {
  private bag: TetrominoType[] = [];

  private refill() {
    const types: TetrominoType[] = ["I", "O", "T", "S", "Z", "J", "L"];
    // Fisher-Yates シャッフル
    for (let i = types.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [types[i], types[j]] = [types[j], types[i]];
    }
    this.bag = types;
  }

  public getNext(): TetrominoType {
    if (this.bag.length === 0) {
      this.refill();
    }
    const piece = this.bag.pop();
    return piece ?? "I";
  }

  public peek(count = 3): TetrominoType[] {
    while (this.bag.length < count) {
      const types: TetrominoType[] = ["I", "O", "T", "S", "Z", "J", "L"];
      for (let i = types.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [types[i], types[j]] = [types[j], types[i]];
      }
      this.bag = [...types, ...this.bag];
    }
    return this.bag.slice(-count).reverse();
  }
}

// ミノを生成する
export function createTetromino(type: TetrominoType): Tetromino {
  const info = TETROMINO_SHAPES[type];
  const matrix = info.matrix.map((row) => [...row]);
  // 中央上部に出現（幅に合わせて中央寄せ）
  const x = Math.floor((GRID_WIDTH - matrix[0].length) / 2);
  const y = 0;

  return {
    type,
    matrix,
    x,
    y,
    color: info.color,
  };
}

// 衝突判定
export function checkCollision(
  piece: Tetromino,
  grid: Cell[][],
  offsetX = 0,
  offsetY = 0,
  customMatrix?: number[][],
): boolean {
  const matrix = customMatrix || piece.matrix;
  const targetX = piece.x + offsetX;
  const targetY = piece.y + offsetY;

  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      if (matrix[r][c] !== 0) {
        const newX = targetX + c;
        const newY = targetY + r;

        // フィールド外判定
        if (newX < 0 || newX >= GRID_WIDTH || newY >= GRID_HEIGHT) {
          return true;
        }

        // 画面上部外(newY < 0)は侵入可とする
        if (newY >= 0) {
          const targetCell = grid[newY][newX];
          // 設置済みブロックまたは障害物ブロックなら衝突
          if (
            targetCell.type === "placed" ||
            targetCell.type === "obstacle"
          ) {
            return true;
          }
        }
      }
    }
  }
  return false;
}

// マトリクスの回転（時計回り）
export function rotateMatrix(matrix: number[][]): number[][] {
  const n = matrix.length;
  const result: number[][] = [];
  for (let r = 0; r < n; r++) {
    result[r] = [];
    for (let c = 0; c < n; c++) {
      result[r][c] = matrix[n - 1 - c][r];
    }
  }
  return result;
}

// SRS風の壁蹴り付き回転
export function tryRotate(
  piece: Tetromino,
  grid: Cell[][],
): {
  success: boolean;
  newMatrix: number[][];
  newX: number;
  newY: number;
} {
  // O型は回転不要
  if (piece.type === "O") {
    return {
      success: true,
      newMatrix: piece.matrix,
      newX: piece.x,
      newY: piece.y,
    };
  }

  const rotated = rotateMatrix(piece.matrix);

  // 壁蹴りオフセット候補 (dx, dy)
  const kickOffsets = [
    [0, 0],
    [-1, 0],
    [1, 0],
    [0, -1],
    [-1, -1],
    [1, -1],
    [-2, 0],
    [2, 0],
  ];

  for (const [dx, dy] of kickOffsets) {
    if (!checkCollision(piece, grid, dx, dy, rotated)) {
      return {
        success: true,
        newMatrix: rotated,
        newX: piece.x + dx,
        newY: piece.y + dy,
      };
    }
  }

  return {
    success: false,
    newMatrix: piece.matrix,
    newX: piece.x,
    newY: piece.y,
  };
}

// 落下予測位置（ゴーストミノのY座標）を計算
export function calculateGhostY(piece: Tetromino, grid: Cell[][]): number {
  let ghostY = piece.y;
  while (!checkCollision(piece, grid, 0, ghostY - piece.y + 1)) {
    ghostY++;
  }
  return ghostY;
}
