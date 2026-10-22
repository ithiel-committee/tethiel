import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  BONUS_GOAL_COLS,
  ENDLESS_STAGE,
  GOAL_ROW,
  GRID_HEIGHT,
  GRID_WIDTH,
  STAGES,
  START_COLS,
  START_ROW,
} from "../src/game/constants.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// virus.png と player_left.png を Base64 化 (SVG への埋め込み用)
const virusImgPath = path.join(rootDir, "src", "assets", "obstacle", "virus.png");
const playerImgPath = path.join(rootDir, "src", "assets", "character", "player_left.png");

const virusBase64 = fs.existsSync(virusImgPath)
  ? `data:image/png;base64,${fs.readFileSync(virusImgPath).toString("base64")}`
  : "";
const playerBase64 = fs.existsSync(playerImgPath)
  ? `data:image/png;base64,${fs.readFileSync(playerImgPath).toString("base64")}`
  : "";

/**
 * 各ステージの SVG 画像を生成する
 */
function generateStageSVG(stage, options = {}) {
  const blockSize = options.blockSize || 32;
  const showCoords = options.showCoords ?? true;
  const coordMargin = showCoords ? 26 : 0;
  const headerHeight = 48;

  const fieldW = GRID_WIDTH * blockSize;
  const fieldH = GRID_HEIGHT * blockSize;
  const svgW = fieldW + coordMargin;
  const svgH = fieldH + headerHeight + coordMargin;

  const ox = coordMargin; // フィールド原点 X
  const oy = headerHeight; // フィールド原点 Y

  const isEndless = stage.mode === "endless" || stage.id === ENDLESS_STAGE.id;

  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgW} ${svgH}" width="${svgW}" height="${svgH}" style="background-color: #070205; font-family: 'DotGothic16', monospace, sans-serif;">
  <defs>
    <!-- ネオングローフィルター (赤) -->
    <filter id="glow-red" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="2.5" result="blur1" />
      <feGaussianBlur stdDeviation="5.5" result="blur2" />
      <feMerge>
        <feMergeNode in="blur2" />
        <feMergeNode in="blur1" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <!-- ネオングローフィルター (金) -->
    <filter id="glow-gold" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3" result="blur1" />
      <feGaussianBlur stdDeviation="6" result="blur2" />
      <feMerge>
        <feMergeNode in="blur2" />
        <feMergeNode in="blur1" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <!-- ヘッダー情報バー -->
  <rect x="0" y="0" width="${svgW}" height="${headerHeight}" fill="#0d0408" />
  <line x1="0" y1="${headerHeight}" x2="${svgW}" y2="${headerHeight}" stroke="#ff1a4b" stroke-width="1.5" />
  <text x="12" y="24" fill="#00f0ff" font-size="15" font-weight="bold">${stage.name} - ${stage.subtitle}</text>
  <text x="12" y="40" fill="#998899" font-size="10.5">障害物: ${stage.initialObstacles.length}マス | 星: ${stage.initialStars.length}個 | 感染間隔: ${stage.infectionIntervalMs}ms</text>

  <!-- フィールド背景 -->
  <rect x="${ox}" y="${oy}" width="${fieldW}" height="${fieldH}" fill="#070205" />

  <!-- 市松模様ストライプ -->
`;

  for (let c = 0; c < GRID_WIDTH; c++) {
    if (c % 2 === 0) {
      svg += `  <rect x="${ox + c * blockSize}" y="${oy}" width="${blockSize}" height="${fieldH}" fill="rgba(255, 26, 75, 0.025)" />\n`;
    }
  }

  // グリッド線
  for (let c = 0; c <= GRID_WIDTH; c++) {
    const x = ox + c * blockSize;
    svg += `  <line x1="${x}" y1="${oy}" x2="${x}" y2="${oy + fieldH}" stroke="rgba(255, 26, 75, 0.16)" stroke-width="1" />\n`;
  }
  for (let r = 0; r <= GRID_HEIGHT; r++) {
    const y = oy + r * blockSize;
    svg += `  <line x1="${ox}" y1="${y}" x2="${ox + fieldW}" y2="${y}" stroke="rgba(255, 26, 75, 0.16)" stroke-width="1" />\n`;
  }

  // 座標ラベル
  if (showCoords) {
    // 列番号 (上部)
    for (let c = 0; c < GRID_WIDTH; c++) {
      svg += `  <text x="${ox + c * blockSize + blockSize / 2}" y="${oy - 5}" fill="#776677" font-size="9.5" text-anchor="middle">${c}</text>\n`;
    }
    // 行番号 (左部)
    for (let r = 0; r < GRID_HEIGHT; r++) {
      svg += `  <text x="${ox - 6}" y="${oy + r * blockSize + blockSize / 2 + 3.5}" fill="#776677" font-size="9.5" text-anchor="end">${r}</text>\n`;
    }
  }

  // GOALエリア (行0〜2)
  if (!isEndless) {
    const goalY = oy + GOAL_ROW * blockSize;
    const normalGoalW = (GRID_WIDTH - BONUS_GOAL_COLS.length) * blockSize;
    const bonusGoalX = ox + normalGoalW;
    const bonusGoalW = BONUS_GOAL_COLS.length * blockSize;

    // 通常GOAL
    svg += `
  <!-- 通常GOALエリア -->
  <rect x="${ox}" y="${goalY}" width="${normalGoalW}" height="${blockSize}" fill="rgba(255, 26, 75, 0.9)" />
  <rect x="${ox}" y="${goalY}" width="${normalGoalW}" height="${blockSize}" fill="none" stroke="#ff2a55" stroke-width="1.5" />
  <text x="${ox + normalGoalW / 2}" y="${goalY + blockSize / 2 + 4}" fill="#ffffff" font-size="12" font-weight="bold" text-anchor="middle" letter-spacing="3">G O A L</text>

  <!-- BONUS GOALエリア -->
  <rect x="${bonusGoalX}" y="${goalY}" width="${bonusGoalW}" height="${blockSize}" fill="rgba(255, 170, 0, 0.92)" />
  <rect x="${bonusGoalX}" y="${goalY}" width="${bonusGoalW}" height="${blockSize}" fill="none" stroke="#ffcc00" stroke-width="1.5" />
  <text x="${bonusGoalX + bonusGoalW / 2}" y="${goalY + blockSize / 2 + 4}" fill="#070205" font-size="10" font-weight="bold" text-anchor="middle">BONUS</text>
