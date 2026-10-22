import test from "node:test";
import assert from "node:assert/strict";
import { STAGES } from "../src/game/constants.ts";
import { simulateStagePlay } from "./stage_solver.mjs";
import { checkPieceReachability } from "./test_reachability_all.mjs";

test("1. STAGE 1 Static Greedy AI Solvability Verification", () => {
  const stage1 = STAGES.find(s => s.id === 1);
  assert.ok(stage1, "STAGE 1 must exist");

  const result = simulateStagePlay(stage1, 42, 35);
  assert.strictEqual(
    result.success,
    true,
    `STAGE 1 must be clearable by static AI (moves: ${result.moves}, reason: ${result.reason})`,
  );
  assert.ok(
    result.highestRow <= 2,
    `STAGE 1 reached row (${result.highestRow}) must reach GOAL (<= 2)`,
  );
});

test("2. STAGE 2 Static Greedy AI Solvability Verification", () => {
  const stage2 = STAGES.find(s => s.id === 2);
  assert.ok(stage2, "STAGE 2 must exist");

  const result = simulateStagePlay(stage2, 42, 35);
  assert.strictEqual(
    result.success,
    true,
    `STAGE 2 must be clearable by static AI (moves: ${result.moves}, reason: ${result.reason})`,
  );
  assert.ok(
    result.highestRow <= 2,
    `STAGE 2 reached row (${result.highestRow}) must reach GOAL (<= 2)`,
  );
});

test("3. STAGE 3 Static Greedy AI Solvability Verification", () => {
  const stage3 = STAGES.find(s => s.id === 3);
  assert.ok(stage3, "STAGE 3 must exist");

  const result = simulateStagePlay(stage3, 42, 35);
  assert.strictEqual(
    result.success,
    true,
    `STAGE 3 must be clearable by static AI (moves: ${result.moves}, reason: ${result.reason})`,
  );
  assert.ok(
    result.highestRow <= 2,
    `STAGE 3 reached row (${result.highestRow}) must reach GOAL (<= 2)`,
  );
});

test("4. All Tetromino Pieces Ground Reachability Verification (All Stages)", () => {
  for (const stage of STAGES) {
    const reachability = checkPieceReachability(stage.initialObstacles);
    for (const [pieceType, status] of Object.entries(reachability)) {
      assert.strictEqual(
        status.canReachBottom,
        true,
        `${stage.name}: Piece ${pieceType} must be able to reach bottom without being blocked by obstacles (deepestBottomRow: ${status.deepestBottomRow})`,
      );
    }
  }
});
