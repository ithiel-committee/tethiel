import { sounds } from "../audio/soundSystem";
import type {
  Cell,
  CharacterPosition,
  GameStats,
  GameStatus,
  SkillType,
  StageData,
  Tetromino,
  TetrominoType,
} from "../types/game";
import {
  BONUS_GOAL_COLS,
  GOAL_ROW,
  GRID_HEIGHT,
  GRID_WIDTH,
  START_COLS,
  START_ROW,
} from "./constants";
import {
  TetrominoBag,
  calculateGhostY,
  checkCollision,
  createTetromino,
  tryRotate,
} from "./tetromino";

export interface EngineCallbacks {
  onStatusChange: (status: GameStatus) => void;
  onStatsChange: (stats: GameStats) => void;
  onHeartsChange: (hearts: number) => void;
  onCharacterMove: (pos: CharacterPosition) => void;
  onHoldChange: (hold: TetrominoType | null) => void;
  onNextChange: (next: TetrominoType[]) => void;
  onStageClear: (isBonusClear: boolean, stats: GameStats) => void;
  onGameOver: (reason: string, stats: GameStats) => void;
}

export class GameEngine {
  public grid: Cell[][] = [];
  public currentPiece: Tetromino | null = null;
  public holdPiece: TetrominoType | null = null;
  public canHold = true;
  public nextPieces: TetrominoType[] = [];
  public skills: SkillType[] = [];

  public hearts = 5; // ハート5つ
  public maxHearts = 5;

  public characterPos: CharacterPosition = {
    x: 5.5,
    y: START_ROW,
    targetX: 5.5,
    targetY: START_ROW,
    isClimbing: false,
  };

  // ミノをたどるウェイポイント列
  public waypoints: { x: number; y: number }[] = [];
  // STARTから最先端への一本の回路ルート（描画用）
  public circuitRoute: [number, number][] = [];
  public isGoalPending = false;
  public isBonusGoal = false;
  public isGoalCelebration = false;
  private goalReachedTimerMs = 0;

  public status: GameStatus = "ready";
  public stage: StageData;
  public callbacks: EngineCallbacks;

  private bag: TetrominoBag;
  private lastFrameTime = 0;
  private dropTimerMs = 0;
  private dropIntervalMs = 900;
  private lockDelayTimerMs = 0;
  private isLocking = false;

  // ウイルス感染タイマー
  private infectionTimerMs = 0;

  // 統計
  public score = 0;
  public minoCount = 0;
  public bonusStars = 0;
  public totalStars = 0;
  public startTimeMs = 0;
  public elapsedTimeMs = 0;
  public bestScore = 987654;

  // 接続された回路パス（STARTから昇順）
  public connectedPath: [number, number][] = [];

  constructor(stage: StageData, callbacks: EngineCallbacks) {
    this.stage = stage;
    this.callbacks = callbacks;
    this.bag = new TetrominoBag();
    this.totalStars = stage.initialStars.length;
    this.initGrid();
  }

  // グリッド初期化
  public initGrid() {
    this.grid = [];
    for (let r = 0; r < GRID_HEIGHT; r++) {
      this.grid[r] = [];
      for (let c = 0; c < GRID_WIDTH; c++) {
        this.grid[r][c] = { type: "empty" };
      }
    }

    // スタート台座（立っている位置に白いブロックを初期配置）
    for (const sc of START_COLS) {
      this.grid[START_ROW][sc] = {
        type: "placed",
        color: "#ffffff",
        isConnected: true,
      };
    }

    // 障害物の配置
    for (const [r, c] of this.stage.initialObstacles) {
      if (r >= 0 && r < GRID_HEIGHT && c >= 0 && c < GRID_WIDTH) {
        this.grid[r][c] = { type: "obstacle" };
      }
    }

    // 星（★）の配置
    for (const [r, c] of this.stage.initialStars) {
      if (r >= 0 && r < GRID_HEIGHT && c >= 0 && c < GRID_WIDTH) {
        this.grid[r][c] = { type: "star" };
      }
    }

    this.characterPos = {
      x: 5.5,
      y: START_ROW,
      targetX: 5.5,
      targetY: START_ROW,
      isClimbing: false,
    };

    this.hearts = 5;
    this.score = 0;
    this.minoCount = 0;
    this.bonusStars = 0;
    this.holdPiece = null;
    this.canHold = true;
    this.connectedPath = [];
    this.waypoints = [];
    this.circuitRoute = [];
    this.isGoalPending = false;
    this.isBonusGoal = false;
    this.isGoalCelebration = false;
    this.goalReachedTimerMs = 0;
    this.infectionTimerMs = 0;
  }

