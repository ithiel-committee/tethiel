import { sounds } from "../audio/soundSystem";
import type {
  Cell,
  GameStats,
  GameStatus,
  SkillType,
  StageData,
  Tetromino,
  TetrominoType,
} from "../types/game";
import { GOAL_ROW, GRID_HEIGHT, GRID_WIDTH } from "./constants";
import {
  TetrominoBag,
  calculateGhostY,
  checkCollision,
  createTetromino,
  tryRotate,
} from "./tetromino";

export interface BombEffect {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  progress: number;
}

export interface EngineCallbacks {
  onStatusChange: (status: GameStatus) => void;
  onStatsChange: (stats: GameStats) => void;
  onHpChange: (hp: number) => void;
  onVirusRowChange: (row: number) => void;
  onSkillsChange: (skills: SkillType[]) => void;
  onHoldChange: (hold: TetrominoType | null) => void;
  onNextChange: (next: TetrominoType[]) => void;
  onStageClear: (stats: GameStats) => void;
  onGameOver: (reason: string, stats: GameStats) => void;
}

export class GameEngine {
  public grid: Cell[][] = [];
  public currentPiece: Tetromino | null = null;
  public holdPiece: TetrominoType | null = null;
  public canHold = true;
  public nextPieces: TetrominoType[] = [];
  public skills: SkillType[] = [];

  public hp = 100;
  public maxHp = 100;
  // ウイルス侵食ライン (行インデックス。20から始まり、0へ向かって上昇)
  public virusRow: number = GRID_HEIGHT;
  public virusFreezeTimerMs = 0;

  public status: GameStatus = "ready";
  public stage: StageData;
  public callbacks: EngineCallbacks;

  private bag: TetrominoBag;
  private lastFrameTime = 0;
  private dropTimerMs = 0;
  private dropIntervalMs = 900; // 通常落下間隔
  private lockDelayTimerMs = 0;
  private isLocking = false;
  private alertSoundTimer = 0;

  // 統計
  public score = 0;
  public linesConnected = 0;
  public itemsCollected = 0;
  public startTimeMs = 0;
  public elapsedTimeMs = 0;

  // 爆発エフェクト演出用
  public activeBombs: BombEffect[] = [];

  constructor(stage: StageData, callbacks: EngineCallbacks) {
    this.stage = stage;
    this.callbacks = callbacks;
    this.bag = new TetrominoBag();
    this.initGrid();
  }

  // グリッドの初期化
  public initGrid() {
    this.grid = [];
    for (let r = 0; r < GRID_HEIGHT; r++) {
      this.grid[r] = [];
      for (let c = 0; c < GRID_WIDTH; c++) {
        this.grid[r][c] = { type: "empty" };
      }
    }

    // ステージ障害物の配置
    for (const [r, c] of this.stage.initialObstacles) {
      if (r >= 0 && r < GRID_HEIGHT && c >= 0 && c < GRID_WIDTH) {
        this.grid[r][c] = { type: "obstacle" };
      }
    }

    // ステージアイテム（スキルカプセル）の配置
    for (const item of this.stage.initialItems) {
      const [r, c] = item.pos;
      if (r >= 0 && r < GRID_HEIGHT && c >= 0 && c < GRID_WIDTH) {
        this.grid[r][c] = { type: "item", itemType: item.skill };
      }
    }

    this.virusRow = GRID_HEIGHT;
    this.hp = 100;
    this.score = 0;
    this.linesConnected = 0;
    this.itemsCollected = 0;
    this.skills = [];
    this.holdPiece = null;
    this.canHold = true;
    this.virusFreezeTimerMs = 0;
    this.activeBombs = [];
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
    this.callbacks.onHpChange(this.hp);
    this.callbacks.onVirusRowChange(this.virusRow);
    this.callbacks.onSkillsChange(this.skills);
    this.callbacks.onHoldChange(this.holdPiece);
    this.callbacks.onNextChange(this.nextPieces);
    this.updateStats();
  }

  // 一時停止切り替え
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

  // 新しいミノを出現させる
  private spawnNextPiece() {
    const nextType = this.bag.getNext();
    this.currentPiece = createTetromino(nextType);
    this.nextPieces = this.bag.peek(3);
    this.canHold = true;
    this.isLocking = false;
    this.lockDelayTimerMs = 0;
    this.dropTimerMs = 0;

    // 出現時に既に衝突している場合＝窒息ゲームオーバー
    if (checkCollision(this.currentPiece, this.grid)) {
      this.triggerGameOver("回路の閉塞：ミノの出現口が塞がれました！");
      return;
    }

    this.callbacks.onNextChange(this.nextPieces);
  }

