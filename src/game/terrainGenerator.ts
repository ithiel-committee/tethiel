import type { Cell } from "../types/game.ts";
import { GRID_WIDTH } from "./constants.ts";

// 決定論的擬似乱数ハッシュ (高度に基づくシード計算)
export function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453123;
  return x - Math.floor(x);
}

// 行内の最大連続空き幅を検査し、幅4マス以上の通路を自然に保証するフェイルセーフ
export function ensurePassableCorridor(row: Cell[]): void {
  let maxEmptySpan = 0;
  let bestStart = -1;
  let currentSpan = 0;
  let currentStart = -1;

  for (let c = 0; c < GRID_WIDTH; c++) {
    if (row[c].type !== "obstacle") {
      if (currentSpan === 0) {
        currentStart = c;
      }
      currentSpan++;
      if (currentSpan > maxEmptySpan) {
        maxEmptySpan = currentSpan;
        bestStart = currentStart;
      }
    } else {
      currentSpan = 0;
    }
  }

  if (maxEmptySpan >= 4) {
    return;
  }

  // 空き区間が存在しない場合は中央付近を起点にする
  let corridorStart = bestStart;
  let corridorEnd = bestStart + maxEmptySpan - 1;
  if (bestStart === -1 || maxEmptySpan === 0) {
    corridorStart = 3;
    corridorEnd = 2;
  }

  // 幅4になるまで余白の多い側へ自然に拡張
  while (corridorEnd - corridorStart + 1 < 4) {
    const canExpandLeft = corridorStart > 0;
    const canExpandRight = corridorEnd < GRID_WIDTH - 1;

    if (canExpandLeft && canExpandRight) {
      if (corridorStart <= GRID_WIDTH - 1 - corridorEnd) {
        corridorEnd++;
      } else {
        corridorStart--;
      }
    } else if (canExpandLeft) {
      corridorStart--;
    } else if (canExpandRight) {
      corridorEnd++;
    } else {
      break;
    }
  }

  // 決定した通路区間内の obstacle のみ empty に変換し既存アイテムを保護
  for (let c = corridorStart; c <= corridorEnd; c++) {
    if (row[c].type === "obstacle") {
      row[c] = { type: "empty" };
    }
  }
}

// エンドレスモード用：感覚的ランダムかつクリア可能な新しい1行の手続き的生成
export function generateEndlessRow(height: number): Cell[] {
  const row: Cell[] = [];
  for (let c = 0; c < GRID_WIDTH; c++) {
    row.push({ type: "empty" });
  }

  // 序盤の低高度 (h <= 4) はスタート直後の足場作りのため完全空き
  if (height <= 4) {
    return row;
  }

  // クールダウン行 (3行に1回、または全体の約30%をスキップして障害物数を従来の0.7倍に調整)
  if (height % 3 === 0 || pseudoRandom(height * 5.1) > 0.7) {
    if (pseudoRandom(height * 3.7) > 0.3) {
      const starCol = 3 + Math.floor(pseudoRandom(height * 8.9) * 6);
      row[starCol] = { type: "star" };
    }
    return row;
  }

  const rnd = (off: number) => pseudoRandom(height * 17.1 + off * 5.3);
  // 5種類の障害物パターン (0: 左壁, 1: 右壁, 2: 中央島, 3: オフセットピン, 4: 左右ピンチ)
  const pattern = Math.floor(rnd(1) * 5);

  const obstacleCols: number[] = [];

  switch (pattern) {
    case 0: {
      // パターン0: 左壁 (列 1 または 列 0〜1) - 右側幅10マス開通
      obstacleCols.push(1);
      if (height > 20 && rnd(2) > 0.7) obstacleCols.push(0);
      break;
    }
    case 1: {
      // パターン1: 右壁 (列 10 または 列 10〜11) - 左側幅10マス開通
      obstacleCols.push(10);
      if (height > 20 && rnd(2) > 0.7) obstacleCols.push(11);
      break;
    }
    case 2: {
      // パターン2: 中央アイランド (列 5, 6 または 列 4, 7) - 中央即配置を阻み左右迂回ルートを要求
      if (rnd(2) > 0.4) {
        obstacleCols.push(5, 6);
      } else {
        obstacleCols.push(rnd(3) > 0.5 ? 4 : 7);
      }
      break;
    }
    case 3: {
      // パターン3: オフセットピン (列 3 または 列 8) - 単独トゲ、両側迂回可能
      const c = rnd(3) > 0.5 ? 3 : 8;
      obstacleCols.push(c);
      break;
    }
    case 4: {
      // パターン4: 左右ピンチ (列 1 と 列 10) - 中央幅8マス完全開通
      obstacleCols.push(1);
      if (rnd(4) > 0.55) obstacleCols.push(10);
      break;
    }
  }

  // 障害物を適用
  for (const col of obstacleCols) {
    if (col >= 0 && col < GRID_WIDTH) {
      row[col] = { type: "obstacle" };
    }
  }

  // 低確率で星(★)を空きスペースに配置
  if (rnd(5) > 0.65 && !row.some((cell) => cell.type === "star")) {
    const freeCols: number[] = [];
    for (let c = 2; c <= 9; c++) {
      if (row[c].type === "empty") freeCols.push(c);
    }
    if (freeCols.length > 0) {
      const picked = freeCols[Math.floor(rnd(6) * freeCols.length)];
      row[picked] = { type: "star" };
    }
  }

  // クリア不可能ケースの絶対防止バリデーション (幅4以上の連続空きスペースを保証)
  ensurePassableCorridor(row);

  return row;
}
