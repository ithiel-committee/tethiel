import test from "node:test";
import assert from "node:assert/strict";
import { STAGES, ENDLESS_STAGE, SCORE_CONFIG, START_ROW, START_COLS } from "../src/game/constants.ts";
import { GameEngine } from "../src/game/engine.ts";
import { getGameActionFromEvent, dispatchGameAction } from "../src/game/input.ts";

function createMockCallbacks() {
  const statsHistory = [];
  return {
    statsHistory,
    callbacks: {
      onStatusChange: () => {},
      onStatsChange: (stats) => {
        statsHistory.push({ ...stats });
      },
      onHeartsChange: () => {},
      onCharacterMove: () => {},
      onHoldChange: () => {},
      onNextChange: () => {},
      onStageClear: () => {},
      onGameOver: () => {},
    },
  };
}

test("1. Initial Bomb Skills Verification (All Stages)", () => {
  // STAGE 1, 2, 3 and ENDLESS must all provide 2 bombs initially
  for (const stage of [...STAGES, ENDLESS_STAGE]) {
    assert.ok(
      Array.isArray(stage.initialSkills),
      `${stage.name} must have initialSkills array`,
    );
    assert.strictEqual(
      stage.initialSkills.length,
      2,
      `${stage.name} must start with 2 initial skills`,
    );
    assert.deepStrictEqual(
      stage.initialSkills,
      ["bomb", "bomb"],
      `${stage.name} initialSkills must be ["bomb", "bomb"]`,
    );

    const { callbacks } = createMockCallbacks();
    const engine = new GameEngine(stage, callbacks);
    assert.strictEqual(
      engine.skills.length,
      2,
      `${stage.name} engine instance must have 2 skills on init`,
    );
  }
});

test("2. Bomb Consumption and Depletion Lifecycle", () => {
  const { callbacks } = createMockCallbacks();
  const engine = new GameEngine(STAGES[0], callbacks);
  engine.start();

  assert.strictEqual(engine.skills.length, 2, "Starts with 2 bombs");

  // First bomb use
  engine.useBomb();
  assert.strictEqual(engine.skills.length, 1, "Decrements to 1 bomb after 1st use");

  // Second bomb use
  engine.useBomb();
  assert.strictEqual(engine.skills.length, 0, "Decrements to 0 bombs after 2nd use");

  // Third bomb use (when depleted) -> no-op, must not throw or go below 0
  const effectsCount = engine.bombExplosionEffects.length;
  engine.useBomb();
  assert.strictEqual(engine.skills.length, 0, "Remains at 0 when depleted");
  assert.strictEqual(
    engine.bombExplosionEffects.length,
    effectsCount,
    "No explosion effect triggered when no bombs remain",
  );
});

test("3. Bomb 3x3 Destruction (Obstacles, Placed, and Infected Blocks)", () => {
  const { callbacks } = createMockCallbacks();
  const engine = new GameEngine(STAGES[0], callbacks);
  engine.start();

  // Set up specific blocks around target (col: 5, row: 15)
  const targetX = 5;
  const targetY = 15;

  // Place currentPiece at (4, 14) so center (currentPiece.x + 1, currentPiece.y + 1) is (5, 15)
  if (engine.currentPiece) {
    engine.currentPiece.x = 4;
    engine.currentPiece.y = 14;
  }

  // Set various block types inside 3x3
  engine.grid[14][4] = { type: "obstacle", color: "#475569" };
  engine.grid[14][5] = { type: "placed", color: "#00f0ff" };
  engine.grid[15][6] = { type: "placed", color: "#ff9900", isInfected: true };
  engine.grid[16][5] = { type: "empty" };

  // Set blocks outside 3x3
  engine.grid[12][5] = { type: "obstacle", color: "#475569" };

  engine.useBomb();

  // Inside 3x3 must be converted to "glitched"
  assert.strictEqual(engine.grid[14][4].type, "glitched", "Obstacle inside 3x3 converted to glitched");
  assert.strictEqual(engine.grid[14][5].type, "glitched", "Placed block inside 3x3 converted to glitched");
  assert.strictEqual(engine.grid[15][6].type, "glitched", "Infected block inside 3x3 converted to glitched");
  assert.strictEqual(engine.grid[16][5].type, "empty", "Empty cell remains empty");

  // Outside 3x3 must remain unchanged
  assert.strictEqual(engine.grid[12][5].type, "obstacle", "Block outside 3x3 untouched");

  // START line cells must never be destroyed
  for (const sc of START_COLS) {
    if (sc >= 0 && sc < 12) {
      assert.notStrictEqual(engine.grid[START_ROW][sc].type, "glitched", "START area cannot be glitched");
    }
  }
});