  // メインゲームループ更新（60fps requestAnimationFrameから呼ばれる）
  public update(now: number) {
    if (this.status !== "playing") return;

    const deltaMs = Math.min(now - this.lastFrameTime, 100); // 極端なラグ防止
    this.lastFrameTime = now;
    this.elapsedTimeMs = now - this.startTimeMs;

    // 1. ウイルスのフリーズタイマーまたは上昇処理
    if (this.virusFreezeTimerMs > 0) {
      this.virusFreezeTimerMs -= deltaMs;
    } else {
      // 一定間隔で1マス上昇
      const speed = 1 / (this.stage.virusRiseIntervalMs / deltaMs);
      this.virusRow = Math.max(0, this.virusRow - speed);
    }
    this.callbacks.onVirusRowChange(this.virusRow);

    // 2. ウイルス侵食エリア内のミノによるライフ減少
    let submergedBlocks = 0;
    const virusLineFloor = Math.floor(this.virusRow);
    for (let r = virusLineFloor; r < GRID_HEIGHT; r++) {
      for (let c = 0; c < GRID_WIDTH; c++) {
        if (this.grid[r][c].type === "placed") {
          submergedBlocks++;
        }
      }
    }

    // 侵食エリア内にブロックがあればHP減少
    if (submergedBlocks > 0) {
      const damage =
        (this.stage.damagePerSecondInVirus / 1000) *
        deltaMs *
        (1 + submergedBlocks * 0.05);
      this.hp = Math.max(0, this.hp - damage);
      this.callbacks.onHpChange(this.hp);

      // アラート音（1秒間隔）
      this.alertSoundTimer += deltaMs;
      if (this.alertSoundTimer > 1000) {
        sounds.playAlert();
        this.alertSoundTimer = 0;
      }
    } else {
      this.alertSoundTimer = 0;
    }

    // HPゼロでゲームオーバー
    if (this.hp <= 0) {
      this.triggerGameOver("ウイルス侵食：システムのライフが尽きました！");
      return;
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
          // 接地中
          this.isLocking = true;
        }
      }

