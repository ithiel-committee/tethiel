// BFS到達可能配置に基づく静的AIソルバー
import { STAGES, GRID_WIDTH, GRID_HEIGHT, GOAL_ROW, START_ROW, START_COLS } from "../src/game/constants.ts";
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

// 7-bag 生成器
class TetrominoBag {
  constructor(seed = 42) {
    this.seed = seed;
    this.bag = [];
    this.types = ["I", "O", "T", "S", "Z", "J", "L"];
  }

  random() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  fillBag() {
    const copy = [...this.types];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(this.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    this.bag = copy;
  }

  getNext() {
    if (this.bag.length === 0) this.fillBag();
    return this.bag.shift();
  }
}

// BFSで上空から左右移動・回転によって到達できるすべての合法な接地配置を列挙
function getAllReachableLandings(pieceType, grid) {
  const baseMat = TETROMINO_SHAPES[pieceType].matrix;
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

  // 出現位置で衝突する場合はシフト出現
  let startX = spawnX;
  let startY = spawnY;
  if (checkCollision(baseMat, startX, startY, grid)) {
    let found = false;
    for (const dx of [-1, 1, -2, 2, -3, 3, -4, 4]) {
      if (!checkCollision(baseMat, startX + dx, startY, grid)) {
        startX += dx;
        found = true;
        break;
      }
    }
    if (!found) return [];
  }

  const queue = [[spawnRot, startX, startY]];
  const visited = new Set([`${spawnRot},${startX},${startY}`]);
  const landings = [];
  const landingKeys = new Set();

  while (queue.length > 0) {
    const [rotIdx, x, y] = queue.shift();
    const mat = rotations[rotIdx];

    // 接地チェック (1マス下に動けない場合は接地配置)
    if (checkCollision(mat, x, y + 1, grid)) {
      const key = `${rotIdx},${x},${y}`;
      if (!landingKeys.has(key)) {
        landingKeys.add(key);
        landings.push({ mat, x, y });
      }
    } else {
      // 下移動
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

  return landings;
}

// 回路接続の再計算 (BFS)
function recalculateConnectedCircuit(grid) {
  for (let r = 0; r < GRID_HEIGHT; r++) {
    for (let c = 0; c < GRID_WIDTH; c++) {
      if (grid[r][c].type === "placed") {
        grid[r][c].isConnected = false;
      }
    }
  }

  const queue = [];
  const visited = new Set();

  for (const sc of START_COLS) {
    for (let r = START_ROW; r >= START_ROW - 1; r--) {
      if (grid[r][sc].type === "placed") {
        visited.add(`${r},${sc}`);
        queue.push([r, sc]);
      }
    }
  }

  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  let highestRow = GRID_HEIGHT;

  while (queue.length > 0) {
    const [cr, cc] = queue.shift();
    grid[cr][cc].isConnected = true;
    if (cr < highestRow) highestRow = cr;

    for (const [dr, dc] of dirs) {
      const nr = cr + dr;
      const nc = cc + dc;
      if (nr >= 0 && nr < GRID_HEIGHT && nc >= 0 && nc < GRID_WIDTH) {
        if (grid[nr][nc].type === "placed" && !visited.has(`${nr},${nc}`)) {
          visited.add(`${nr},${nc}`);
          queue.push([nr, nc]);
        }
      }
    }
  }

  return highestRow;
}

/**
 * 静的アルゴリズムによるステージクリアシミュレーション
 */
export function simulateStagePlay(stage, seed = 42, maxMoves = 35) {
  const grid = Array.from({ length: GRID_HEIGHT }, () =>
    Array.from({ length: GRID_WIDTH }, () => ({ type: "empty", isConnected: false }))
  );

  for (const sc of START_COLS) {
    grid[START_ROW][sc] = { type: "placed", isConnected: true };
  }

  for (const [r, c] of stage.initialObstacles) {
    if (r >= 0 && r < GRID_HEIGHT && c >= 0 && c < GRID_WIDTH) {
      grid[r][c] = { type: "obstacle", isConnected: false };
    }
  }

  let charY = START_ROW;
  let magmaRow = GRID_HEIGHT;
  let hearts = 5;
  const bag = new TetrominoBag(seed);

  let currentHighest = START_ROW;
  let moveCount = 0;

  for (let move = 1; move <= maxMoves; move++) {
    moveCount = move;
    const pieceType = bag.getNext();

    // BFSで到達可能な全接地配置を取得
    const landings = getAllReachableLandings(pieceType, grid);
    if (landings.length === 0) {
      return { success: false, moves: move, highestRow: currentHighest, reason: "No reachable landings (Ceiling blocked)" };
    }

    let bestLanding = null;
    let bestScore = -Infinity;

    for (const landing of landings) {
      const { mat, x, y } = landing;
      const cells = [];
      for (let r = 0; r < mat.length; r++) {
        for (let c = 0; c < mat[r].length; c++) {
          if (mat[r][c] !== 0) {
            cells.push([y + r, x + c]);
          }
        }
      }

      // トゲ隣接判定
      const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      let touchesObstacle = false;
      for (const [cr, cc] of cells) {
        for (const [dr, dc] of dirs) {
          const nr = cr + dr;
          const nc = cc + dc;
          if (nr >= 0 && nr < GRID_HEIGHT && nc >= 0 && nc < GRID_WIDTH) {
            if (grid[nr][nc].type === "obstacle") touchesObstacle = true;
          }
        }
      }

      // 回路接続判定
      let connectsToCircuit = false;
      for (const [cr, cc] of cells) {
        for (const [dr, dc] of dirs) {
          const nr = cr + dr;
          const nc = cc + dc;
          if (nr >= 0 && nr < GRID_HEIGHT && nc >= 0 && nc < GRID_WIDTH) {
            if (grid[nr][nc].type === "placed" && grid[nr][nc].isConnected) {
              connectsToCircuit = true;
            }
          }
        }
      }

      // 静的評価関数
      let score = 0;

      // 1. 回路接続性
      if (connectsToCircuit) {
        score += 50000;
      } else {
        score -= 20000;
        if (touchesObstacle) score -= 100000;
      }

      // 2. 到達高度
      const minCellRow = Math.min(...cells.map(c => c[0]));
      const heightGain = currentHighest - minCellRow;
      score += heightGain * 4000;

      if (minCellRow <= GOAL_ROW && connectsToCircuit) {
        score += 500000;
      }

      // 3. 階段状の登りやすさ (イティエルからの高さ差が1〜3段)
      const rowDiff = charY - minCellRow;
      if (rowDiff >= 1 && rowDiff <= 3) {
        score += 6000;
      }

      // 4. マグマ危険域回避
      if (minCellRow >= magmaRow) {
        score -= 30000;
      }

      // 5. 中央寄り優先 (極端な壁際での孤立防止)
      const avgCol = cells.reduce((acc, c) => acc + c[1], 0) / cells.length;
      score -= Math.abs(avgCol - 5.5) * 40;

      if (score > bestScore) {
        bestScore = score;
        bestLanding = { ...landing, cells };
      }
    }

    if (!bestLanding) {
      return { success: false, moves: move, highestRow: currentHighest, reason: "No suitable move found" };
    }

    // 盤面に適用
    for (const [r, c] of bestLanding.cells) {
      grid[r][c] = { type: "placed", isConnected: false };
    }

    const newHighest = recalculateConnectedCircuit(grid);
    if (newHighest < currentHighest) {
      currentHighest = newHighest;
      charY = currentHighest;
    }

    // ウイルスせり上がり
    if (move >= 2) {
      const movesPerInfection = Math.max(1, Math.round(stage.infectionIntervalMs / 1800));
      if (move % movesPerInfection === 0 && magmaRow > 0) {
        magmaRow--;
        if (charY >= magmaRow) {
          hearts--;
          if (hearts <= 0) {
            return { success: false, moves: move, highestRow: currentHighest, reason: "Infected by malware" };
          }
        }
      }
    }

    // ゴール到達判定
    if (currentHighest <= GOAL_ROW) {
      return { success: true, moves: move, highestRow: currentHighest, reason: "GOAL REACHED" };
    }
  }

  return {
    success: currentHighest <= GOAL_ROW,
    moves: moveCount,
    highestRow: currentHighest,
    reason: currentHighest <= GOAL_ROW ? "GOAL REACHED" : `Exceeded max moves (Reached row ${currentHighest})`,
  };
}
