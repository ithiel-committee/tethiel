import playerSpriteLeftSrc from "../../assets/character/player_left.png";
import playerSpriteRightSrc from "../../assets/character/player_right.png";
import playerDotLeftSrc from "../../assets/character/player_dot.png";
import playerDotRightSrc from "../../assets/character/player_dot_right.png";
import tethielCursorSrc from "../../assets/cursor/tethiel_cursor.png";
import virusSpriteSrc from "../../assets/obstacle/virus.png";
import type { PlayerSpriteMode } from "../../config/gameFlags.ts";
import { GRID_HEIGHT, GRID_WIDTH } from "../constants";

export const BLOCK_SIZE = 28;
export const CANVAS_WIDTH = GRID_WIDTH * BLOCK_SIZE;
export const CANVAS_HEIGHT = GRID_HEIGHT * BLOCK_SIZE;

// 画像スプライト
export const playerSpriteLeft = new Image();
playerSpriteLeft.src = playerSpriteLeftSrc;

export const playerSpriteRight = new Image();
playerSpriteRight.src = playerSpriteRightSrc;

export const playerDotSpriteLeft = new Image();
playerDotSpriteLeft.src = playerDotLeftSrc;

export const playerDotSpriteRight = new Image();
playerDotSpriteRight.src = playerDotRightSrc;

export const tethielCursorSprite = new Image();
tethielCursorSprite.src = tethielCursorSrc;

export const virusSprite = new Image();
virusSprite.src = virusSpriteSrc;

/**
 * ミノブロックの描画（通常・感染・最上部発光）
 */
export function drawMinoBlock(
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
    // 積み上げている最上部のミノを白く光らせる
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "#ffffff";
    ctx.shadowBlur = 12;
    ctx.fillRect(x + 1, y + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
    ctx.shadowBlur = 0;

    ctx.strokeStyle = "#ff1a4b";
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

/**
 * 障害物ブロックの描画 (ウイルス画像スプライト & サイバーネオングロー)
 */
export function drawObstacleBlock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
) {
  if (virusSprite.complete && virusSprite.naturalWidth > 0) {
    // 生きているような穏やかな呼吸モーション (周期600ms, ±4%の拡縮)
    const pulse = Math.sin(time / 300);
    const breath = 1 + pulse * 0.04;
    const drawSize = Math.round((BLOCK_SIZE - 2) * breath);

    const cx = x + BLOCK_SIZE / 2;
    const cy = y + BLOCK_SIZE / 2;

    ctx.save();
    // 赤いネオングロー
    ctx.shadowColor = "#ff1a4b";
    ctx.shadowBlur = 6 + (pulse + 1) * 3;

    const prevSmoothing = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = false;

    ctx.drawImage(
      virusSprite,
      Math.round(cx - drawSize / 2),
      Math.round(cy - drawSize / 2),
      drawSize,
      drawSize,
    );

    ctx.imageSmoothingEnabled = prevSmoothing;
    ctx.restore();
  } else {
    // 画像ロード前のフォールバック描画
    ctx.fillStyle = "#ff1744";
    ctx.fillRect(x + 4, y + 4, BLOCK_SIZE - 8, BLOCK_SIZE - 8);
  }
}

/**
 * グリッチ状態のブロック描画
 */
export function drawGlitchedBlock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  baseColor: string,
  time: number,
  seed: number,
) {
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
    const shift = isJitter ? ((glitchFrame * (i + 1) * 7) % 9) - 4 : 0;

    // 赤色（マゼンタ）色ズレ
    ctx.fillStyle = "rgba(255, 0, 85, 0.6)";
    ctx.fillRect(x + 1 + shift + 1.5, sliceY, BLOCK_SIZE - 2, sliceH);

    // シアン色ズレ
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
  ctx.strokeStyle = isJitter ? "#ff4d6d" : "rgba(255, 0, 85, 0.8)";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(
    x + 1 + (isJitter ? (glitchFrame % 5) - 2 : 0),
    y + 1,
    BLOCK_SIZE - 2,
    BLOCK_SIZE - 2,
  );
}

/**
 * 星（★）ボーナスアイテムの描画
 */
export function drawStarItem(
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
  ctx.font = '14px "DotGothic16", monospace';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("★", cx, cy);
  ctx.shadowBlur = 0;
}

/**
 * イティエルの自機キャラ描画
 */