test("4. Score Calculation and Immediate UI Synchronization (onStatsChange)", () => {
  const { callbacks, statsHistory } = createMockCallbacks();
  const engine = new GameEngine(STAGES[0], callbacks);
  engine.start();

  // Position piece
  if (engine.currentPiece) {
    engine.currentPiece.x = 4;
    engine.currentPiece.y = 10;
  }

  // Put 3 breakable blocks in 3x3
  engine.grid[10][4] = { type: "obstacle" };
  engine.grid[11][5] = { type: "placed" };
  engine.grid[12][6] = { type: "placed", isInfected: true };

  const initialScore = engine.score;
  const initialHistoryLen = statsHistory.length;

  engine.useBomb();

  const expectedScore = initialScore + SCORE_CONFIG.BOMB_BREAK_PER_BLOCK * 3;
  assert.strictEqual(engine.score, expectedScore, `Score must increase by 3 blocks * ${SCORE_CONFIG.BOMB_BREAK_PER_BLOCK}`);

  // Immediate UI stats emission check
  assert.ok(statsHistory.length > initialHistoryLen, "onStatsChange must be invoked immediately during useBomb");
  const latestStats = statsHistory[statsHistory.length - 1];
  assert.strictEqual(latestStats.score, expectedScore, "Latest emitted stats must contain updated score");
});

test("5. Bomb Explosion Effect Data Generation", () => {
  const { callbacks } = createMockCallbacks();
  const engine = new GameEngine(STAGES[0], callbacks);
  engine.start();

  if (engine.currentPiece) {
    engine.currentPiece.x = 3;
    engine.currentPiece.y = 12;
  }

  engine.grid[12][3] = { type: "obstacle", color: "#ff1a4b" };
  engine.grid[13][4] = { type: "placed", color: "#00f0ff" };

  engine.useBomb();

  assert.strictEqual(engine.bombExplosionEffects.length, 1, "1 bomb explosion effect must be recorded");
  const fx = engine.bombExplosionEffects[0];
  assert.strictEqual(fx.x, 4, "fx.x must match explosion center (col 4)");
  assert.strictEqual(fx.y, 13, "fx.y must match explosion center (row 13)");
  assert.ok(fx.createdAt > 0, "fx.createdAt timestamp must be set");
  assert.strictEqual(fx.brokenBlocks.length, 2, "brokenBlocks must contain 2 destroyed blocks");
  assert.strictEqual(fx.brokenBlocks[0].x, 3);
  assert.strictEqual(fx.brokenBlocks[0].y, 12);
  assert.strictEqual(fx.brokenBlocks[1].x, 4);
  assert.strictEqual(fx.brokenBlocks[1].y, 13);
});

test("6. Keyboard Event Mapping to Bomb Action (getGameActionFromEvent & dispatchGameAction)", () => {
  const bombInputs = [
    { code: "KeyB", key: "b" },
    { code: "KeyB", key: "B" },
    { code: "KeyB", key: "ｂ" },
    { code: "KeyB", key: "Ｂ" },
    { code: "KeyB", key: "こ" },
    { code: "Digit1", key: "1" },
    { code: "Digit1", key: "１" },
    { code: "Digit1", key: "ぬ" },
    { code: "Numpad1", key: "1" },
  ];

  for (const input of bombInputs) {
    const action = getGameActionFromEvent(input);
    assert.strictEqual(
      action,
      "bomb",
      `Input (code: ${input.code}, key: ${input.key}) must map to "bomb" action`,
    );
  }

  // Non-bomb inputs must not map to bomb
  const otherInputs = [
    { code: "KeyA", key: "a" },
    { code: "ArrowLeft", key: "ArrowLeft" },
    { code: "Space", key: " " },
    { code: "KeyC", key: "c" },
  ];
  for (const input of otherInputs) {
    const action = getGameActionFromEvent(input);
    assert.notStrictEqual(action, "bomb", `Input ${input.code} must not map to "bomb"`);
  }

  // dispatchGameAction test
  const { callbacks } = createMockCallbacks();
  const engine = new GameEngine(STAGES[0], callbacks);
  engine.start();
  assert.strictEqual(engine.skills.length, 2);
  dispatchGameAction(engine, "bomb");
  assert.strictEqual(engine.skills.length, 1, "dispatchGameAction with 'bomb' triggers engine.useBomb()");
});
