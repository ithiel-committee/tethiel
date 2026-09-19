import { useEffect, useRef } from "react";
import {
  BONUS_GOAL_COLS,
  COLORS,
  GOAL_ROW,
  GRID_HEIGHT,
  GRID_WIDTH,
  START_COLS,
  START_ROW,
} from "../game/constants";
import type { GameEngine } from "../game/engine";
import { calculateGhostY } from "../game/tetromino";

interface GameCanvasProps {
  engine: GameEngine;
}

const BLOCK_SIZE = 25;
const CANVAS_WIDTH = GRID_WIDTH * BLOCK_SIZE; // 300px
const CANVAS_HEIGHT = GRID_HEIGHT * BLOCK_SIZE; // 550px

export const GameCanvas = ({ engine }: GameCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;

    const render = (time: number) => {
      engine.update(time);

      // 1. 背景描画
      ctx.fillStyle = COLORS.fieldBg;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // 2. グリッド線（PDFのストライプ・方眼模様）
      ctx.strokeStyle = COLORS.gridLine;
      ctx.lineWidth = 1;
      for (let c = 0; c <= GRID_WIDTH; c++) {
        // 市松模様の縦ストライプ背景
        if (c % 2 === 0) {
          ctx.fillStyle = "rgba(0, 240, 255, 0.02)";
          ctx.fillRect(c * BLOCK_SIZE, 0, BLOCK_SIZE, CANVAS_HEIGHT);
        }
        ctx.beginPath();
        ctx.moveTo(c * BLOCK_SIZE, 0);
        ctx.lineTo(c * BLOCK_SIZE, CANVAS_HEIGHT);
        ctx.stroke();
      }
      for (let r = 0; r <= GRID_HEIGHT; r++) {
        ctx.beginPath();
        ctx.moveTo(0, r * BLOCK_SIZE);
        ctx.lineTo(CANVAS_WIDTH, r * BLOCK_SIZE);
        ctx.stroke();
      }

      // 3. 上部ミノ落下ゾーン表示（矢印マーク「ミノ上から」）
      ctx.fillStyle = "rgba(255, 100, 150, 0.5)";
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.textAlign = "center";
      ctx.fillText("↓ ミノ上から ↓", CANVAS_WIDTH / 2, 16);

      // 4. GOALライン描画（行2）
      const goalY = GOAL_ROW * BLOCK_SIZE;
      // 通常GOALエリア
      ctx.fillStyle = "rgba(0, 229, 255, 0.85)";
      ctx.fillRect(
        0,
        goalY,
        (GRID_WIDTH - BONUS_GOAL_COLS.length) * BLOCK_SIZE,
        BLOCK_SIZE,
      );
      ctx.fillStyle = "#020617";
      ctx.font = '10px "Silkscreen", monospace';
      ctx.textAlign = "center";
      ctx.fillText(
        "G  O  A  L",
        ((GRID_WIDTH - BONUS_GOAL_COLS.length) * BLOCK_SIZE) / 2,
        goalY + 17,
      );

      // BONUSエリア（右端2マス）
      const bonusStartX =
        (GRID_WIDTH - BONUS_GOAL_COLS.length) * BLOCK_SIZE;
      ctx.fillStyle = "rgba(255, 0, 127, 0.9)";
      ctx.fillRect(
        bonusStartX,
        goalY,
        BONUS_GOAL_COLS.length * BLOCK_SIZE,
        BLOCK_SIZE,
      );
      ctx.fillStyle = "#ffffff";
      ctx.font = '8px "Silkscreen", monospace';
      ctx.fillText(
        "BONUS",
        bonusStartX + (BONUS_GOAL_COLS.length * BLOCK_SIZE) / 2,
        goalY + 16,
      );

      // 5. スタート台座（立っている位置にミノと同質の白いブロックを配置）
      const startY = START_ROW * BLOCK_SIZE;
      for (const col of START_COLS) {
        drawMinoBlock(
          ctx,
          col * BLOCK_SIZE,
          startY,
          "#ffffff",
          false,
          false,
          time,
        );
      }

      // 6. フィールドセル描画（設置ミノ、障害物、星）
      for (let r = 0; r < GRID_HEIGHT; r++) {
        for (let c = 0; c < GRID_WIDTH; c++) {
          const cell = engine.grid[r][c];
          const px = c * BLOCK_SIZE;
          const py = r * BLOCK_SIZE;

          if (cell.type === "placed" && cell.color) {
            drawMinoBlock(
              ctx,
              px,
              py,
              cell.color,
              cell.isInfected ?? false,
              cell.isTopCircuit ?? false,
              time,
            );
          } else if (cell.type === "obstacle") {
            drawObstacleBlock(ctx, px, py);
          } else if (cell.type === "star") {
            drawStarItem(ctx, px, py, time);
          } else if (cell.type === "glitched") {
            drawGlitchedBlock(
              ctx,
              px,
              py,
              cell.color || "#00f0ff",
              time,
              cell.glitchSeed ?? 0,
            );
          }
        }
      }

      // 7. 回路パス（通電ライン）の描画（キャラクターの移動ルートに合わせる）
      if (engine.circuitRoute.length > 0) {
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 3;
        ctx.shadowColor = "#00ffff";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        const [firstR, firstC] = engine.circuitRoute[0];
        ctx.moveTo(
          firstC * BLOCK_SIZE + BLOCK_SIZE / 2,
          firstR * BLOCK_SIZE + BLOCK_SIZE / 2,
        );
        for (let i = 1; i < engine.circuitRoute.length; i++) {
          const [r, c] = engine.circuitRoute[i];
          ctx.lineTo(
            c * BLOCK_SIZE + BLOCK_SIZE / 2,
            r * BLOCK_SIZE + BLOCK_SIZE / 2,
          );
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // 8. ゴーストミノ描画
      if (engine.currentPiece && engine.status === "playing") {
        const ghostY = calculateGhostY(engine.currentPiece, engine.grid);
        const { matrix, x, color } = engine.currentPiece;

        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        for (let r = 0; r < matrix.length; r++) {
          for (let c = 0; c < matrix[r].length; c++) {
            if (matrix[r][c] !== 0) {
              const gx = (x + c) * BLOCK_SIZE;
              const gy = (ghostY + r) * BLOCK_SIZE;
              ctx.strokeRect(
                gx + 1,
                gy + 1,
                BLOCK_SIZE - 2,
                BLOCK_SIZE - 2,
              );
            }
          }
        }
        ctx.setLineDash([]);
      }

      // 9. 現在操作中の落下ミノ描画
      if (engine.currentPiece && engine.status === "playing") {
        const { matrix, x, y, color } = engine.currentPiece;
        for (let r = 0; r < matrix.length; r++) {
          for (let c = 0; c < matrix[r].length; c++) {
            if (matrix[r][c] !== 0) {
              const px = (x + c) * BLOCK_SIZE;
              const py = (y + r) * BLOCK_SIZE;
              drawMinoBlock(ctx, px, py, color, false, false, time);
            }
          }
        }
      }

      // 10. イティエル（登るキャラクター）の描画
      drawIthielCharacter(
        ctx,
        engine.characterPos.x * BLOCK_SIZE,
        engine.characterPos.y * BLOCK_SIZE,
        time,
        engine.characterPos.isClimbing,
      );

      // 10.5 ゴール到達時のセレブレーション演出（キャラクターが到着した瞬間に発動）
      if (engine.isGoalCelebration) {
        const cx = engine.characterPos.x * BLOCK_SIZE;
        const cy = engine.characterPos.y * BLOCK_SIZE;

        // ゴール到達時の光る放射オーラ
        const auraRadius = 24 + Math.sin(time / 80) * 6;
        const grad = ctx.createRadialGradient(cx, cy, 4, cx, cy, auraRadius);
        grad.addColorStop(0, "rgba(255, 230, 0, 0.9)");
        grad.addColorStop(0.5, "rgba(0, 240, 255, 0.6)");
        grad.addColorStop(1, "rgba(0, 240, 255, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, auraRadius, 0, Math.PI * 2);
        ctx.fill();

        // 頭上に浮かぶ「GOAL!!」テキスト
        ctx.save();
        ctx.shadowColor = engine.isBonusGoal ? "#ff007f" : "#ffdd00";
        ctx.shadowBlur = 12;
        ctx.fillStyle = engine.isBonusGoal ? "#ff007f" : "#ffe600";
        ctx.font = '12px "Silkscreen", monospace';
        ctx.textAlign = "center";
        ctx.fillText(
          engine.isBonusGoal ? "★ BONUS GOAL! ★" : "★ GOAL! ★",
          cx,
          cy - 22,
        );
        ctx.restore();
      }

      // 11. 一時停止画面
      if (engine.status === "paused") {
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.fillStyle = "#00f0ff";
        ctx.font = '16px "Silkscreen", monospace';
        ctx.textAlign = "center";
        ctx.fillText("PAUSED", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      }

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationId);
  }, [engine]);

  return (
    <div className="relative inline-block border-2 border-cyan-500/50 rounded-lg p-1 bg-slate-950/90 shadow-[0_0_25px_rgba(0,240,255,0.2)]">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="rounded block"
      />
    </div>
  );
};

// ミノブロックの描画（通常・感染・最上部発光）
function drawMinoBlock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  isInfected: boolean,
  isTopCircuit: boolean,
  time: number,
) {
  if (isInfected) {
    // 時間経過で下から黒く変化したウイルス感染ブロック
    ctx.fillStyle = "#0f111a";
    ctx.fillRect(x + 1, y + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);

    // 赤く脈動するウイルス浸食枠
    const pulse = 0.5 + Math.sin(time / 150) * 0.5;
    ctx.strokeStyle = `rgba(255, 0, 60, ${pulse})`;
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 2, y + 2, BLOCK_SIZE - 4, BLOCK_SIZE - 4);
    return;
  }

  if (isTopCircuit) {
    // 積み上げている最上部のミノを白く光らせる（PDF 6p）
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "#ffffff";
    ctx.shadowBlur = 12;
    ctx.fillRect(x + 1, y + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
    ctx.shadowBlur = 0;

    ctx.strokeStyle = "#00ffff";
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, y + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
    return;
  }

  // 通常ミノ
  ctx.fillStyle = color;
  ctx.fillRect(x + 1, y + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);

  // 回路風ハイライト
  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  ctx.fillRect(x + 2, y + 2, BLOCK_SIZE - 4, 2);
  ctx.fillRect(x + 2, y + 2, 2, BLOCK_SIZE - 4);

  ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 1, y + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
}

// 障害物ブロックの描画
function drawObstacleBlock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
) {
  ctx.fillStyle = "#334155";
  ctx.fillRect(x + 1, y + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);

  ctx.strokeStyle = "#64748b";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x + 3, y + BLOCK_SIZE - 3);
  ctx.lineTo(x + BLOCK_SIZE - 3, y + 3);
  ctx.stroke();

  ctx.strokeStyle = "#94a3b8";
  ctx.strokeRect(x + 1, y + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
}

