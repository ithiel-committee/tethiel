import type { Cell, CharacterPosition, GameMode } from "../types/game.ts";
import {
  BONUS_GOAL_COLS,
  GOAL_ROW,
  GRID_HEIGHT,
  GRID_WIDTH,
  START_COLS,
  START_ROW,
} from "./constants.ts";

export interface CircuitResult {
  connectedPath: [number, number][];
  circuitRoute: [number, number][];
  topCell: [number, number] | null;
  waypoints: { x: number; y: number }[];
  isGoalPending: boolean;
  isBonusGoal: boolean;
  targetPos: { x: number; y: number } | null;
}

const DIRS: [number, number][] = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

// キャラクター現在位置から目標地点まで、接続されたミノをたどるウェイポイント列を計算
export function calculateWaypointsTo(
  grid: Cell[][],
  characterPos: CharacterPosition,
  connectedPath: [number, number][],
  tr: number,
  tc: number,
): { x: number; y: number }[] {
  const curR = Math.round(characterPos.y);
  const curC = Math.floor(characterPos.x);

  // すでに目標にいる場合
  if (curR === tr && curC === tc) {
    return [];
  }

  // 探索の始点ノードを決定
  let startNode: [number, number] | null = null;

  if (
    curR >= 0 &&
    curR < GRID_HEIGHT &&
    curC >= 0 &&
    curC < GRID_WIDTH &&
    grid[curR][curC].isConnected
  ) {
    // 現在地が接続済みブロック上にある場合
    startNode = [curR, curC];
  } else if (curR >= START_ROW) {
    // START地点にいる場合、START列の接続済みブロックを探す
    for (const sc of START_COLS) {
      for (let r = START_ROW; r >= START_ROW - 1; r--) {
        if (r >= 0 && r < GRID_HEIGHT && grid[r][sc].isConnected) {
          startNode = [r, sc];
          break;
        }
      }
      if (startNode) break;
    }
  }

  // 上記で見つからない場合、接続された回路の中で現在地に最も近いブロックを始点にする
  if (!startNode && connectedPath.length > 0) {
    let minDist = Number.POSITIVE_INFINITY;
    for (const [r, c] of connectedPath) {
      const d = Math.hypot(c + 0.5 - characterPos.x, r - characterPos.y);
      if (d < minDist) {
        minDist = d;
        startNode = [r, c];
      }
    }
  }

  if (!startNode) {
    return [];
  }

  // BFSでstartNodeから[tr, tc]までの接続ブロックをたどる最短経路を探索
  const queue: [number, number][] = [[startNode[0], startNode[1]]];
  const visited = new Set<string>([`${startNode[0]},${startNode[1]}`]);
  const parent = new Map<string, [number, number]>();
  let found = false;

  while (queue.length > 0) {
    const curr = queue.shift();
    if (!curr) break;
    const [cr, cc] = curr;
    if (cr === tr && cc === tc) {
      found = true;
      break;
    }
    for (const [dr, dc] of DIRS) {
      const nr = cr + dr;
      const nc = cc + dc;
      if (nr >= 0 && nr < GRID_HEIGHT && nc >= 0 && nc < GRID_WIDTH) {
        if (grid[nr][nc].isConnected) {
          const key = `${nr},${nc}`;
          if (!visited.has(key)) {
            visited.add(key);
            parent.set(key, [cr, cc]);
            queue.push([nr, nc]);
          }
        }
      }
    }
  }

  if (!found) {
    return [];
  }

  // 経路復元
  const steps: [number, number][] = [];
  let curr: [number, number] | undefined = [tr, tc];
  while (curr) {
    steps.unshift(curr);
    const key = `${curr[0]},${curr[1]}`;
    curr = parent.get(key);
  }

  // ウェイポイント列に変換 (ブロック中央: c + 0.5, r)
  const newWaypoints = steps.map(([r, c]) => ({
    x: c + 0.5,
    y: r,
  }));

  // 現在位置とほぼ一致する先頭ウェイポイントはスキップ
  while (
    newWaypoints.length > 0 &&
    Math.hypot(
      newWaypoints[0].x - characterPos.x,
      newWaypoints[0].y - characterPos.y,
    ) < 0.2
  ) {
    newWaypoints.shift();
  }

  return newWaypoints;
}