  // ゲーム開始
  public start() {
    this.initGrid();
    this.status = "playing";
    this.startTimeMs = performance.now();
    this.lastFrameTime = performance.now();
    this.nextPieces = this.bag.peek(3);
    this.spawnNextPiece();

    this.callbacks.onStatusChange(this.status);
    this.callbacks.onHeartsChange(this.hearts);
    this.callbacks.onCharacterMove(this.characterPos);
    this.callbacks.onHoldChange(this.holdPiece);
    this.callbacks.onNextChange(this.nextPieces);
    this.updateStats();
  }

  // 一時停止
  public togglePause() {
    if (this.status === "playing") {
      this.status = "paused";
      this.callbacks.onStatusChange(this.status);
    } else if (this.status === "paused") {
      this.status = "playing";
      this.lastFrameTime = performance.now();
      this.callbacks.onStatusChange(this.status);
    }
  }

  // ミノ出現
  private spawnNextPiece() {
    const nextType = this.bag.getNext();
    this.currentPiece = createTetromino(nextType);
    this.nextPieces = this.bag.peek(3);
    this.canHold = true;
    this.isLocking = false;
    this.lockDelayTimerMs = 0;
    this.dropTimerMs = 0;

    // 出現位置で衝突＝進行不能ゲームオーバー
    if (checkCollision(this.currentPiece, this.grid)) {
      this.triggerGameOver(
        "ミノ上部に障害物があり置けない進行不能状態になりました",
      );
      return;
    }

    this.callbacks.onNextChange(this.nextPieces);
  }

  // 毎フレーム更新（60fps）
  public update(now: number) {
    if (this.status !== "playing") return;

    const deltaMs = Math.min(now - this.lastFrameTime, 100);
    this.lastFrameTime = now;
    this.elapsedTimeMs = now - this.startTimeMs;

    // 1. ウイルス感染進行（STARTから繋がった回路を順に黒く染める）
    if (this.connectedPath.length > 0) {
      this.infectionTimerMs += deltaMs;
      if (this.infectionTimerMs >= this.stage.infectionIntervalMs) {
        this.infectionTimerMs = 0;
        this.advanceInfection();
      }
    }

    // 2. イティエルの移動（ミノをたどる動き）
    if (this.waypoints.length > 0) {
      const target = this.waypoints[0];
      const dx = target.x - this.characterPos.x;
      const dy = target.y - this.characterPos.y;
      const dist = Math.hypot(dx, dy);

      // 移動速度（ブロック/秒）
      const speed = this.isGoalPending ? 12.0 : 9.0;
      const step = (speed * deltaMs) / 1000;

      if (dist <= step) {
        this.characterPos.x = target.x;
        this.characterPos.y = target.y;
        this.waypoints.shift();

        if (this.waypoints.length === 0) {
          this.characterPos.isClimbing = false;
          // ゴールマスに到着した瞬間
          if (this.isGoalPending && this.characterPos.y <= GOAL_ROW) {
            this.isGoalCelebration = true;
            sounds.playClear();
          }
        } else {
          this.characterPos.isClimbing = true;
        }
      } else {
        this.characterPos.x += (dx / dist) * step;
        this.characterPos.y += (dy / dist) * step;
        this.characterPos.isClimbing = true;
      }
      this.callbacks.onCharacterMove({ ...this.characterPos });
    } else {
      this.characterPos.isClimbing = false;

      // ゴールマスに到着後のセレブレーション待機（1秒後にリザルト画面へ遷移）
      if (this.isGoalCelebration) {
        this.goalReachedTimerMs += deltaMs;
        if (this.goalReachedTimerMs >= 1000) {
          this.triggerStageClear(this.isBonusGoal);
          return;
        }
      }
    }

    // 3. ミノの自動落下
    if (this.currentPiece) {
      this.dropTimerMs += deltaMs;
      if (this.dropTimerMs >= this.dropIntervalMs) {
        this.dropTimerMs = 0;
        if (!checkCollision(this.currentPiece, this.grid, 0, 1)) {
          this.currentPiece.y++;
          this.isLocking = false;
          this.lockDelayTimerMs = 0;
        } else {
          this.isLocking = true;
        }
      }

      if (this.isLocking) {
        this.lockDelayTimerMs += deltaMs;
        if (this.lockDelayTimerMs >= 500) {
          this.lockPiece();
        }
      }
    }

    this.updateStats();
  }

