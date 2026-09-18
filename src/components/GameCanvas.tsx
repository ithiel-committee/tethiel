import { useEffect, useRef } from "react";
import {
  COLORS,
  GOAL_ROW,
  GRID_HEIGHT,
  GRID_WIDTH,
} from "../game/constants";
import type { GameEngine } from "../game/engine";
import { calculateGhostY } from "../game/tetromino";

interface GameCanvasProps {
  engine: GameEngine;
}

const BLOCK_SIZE = 28;
const CANVAS_WIDTH = GRID_WIDTH * BLOCK_SIZE; // 280px
const CANVAS_HEIGHT = GRID_HEIGHT * BLOCK_SIZE; // 560px

export const GameCanvas = ({ engine }: GameCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;

    const render = (time: number) => {
      // 1. エンジン更新
      engine.update(time);

      // 2. キャンバス初期化
      ctx.fillStyle = COLORS.background;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // 3. グリッド背景の描画
      ctx.strokeStyle = COLORS.gridLine;
      ctx.lineWidth = 1;
      for (let c = 0; c <= GRID_WIDTH; c++) {
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

      // 4. ゴールエリア（行0〜1）のハイライト
      const goalPulse = 0.15 + Math.sin(time / 250) * 0.05;
      ctx.fillStyle = `rgba(0, 255, 200, ${goalPulse})`;
      ctx.fillRect(0, 0, CANVAS_WIDTH, (GOAL_ROW + 1) * BLOCK_SIZE);

      // ゴール境界線
      ctx.strokeStyle = COLORS.goalBorder;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(0, (GOAL_ROW + 1) * BLOCK_SIZE);
      ctx.lineTo(CANVAS_WIDTH, (GOAL_ROW + 1) * BLOCK_SIZE);
      ctx.stroke();
      ctx.setLineDash([]);

      // ゴール文字
      ctx.fillStyle = "#00ffc8";
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.textAlign = "center";
      ctx.fillText("★ SERVER CORE ★", CANVAS_WIDTH / 2, 18);

      // 5. グリッドのセル描画（設置ブロック、障害物、アイテム）
      for (let r = 0; r < GRID_HEIGHT; r++) {
        for (let c = 0; c < GRID_WIDTH; c++) {
          const cell = engine.grid[r][c];
          const px = c * BLOCK_SIZE;
          const py = r * BLOCK_SIZE;

          if (cell.type === "placed" && cell.color) {
            drawCyberBlock(ctx, px, py, cell.color, false);
          } else if (cell.type === "glowing") {
            // 通電ラインの強力発光
            const glowPulse = 0.7 + Math.sin(time / 100) * 0.3;
            drawCyberBlock(ctx, px, py, "#00ffff", true, glowPulse);
          } else if (cell.type === "obstacle") {
            drawObstacleBlock(ctx, px, py);
          } else if (cell.type === "item") {
            drawItemCapsule(ctx, px, py, cell.itemType || "bomb", time);
          }
        }
      }

      // 6. ウイルス侵食エリアの描画（下からせり上がり）
      const virusY = engine.virusRow * BLOCK_SIZE;
      if (virusY < CANVAS_HEIGHT) {
        // グラデーション侵食
        const virusGrad = ctx.createLinearGradient(
          0,
          virusY,
          0,
          CANVAS_HEIGHT,
        );
        const virusWave = Math.sin(time / 200) * 0.08;
        virusGrad.addColorStop(0, `rgba(255, 0, 80, ${0.4 + virusWave})`);
        virusGrad.addColorStop(1, "rgba(255, 0, 40, 0.85)");

        ctx.fillStyle = virusGrad;
        ctx.fillRect(0, virusY, CANVAS_WIDTH, CANVAS_HEIGHT - virusY);

        // 侵食前線（レーザー/ノイズライン）
        ctx.strokeStyle =
          engine.virusFreezeTimerMs > 0 ? "#00ffff" : COLORS.virusLine;
        ctx.lineWidth = 3;
        ctx.shadowColor =
          engine.virusFreezeTimerMs > 0 ? "#00ffff" : "#ff0055";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(0, virusY);
        // 少し波打つライン
        for (let x = 0; x <= CANVAS_WIDTH; x += 10) {
          const offset = Math.sin((x + time / 5) * 0.05) * 2;
          ctx.lineTo(x, virusY + offset);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // フリーズ状態のラベル
        if (engine.virusFreezeTimerMs > 0) {
          ctx.fillStyle = "#00ffff";
          ctx.font = '8px "Press Start 2P", monospace';
          ctx.textAlign = "right";
          ctx.fillText(
            `FROZEN ${(engine.virusFreezeTimerMs / 1000).toFixed(1)}s`,
            CANVAS_WIDTH - 6,
            virusY - 6,
          );
        } else {
          ctx.fillStyle = "#ff0055";
          ctx.font = '8px "Press Start 2P", monospace';
          ctx.textAlign = "right";
          ctx.fillText("! VIRUS ZONE !", CANVAS_WIDTH - 6, virusY - 6);
        }
      }

      // 7. ゴーストミノ（落下予測）の描画
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
                gx + 2,
                gy + 2,
                BLOCK_SIZE - 4,
                BLOCK_SIZE - 4,
              );
            }
          }
        }
        ctx.setLineDash([]);
      }

      // 8. 現在操作中のミノの描画
      if (engine.currentPiece && engine.status === "playing") {
        const { matrix, x, y, color } = engine.currentPiece;
        for (let r = 0; r < matrix.length; r++) {
          for (let c = 0; c < matrix[r].length; c++) {
            if (matrix[r][c] !== 0) {
              const px = (x + c) * BLOCK_SIZE;
              const py = (y + r) * BLOCK_SIZE;
              drawCyberBlock(ctx, px, py, color, true);
            }
          }
        }
      }

      // 9. ボム爆発エフェクトの描画
      for (const bomb of engine.activeBombs) {
        const bx = (bomb.x + 0.5) * BLOCK_SIZE;
        const by = (bomb.y + 0.5) * BLOCK_SIZE;
        const currentR = bomb.radius * BLOCK_SIZE;

        ctx.strokeStyle = `rgba(255, 60, 100, ${1 - bomb.progress})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(bx, by, currentR, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = `rgba(255, 200, 0, ${(1 - bomb.progress) * 0.4})`;
        ctx.beginPath();
        ctx.arc(bx, by, currentR * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }

      // 10. 一時停止画面のオーバーレイ
      if (engine.status === "paused") {
        ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
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
    <div className="relative inline-block border-2 border-cyan-500/40 rounded-lg p-1 bg-slate-950/80 shadow-[0_0_20px_rgba(0,240,255,0.15)]">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="rounded block"
      />
    </div>
  );
};

// サイバー調ブロックの描画ヘルパー
function drawCyberBlock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  isGlow = false,
  glowIntensity = 1,
) {
  // 背景塗り
  ctx.fillStyle = color;
  ctx.fillRect(x + 1, y + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);

  // 内側の回路パターン風ハイライト
  ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
  ctx.fillRect(x + 2, y + 2, BLOCK_SIZE - 4, 3);
  ctx.fillRect(x + 2, y + 2, 3, BLOCK_SIZE - 4);

  // 外枠
  ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 1, y + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);

  // ネオン発光効果
  if (isGlow) {
    ctx.strokeStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 8 * glowIntensity;
    ctx.strokeRect(x + 1, y + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
    ctx.shadowBlur = 0;
  }
}

// 障害物ブロックの描画
function drawObstacleBlock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
) {
  ctx.fillStyle = "#334155";
  ctx.fillRect(x + 1, y + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);

  // 斜線ハッチング
  ctx.strokeStyle = "#64748b";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x + 4, y + BLOCK_SIZE - 4);
  ctx.lineTo(x + BLOCK_SIZE - 4, y + 4);
  ctx.stroke();

  // 枠線
  ctx.strokeStyle = "#94a3b8";
  ctx.strokeRect(x + 1, y + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
}

// アイテムカプセルの描画
function drawItemCapsule(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  type: string,
  time: number,
) {
  const bobbing = Math.sin(time / 200) * 2;
  const centerX = x + BLOCK_SIZE / 2;
  const centerY = y + BLOCK_SIZE / 2 + bobbing;
  const radius = BLOCK_SIZE * 0.35;

  let color = "#ff3366"; // bomb
  let label = "B";
  if (type === "heal") {
    color = "#10b981";
    label = "+";
  } else if (type === "freeze") {
    color = "#00d4ff";
    label = "F";
  }

  // オーラ発光
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // ラベル文字
  ctx.fillStyle = "#ffffff";
  ctx.font = '9px "Press Start 2P", monospace';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, centerX, centerY + 1);
}
