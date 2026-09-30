import { useCallback, useEffect, useMemo, useState } from "react";
import { sounds } from "./audio/soundSystem";
import { GameCanvas } from "./components/GameCanvas";
import { GameUI } from "./components/GameUI";
import { ResultScreen } from "./components/ResultScreen";
import { StoryDialog } from "./components/StoryDialog";
import { TitleScreen } from "./components/TitleScreen";
import { STAGES } from "./game/constants";
import { GameEngine } from "./game/engine";
import type {
  GameStats,
  GameStatus,
  StageData,
  TetrominoType,
} from "./types/game";

type Screen = "title" | "story" | "game" | "result";

// URLから直接開始するステージを判定 (/play/stage-1, #/play/stage-1, ?stage=1 など)
function parseStageFromUrl(): StageData | null {
  if (typeof window === "undefined") return null;
  const url =
    `${window.location.pathname}${window.location.search}${window.location.hash}`.toLowerCase();
  const match = url.match(
    /(?:play\/stage-|play\/stage|stage-|stage=)(\d+)/,
  );
  if (match) {
    const stageId = Number.parseInt(match[1], 10);
    const found = STAGES.find((s) => s.id === stageId);
    if (found) return found;
  }
  return null;
}

// キー入力判定：物理キー(code)と文字(key)の両方を検証し、
// 日本語IME（全角ひらがなモード/全角英数/かな入力等）の変な状態でも100%確実に操作を拾えるようにする
type GameAction =
  | "moveLeft"
  | "moveRight"
  | "hardDrop"
  | "softDrop"
  | "rotateCcw"
  | "rotateCw"
  | "hold"
  | "bomb"
  | "pause";

function getGameActionFromEvent(e: KeyboardEvent): GameAction | null {
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

  // 6. 反時計回り / 左回転 (Z, 全角Z, かな「つ」「っ」)
  if (
    code === "KeyZ" ||
    lowerKey === "z" ||
    key === "ｚ" ||
    key === "Ｚ" ||
    key === "つ" ||
    key === "っ"
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

  // 8. ホールド (C, 全角C, かな「そ」)
  if (
    code === "KeyC" ||
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

export function App() {
  const directStage = useMemo(() => parseStageFromUrl(), []);
  const [screen, setScreen] = useState<Screen>(
    directStage ? "game" : "title",
  );
  const [selectedStage, setSelectedStage] = useState<StageData>(
    directStage ?? STAGES[0],
  );
  const [isMuted, setIsMuted] = useState<boolean>(sounds.isMuted());

  // ゲームステート
  const [gameStatus, setGameStatus] = useState<GameStatus>("ready");
  const [hearts, setHearts] = useState<number>(5);
  const [holdPiece, setHoldPiece] = useState<TetrominoType | null>(null);
  const [nextPieces, setNextPieces] = useState<TetrominoType[]>([]);
  const [isBonusClear, setIsBonusClear] = useState<boolean>(false);
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    clearTimeSeconds: 0,
    clearTimeMs: 0,
    minoCount: 0,
    bonusStars: 0,
    totalStars: 5,
    stageNumber: directStage?.id ?? 1,
    bestScore: 987654,
  });
  const [gameOverReason, setGameOverReason] = useState<string>("");

  // GameEngineの初期化
  const engine = useMemo(() => {
    return new GameEngine(selectedStage, {
      onStatusChange: (status) => setGameStatus(status),
      onHeartsChange: (newHearts) => setHearts(newHearts),
      onCharacterMove: () => {},
      onHoldChange: (piece) => setHoldPiece(piece),
      onNextChange: (next) => setNextPieces(next),
      onStatsChange: (newStats) => setStats(newStats),
      onStageClear: (isBonus) => {
        setIsBonusClear(isBonus);
        setScreen("result");
      },
      onGameOver: (reason) => {
        setGameOverReason(reason);
        setScreen("result");
      },
    });
  }, [selectedStage]);

  // URL直接指定で直接ゲーム画面に入った場合の自動開始
  useEffect(() => {
    if (directStage && engine.status === "ready") {
      engine.start();
    }
  }, [directStage, engine]);

  // サウンド切り替え
  const handleToggleMute = useCallback(() => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  }, []);

  // ステージ選択
  const handleSelectStage = useCallback((stage: StageData) => {
    setSelectedStage(stage);
    setScreen("story");
  }, []);

  // ゲーム開始
  const handleStartGame = useCallback(() => {
    setScreen("game");
    engine.start();
  }, [engine]);

  // リトライ
  const handleRetry = useCallback(() => {
    setScreen("game");
    engine.start();
  }, [engine]);

  // タイトルへ戻る
  const handleBackToTitle = useCallback(() => {
    if (
      window.location.pathname.includes("/play/") ||
      window.location.hash ||
      window.location.search.includes("stage=")
    ) {
      const cleanPath = window.location.pathname.replace(
        /\/play\/.*$/,
        "/",
      );
      window.history.replaceState(null, "", cleanPath || "/");
    }
    setScreen("title");
  }, []);

  // キーボード操作（日本語IME/全角状態/物理キー判定を100%吸収）
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const action = getGameActionFromEvent(e);
      if (!action) return;

      // 一時停止はゲーム画面であればポーズ中・プレイ中問わず有効
      if (action === "pause") {
        if (screen === "game") {
          e.preventDefault();
          engine.togglePause();
        }
        return;
      }

      // プレイ中のみゲーム操作を実行
      if (screen !== "game" || engine.status !== "playing") {
        return;
      }

      // ゲーム用キーはIME変換やブラウザスクロール等を防ぐため必ず抑止
      e.preventDefault();
      e.stopPropagation();

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
      }
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () =>
      window.removeEventListener("keydown", handleKeyDown, {
        capture: true,
      });
  }, [screen, engine]);

  return (
    <div className="min-h-screen text-slate-100 flex flex-col items-center justify-center p-2 sm:p-4 select-none overflow-x-hidden">
      {screen === "title" && (
        <TitleScreen
          onSelectStage={handleSelectStage}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {screen === "story" && (
        <StoryDialog
          stage={selectedStage}
          onStartGame={handleStartGame}
          onBackToTitle={handleBackToTitle}
        />
      )}

      {screen === "game" && (
        <GameUI
          engine={engine}
          hearts={hearts}
          holdPiece={holdPiece}
          nextPieces={nextPieces}
          stats={stats}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onExitGame={handleBackToTitle}
        >
          <GameCanvas engine={engine} />
        </GameUI>
      )}

      {screen === "result" && (
        <ResultScreen
          isCleared={gameStatus === "cleared"}
          isBonusClear={isBonusClear}
          gameOverReason={gameOverReason}
          stage={selectedStage}
          stats={stats}
          hearts={hearts}
          onRetry={handleRetry}
          onSelectStage={handleBackToTitle}
        />
      )}
    </div>
  );
}
export default App;