// グリッチ状態のブロック描画（消えるのではなく実態を残したまま数msおきに激しくグリッチ）
function drawGlitchedBlock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  baseColor: string,
  time: number,
  seed: number,
) {
  // 数ms（約45ms）おきにグリッチのフレームを切り替える
  const glitchFrame = Math.floor(time / 45 + seed * 19);
  const isJitter = glitchFrame % 2 === 0;

  // 基本の実態（半透明のサイバーノイズベース）
  ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
  ctx.fillRect(x + 1, y + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);

  // スライスごとの横ズレグリッチ（3分割）
  const sliceCount = 3;
  const sliceH = (BLOCK_SIZE - 2) / sliceCount;

  for (let i = 0; i < sliceCount; i++) {
    const sliceY = y + 1 + i * sliceH;
    // スライスごとの擬似ランダムズレ（-4px 〜 +4px）
    const shift = isJitter ? (((glitchFrame * (i + 1) * 7) % 9) - 4) : 0;

    // 赤色（マゼンタ）色ズレ（RGB split）
    ctx.fillStyle = "rgba(255, 0, 85, 0.6)";
    ctx.fillRect(x + 1 + shift + 1.5, sliceY, BLOCK_SIZE - 2, sliceH);

    // シアン色ズレ（RGB split）
    ctx.fillStyle = "rgba(0, 240, 255, 0.6)";
    ctx.fillRect(x + 1 + shift - 1.5, sliceY, BLOCK_SIZE - 2, sliceH);

    // 元ブロックの色のグリッチコア
    ctx.fillStyle = baseColor;
    ctx.globalAlpha = 0.45;
    ctx.fillRect(x + 1 + shift, sliceY, BLOCK_SIZE - 2, sliceH);
    ctx.globalAlpha = 1.0;
  }

  // デジタル走査線・ノイズバー
  if (isJitter) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    const lineY = y + 1 + ((glitchFrame * 11) % (BLOCK_SIZE - 4));
    ctx.fillRect(x + 1, lineY, BLOCK_SIZE - 2, 1.5);
  }

  // グリッチした崩れ枠線
  ctx.strokeStyle = isJitter ? "#00ffff" : "rgba(255, 0, 85, 0.8)";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(
    x + 1 + (isJitter ? ((glitchFrame % 5) - 2) : 0),
    y + 1,
    BLOCK_SIZE - 2,
    BLOCK_SIZE - 2,
  );
}