  // ウイルス感染を一歩進める
  private advanceInfection() {
    // connectedPath は START から最上部に向かって並んでいる
    for (const [r, c] of this.connectedPath) {
      const cell = this.grid[r][c];
      if (!cell.isInfected) {
        cell.isInfected = true;

        // もし感染したマスが、イティエルがいる最上部ミノ（またはイティエルの現在地）だった場合
        if (
          cell.isTopCircuit ||
          (Math.round(this.characterPos.y) === r &&
            Math.round(this.characterPos.x) === c)
        ) {
          sounds.playAlert();
          this.hearts = Math.max(0, this.hearts - 1);
          this.callbacks.onHeartsChange(this.hearts);

          if (this.hearts <= 0) {
            this.triggerGameOver(
              "最上部のミノがウイルスに追いつかれました！",
            );
            return;
          }
        }
        break;
      }
    }
  }

  // ミノをグリッドに固定する
  private lockPiece() {
    if (!this.currentPiece) return;

    sounds.playLock();
    const { matrix, x, y, color } = this.currentPiece;
    this.minoCount++;

    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        if (matrix[r][c] !== 0) {
          const targetY = y + r;
          const targetX = x + c;

          if (
            targetY >= 0 &&
            targetY < GRID_HEIGHT &&
            targetX >= 0 &&
            targetX < GRID_WIDTH
          ) {
            // 星（★）を回収
            if (this.grid[targetY][targetX].type === "star") {
              sounds.playItemGet();
              this.bonusStars++;
              this.score += 800;
            }

            this.grid[targetY][targetX] = {
              type: "placed",
              color: color,
              isConnected: false,
              isInfected: false,
              isTopCircuit: false,
            };
          }
        }
      }
    }

    this.currentPiece = null;
    this.score += 50;

    // 回路接続の再計算（STARTからBFS探索）
    this.recalculateCircuit();

    // 次のミノ出現
    this.spawnNextPiece();
  }

  // STARTから繋がる回路の再計算
  private recalculateCircuit() {
    // 既存のフラグをリセット（感染済みフラグは維持）
    for (let r = 0; r < GRID_HEIGHT; r++) {
      for (let c = 0; c < GRID_WIDTH; c++) {
        if (this.grid[r][c].type === "placed") {
          this.grid[r][c].isConnected = false;
          this.grid[r][c].isTopCircuit = false;
        }
      }
    }

    // BFSでSTART地点から隣接しているplacedブロックを探索
    const queue: [number, number][] = [];
    const visited = new Set<string>();

    // 最下部START地点のブロックをシードにする
    for (const startCol of START_COLS) {
      // START行直上またはSTART行にミノがあるか
      for (let r = START_ROW; r >= START_ROW - 1; r--) {
        if (this.grid[r][startCol].type === "placed") {
          const key = `${r},${startCol}`;
          if (!visited.has(key)) {
            visited.add(key);
            queue.push([r, startCol]);
          }
        }
      }
    }

    const path: [number, number][] = [];
    let topRow = GRID_HEIGHT;
    let topCell: [number, number] | null = null;
    const parent = new Map<string, [number, number]>();

    const dirs = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];

    while (queue.length > 0) {
      const curr = queue.shift();
      if (!curr) break;
      const [cr, cc] = curr;
      path.push([cr, cc]);
      this.grid[cr][cc].isConnected = true;

      if (cr < topRow) {
        topRow = cr;
        topCell = [cr, cc];
      }

      for (const [dr, dc] of dirs) {
        const nr = cr + dr;
        const nc = cc + dc;
        if (nr >= 0 && nr < GRID_HEIGHT && nc >= 0 && nc < GRID_WIDTH) {
          if (this.grid[nr][nc].type === "placed") {
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
    this.connectedPath = path;

    // 最上部ブロックの特定＆イティエルの目標位置
    if (topCell) {
      const [tr, tc] = topCell;
      this.grid[tr][tc].isTopCircuit = true;
      this.characterPos.targetX = tc + 0.5;
      this.characterPos.targetY = tr;

      // STARTから最上部ブロックまでの一本の接続ルートを復元
      const route: [number, number][] = [];
      let curr: [number, number] | undefined = topCell;
      while (curr) {
        route.unshift(curr);
        const key = `${curr[0]},${curr[1]}`;
        curr = parent.get(key);
      }
      this.circuitRoute = route;

      // キャラクター現在位置から最上部ブロックまで、ミノをたどるルート（最短経路）をBFSで探索
      this.calculateWaypointsTo(tr, tc);

      // GOAL判定の準備（キャラクターがミノをたどって登りきった時にクリア）
      if (tr <= GOAL_ROW) {
        this.isGoalPending = true;
        this.isBonusGoal = BONUS_GOAL_COLS.includes(tc);
        this.currentPiece = null; // ゴール達成時はミノの落下を止めて登頂を見届ける
      } else {
        this.isGoalPending = false;
      }
    } else {
      this.waypoints = [];
      this.circuitRoute = [];
      this.isGoalPending = false;
      this.characterPos.isClimbing = false;
    }
  }

  // キャラクター現在位置から目標地点まで、接続されたミノをたどるウェイポイント列を計算
  private calculateWaypointsTo(tr: number, tc: number) {
    const curR = Math.round(this.characterPos.y);
    const curC = Math.floor(this.characterPos.x);

    // すでに目標にいる場合
    if (curR === tr && curC === tc) {
      this.waypoints = [];
      return;
    }

    // 探索の始点ノードを決定
    let startNode: [number, number] | null = null;

    if (
      curR >= 0 &&
      curR < GRID_HEIGHT &&
      curC >= 0 &&
      curC < GRID_WIDTH &&
      this.grid[curR][curC].isConnected
    ) {
      // 現在地が接続済みブロック上にある場合
      startNode = [curR, curC];
    } else if (curR >= START_ROW) {
      // START地点にいる場合、START列の接続済みブロックを探す
      for (const sc of START_COLS) {
        for (let r = START_ROW; r >= START_ROW - 1; r--) {
          if (r >= 0 && r < GRID_HEIGHT && this.grid[r][sc].isConnected) {
            startNode = [r, sc];
            break;
          }
        }
        if (startNode) break;
      }
    }

    // 上記で見つからない場合、接続された回路の中で現在地に最も近いブロックを始点にする
    if (!startNode && this.connectedPath.length > 0) {
      let minDist = Infinity;
      for (const [r, c] of this.connectedPath) {
        const d = Math.hypot(
          c + 0.5 - this.characterPos.x,
          r - this.characterPos.y,
        );
        if (d < minDist) {
          minDist = d;
          startNode = [r, c];
        }
      }
    }

    if (!startNode) {
      this.waypoints = [];
      return;
    }

    // BFSでstartNodeから[tr, tc]までの接続ブロックをたどる最短経路を探索
    const dirs = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];
    const queue: [number, number][] = [[startNode[0], startNode[1]]];
    const visited = new Set<string>([`${startNode[0]},${startNode[1]}`]);
    const parent = new Map<string, [number, number]>();
    let found = false;

    while (queue.length > 0) {
      const [cr, cc] = queue.shift()!;
      if (cr === tr && cc === tc) {
        found = true;
        break;
      }
      for (const [dr, dc] of dirs) {
        const nr = cr + dr;
        const nc = cc + dc;
        if (nr >= 0 && nr < GRID_HEIGHT && nc >= 0 && nc < GRID_WIDTH) {
          if (this.grid[nr][nc].isConnected) {
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
      this.waypoints = [];
      return;
    }

    // 経路復元
    const steps: [number, number][] = [];
    let curr: [number, number] | undefined = [tr, tc];
    while (curr) {
      steps.unshift(curr);
      const key = `${curr[0]},${curr[1]}`;
      curr = parent.get(key);
    }

    // ウェイポイント列に変換（ブロック中央: c + 0.5, r）
    const newWaypoints = steps.map(([r, c]) => ({
      x: c + 0.5,
      y: r,
    }));

    // 現在位置とほぼ一致する先頭ウェイポイントはスキップ
    while (
      newWaypoints.length > 0 &&
      Math.hypot(
        newWaypoints[0].x - this.characterPos.x,
        newWaypoints[0].y - this.characterPos.y,
      ) < 0.2
    ) {
      newWaypoints.shift();
    }

    this.waypoints = newWaypoints;
  }

  // 操作系
  public moveLeft() {
    if (this.status !== "playing" || !this.currentPiece) return;
    if (!checkCollision(this.currentPiece, this.grid, -1, 0)) {
      this.currentPiece.x--;
      sounds.playMove();
      this.resetLockDelay();
    }
  }

  public moveRight() {
    if (this.status !== "playing" || !this.currentPiece) return;
    if (!checkCollision(this.currentPiece, this.grid, 1, 0)) {
      this.currentPiece.x++;
      sounds.playMove();
      this.resetLockDelay();
    }
  }

  public rotate() {
    if (this.status !== "playing" || !this.currentPiece) return;
    const result = tryRotate(this.currentPiece, this.grid);
    if (result.success) {
      this.currentPiece.matrix = result.newMatrix;
      this.currentPiece.x = result.newX;
      this.currentPiece.y = result.newY;
      sounds.playRotate();
      this.resetLockDelay();
    }
  }

  public softDrop() {
    if (this.status !== "playing" || !this.currentPiece) return;
    if (!checkCollision(this.currentPiece, this.grid, 0, 1)) {
      this.currentPiece.y++;
      this.score += 1;
      sounds.playMove();
    } else {
      this.isLocking = true;
    }
  }

  public hardDrop() {
    if (this.status !== "playing" || !this.currentPiece) return;
    const ghostY = calculateGhostY(this.currentPiece, this.grid);
    this.score += (ghostY - this.currentPiece.y) * 2;
    this.currentPiece.y = ghostY;
    sounds.playHardDrop();
    this.lockPiece();
  }

  public hold() {
    if (this.status !== "playing" || !this.currentPiece || !this.canHold)
      return;

    sounds.playHold();
    const currentType = this.currentPiece.type;

    if (this.holdPiece === null) {
      this.holdPiece = currentType;
      this.spawnNextPiece();
    } else {
      const temp = this.holdPiece;
      this.holdPiece = currentType;
      this.currentPiece = createTetromino(temp);
      this.isLocking = false;
      this.lockDelayTimerMs = 0;
    }

    this.canHold = false;
    this.callbacks.onHoldChange(this.holdPiece);
  }

  public useBomb() {
    if (this.skills.length === 0) return;
    this.skills.pop();
    sounds.playBomb();

    // イティエルの現在位置または操作ミノの周囲2マスを破壊
    const cx = this.currentPiece
      ? this.currentPiece.x + 1
      : Math.round(this.characterPos.x);
    const cy = this.currentPiece
      ? this.currentPiece.y + 1
      : Math.round(this.characterPos.y);

    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const tr = cy + dr;
        const tc = cx + dc;
        if (
          tr >= 0 &&
          tr < GRID_HEIGHT &&
          tc >= 0 &&
          tc < GRID_WIDTH &&
          !(tr === START_ROW && START_COLS.includes(tc))
        ) {
          if (
            this.grid[tr][tc].type === "obstacle" ||
            this.grid[tr][tc].type === "placed"
          ) {
            const oldColor = this.grid[tr][tc].color || "#00f0ff";
            this.grid[tr][tc] = {
              type: "glitched",
              color: oldColor,
              glitchSeed: Math.random() * 100,
            };
            this.score += 50;
          }
        }
      }
    }

    this.recalculateCircuit();
  }

  private resetLockDelay() {
    if (this.isLocking) {
      this.lockDelayTimerMs = 0;
    }
  }

  private updateStats() {
    const stats: GameStats = {
      score: this.score,
      clearTimeSeconds: Math.floor(this.elapsedTimeMs / 1000),
      clearTimeMs: this.elapsedTimeMs,
      minoCount: this.minoCount,
      bonusStars: this.bonusStars,
      totalStars: this.totalStars,
      stageNumber: this.stage.id,
      bestScore: this.bestScore,
    };
    this.callbacks.onStatsChange(stats);
  }

  private triggerStageClear(isBonusClear: boolean) {
    this.status = "cleared";
    sounds.playClear();
    this.score += isBonusClear ? 10000 : 5000;
    this.score += this.bonusStars * 1000;
    this.score += this.hearts * 500;

    const stats: GameStats = {
      score: this.score,
      clearTimeSeconds: Math.floor(this.elapsedTimeMs / 1000),
      clearTimeMs: this.elapsedTimeMs,
      minoCount: this.minoCount,
      bonusStars: this.bonusStars,
      totalStars: this.totalStars,
      stageNumber: this.stage.id,
      bestScore: Math.max(this.bestScore, this.score),
    };
    this.callbacks.onStatusChange(this.status);
    this.callbacks.onStageClear(isBonusClear, stats);
  }

  private triggerGameOver(reason: string) {
    this.status = "gameover";
    sounds.playGameOver();
    const stats: GameStats = {
      score: this.score,
      clearTimeSeconds: Math.floor(this.elapsedTimeMs / 1000),
      clearTimeMs: this.elapsedTimeMs,
      minoCount: this.minoCount,
      bonusStars: this.bonusStars,
      totalStars: this.totalStars,
      stageNumber: this.stage.id,
      bestScore: this.bestScore,
    };
    this.callbacks.onStatusChange(this.status);
    this.callbacks.onGameOver(reason, stats);
  }
}