      // 接地後のロックディレイ（約500ms猶予）
      if (this.isLocking) {
        this.lockDelayTimerMs += deltaMs;
        if (this.lockDelayTimerMs >= 500) {
          this.lockPiece();
        }
      }
    }

    // 4. 爆発エフェクトの更新
    for (let i = this.activeBombs.length - 1; i >= 0; i--) {
      const bomb = this.activeBombs[i];
      bomb.progress += deltaMs / 400; // 400msのアニメーション
      bomb.radius = bomb.maxRadius * bomb.progress;
      if (bomb.progress >= 1) {
        this.activeBombs.splice(i, 1);
      }
    }

    this.updateStats();
  }

  // ミノをグリッドに固定する
  private lockPiece() {
    if (!this.currentPiece) return;

    sounds.playLock();
    const { matrix, x, y, color } = this.currentPiece;
    let reachedGoal = false;

    // グリッドへの書き込み & アイテム取得判定
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
            // アイテムの上に重ねた（接続した）場合
            if (this.grid[targetY][targetX].type === "item") {
              const itemType =
                this.grid[targetY][targetX].itemType || "bomb";
              this.collectItem(itemType);
            }

            this.grid[targetY][targetX] = {
              type: "placed",
              color: color,
            };

            // ゴールライン判定（最上部到達）
            if (targetY <= GOAL_ROW) {
              reachedGoal = true;
            }
          }
        }
      }
    }

    this.currentPiece = null;
    this.score += 20;

    // 回路フル接続（ライン揃え）の判定（消去はせずボーナス発動）
    this.checkLineBonuses();

    // ゴール到達判定
    if (reachedGoal) {
      this.triggerStageClear();
      return;
    }

    // 次のミノを出現
    this.spawnNextPiece();
  }

  // アイテム回収
  private collectItem(type: SkillType) {
    sounds.playItemGet();
    this.itemsCollected++;
    this.score += 150;

    // スキルスロットに追加（最大3個）
    if (this.skills.length < 3) {
      this.skills.push(type);
      this.callbacks.onSkillsChange([...this.skills]);
    }
  }

  // 横1列フル接続（ライン揃えボーナス）
  private checkLineBonuses() {
    let connectedLines = 0;

    for (let r = 0; r < GRID_HEIGHT; r++) {
      let isFull = true;
      for (let c = 0; c < GRID_WIDTH; c++) {
        const cellType = this.grid[r][c].type;
        if (cellType !== "placed" && cellType !== "glowing") {
          isFull = false;
          break;
        }
      }

      if (isFull) {
        // 初めて揃ったラインを通電状態（glowing）にする
        let isNewLine = false;
        for (let c = 0; c < GRID_WIDTH; c++) {
          if (this.grid[r][c].type === "placed") {
            this.grid[r][c].type = "glowing";
            this.grid[r][c].isGlow = true;
            isNewLine = true;
          }
        }
        if (isNewLine) {
          connectedLines++;
        }
      }
    }

    if (connectedLines > 0) {
      sounds.playLineBonus();
      this.linesConnected += connectedLines;
      this.score += connectedLines * 300;

      // ウイルス一時フリーズ（1ラインにつき3.5秒）
      this.virusFreezeTimerMs += connectedLines * 3500;

      // HP微回復 (+15% × ライン数)
      this.hp = Math.min(this.maxHp, this.hp + connectedLines * 15);
      this.callbacks.onHpChange(this.hp);
    }
  }

  // スキル発動
  public useSkill(index: number) {
    if (index < 0 || index >= this.skills.length) return;
    const skill = this.skills[index];
    this.skills.splice(index, 1);
    this.callbacks.onSkillsChange([...this.skills]);

    if (skill === "bomb") {
      this.executeBomb();
    } else if (skill === "freeze") {
      sounds.playItemGet();
      this.virusFreezeTimerMs += 6000; // 6秒停止
    } else if (skill === "heal") {
      sounds.playItemGet();
      this.hp = Math.min(this.maxHp, this.hp + 40);
      this.callbacks.onHpChange(this.hp);
    }
  }

  // ボムスキル実行：現在操作中ミノの周囲3x3マスの障害物とブロックを消去
  private executeBomb() {
    sounds.playBomb();

    let centerX = 5;
    let centerY = 10;
    if (this.currentPiece) {
      centerX =
        this.currentPiece.x +
        Math.floor(this.currentPiece.matrix[0].length / 2);
      centerY =
        this.currentPiece.y +
        Math.floor(this.currentPiece.matrix.length / 2);
    }

    // 爆発エフェクト追加
    this.activeBombs.push({
      x: centerX,
      y: centerY,
      radius: 0,
      maxRadius: 3.5,
      progress: 0,
    });

    // 周囲3x3（-1〜+1）の範囲を破壊
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const targetR = centerY + dr;
        const targetC = centerX + dc;
        if (
          targetR >= 0 &&
          targetR < GRID_HEIGHT &&
          targetC >= 0 &&
          targetC < GRID_WIDTH
        ) {
          if (
            this.grid[targetR][targetC].type === "obstacle" ||
            this.grid[targetR][targetC].type === "placed" ||
            this.grid[targetR][targetC].type === "glowing"
          ) {
            this.grid[targetR][targetC] = { type: "empty" };
            this.score += 50;
          }
        }
      }
    }

    // ボム発動後、ミノが空中に浮いて落下可能になったかチェック
    this.isLocking = false;
    this.lockDelayTimerMs = 0;
  }

  // 操作：左移動
  public moveLeft() {
    if (this.status !== "playing" || !this.currentPiece) return;
    if (!checkCollision(this.currentPiece, this.grid, -1, 0)) {
      this.currentPiece.x--;
      sounds.playMove();
      this.resetLockDelay();
    }
  }

  // 操作：右移動
  public moveRight() {
    if (this.status !== "playing" || !this.currentPiece) return;
    if (!checkCollision(this.currentPiece, this.grid, 1, 0)) {
      this.currentPiece.x++;
      sounds.playMove();
      this.resetLockDelay();
    }
  }

  // 操作：回転
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

  // 操作：ソフトドロップ
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

  // 操作：ハードドロップ
  public hardDrop() {
    if (this.status !== "playing" || !this.currentPiece) return;
    const ghostY = calculateGhostY(this.currentPiece, this.grid);
    const dropDistance = ghostY - this.currentPiece.y;
    this.score += dropDistance * 2;
    this.currentPiece.y = ghostY;
    sounds.playHardDrop();
    this.lockPiece();
  }

  // 操作：ホールド
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

  private resetLockDelay() {
    if (this.isLocking) {
      this.lockDelayTimerMs = 0;
    }
  }

  // 最高到達点を計算
  private getHighestRow(): number {
    for (let r = 0; r < GRID_HEIGHT; r++) {
      for (let c = 0; c < GRID_WIDTH; c++) {
        if (
          this.grid[r][c].type === "placed" ||
          this.grid[r][c].type === "glowing"
        ) {
          return r;
        }
      }
    }
    return GRID_HEIGHT;
  }

  private updateStats() {
    const stats: GameStats = {
      score: this.score,
      linesConnected: this.linesConnected,
      itemsCollected: this.itemsCollected,
      clearTimeSeconds: Math.floor(this.elapsedTimeMs / 1000),
      highestRow: this.getHighestRow(),
    };
    this.callbacks.onStatsChange(stats);
  }

  private triggerStageClear() {
    this.status = "cleared";
    sounds.playClear();
    const stats: GameStats = {
      score: this.score + Math.floor(this.hp) * 10,
      linesConnected: this.linesConnected,
      itemsCollected: this.itemsCollected,
      clearTimeSeconds: Math.floor(this.elapsedTimeMs / 1000),
      highestRow: this.getHighestRow(),
    };
    this.callbacks.onStatusChange(this.status);
    this.callbacks.onStageClear(stats);
  }

  private triggerGameOver(reason: string) {
    this.status = "gameover";
    sounds.playGameOver();
    const stats: GameStats = {
      score: this.score,
      linesConnected: this.linesConnected,
      itemsCollected: this.itemsCollected,
      clearTimeSeconds: Math.floor(this.elapsedTimeMs / 1000),
      highestRow: this.getHighestRow(),
    };
    this.callbacks.onStatusChange(this.status);
    this.callbacks.onGameOver(reason, stats);
  }
}