`;
  } else {
    // エンドレスヘッダー
    svg += `
  <rect x="${ox}" y="${oy}" width="${fieldW}" height="${blockSize}" fill="rgba(255, 26, 75, 0.2)" stroke="rgba(255, 40, 80, 0.5)" />
  <text x="${ox + fieldW / 2}" y="${oy + blockSize / 2 + 4}" fill="#ff2a55" font-size="11" text-anchor="middle">▲ ENDLESS CLIMBING ▲</text>
`;
  }

  // START台座 (行21, START_COLS)
  const startY = oy + START_ROW * blockSize;
  for (const c of START_COLS) {
    const startX = ox + c * blockSize;
    svg += `
  <!-- START台座 -->
  <rect x="${startX + 1}" y="${startY + 1}" width="${blockSize - 2}" height="${blockSize - 2}" fill="#ffffff" rx="2" />
  <rect x="${startX + 2}" y="${startY + 2}" width="${blockSize - 4}" height="${blockSize - 4}" fill="none" stroke="rgba(0, 240, 255, 0.8)" stroke-width="1" />
`;
  }

  // イティエル立ち位置 (START_COLS中央上)
  if (playerBase64) {
    const charW = blockSize * 1.35;
    const charH = blockSize * 2.25;
    const charX = ox + 5.5 * blockSize - charW / 2;
    const charY = startY - charH + blockSize * 0.9;
    svg += `  <image href="${playerBase64}" x="${charX}" y="${charY}" width="${charW}" height="${charH}" opacity="0.95" />\n`;
  }

  // 障害物 (obstacles)
  svg += `\n  <!-- 障害物 (ウイルス) -->\n`;
  for (const [r, c] of stage.initialObstacles) {
    const x = ox + c * blockSize;
    const y = oy + r * blockSize;

    if (virusBase64) {
      const vSize = blockSize - 2;
      svg += `  <g filter="url(#glow-red)">
    <image href="${virusBase64}" x="${x + 1}" y="${y + 1}" width="${vSize}" height="${vSize}" />
  </g>\n`;
    } else {
      svg += `  <rect x="${x + 2}" y="${y + 2}" width="${blockSize - 4}" height="${blockSize - 4}" fill="#ff1744" filter="url(#glow-red)" rx="3" />\n`;
    }
  }

  // 星 (stars)
  svg += `\n  <!-- 星 (★) -->\n`;
  for (const [r, c] of stage.initialStars) {
    const cx = ox + c * blockSize + blockSize / 2;
    const cy = oy + r * blockSize + blockSize / 2 + 5.5;
    svg += `  <text x="${cx}" y="${cy}" fill="#ffdd00" font-size="18" text-anchor="middle" filter="url(#glow-gold)">★</text>\n`;
  }

  svg += `</svg>`;
  return svg;
}

/**
 * 全ステージを並べて閲覧・PNG保存できる HTML プレビューページを生成する
 */
function generateViewerHTML(stages) {
  const cardsHtml = stages.map(stage => {
    const safeName = stage.name.toLowerCase().replace(/\s+/g, "_");
    return `
    <div class="stage-card">
      <div class="card-header">
        <div class="title-row">
          <span class="stage-title">${stage.name}</span>
          <span class="stage-badge">${stage.subtitle}</span>
        </div>
        <div class="stage-meta">
          <span>障害物: <b>${stage.initialObstacles.length}マス</b></span>
          <span>星: <b>${stage.initialStars.length}個</b></span>
          <span>感染速度: <b>${stage.infectionIntervalMs}ms</b></span>
        </div>
      </div>
      <div class="svg-container">
        <img src="${safeName}.svg" id="img-${safeName}" alt="${stage.name}" />
      </div>
      <div class="card-actions">
        <a href="${safeName}.svg" download="${safeName}.svg" class="action-btn">SVG 保存</a>
        <button onclick="downloadAsPNG('${safeName}')" class="action-btn primary">PNG として保存</button>
      </div>
    </div>`;
  }).join("\n");

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>TethieL - ステージマッププレビュー</title>
  <style>
    :root {
      --bg: #070205;
      --card-bg: #11050c;
      --card-border: #ff1a4b44;
      --accent: #ff1a4b;
      --text: #e0d0d8;
    }
    body {
      margin: 0;
      padding: 24px;
      background-color: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "DotGothic16", monospace, sans-serif;
    }
    header {
      text-align: center;
      margin-bottom: 28px;
    }
    h1 {
      color: #00f0ff;
      margin: 0 0 8px 0;
      letter-spacing: 2px;
      font-size: 24px;
    }
    .subtitle {
      color: #998899;
      font-size: 13px;
    }
    .gallery-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 24px;
      justify-content: center;
    }
    .stage-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 8px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      box-shadow: 0 4px 20px rgba(255, 26, 75, 0.12);
    }
    .card-header {
      width: 100%;
      margin-bottom: 12px;
    }
    .title-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }
    .stage-title {
      font-size: 16px;
      font-weight: bold;
      color: #00f0ff;
    }
    .stage-badge {
      background: rgba(255, 26, 75, 0.2);
      border: 1px solid var(--accent);
      color: #ff6688;
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 4px;
    }
    .stage-meta {
      display: flex;
      gap: 12px;
      font-size: 11px;
      color: #887788;
    }
    .svg-container {
      background: #000000;
      border: 1px solid #331122;
      border-radius: 4px;
      padding: 8px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .svg-container img {
      max-width: 100%;
      height: auto;
      display: block;
    }
    .card-actions {
      margin-top: 12px;
      display: flex;
      gap: 8px;
      width: 100%;
    }
    .action-btn {
      flex: 1;
      text-align: center;
      padding: 7px 10px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: bold;
      text-decoration: none;
      cursor: pointer;
      border: 1px solid #ff1a4b66;
      background: rgba(255, 26, 75, 0.1);
      color: #ff88a3;
      transition: all 0.2s;
    }
    .action-btn:hover {
      background: rgba(255, 26, 75, 0.3);
      border-color: #ff1a4b;
      color: #ffffff;
    }
    .action-btn.primary {
      background: #ff1a4b;
      border-color: #ff1a4b;
      color: #ffffff;
    }
    .action-btn.primary:hover {
      background: #ff4066;
    }
  </style>
</head>
<body>
  <header>
    <h1>TETHIEL STAGE MAP GALLERY</h1>
    <div class="subtitle">Generated directly from src/game/constants.ts</div>
  </header>

  <div class="gallery-grid">
    ${cardsHtml}
  </div>

  <script>
    // SVG を HTML5 Canvas に描画して高解像度 PNG としてダウンロードする
    function downloadAsPNG(safeName) {
      const img = document.getElementById('img-' + safeName);
      if (!img) return;

      const canvas = document.createElement('canvas');
      const scale = 2; // 2倍スケールで鮮明な高解像度PNGを生成
      canvas.width = img.naturalWidth * scale;
      canvas.height = img.naturalHeight * scale;

      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const a = document.createElement('a');
      a.download = safeName + '.png';
      a.href = canvas.toDataURL('image/png');
      a.click();
    }
  </script>
</body>
</html>`;
}

// メイン実行処理
function main() {
  const outputDir = path.join(rootDir, "output", "stages");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const allStages = [...STAGES, ENDLESS_STAGE];
  console.log(`Processing ${allStages.length} stages from constants.ts...`);

  for (const stage of allStages) {
    const safeName = stage.name.toLowerCase().replace(/\s+/g, "_");
    const svgPath = path.join(outputDir, `${safeName}.svg`);
    const svgContent = generateStageSVG(stage);
    fs.writeFileSync(svgPath, svgContent, "utf-8");
    console.log(`✓ Generated: ${svgPath} (Obstacles: ${stage.initialObstacles.length}, Stars: ${stage.initialStars.length})`);
  }

  // ギャラリーHTMLの出力
  const htmlPath = path.join(outputDir, "index.html");
  const htmlContent = generateViewerHTML(allStages);
  fs.writeFileSync(htmlPath, htmlContent, "utf-8");
  console.log(`✓ Generated viewer: ${htmlPath}`);

  console.log(`\nAll stage images and viewer have been generated in: ${outputDir}`);
}

main();
