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
  SkillType,
  StageData,
  TetrominoType,
} from "./types/game";

type Screen = "title" | "story" | "game" | "result";

export function App() {
  const [screen, setScreen] = useState<Screen>("title");
  const [selectedStage, setSelectedStage] = useState<StageData>(STAGES[0]);
  const [isMuted, setIsMuted] = useState<boolean>(sounds.isMuted());

  // ゲームステート
  const [gameStatus, setGameStatus] = useState<GameStatus>("ready");
  const [hp, setHp] = useState<number>(100);
  const [virusRow, setVirusRow] = useState<number>(20);
  const [skills, setSkills] = useState<SkillType[]>([]);
  const [holdPiece, setHoldPiece] = useState<TetrominoType | null>(null);
  const [nextPieces, setNextPieces] = useState<TetrominoType[]>([]);
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    linesConnected: 0,
    itemsCollected: 0,
    clearTimeSeconds: 0,
    highestRow: 20,
  });
  const [gameOverReason, setGameOverReason] = useState<string>("");

  // GameEngineの初期化
  const engine = useMemo(() => {
    return new GameEngine(selectedStage, {
      onStatusChange: (status) => setGameStatus(status),
      onHpChange: (newHp) => setHp(newHp),
      onVirusRowChange: (row) => setVirusRow(row),
      onSkillsChange: (newSkills) => setSkills(newSkills),
      onHoldChange: (piece) => setHoldPiece(piece),
      onNextChange: (next) => setNextPieces(next),
      onStatsChange: (newStats) => setStats(newStats),
      onStageClear: () => {
        setScreen("result");
      },
      onGameOver: (reason) => {
        setGameOverReason(reason);
        setScreen("result");
      },
    });
  }, [selectedStage]);

  // サウンドミュート切り替え
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

  // タイトル・ステージ選択へ戻る
  const handleBackToTitle = useCallback(() => {
    setScreen("title");
  }, []);

  // キーボード操作リスナー
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
          e.preventDefault();
          engine.useSkill(0);
          break;
        case "2":
          e.preventDefault();
          engine.useSkill(1);
          break;
        case "3":
          e.preventDefault();
          engine.useSkill(2);
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-3 md:p-6 select-none overflow-x-hidden">
      {/* 画面ルーティング */}
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
        <div className="w-full flex flex-col items-center gap-4">
          <GameUI
            engine={engine}
            hp={hp}
            virusRow={virusRow}
            skills={skills}
            holdPiece={holdPiece}
            nextPieces={nextPieces}
            stats={stats}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            onExitGame={handleBackToTitle}
          />
          {/* 中央キャンバス */}
          <div className="flex justify-center -mt-2">
            <GameCanvas engine={engine} />
          </div>
        </div>
      )}

      {screen === "result" && (
        <ResultScreen
          isCleared={gameStatus === "cleared"}
          gameOverReason={gameOverReason}
          stage={selectedStage}
          stats={stats}
          hp={hp}
          onRetry={handleRetry}
          onSelectStage={handleBackToTitle}
        />
      )}
    </div>
  );
}
export default App;
