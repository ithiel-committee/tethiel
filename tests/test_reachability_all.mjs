// 全ミノの地上到達可能性（Passability / Solvability）検証関数
import { STAGES, GRID_WIDTH, GRID_HEIGHT } from "../src/game/constants.ts";
import { TETROMINO_SHAPES } from "../src/game/constants.ts";

function rotateMatrix(matrix, clockwise = true) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const newMatrix = Array.from({ length: cols }, () => Array(rows).fill(0));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (clockwise) newMatrix[c][rows - 1 - r] = matrix[r][c];
      else newMatrix[cols - 1 - c][r] = matrix[r][c];
    }
  }
  return newMatrix;
}

function checkCollision(matrix, px, py, grid) {
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      if (matrix[r][c] !== 0) {
        const tr = py + r;
        const tc = px + c;
        if (tc < 0 || tc >= GRID_WIDTH || tr >= GRID_HEIGHT) return true;
        if (tr >= 0 && (grid[tr][tc].type === "placed" || grid[tr][tc].type === "obstacle")) return true;
      }
    }
  }
  return false;
}

export function checkPieceReachability(obstacles) {
  const grid = Array.from({ length: GRID_HEIGHT }, () =>
    Array.from({ length: GRID_WIDTH }, () => ({ type: "empty" }))
  );
  for (const [r, c] of obstacles) {
    grid[r][c] = { type: "obstacle" };
  }

  const pieceTypes = ["I", "O", "T", "L", "J", "S", "Z"];
  const results = {};

  for (const type of pieceTypes) {
    const baseMat = TETROMINO_SHAPES[type].matrix;
    const rotations = [baseMat];
    let curM = baseMat;
    for (let rot = 1; rot < 4; rot++) {
      curM = rotateMatrix(curM, true);
      if (!rotations.some(m => JSON.stringify(m) === JSON.stringify(curM))) {
        rotations.push(curM);
      }
    }

    const spawnRot = 0;
    const spawnX = Math.floor((GRID_WIDTH - baseMat[0].length) / 2);
    const spawnY = 0;

    if (checkCollision(baseMat, spawnX, spawnY, grid)) {
      results[type] = { canReachBottom: false, deepestY: -1 };
      continue;
    }

    const queue = [[spawnRot, spawnX, spawnY]];
    const visited = new Set([`${spawnRot},${spawnX},${spawnY}`]);
    let maxLandingBottomRow = 0;

    while (queue.length > 0) {
      const [rotIdx, x, y] = queue.shift();
      const mat = rotations[rotIdx];

      // ミノの底の行
      const bottomRow = y + mat.length - 1;
      if (bottomRow > maxLandingBottomRow) {
        maxLandingBottomRow = bottomRow;
      }

      // 下移動
      if (!checkCollision(mat, x, y + 1, grid)) {
        const nextKey = `${rotIdx},${x},${y + 1}`;
        if (!visited.has(nextKey)) {
          visited.add(nextKey);
          queue.push([rotIdx, x, y + 1]);
        }
      }

      // 左右移動
      for (const dx of [-1, 1]) {
        const nextX = x + dx;
        if (!checkCollision(mat, nextX, y, grid)) {
          const nextKey = `${rotIdx},${nextX},${y}`;
          if (!visited.has(nextKey)) {
            visited.add(nextKey);
            queue.push([rotIdx, nextX, y]);
          }
        }
      }

      // 回転
      for (const nextRot of [(rotIdx + 1) % rotations.length, (rotIdx + rotations.length - 1) % rotations.length]) {
        const nextMat = rotations[nextRot];
        if (!checkCollision(nextMat, x, y, grid)) {
          const nextKey = `${nextRot},${x},${y}`;
          if (!visited.has(nextKey)) {
            visited.add(nextKey);
            queue.push([nextRot, x, y]);
          }
        }
      }
    }

    results[type] = {
      canReachBottom: maxLandingBottomRow >= 20,
      deepestBottomRow: maxLandingBottomRow,
    };
  }

  return results;
}

console.log("=== STAGE 1 ===");
console.log(checkPieceReachability(STAGES[0].initialObstacles));
console.log("=== STAGE 2 ===");
console.log(checkPieceReachability(STAGES[1].initialObstacles));
console.log("=== STAGE 3 ===");
console.log(checkPieceReachability(STAGES[2].initialObstacles));
