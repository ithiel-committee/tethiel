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
import { useUIText } from "../context/UIModeContext";
import {
  BLOCK_SIZE,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  drawGlitchedBlock,
  drawIthielCharacter,
  drawMinoBlock,
  drawObstacleBlock,
  drawStarItem,
} from "../game/renderer/gameRenderer";
import { getGameFlags } from "../config/gameFlags.ts";

interface GameCanvasProps {
  engine: GameEngine;
}

export const GameCanvas = ({ engine }: GameCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { isKids } = useUIText();
  const isKidsRef = useRef(isKids);

  useEffect(() => {
    isKidsRef.current = isKids;
  }, [isKids]);

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
          ctx.fillStyle = "rgba(255, 26, 75, 0.02)";
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

      // 4. 最上部ヘッダー（エンドレス時は高度表示、ステージ時はGOALライン）
      if (engine.gameMode === "endless") {
        ctx.fillStyle = "rgba(255, 26, 75, 0.18)";
        ctx.fillRect(0, 0, CANVAS_WIDTH, BLOCK_SIZE);
        ctx.strokeStyle = "rgba(255, 40, 80, 0.5)";
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, CANVAS_WIDTH, BLOCK_SIZE);

        ctx.fillStyle = "#ff2a55";
        ctx.font = '11px "DotGothic16", monospace';
        ctx.textAlign = "center";
        ctx.fillText(
          isKidsRef.current
            ? `▲ たかさ: ${engine.climbedHeight}m ▲`
            : `▲ CLIMB: ${engine.climbedHeight}m ▲`,
          CANVAS_WIDTH / 2,
          18,
        );
      } else {
        // 通常ステージモード：GOALライン描画（行2）
        const goalY = GOAL_ROW * BLOCK_SIZE;
        // 通常GOALエリア（学部の赤サイバーコア）
        ctx.fillStyle = "rgba(255, 26, 75, 0.9)";
        ctx.fillRect(
          0,
          goalY,
          (GRID_WIDTH - BONUS_GOAL_COLS.length) * BLOCK_SIZE,
          BLOCK_SIZE,
        );
        ctx.fillStyle = "#ffffff";
        ctx.font = '11px "DotGothic16", monospace';
        ctx.textAlign = "center";
        ctx.fillText(
          isKidsRef.current ? "ゴ　ー　ル" : "G  O  A  L",
          ((GRID_WIDTH - BONUS_GOAL_COLS.length) * BLOCK_SIZE) / 2,
          goalY + 17,
        );

        // BONUSエリア（右端2マス）
        const bonusStartX =
          (GRID_WIDTH - BONUS_GOAL_COLS.length) * BLOCK_SIZE;
        ctx.fillStyle = "rgba(255, 170, 0, 0.92)";
        ctx.fillRect(
          bonusStartX,
          goalY,
          BONUS_GOAL_COLS.length * BLOCK_SIZE,
          BLOCK_SIZE,
        );
        ctx.fillStyle = "#0a0407";
        ctx.font = '9px "DotGothic16", monospace';
        ctx.fillText(
          isKidsRef.current ? "ボーナス" : "BONUS",
          bonusStartX + (BONUS_GOAL_COLS.length * BLOCK_SIZE) / 2,
          goalY + 16,
        );
      }

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
            drawObstacleBlock(ctx, px, py, time);
          } else if (cell.type === "star") {
            drawStarItem(ctx, px, py, time);
          } else if (cell.type === "glitched") {
            drawGlitchedBlock(
              ctx,
              px,
              py,
              cell.color || "#ff1a4b",
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
        ctx.shadowColor = "#ff1a4b";
        ctx.shadowBlur = 12;
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

      // 10. イティエル (登るキャラクター) の描画
      drawIthielCharacter(
        ctx,
        engine.characterPos.x * BLOCK_SIZE,
        engine.characterPos.y * BLOCK_SIZE,
        time,
        engine.characterPos.isMoving,
        engine.characterPos.facing,
        getGameFlags().playerSpriteMode,
      );

      // 10.5 ゴール到達時のセレブレーション演出（キャラクターが到着した瞬間に発動）
      if (engine.isGoalCelebration) {
        const cx = engine.characterPos.x * BLOCK_SIZE;
        const cy = engine.characterPos.y * BLOCK_SIZE;

        // ゴール到達時の光る放射オーラ
        const auraRadius = 24 + Math.sin(time / 80) * 6;
        const grad = ctx.createRadialGradient(
          cx,
          cy,
          4,
          cx,
          cy,
          auraRadius,
        );
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
        ctx.font = '13px "DotGothic16", monospace';
        ctx.textAlign = "center";
        ctx.fillText(
          engine.isBonusGoal
            ? isKidsRef.current
              ? "★ とくべつなゴール！ ★"
              : "★ BONUS GOAL! ★"
            : isKidsRef.current
              ? "★ ゴール！ ★"
              : "★ GOAL! ★",
          cx,
          cy - 22,
        );
        ctx.restore();
      }

      // 10.3. せりあがるウイルス感染ライン（揺れのない直線サイバー警戒ライン）
      if (
        engine.infectionMode === "rising_magma" &&
        engine.magmaRow < GRID_HEIGHT
      ) {
        const magmaY = engine.magmaRow * BLOCK_SIZE;
        const magmaHeight = CANVAS_HEIGHT - magmaY;

        ctx.save();
        // 感染領域（暗赤色・暗紫色のサイバー警戒ゾーン）
        const grad = ctx.createLinearGradient(0, magmaY, 0, CANVAS_HEIGHT);
        grad.addColorStop(0, "rgba(255, 0, 70, 0.4)");
        grad.addColorStop(0.2, "rgba(45, 5, 20, 0.85)");
        grad.addColorStop(1, "rgba(8, 2, 10, 0.95)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, magmaY, CANVAS_WIDTH, magmaHeight);

        // 揺れのない水平なサイバー境界ライン（ネオンマゼンタの直線）
        ctx.beginPath();
        ctx.moveTo(0, magmaY);
        ctx.lineTo(CANVAS_WIDTH, magmaY);
        ctx.strokeStyle = "#ff0055";
        ctx.lineWidth = 2;
        ctx.shadowColor = "#ff0055";
        ctx.shadowBlur = 6;
        ctx.stroke();

        // 警戒ライン下の静止ハザードストライプ（揺れないフラットな斜線）
        ctx.strokeStyle = "rgba(255, 0, 85, 0.25)";
        ctx.lineWidth = 1;
        ctx.shadowBlur = 0;
        for (let x = 0; x < CANVAS_WIDTH; x += 14) {
          ctx.beginPath();
          ctx.moveTo(x, magmaY);
          ctx.lineTo(x + 8, magmaY + 8);
          ctx.stroke();
        }

        // 警告ラベル "▲ VIRUS HAZARD LINE ▲"
        const pulse = 0.7 + Math.sin(time / 200) * 0.3;
        ctx.font = '10px "DotGothic16", monospace';
        ctx.fillStyle = `rgba(255, 80, 110, ${pulse})`;
        ctx.shadowColor = "#ff0055";
        ctx.shadowBlur = 4;
        ctx.textAlign = "left";
        ctx.fillText(
          isKidsRef.current
            ? "▲ ウイルス きけんライン ▲"
            : "▲ VIRUS HAZARD LINE ▲",
          6,
          magmaY - 6,
        );
        ctx.restore();
      }

      // 10.5. トゲ障害物接触・ミノ破壊エフェクト
      if (engine.spikeHitEffects.length > 0) {
        const now = performance.now();
        engine.spikeHitEffects = engine.spikeHitEffects.filter((fx) => {
          const age = now - fx.createdAt;
          if (age > 600) return false;

          const progress = age / 600; // 0 -> 1
          const alpha = 1 - progress;
          const radius = (1 - (1 - progress) ** 2) * BLOCK_SIZE * 1.5;
          const px = fx.x * BLOCK_SIZE;
          const py = fx.y * BLOCK_SIZE;

          ctx.save();
          // 衝撃波リング
          ctx.strokeStyle = `rgba(255, 23, 68, ${alpha * 0.9})`;
          ctx.lineWidth = 2.5 * (1 - progress);
          ctx.beginPath();
          ctx.arc(px, py, radius, 0, Math.PI * 2);
          ctx.stroke();

          // 破片パーティクル
          const count = 8;
          for (let i = 0; i < count; i++) {
            const angle = (i * Math.PI * 2) / count + fx.createdAt * 0.01;
            const dist = progress * BLOCK_SIZE * 1.6;
            const pX = px + Math.cos(angle) * dist;
            const pY = py + Math.sin(angle) * dist;
            const pSize = Math.max(1, (1 - progress) * 4);

            ctx.fillStyle =
              i % 2 === 0 ? "#ff1744" : fx.color || "#ffdd00";
            ctx.shadowColor = "#ff1744";
            ctx.shadowBlur = 4;
            ctx.fillRect(pX - pSize / 2, pY - pSize / 2, pSize, pSize);
          }

          // "BREAK!" ワーニングテキスト
          if (progress < 0.85) {
            ctx.font = 'bold 10px "DotGothic16", monospace';
            ctx.fillStyle = `rgba(255, 60, 90, ${alpha})`;
            ctx.shadowColor = "#ff0055";
            ctx.shadowBlur = 6;
            ctx.textAlign = "center";
            ctx.fillText(
              isKidsRef.current ? "わな！" : "TRAP!",
              px,
              py - radius * 0.6 - 4,
            );
          }
          ctx.restore();

          return true;
        });
      }

      // 11. 一時停止画面
      if (engine.status === "paused") {
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.fillStyle = "#ff2a55";
        ctx.font = '18px "DotGothic16", monospace';
        ctx.textAlign = "center";
        ctx.fillText(
          isKidsRef.current ? "ひとやすみ" : "PAUSED",
          CANVAS_WIDTH / 2,
          CANVAS_HEIGHT / 2,
        );
      }

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationId);
  }, [engine]);

  return (
    <div className="relative inline-block border-2 border-rose-500/60 rounded-xl p-1 bg-slate-950/90 shadow-[0_0_30px_rgba(255,26,75,0.25)]">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="rounded block"
      />
    </div>
  );
};
