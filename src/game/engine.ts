import { sounds } from "../audio/soundSystem.ts";
import type {
  Cell,
  CharacterPosition,
  GameMode,
  GameStats,
  GameStatus,
  SkillType,
  StageData,
  Tetromino,
  TetrominoType,
} from "../types/game.ts";
import { recalculateCircuit } from "./circuitPathfinder.ts";
import {
  GAME_RULES,
  GOAL_ROW,
  GRID_HEIGHT,
  GRID_WIDTH,
  SCORE_CONFIG,
  START_CENTER_X,
  START_COLS,
  START_ROW,
  TIMING_CONFIG,
} from "./constants.ts";
import { calculateStageClearScore } from "./scoring.ts";
import { generateEndlessRow } from "./terrainGenerator.ts";
import {
  TetrominoBag,
  calculateGhostY,
  checkCollision,
  createTetromino,
  tryRotate,
} from "./tetromino.ts";

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

  public hearts: number = GAME_RULES.INITIAL_HEARTS;
  public maxHearts: number = GAME_RULES.MAX_HEARTS;

  public characterPos: CharacterPosition = {
    x: START_CENTER_X,
    y: START_ROW,
    targetX: START_CENTER_X,
    targetY: START_ROW,
    isClimbing: false,
    facing: "left",
    isMoving: false,
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
  private dropIntervalMs: number = TIMING_CONFIG.DEFAULT_DROP_INTERVAL_MS;
  private lockDelayTimerMs = 0;
  private isLocking = false;

  // ウイルス感染タイマー
  private infectionTimerMs = 0;
  // 感染ブロック上の継続ダメージタイマー（1秒おき）
  private infectedDamageTimerMs = 0;

  // 統計
  public score = 0;
  public minoCount = 0;
  public bonusStars = 0;
  public totalStars = 0;
  public startTimeMs = 0;
  public elapsedTimeMs = 0;
  public bestScore = 0;

  // 接続された回路パス（STARTから昇順）
  public connectedPath: [number, number][] = [];
  // トゲトラップ接触時の爆砕エフェクト情報
  public spikeHitEffects: {
    x: number;
    y: number;
    color: string;
    createdAt: number;
  }[] = [];
  // ボム爆発エフェクト情報 (大爆発衝撃波＋破片パーティクル)
  public bombExplosionEffects: {
    x: number;
    y: number;
    brokenBlocks: { x: number; y: number; color: string }[];
    createdAt: number;
  }[] = [];

  // せりあがり型ウイルス（横一列感染）の現在進行行（初期値は最下部の外側）
  public magmaRow: number = GRID_HEIGHT;
  // ウイルス感染モード ("rising_magma": マグマ状横一列せりあがり / "circuit_path": 従来の回路辿り)
  public infectionMode: "rising_magma" | "circuit_path" = "rising_magma";

  // スコア内訳用
  public timePenalty = 0;
  public minoBonus = 0;

  // ゲームモード ("stage": 通常ステージ / "endless": 無限縦スクロール)
  public gameMode: GameMode = "stage";
  // エンドレスモードで登った総高度（メートル）
  public climbedHeight = 0;
  // 現在のウイルス感染間隔（エンドレスモードで加速）
  public currentInfectionIntervalMs: number =
    TIMING_CONFIG.DEFAULT_INFECTION_INTERVAL_MS;

  // 感染開始までの残り配置ミノ数（0なら既にウイルス活動中）
  public get minosUntilInfection(): number {
    return Math.max(0, GAME_RULES.INFECTION_DELAY_MINO_COUNT - this.minoCount);
  }

  constructor(
    stage: StageData,
    callbacks: EngineCallbacks,
    initialBestScore?: number,
  ) {
    this.stage = stage;
    this.callbacks = callbacks;
    if (initialBestScore !== undefined) {
      this.bestScore = initialBestScore;
    }
    this.bag = new TetrominoBag();
    this.totalStars = stage.initialStars.length;
    this.initGrid();
  }

  // グリッド初期化
  public initGrid() {
    this.gameMode = this.stage.mode ?? "stage";
    this.climbedHeight = 0;
    this.currentInfectionIntervalMs = this.stage.infectionIntervalMs;

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

    // 障害物と星の初期配置
    if (this.gameMode === "endless") {
      // エンドレスモード: 足元は安全を確保し、上空へ向かってプロシージャル地形を初期展開
      const terrainStartRow = START_ROW - GAME_RULES.ENDLESS_SAFE_ROWS;
      for (let r = terrainStartRow; r >= 0; r--) {
        const height = START_ROW - r;
        this.grid[r] = generateEndlessRow(height);
      }
    } else {
      // 通常ステージモード: ステージ定義に基づく配置
      for (const [r, c] of this.stage.initialObstacles) {
        if (r >= 0 && r < GRID_HEIGHT && c >= 0 && c < GRID_WIDTH) {
          this.grid[r][c] = { type: "obstacle" };
        }
      }
      for (const [r, c] of this.stage.initialStars) {
        if (r >= 0 && r < GRID_HEIGHT && c >= 0 && c < GRID_WIDTH) {
          this.grid[r][c] = { type: "star" };
        }
      }
    }

    this.characterPos = {
      x: START_CENTER_X,
      y: START_ROW,
      targetX: START_CENTER_X,
      targetY: START_ROW,
      isClimbing: false,
      facing: "left",
      isMoving: false,
    };

    this.hearts = GAME_RULES.INITIAL_HEARTS;
    this.score = 0;
    this.minoCount = 0;
    this.bonusStars = 0;
    this.holdPiece = null;
    this.canHold = true;
    this.connectedPath = [];
    this.waypoints = [];
    this.circuitRoute = [];
    this.spikeHitEffects = [];
    this.bombExplosionEffects = [];
    this.magmaRow = GRID_HEIGHT;
    this.timePenalty = 0;
    this.minoBonus = 0;
    this.isGoalPending = false;
    this.isBonusGoal = false;
    this.isGoalCelebration = false;
    this.skills = this.stage.initialSkills
      ? [...this.stage.initialSkills]
      : this.stage.id >= 2
        ? ["bomb", "bomb"]
        : [];
    this.goalReachedTimerMs = 0;
    this.infectionTimerMs = 0;
    this.infectedDamageTimerMs = 0;
  }

  // エンドレスモード用：フィールド全体を下にスクロール (イティエルが登った高度を進める)
  public scrollDown(count = 1) {
    for (let step = 0; step < count; step++) {
      this.climbedHeight++;
      this.score += SCORE_CONFIG.ENDLESS_SCROLL_PER_ROW;

      // ウイルスの段階的加速 (10m登るごとに120ms短縮、最小1400ms)
      this.currentInfectionIntervalMs = Math.max(
        1400,
        this.stage.infectionIntervalMs -
          Math.floor(this.climbedHeight / 10) * 120,
      );

      // グリッドを1行下へシフト
      // 初期グリッド (高度0〜21) の上空へ連続するように START_ROW + climbedHeight を渡す
      this.grid.pop();
      this.grid.unshift(
        generateEndlessRow(START_ROW + this.climbedHeight),
      );
    }

    // エンティティの座標を下にシフト
    this.characterPos.y += count;
    this.characterPos.targetY += count;
    for (const wp of this.waypoints) {
      wp.y += count;
    }

    // 回路パス
    this.connectedPath = this.connectedPath
      .map(([r, c]) => [r + count, c] as [number, number])
      .filter(([r]) => r < GRID_HEIGHT);

    this.circuitRoute = this.circuitRoute
      .map(([r, c]) => [r + count, c] as [number, number])
      .filter(([r]) => r < GRID_HEIGHT);

    // トゲエフェクト
    for (const fx of this.spikeHitEffects) {
      fx.y += count;
    }

    // 操作中のミノも連動
    if (this.currentPiece) {
      this.currentPiece.y += count;
    }

    // ウイルス感染ラインも連動（押し返す）
    this.magmaRow = Math.min(GRID_HEIGHT, this.magmaRow + count);

    this.callbacks.onCharacterMove({ ...this.characterPos });
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

    // 出現位置で衝突する場合の安全スポーン処理
    if (checkCollision(this.currentPiece, this.grid)) {
      // 1. 左右の安全な空きスペース(dx = -1, 1, -2, 2, -3, 3, -4, 4)からの出現を試みる
      const shiftOffsets = [-1, 1, -2, 2, -3, 3, -4, 4];
      let shifted = false;
      for (const dx of shiftOffsets) {
        if (!checkCollision(this.currentPiece, this.grid, dx, 0)) {
          this.currentPiece.x += dx;
          shifted = true;
          break;
        }
      }

      // 2. 水平シフトで空きがない場合、画面外上空(y = -1)からの出現を試みる
      if (!shifted && !checkCollision(this.currentPiece, this.grid, 0, -1)) {
        this.currentPiece.y = -1;
        shifted = true;
      }

      // 3. 画面外上空かつ左右シフト(dx, y = -1)を試みる
      if (!shifted) {
        for (const dx of shiftOffsets) {
          if (!checkCollision(this.currentPiece, this.grid, dx, -1)) {
            this.currentPiece.x += dx;
            this.currentPiece.y = -1;
            shifted = true;
            break;
          }
        }
      }

      // 4. シフトしてもなお重なる場合のフェイルセーフ
      if (!shifted) {
        // エンドレスモードで障害物に阻まれている場合は、出現領域の障害物をクリアして即死を防止
        if (this.gameMode === "endless") {
          const { matrix, x, y } = this.currentPiece;
          let clearedAny = false;
          for (let r = 0; r < matrix.length; r++) {
            for (let c = 0; c < matrix[r].length; c++) {
              if (matrix[r][c] !== 0) {
                const tr = y + r;
                const tc = x + c;
                if (tr >= 0 && tr < GRID_HEIGHT && tc >= 0 && tc < GRID_WIDTH) {
                  if (this.grid[tr][tc].type === "obstacle") {
                    this.grid[tr][tc] = { type: "empty" };
                    clearedAny = true;
                  }
                }
              }
            }
          }
          if (clearedAny && !checkCollision(this.currentPiece, this.grid)) {
            this.callbacks.onNextChange(this.nextPieces);
            return;
          }
        }

        // 設置済みミノで完全に天井まで埋まっている場合は進行不能ゲームオーバー
        this.triggerGameOver(
          "ブロックが天井まで積み上がり置けなくなりました",
        );
        return;
      }
    }

    this.callbacks.onNextChange(this.nextPieces);
  }

  // 毎フレーム更新（60fps）
  public update(now: number) {
    if (this.status !== "playing") return;

    const deltaMs = Math.min(now - this.lastFrameTime, 100);
    this.lastFrameTime = now;
    this.elapsedTimeMs = now - this.startTimeMs;

    // 1. ウイルス感染進行（マグマせりあがり）
    // 要件：「2ミノを配置完了し終わるまで動き出さないように」
    const isReadyToInfect =
      this.minoCount >= GAME_RULES.INFECTION_DELAY_MINO_COUNT;
    const shouldInfect =
      isReadyToInfect && (this.connectedPath.length > 0 || this.minoCount > 0);

    if (shouldInfect) {
      this.infectionTimerMs += deltaMs;
      if (this.infectionTimerMs >= this.currentInfectionIntervalMs) {
        this.infectionTimerMs = 0;
        this.advanceInfection();
      }
    } else {
      // 2ミノ配置完了するまでは待機タイマーを0に維持
      this.infectionTimerMs = 0;
    }

    // 2. ウイルス領域滞在中の継続ダメージ(1秒おきにハート-1)
    const footR = Math.round(this.characterPos.y);
    const footC = Math.floor(this.characterPos.x);
    const isFootInfected =
      (footR >= 0 &&
        footR < GRID_HEIGHT &&
        footC >= 0 &&
        footC < GRID_WIDTH &&
        this.grid[footR][footC]?.isInfected) ||
      footR >= this.magmaRow;

    if (isFootInfected) {
      this.infectedDamageTimerMs += deltaMs;
      if (
        this.infectedDamageTimerMs >= TIMING_CONFIG.INFECTED_DAMAGE_INTERVAL_MS
      ) {
        this.infectedDamageTimerMs = 0;
        this.takeDamage("ウイルスの感染領域内に留まり続けています！");
        if (this.status !== "playing") return;
      }
    } else {
      this.infectedDamageTimerMs = 0;
    }

    // 2. イティエルの移動(ミノをたどる動き)
    if (this.waypoints.length > 0) {
      const target = this.waypoints[0];
      const dx = target.x - this.characterPos.x;
      const dy = target.y - this.characterPos.y;
      const dist = Math.hypot(dx, dy);

      // 右に移動するときだけ右向き、それ以外(左移動・上下移動・停止)はデフォルト左向き
      this.characterPos.facing = dx > 0.02 ? "right" : "left";
      this.characterPos.isMoving = true;

      // 移動速度(ブロック/秒)
      const speed = this.isGoalPending
        ? TIMING_CONFIG.CHAR_MOVE_SPEED_GOAL
        : TIMING_CONFIG.CHAR_MOVE_SPEED_NORMAL;
      const step = (speed * deltaMs) / 1000;

      if (dist <= step) {
        this.characterPos.x = target.x;
        this.characterPos.y = target.y;
        this.waypoints.shift();

        if (this.waypoints.length === 0) {
          this.characterPos.isClimbing = false;
          this.characterPos.isMoving = false;
          this.characterPos.facing = "left";
          // ゴールマスに到着した瞬間（ステージモードのみ）
          if (
            this.gameMode === "stage" &&
            this.isGoalPending &&
            this.characterPos.y <= GOAL_ROW
          ) {
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
      this.characterPos.isMoving = false;
      this.characterPos.facing = "left";

      // ゴールマスに到着後のセレブレーション待機(1秒後にリザルト画面へ遷移・ステージモードのみ)
      if (this.gameMode === "stage" && this.isGoalCelebration) {
        this.goalReachedTimerMs += deltaMs;
        if (this.goalReachedTimerMs >= TIMING_CONFIG.GOAL_CELEBRATION_WAIT_MS) {
          this.triggerStageClear(this.isBonusGoal);
          return;
        }
      }
    }

    // 2.5 エンドレスモード時の自動縦スクロール処理
    // イティエルが画面上部に登ったら、フィールドを下にスクロールして中央へ戻す
    const midGridRow = Math.floor(GRID_HEIGHT / 2);
    if (this.gameMode === "endless" && this.characterPos.y < midGridRow) {
      const scrollRows = Math.floor(midGridRow - this.characterPos.y);
      if (scrollRows > 0) {
        this.scrollDown(scrollRows);
        this.recalculateCircuit();
      }
    }

    // 3. ミノの自動落下 & 接地・ロックディレイ判定
    if (this.currentPiece) {
      const isCurrentlyGrounded = checkCollision(
        this.currentPiece,
        this.grid,
        0,
        1,
      );

      // 直下に足場がない(空中にいる)場合は直ちにロック状態を解除
      if (!isCurrentlyGrounded) {
        this.isLocking = false;
        this.lockDelayTimerMs = 0;
      }

      this.dropTimerMs += deltaMs;
      if (this.dropTimerMs >= this.dropIntervalMs) {
        this.dropTimerMs = 0;
        if (!isCurrentlyGrounded) {
          this.currentPiece.y++;
        } else {
          this.isLocking = true;
        }
      }

      if (this.isLocking) {
        this.lockDelayTimerMs += deltaMs;
        if (this.lockDelayTimerMs >= TIMING_CONFIG.LOCK_DELAY_MS) {
          this.lockPiece();
        }
      }
    }

    this.updateStats();
  }

  // ウイルス感染を一歩進める（せりあがり型マグマ感染）
  private advanceInfection() {
    this.advanceMagmaInfection();
  }

  // マグマがせりあがってくるように横一列で下から感染を進める
  private advanceMagmaInfection() {
    if (this.magmaRow > 0) {
      this.magmaRow--;
      const targetRow = this.magmaRow;

      // 対象行のすべての設置済みブロックをウイルス感染状態にする
      for (let c = 0; c < GRID_WIDTH; c++) {
        if (this.grid[targetRow][c].type === "placed") {
          this.grid[targetRow][c].isInfected = true;
        }
      }

      // イティエルの現在行がせりあがったウイルス行に到達（呑み込まれた）場合
      const charRow = Math.round(this.characterPos.y);
      if (charRow >= targetRow) {
        this.takeDamage("ウイルスに飲み込まれました！");
        this.infectedDamageTimerMs = 0;
      }
    }
  }

  // ダメージ処理（ハート-1、SE、ゲームオーバー判定）
  private takeDamage(
    reason = "最上部のミノがウイルスに追いつかれました！",
  ) {
    sounds.playAlert();
    this.hearts = Math.max(0, this.hearts - 1);
    this.callbacks.onHeartsChange(this.hearts);

    if (this.hearts <= 0) {
      this.triggerGameOver(reason);
    }
  }

  // ミノをグリッドに固定する
  private lockPiece() {
    if (!this.currentPiece) return;

    sounds.playLock();
    const { matrix, x, y, color } = this.currentPiece;
    this.minoCount++;

    const placedCoords: [number, number][] = [];

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
            placedCoords.push([targetY, targetX]);

            // 星(★)を回収(スピーディなプレイを促すためスコアを控えめに調整)
            if (this.grid[targetY][targetX].type === "star") {
              sounds.playItemGet();
              this.bonusStars++;
              this.score += SCORE_CONFIG.STAR_COLLECT;
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
    this.score += SCORE_CONFIG.PLACED_MINO;

    // 回路接続の再計算（STARTからBFS探索）
    this.recalculateCircuit();

    // 障害物接触判定：
    // 「障害物に触れる、かつイティエルのいるミノ群に触れていない、時にライフdown&ミノ破壊」
    // 1. 今回置かれたミノのセルのいずれかが障害物（obstacle）と上下左右4近傍で隣接しているか
    const dirs = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];
    let touchesObstacle = false;
    for (const [pr, pc] of placedCoords) {
      for (const [dr, dc] of dirs) {
        const nr = pr + dr;
        const nc = pc + dc;
        if (nr >= 0 && nr < GRID_HEIGHT && nc >= 0 && nc < GRID_WIDTH) {
          if (this.grid[nr][nc].type === "obstacle") {
            touchesObstacle = true;
            break;
          }
        }
      }
      if (touchesObstacle) break;
    }

    // 2. 「イティエルのいるミノ群に触れていない」
    // 回路再計算後、STARTから繋がったミノ群（イティエルがいる回路）は isConnected === true になっている
    const isConnectedToCircuit = placedCoords.some(
      ([pr, pc]) => this.grid[pr][pc].isConnected,
    );

    if (touchesObstacle && !isConnectedToCircuit) {
      // トゲ障害物トラップ発動！
      sounds.playSpikeTrap();
      this.takeDamage("トゲ障害物に接触してミノが破壊されました！");

      // 破壊エフェクト登録 & グリッドから消去
      for (const [pr, pc] of placedCoords) {
        this.spikeHitEffects.push({
          x: pc + 0.5,
          y: pr + 0.5,
          color: color,
          createdAt: performance.now(),
        });
        this.grid[pr][pc] = { type: "empty" };
      }

      // 破壊されたため回路を再計算
      this.recalculateCircuit();
    }

    // イティミノ群がゴール地点の高さに達したタイミングで新規ミノの出現を停止する
    if (!this.isGoalPending) {
      this.spawnNextPiece();
    }
  }

  // STARTから繋がる回路の再計算
  private recalculateCircuit() {
    const result = recalculateCircuit(
      this.grid,
      this.characterPos,
      this.gameMode,
    );

    this.connectedPath = result.connectedPath;
    this.circuitRoute = result.circuitRoute;
    this.waypoints = result.waypoints;
    this.isGoalPending = result.isGoalPending;
    this.isBonusGoal = result.isBonusGoal;

    if (result.targetPos) {
      this.characterPos.targetX = result.targetPos.x;
      this.characterPos.targetY = result.targetPos.y;
    } else {
      this.characterPos.isClimbing = false;
    }
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

  public rotate(clockwise = true) {
    if (this.status !== "playing" || !this.currentPiece) return;
    const result = tryRotate(this.currentPiece, this.grid, clockwise);
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
      this.score += SCORE_CONFIG.SOFT_DROP_PER_ROW;
      sounds.playMove();
      // 下に移動した直後の接地判定
      if (!checkCollision(this.currentPiece, this.grid, 0, 1)) {
        this.isLocking = false;
        this.lockDelayTimerMs = 0;
      } else {
        this.isLocking = true;
      }
    } else {
      this.isLocking = true;
    }
  }

  public hardDrop() {
    if (this.status !== "playing" || !this.currentPiece) return;
    const ghostY = calculateGhostY(this.currentPiece, this.grid);
    this.score +=
      (ghostY - this.currentPiece.y) * SCORE_CONFIG.HARD_DROP_PER_ROW;
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

    // イティエルの現在位置または操作ミノの周囲2マス（3x3マス）を破壊
    const cx = this.currentPiece
      ? this.currentPiece.x + 1
      : Math.round(this.characterPos.x);
    const cy = this.currentPiece
      ? this.currentPiece.y + 1
      : Math.round(this.characterPos.y);

    const brokenBlocks: { x: number; y: number; color: string }[] = [];

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
          const cell = this.grid[tr][tc];
          if (
            cell.type === "obstacle" ||
            cell.type === "placed" ||
            cell.isInfected
          ) {
            const oldColor =
              cell.color ||
              (cell.type === "obstacle" ? "#ff1a4b" : "#00f0ff");
            brokenBlocks.push({ x: tc, y: tr, color: oldColor });
            this.grid[tr][tc] = {
              type: "glitched",
              color: oldColor,
              glitchSeed: Math.random() * 100,
            };
            this.score += SCORE_CONFIG.BOMB_BREAK_PER_BLOCK;
          }
        }
      }
    }

    // 鮮烈なサイバー大爆発エフェクトを登録（衝撃波＋破片パーティクル）
    this.bombExplosionEffects.push({
      x: cx,
      y: cy,
      brokenBlocks,
      createdAt: performance.now(),
    });

    this.recalculateCircuit();
    // ★ボム使用時に残数カウントおよびスコアを即座にUIへ反映
    this.updateStats();
  }

  private resetLockDelay() {
    if (!this.currentPiece) return;
    const isGrounded = checkCollision(this.currentPiece, this.grid, 0, 1);
    if (!isGrounded) {
      // 横移動や回転で空中に抜け出た場合はロック状態を解除
      this.isLocking = false;
      this.lockDelayTimerMs = 0;
    } else if (this.isLocking) {
      // 接地継続中の場合はロック猶予時間をリセット
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
      gameMode: this.gameMode,
      climbedHeight: this.climbedHeight,
    };
    this.callbacks.onStatsChange(stats);
  }

  private triggerStageClear(isBonusClear: boolean) {
    this.status = "cleared";
    sounds.playClear();

    const scoreResult = calculateStageClearScore({
      baseScore: this.score,
      isBonusClear,
      elapsedTimeMs: this.elapsedTimeMs,
      minoCount: this.minoCount,
      bonusStars: this.bonusStars,
      hearts: this.hearts,
    });

    this.score = scoreResult.finalScore;
    this.timePenalty = scoreResult.timePenalty;
    this.minoBonus = scoreResult.minoBonus;

    const clearSec = Math.floor(this.elapsedTimeMs / 1000);
    const stats: GameStats = {
      score: this.score,
      clearTimeSeconds: clearSec,
      clearTimeMs: this.elapsedTimeMs,
      minoCount: this.minoCount,
      bonusStars: this.bonusStars,
      totalStars: this.totalStars,
      stageNumber: this.stage.id,
      bestScore: Math.max(this.bestScore, this.score),
      timePenalty: this.timePenalty,
      minoBonus: this.minoBonus,
      gameMode: this.gameMode,
      climbedHeight: this.climbedHeight,
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
      gameMode: this.gameMode,
      climbedHeight: this.climbedHeight,
    };
    this.callbacks.onStatusChange(this.status);
    this.callbacks.onGameOver(reason, stats);
  }
}
