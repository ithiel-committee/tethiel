import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

test("1. CSS Layout & No-Scroll Constraints Check", () => {
  const cssPath = path.join(rootDir, "src", "index.css");
  assert.ok(fs.existsSync(cssPath), "src/index.css must exist");

  const cssContent = fs.readFileSync(cssPath, "utf-8");

  // html and body must have overflow: hidden
  assert.match(
    cssContent,
    /html,\s*body\s*\{[^}]*overflow:\s*hidden/s,
    "html and body must have overflow: hidden to prevent viewport scrolling",
  );

  // #root must have overflow: hidden and height: 100%
  assert.match(
    cssContent,
    /#root\s*\{[^}]*overflow:\s*hidden/s,
    "#root container must have overflow: hidden to prevent application scroll",
  );

  // .result-modal-card must have max-height constraint
  assert.match(
    cssContent,
    /\.result-modal-card\s*\{[^}]*max-height:\s*calc\(100vh/s,
    ".result-modal-card must enforce max-height to fit within viewport",
  );

  // .result-action-btn height must be compact (<= 38px)
  const btnHeightMatch = cssContent.match(/\.result-action-btn\s*\{[^}]*height:\s*(\d+)px/s);
  assert.ok(btnHeightMatch, ".result-action-btn must declare explicit height");
  const btnHeight = Number.parseInt(btnHeightMatch[1], 10);
  assert.ok(
    btnHeight <= 38,
    `.result-action-btn height must be <= 38px (actual: ${btnHeight}px) to fit on compact screens`,
  );
});

test("2. App.tsx Root Container Viewport Constraints", () => {
  const appPath = path.join(rootDir, "src", "App.tsx");
  assert.ok(fs.existsSync(appPath), "src/App.tsx must exist");

  const appContent = fs.readFileSync(appPath, "utf-8");

  // Root container must enforce h-full max-h-screen overflow-hidden
  assert.ok(
    appContent.includes("max-h-screen") && appContent.includes("overflow-hidden"),
    "App.tsx root wrapper must enforce max-h-screen and overflow-hidden",
  );

  // Result screen container must be centered without scroll
  assert.ok(
    appContent.includes('screen === "result"'),
    "App.tsx must handle result screen",
  );
  assert.ok(
    appContent.includes('key="result" className="screen-transition-enter w-full h-full flex justify-center items-center overflow-hidden"'),
    "Result screen wrapper must be centered with h-full and overflow-hidden",
  );
});

test("3. ResultScreen Height Budget Simulation (780px and 768px Viewports)", () => {
  // Typical notebook viewport heights: 780px (user environment), 768px (WXGA / 1366x768)
  const testViewports = [
    { name: "Browser Viewport (User)", height: 780 },
    { name: "Standard Laptop (768p)", height: 768 },
    { name: "Compact Screen (720p)", height: 720 },
  ];

  // Element height budget in .result-modal-card (in pixels)
  const budget = {
    cardPaddingTopBottom: 12 * 2, // 24px
    ithielAvatar: 44, // 44px
    headerGapAndMargins: 4 + 4 + 4, // 12px
    titleText: 18, // 18px
    subText: 14, // 14px
    stageLabel: 14, // 14px
    statsCardPadding: 8 * 2, // 16px
    statsCardRankRow: 24, // 24px
    statsCardGrid: 44, // 44px
    statsCardAdjustments: 20, // 20px
    actionsContainerMarginTop: 6 + 6, // 12px
    actionButtons: 35 * 4, // 140px (4 vertical buttons)
    actionButtonsGap: 6 * 3, // 18px
  };

  const totalCalculatedHeight = Object.values(budget).reduce((acc, h) => acc + h, 0);

  for (const vp of testViewports) {
    const marginAvailable = vp.height - totalCalculatedHeight;
    assert.ok(
      totalCalculatedHeight < vp.height,
      `ResultScreen total height (${totalCalculatedHeight}px) must be smaller than viewport height (${vp.height}px for ${vp.name})`,
    );
    assert.ok(
      marginAvailable >= 100,
      `ResultScreen must leave at least 100px breathing room on ${vp.name} (remaining: ${marginAvailable}px)`,
    );
  }
});

test("4. Overflow Checker Utility Integration", () => {
  const checkerPath = path.join(rootDir, "src", "utils", "overflowChecker.ts");
  assert.ok(fs.existsSync(checkerPath), "src/utils/overflowChecker.ts must exist");

  const checkerContent = fs.readFileSync(checkerPath, "utf-8");

  // Must export checkElementOverflow and assertNoScreenOverflow
  assert.ok(
    checkerContent.includes("export function checkElementOverflow"),
    "Must export checkElementOverflow",
  );
  assert.ok(
    checkerContent.includes("export function assertNoScreenOverflow"),
    "Must export assertNoScreenOverflow",
  );
  assert.ok(
    checkerContent.includes("export function useOverflowCheck"),
    "Must export useOverflowCheck hook",
  );

  // Check usage in all main screens
  const screens = [
    { file: "src/components/ResultScreen.tsx", name: "ResultScreen" },
    { file: "src/components/TitleScreen.tsx", name: "TitleScreen" },
    { file: "src/components/GameUI.tsx", name: "GameUI" },
    { file: "src/components/NovelScreen.tsx", name: "NovelScreen" },
  ];

  for (const screen of screens) {
    const fullPath = path.join(rootDir, screen.file);
    const content = fs.readFileSync(fullPath, "utf-8");
    assert.ok(
      content.includes("useOverflowCheck"),
      `${screen.file} must invoke useOverflowCheck for screen overflow monitoring`,
    );
  }
});

test("5. STAGE 3 Implementation and Unlock Verification", () => {
  const constantsPath = path.join(rootDir, "src", "game", "constants.ts");
  const constantsContent = fs.readFileSync(constantsPath, "utf-8");

  // STAGE 3 must be unlocked
  assert.ok(
    constantsContent.includes('name: "STAGE 3"') && constantsContent.includes("isUnlocked: true"),
    "STAGE 3 must be defined and unlocked",
  );

  // STAGE 3 must have obstacles and stars defined
  assert.match(
    constantsContent,
    /id:\s*3,.*initialObstacles:\s*\[\s*\[/s,
    "STAGE 3 must have configured initialObstacles",
  );
  assert.match(
    constantsContent,
    /id:\s*3,.*initialStars:\s*\[\s*\[/s,
    "STAGE 3 must have configured initialStars",
  );
});

test("6. STAGE 3 No Straight-Through 2-Column Corridors Verification", () => {
  const constantsPath = path.join(rootDir, "src", "game", "constants.ts");
  const constantsContent = fs.readFileSync(constantsPath, "utf-8");

  // Parse initialObstacles from STAGE 3
  const stage3Block = constantsContent.split('id: 3')[1]?.split('id: 99')[0] || "";
  const match = stage3Block.match(/initialObstacles:\s*\[([\s\S]*?)\],\s*initialStars/);
  assert.ok(match, "Must find STAGE 3 initialObstacles block");

  const obstaclePairs = [...match[1].matchAll(/\[(\d+),\s*(\d+)\]/g)].map(m => [
    Number.parseInt(m[1], 10),
    Number.parseInt(m[2], 10),
  ]);

  const grid = Array.from({ length: 22 }, () => Array(12).fill(false));
  for (const [r, c] of obstaclePairs) {
    grid[r][c] = true;
  }

  // Verify that NO adjacent 2-column pair [c, c+1] is completely clear from row 3 to 19
  for (let c = 0; c < 11; c++) {
    let clearAll = true;
    for (let r = 3; r <= 19; r++) {
      if (grid[r][c] || grid[r][c + 1]) {
        clearAll = false;
        break;
      }
    }
    assert.strictEqual(
      clearAll,
      false,
      `Columns [${c}, ${c + 1}] must not be a full-height straight clear corridor`,
    );
  }

  // Verify maximum continuous 2-column clear height does not exceed 8 rows
  for (let c = 0; c < 11; c++) {
    let maxRun = 0;
    let curRun = 0;
    for (let r = 3; r <= 19; r++) {
      if (!grid[r][c] && !grid[r][c + 1]) {
        curRun++;
        if (curRun > maxRun) maxRun = curRun;
      } else {
        curRun = 0;
      }
    }
    assert.ok(
      maxRun <= 8,
      `Columns [${c}, ${c + 1}] continuous clear height (${maxRun}) must be <= 8 rows to prevent trivial stacking`,
    );
  }
});