export function drawIthielCharacter(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  time: number,
  isMoving: boolean,
  facing: "left" | "right" = "left",
  spriteMode: PlayerSpriteMode = "deformed",
) {
  const isPixel = spriteMode === "pixel";
  // ドット絵モード時は原寸50x50(実キャラ高47px)で1ドット=1画面ピクセルの等倍描画を行い、縮小によるモアレやちらつきを根本防止
  const charHeight = isPixel ? 50 : 44;
  const aspectRatio = isPixel
    ? 1
    : facing === "right"
      ? 249 / 423
      : 225 / 426;
  const charWidth = charHeight * aspectRatio;

  let bounceY = 0;
  let tilt = 0;
  if (isMoving) {
    const stepPhase = (time / 80) % Math.PI;
    bounceY = Math.sin(stepPhase) * 6;
    // ドット絵モード時は斜めサンプリングによるジャギーの波打ち・ちらつきを防ぐため回転(tilt)をOFF
    tilt = isPixel ? 0 : (facing === "right" ? 0.05 : -0.05) * Math.sin(stepPhase);
  } else {
    bounceY = Math.sin(time / 300) * 1.5;
  }

  const cx = px;
  const groundY = py + BLOCK_SIZE;

  // 1. 足場の光るオーラ・影
  const shadowScale = isMoving
    ? Math.max(0.6, 1 - (bounceY / 6) * 0.4)
    : 1;
  const shadowAlpha = isMoving
    ? Math.max(0.2, 0.45 - (bounceY / 6) * 0.25)
    : 0.4;
  ctx.fillStyle = `rgba(0, 255, 200, ${shadowAlpha})`;
  ctx.beginPath();
  ctx.ellipse(
    cx,
    groundY,
    11 * shadowScale,
    3.5 * shadowScale,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // 2. 自機スプライトの描画 (ピクセル境界への整数スナップでシマリングを解消)
  const drawX = isPixel ? Math.round(cx) : cx;
  const drawY = isPixel ? Math.round(groundY - bounceY) : groundY - bounceY;

  ctx.save();
  ctx.translate(drawX, drawY);
  if (tilt !== 0) {
    ctx.rotate(tilt);
  }

  if (isPixel) {
    // 50x50原寸ドット絵自機 (等倍1:1のため平滑化OFFで最高鮮明度・ブレなし)
    const prevSmoothing = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = false;

    const dotImg =
      facing === "right" ? playerDotSpriteRight : playerDotSpriteLeft;
    // 原寸ドット絵の下部余白2px分を考慮して接地位置をぴったり補正
    const drawOffsetX = -Math.round(charWidth / 2);
    const drawOffsetY = -charHeight + 2;

    if (dotImg.complete && dotImg.naturalWidth > 0) {
      ctx.drawImage(
        dotImg,
        drawOffsetX,
        drawOffsetY,
        charWidth,
        charHeight,
      );
    } else if (
      playerDotSpriteLeft.complete &&
      playerDotSpriteLeft.naturalWidth > 0
    ) {
      if (facing === "right") {
        ctx.scale(-1, 1);
      }
      ctx.drawImage(
        playerDotSpriteLeft,
        drawOffsetX,
        drawOffsetY,
        charWidth,
        charHeight,
      );
    } else {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(-charWidth / 2, -charHeight, charWidth, charHeight);
    }

    ctx.imageSmoothingEnabled = prevSmoothing;
  } else {
    // デフォルメ立ち絵画像
    const img = facing === "right" ? playerSpriteRight : playerSpriteLeft;
    if (img.complete && img.naturalWidth > 0) {
      ctx.drawImage(
        img,
        -charWidth / 2,
        -charHeight,
        charWidth,
        charHeight,
      );
    } else {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(-3, -charHeight + 5, 6, 6);
      ctx.fillRect(-4, -charHeight + 12, 8, 8);
      ctx.fillRect(-3, -charHeight + 20, 2, 3);
      ctx.fillRect(1, -charHeight + 20, 2, 3);
    }
  }
  ctx.restore();

  // 3. 頭上のネームラベル「イティエル」
  const labelY = isPixel
    ? Math.round(drawY - charHeight - 3)
    : groundY - charHeight - bounceY - 6;
  ctx.fillStyle = "#ffffff";
  ctx.font = '9px "DotGothic16", monospace';
  ctx.textAlign = "center";
  ctx.shadowColor = "rgba(0, 240, 255, 0.8)";
  ctx.shadowBlur = 4;
  ctx.fillText("イティエル", drawX, labelY);
  ctx.shadowBlur = 0;
}