// 星（★）ボーナスアイテムの描画
function drawStarItem(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
) {
  const bobbing = Math.sin(time / 200) * 2;
  const cx = x + BLOCK_SIZE / 2;
  const cy = y + BLOCK_SIZE / 2 + bobbing;

  ctx.fillStyle = "#ffdd00";
  ctx.shadowColor = "#ffdd00";
  ctx.shadowBlur = 8;
  ctx.font = '14px "Silkscreen", monospace';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("★", cx, cy);
  ctx.shadowBlur = 0;
}

// イティエルのミニドットキャラ描画（無機質な白い人形シルエット）
function drawIthielCharacter(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  time: number,
  isClimbing: boolean,
) {
  const bobbing = isClimbing
    ? Math.sin(time / 80) * 3
    : Math.sin(time / 300) * 1.5;
  const cx = px;
  const cy = py - 6 + bobbing;

  // 足場の光るオーラ
  ctx.fillStyle = "rgba(0, 255, 200, 0.4)";
  ctx.beginPath();
  ctx.ellipse(cx, cy + 12, 10, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // 無機質な白い人形シルエット (ドット調)
  ctx.fillStyle = "#ffffff";
  // 頭 (6x6)
  ctx.fillRect(cx - 3, cy - 5, 6, 6);
  // 首・肩・胴体 (8x8)
  ctx.fillRect(cx - 4, cy + 2, 8, 8);
  // 足 (左右)
  ctx.fillRect(cx - 3, cy + 10, 2, 3);
  ctx.fillRect(cx + 1, cy + 10, 2, 3);

  // 頭上のネームラベル「イティエル」
  ctx.fillStyle = "#ffffff";
  ctx.font = '9px "DotGothic16", monospace';
  ctx.textAlign = "center";
  ctx.fillText("イティエル", cx, cy - 10);
}
