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
      ctx.font = '10px "Press Start 2P", monospace';
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
      ctx.font = '7px "Press Start 2P", monospace';
      ctx.fillText(
        "BONUS",
        bonusStartX + (BONUS_GOAL_COLS.length * BLOCK_SIZE) / 2,
        goalY + 16,
      );

      // 5. 最下部 START ライン描画（行21）
      const startY = START_ROW * BLOCK_SIZE;
      ctx.fillStyle = "rgba(0, 255, 136, 0.85)";
      ctx.fillRect(0, startY, CANVAS_WIDTH, BLOCK_SIZE);
      ctx.fillStyle = "#020617";
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.textAlign = "center";
      ctx.fillText("S  T  A  R  T", CANVAS_WIDTH / 2, startY + 17);

      // START接続口の枠マーク（列5〜6）
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        START_COLS[0] * BLOCK_SIZE,
        startY,
        START_COLS.length * BLOCK_SIZE,
        BLOCK_SIZE,
      );

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
          }
        }
      }

      // 7. 回路パス（通電ライン）の描画
      if (engine.connectedPath.length > 0) {
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 3;
        ctx.shadowColor = "#00ffff";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        // START中央から開始
        ctx.moveTo(
          (START_COLS[0] + 1) * BLOCK_SIZE,
          START_ROW * BLOCK_SIZE + BLOCK_SIZE / 2,
        );
        for (const [r, c] of engine.connectedPath) {
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

      // 11. 一時停止画面
      if (engine.status === "paused") {
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.fillStyle = "#00f0ff";
        ctx.font = '16px "Press Start 2P", monospace';
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
  ctx.font = '14px "Press Start 2P", monospace';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("★", cx, cy);
  ctx.shadowBlur = 0;
}

// イティエルのミニドットキャラ描画
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

  // イティエルドットミニキャラ（黒髪・赤いアクセント・制服）
  // 髪（黒）
  ctx.fillStyle = "#1e293b";
  ctx.fillRect(cx - 6, cy - 8, 12, 10);
  // 赤いアクセント（メッシュ）
  ctx.fillStyle = "#ff2a6d";
  ctx.fillRect(cx + 2, cy - 6, 3, 8);
  // 顔（肌色）
  ctx.fillStyle = "#fde047";
  ctx.fillRect(cx - 4, cy - 4, 8, 7);
  // 目（つぶらな瞳）
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(cx - 3, cy - 2, 2, 2);
  ctx.fillRect(cx + 1, cy - 2, 2, 2);
  // 制服（ジャケット＋赤タイ）
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(cx - 5, cy + 3, 10, 8);
  ctx.fillStyle = "#ef4444";
  ctx.fillRect(cx - 1, cy + 4, 2, 5);

  // 頭上のネームラベル「ITHIEL」
  ctx.fillStyle = "#00ffff";
  ctx.font = '6px "Press Start 2P", monospace';
  ctx.textAlign = "center";
  ctx.fillText("iTL", cx, cy - 12);
}