// STARTから繋がる回路の再計算および目標位置・ウェイポイントの算出
export function recalculateCircuit(
  grid: Cell[][],
  characterPos: CharacterPosition,
  gameMode: GameMode,
): CircuitResult {
  // 既存のフラグをリセット (感染済みフラグは維持)
  for (let r = 0; r < GRID_HEIGHT; r++) {
    for (let c = 0; c < GRID_WIDTH; c++) {
      if (grid[r][c].type === "placed") {
        grid[r][c].isConnected = false;
        grid[r][c].isTopCircuit = false;
      }
    }
  }

  // BFSでSTART地点から隣接しているplacedブロックを探索
  const queue: [number, number][] = [];
  const visited = new Set<string>();

  // 最下部START地点のブロックをシードにする
  for (const startCol of START_COLS) {
    for (let r = START_ROW; r >= START_ROW - 1; r--) {
      if (grid[r][startCol].type === "placed") {
        const key = `${r},${startCol}`;
        if (!visited.has(key)) {
          visited.add(key);
          queue.push([r, startCol]);
        }
      }
    }
  }

  // エンドレスモード時：スクロール後も回路が途切れないよう、イティエルの足元ブロックと最下行ブロックをシードに含める
  if (gameMode === "endless") {
    const footR = Math.round(characterPos.y);
    const footC = Math.floor(characterPos.x);
    if (
      footR >= 0 &&
      footR < GRID_HEIGHT &&
      footC >= 0 &&
      footC < GRID_WIDTH &&
      grid[footR][footC].type === "placed"
    ) {
      const key = `${footR},${footC}`;
      if (!visited.has(key)) {
        visited.add(key);
        queue.push([footR, footC]);
      }
    }
    for (let c = 0; c < GRID_WIDTH; c++) {
      if (grid[GRID_HEIGHT - 1][c].type === "placed") {
        const key = `${GRID_HEIGHT - 1},${c}`;
        if (!visited.has(key)) {
          visited.add(key);
          queue.push([GRID_HEIGHT - 1, c]);
        }
      }
    }
  }

  const path: [number, number][] = [];
  let topRow = GRID_HEIGHT;
  let topCell: [number, number] | null = null;
  const parent = new Map<string, [number, number]>();

  while (queue.length > 0) {
    const curr = queue.shift();
    if (!curr) break;
    const [cr, cc] = curr;
    path.push([cr, cc]);
    grid[cr][cc].isConnected = true;

    if (cr < topRow) {
      topRow = cr;
      topCell = [cr, cc];
    }

    for (const [dr, dc] of DIRS) {
      const nr = cr + dr;
      const nc = cc + dc;
      if (nr >= 0 && nr < GRID_HEIGHT && nc >= 0 && nc < GRID_WIDTH) {
        if (grid[nr][nc].type === "placed") {
          const key = `${nr},${nc}`;
          if (!visited.has(key)) {
            visited.add(key);
            parent.set(key, [cr, cc]);
            queue.push([nr, nc]);
          }
        }
      }
    }
  }

  // 最下部から上に向かう順序でソート
  path.sort((a, b) => b[0] - a[0]);

  if (!topCell) {
    return {
      connectedPath: path,
      circuitRoute: [],
      topCell: null,
      waypoints: [],
      isGoalPending: false,
      isBonusGoal: false,
      targetPos: null,
    };
  }

  const [tr, tc] = topCell;
  grid[tr][tc].isTopCircuit = true;

  // STARTから最上部ブロックまでの一本の接続ルートを復元
  const route: [number, number][] = [];
  let curr: [number, number] | undefined = topCell;
  while (curr) {
    route.unshift(curr);
    const key = `${curr[0]},${curr[1]}`;
    curr = parent.get(key);
  }

  // キャラクター現在位置から最上部ブロックまで、ミノをたどるルート(最短経路)をBFSで探索
  const waypoints = calculateWaypointsTo(
    grid,
    characterPos,
    path,
    tr,
    tc,
  );

  const isGoalPending = gameMode === "stage" && tr <= GOAL_ROW;
  const isBonusGoal = isGoalPending && BONUS_GOAL_COLS.includes(tc);

  return {
    connectedPath: path,
    circuitRoute: route,
    topCell,
    waypoints,
    isGoalPending,
    isBonusGoal,
    targetPos: { x: tc + 0.5, y: tr },
  };
}
