import type { GameEngine } from "./engine";

export type GameAction =
  | "moveLeft"
  | "moveRight"
  | "hardDrop"
  | "softDrop"
  | "rotateCcw"
  | "rotateCw"
  | "hold"
  | "bomb"
  | "pause";

/**
 * キーボードイベントからゲームアクションを判定する
 * 物理キー(code)と文字(key)の両方を検証し、日本語IME(全角/かな入力)でも確実に操作を拾う
 */
export function getGameActionFromEvent(e: KeyboardEvent): GameAction | null {
  const code = e.code;
  const key = e.key;
  const lowerKey = key.toLowerCase();

  // 1. ポーズ (P, Escape, 全角P, かな「せ」)
  if (
    code === "KeyP" ||
    code === "Escape" ||
    lowerKey === "p" ||
    key === "ｐ" ||
    key === "Ｐ" ||
    key === "せ" ||
    key === "Escape"
  ) {
    return "pause";
  }

  // 2. 即置き / ハードドロップ (ArrowUp, Space, 全角スペース)
  if (
    code === "ArrowUp" ||
    code === "Space" ||
    key === "ArrowUp" ||
    key === " " ||
    key === "　"
  ) {
    return "hardDrop";
  }

  // 3. 左移動 (ArrowLeft, A, 全角A, かな「ち」)
  if (
    code === "ArrowLeft" ||
    code === "KeyA" ||
    key === "ArrowLeft" ||
    lowerKey === "a" ||
    key === "ａ" ||
    key === "Ａ" ||
    key === "ち"
  ) {
    return "moveLeft";
  }

  // 4. 右移動 (ArrowRight, D, 全角D, かな「し」)
  if (
    code === "ArrowRight" ||
    code === "KeyD" ||
    key === "ArrowRight" ||
    lowerKey === "d" ||
    key === "ｄ" ||
    key === "Ｄ" ||
    key === "し"
  ) {
    return "moveRight";
  }

  // 5. ソフトドロップ (ArrowDown, S, 全角S, かな「と」)
  if (
    code === "ArrowDown" ||
    code === "KeyS" ||
    key === "ArrowDown" ||
    lowerKey === "s" ||
    key === "ｓ" ||
    key === "Ｓ" ||
    key === "と"
  ) {
    return "softDrop";
  }

  // 6. 反時計回り / 左回転 (Z, Q, 全角Z/Q, かな「つ」「っ」「た」)
  if (
    code === "KeyZ" ||
    code === "KeyQ" ||
    lowerKey === "z" ||
    lowerKey === "q" ||
    key === "ｚ" ||
    key === "Ｚ" ||
    key === "ｑ" ||
    key === "Ｑ" ||
    key === "つ" ||
    key === "っ" ||
    key === "た"
  ) {
    return "rotateCcw";
  }

  // 7. 時計回り / 右回転 (X, W, 全角X, 全角W, かな「さ」「て」)
  if (
    code === "KeyX" ||
    code === "KeyW" ||
    lowerKey === "x" ||
    lowerKey === "w" ||
    key === "ｘ" ||
    key === "Ｘ" ||
    key === "ｗ" ||
    key === "Ｗ" ||
    key === "さ" ||
    key === "て"
  ) {
    return "rotateCw";
  }

  // 8. ホールド (C, Shift, 全角C, かな「そ」)
  if (
    code === "KeyC" ||
    code === "ShiftLeft" ||
    code === "ShiftRight" ||
    key === "Shift" ||
    lowerKey === "c" ||
    key === "ｃ" ||
    key === "Ｃ" ||
    key === "そ"
  ) {
    return "hold";
  }

  // 9. ボム (1, テンキー1, B, 全角1, 全角B, かな「こ」「ぬ」)
  if (
    code === "Digit1" ||
    code === "Numpad1" ||
    code === "KeyB" ||
    key === "1" ||
    key === "１" ||
    key === "ぬ" ||
    lowerKey === "b" ||
    key === "ｂ" ||
    key === "Ｂ" ||
    key === "こ"
  ) {
    return "bomb";
  }

  return null;
}

/**
 * ゲームエンジンに対してアクションを実行する
 */
export function dispatchGameAction(
  engine: GameEngine,
  action: GameAction,
): void {
  switch (action) {
    case "moveLeft":
      engine.moveLeft();
      break;
    case "moveRight":
      engine.moveRight();
      break;
    case "hardDrop":
      engine.hardDrop();
      break;
    case "softDrop":
      engine.softDrop();
      break;
    case "rotateCcw":
      engine.rotate(false);
      break;
    case "rotateCw":
      engine.rotate(true);
      break;
    case "hold":
      engine.hold();
      break;
    case "bomb":
      engine.useBomb();
      break;
    case "pause":
      engine.togglePause();
      break;
  }
}
