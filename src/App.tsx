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

// URLから直接開始するステージを判定 (/play/stage-1, #/play/stage-1, ?stage=1 など)
function parseStageFromUrl(): StageData | null {
  if (typeof window === "undefined") return null;
  const url = `${window.location.pathname}${window.location.search}${window.location.hash}`.toLowerCase();
  const match = url.match(/(?:play\/stage-|play\/stage|stage-|stage=)(\d+)/);
  if (match) {
    const stageId = parseInt(match[1], 10);
    const found = STAGES.find((s) => s.id === stageId);
    if (found) return found;
  }
  return null;
}

export function App() {
  const directStage = useMemo(() => parseStageFromUrl(), []);
  const [screen, setScreen] = useState<Screen>(directStage ? "game" : "title");
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
      const cleanPath = window.location.pathname.replace(/\/play\/.*$/, "/");
      window.history.replaceState(null, "", cleanPath || "/");
    }
    setScreen("title");
  }, []);

  // キーボード操作
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (screen !== "game" || engine.status !== "playing") {
        if (e.key === "p" || e.key === "P") {
          engine.togglePause();
        }
        return;
      }

      switch (e.key) {
        case "ArrowLeft":
        case "a":
        case "A":
          e.preventDefault();
          engine.moveLeft();
          break;
        case "ArrowRight":
        case "d":
        case "D":
          e.preventDefault();
          engine.moveRight();
          break;
        case "ArrowUp":
        case "w":
        case "W":
        case "z":
        case "Z":
        case "x":
        case "X":
          e.preventDefault();
          engine.rotate();
          break;
        case "ArrowDown":
        case "s":
        case "S":
          e.preventDefault();
          engine.softDrop();
          break;
        case " ": // Space
          e.preventDefault();
          engine.hardDrop();
          break;
        case "c":
        case "C":
          e.preventDefault();
          engine.hold();
          break;
        case "1":
        case "b":
        case "B":
          e.preventDefault();
          engine.useBomb();
          break;
        case "p":
        case "P":
        case "Escape":
          e.preventDefault();
          engine.togglePause();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [screen, engine]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-2 sm:p-4 select-none overflow-x-hidden">
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
