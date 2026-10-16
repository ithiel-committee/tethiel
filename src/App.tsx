import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { sounds } from "./audio/soundSystem";
import { GameCanvas } from "./components/GameCanvas";
import { GameUI } from "./components/GameUI";
import { NovelScreen } from "./components/NovelScreen";
import { ResultScreen } from "./components/ResultScreen";
import { TitleScreen } from "./components/TitleScreen";
import { getStoryScene } from "./data/storyData";
import { STAGES } from "./game/constants";
import { GameEngine } from "./game/engine";
import { dispatchGameAction, getGameActionFromEvent } from "./game/input";
import type {
  GameStats,
  GameStatus,
  StageData,
  TetrominoType,
} from "./types/game";
import { cleanStageUrl, parseStageFromUrl } from "./utils/url";

type Screen = "title" | "prologue" | "game" | "epilogue" | "result";

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
        const epilogue = getStoryScene(selectedStage.id, "epilogue");
        if (epilogue) {
          setScreen("epilogue");
        } else {
          setScreen("result");
        }
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

  // ステージ選択 (プロローグが存在すればプロローグへ、なければゲーム開始)
  const handleSelectStage = useCallback((stage: StageData) => {
    setSelectedStage(stage);
    const prologue = getStoryScene(stage.id, "prologue");
    if (prologue) {
      setScreen("prologue");
    } else {
      setScreen("game");
      engine.start();
    }
  }, [engine]);

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
    cleanStageUrl();
    setScreen("title");
  }, []);

  // 長押し(キーリピート)による連続暴発を防ぐキーの押下状態管理
  const activeSinglePressKeysRef = useRef<Set<string>>(new Set());

  // キーボード操作 (日本語IME/全角状態/物理キー判定を100%吸収)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const action = getGameActionFromEvent(e);
      if (!action) return;

      // 上キー等の即置き(hardDrop)や単発アクションは長押しによる連続暴発を防ぐ
      if (
        action === "hardDrop" ||
        action === "hold" ||
        action === "pause" ||
        action === "bomb"
      ) {
        if (e.repeat || activeSinglePressKeysRef.current.has(e.code)) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        activeSinglePressKeysRef.current.add(e.code);
      }

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

      dispatchGameAction(engine, action);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      activeSinglePressKeysRef.current.delete(e.code);
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    window.addEventListener("keyup", handleKeyUp, { capture: true });
    return () => {
      window.removeEventListener("keydown", handleKeyDown, {
        capture: true,
      });
      window.removeEventListener("keyup", handleKeyUp, {
        capture: true,
      });
    };
  }, [screen, engine]);

  return (
    <div
      className={`w-full text-slate-100 flex flex-col items-center justify-center select-none overflow-x-hidden ${
        screen === "title" || screen === "game"
          ? "h-screen max-h-screen overflow-hidden p-1 sm:p-2"
          : "min-h-screen p-2 sm:p-4"
      }`}
    >
      {screen === "title" && (
        <div key="title" className="screen-transition-enter w-full h-full">
          <TitleScreen
            onSelectStage={handleSelectStage}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
          />
        </div>
      )}

      {screen === "prologue" && (
        <div key="prologue" className="screen-transition-enter w-full">
          <NovelScreen
            scene={
              getStoryScene(selectedStage.id, "prologue") ?? {
                id: "fallback-prologue",
                stageId: selectedStage.id,
                type: "prologue",
                title: "MISSION BRIEFING",
                dialogues: [
                  {
                    speaker: "イティエル",
                    expression: "determined",
                    text: "準備はいい？ 防衛戦を開始するよ！",
                  },
                ],
              }
            }
            onComplete={handleStartGame}
            onBackToTitle={handleBackToTitle}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
          />
        </div>
      )}

      {screen === "epilogue" && (
        <div key="epilogue" className="screen-transition-enter w-full">
          <NovelScreen
            scene={
              getStoryScene(selectedStage.id, "epilogue") ?? {
                id: "fallback-epilogue",
                stageId: selectedStage.id,
                type: "epilogue",
                title: "MISSION COMPLETE",
                dialogues: [
                  {
                    speaker: "イティエル",
                    expression: "smile",
                    text: "防衛成功！ お疲れ様、プレイヤー！",
                  },
                ],
              }
            }
            onComplete={() => setScreen("result")}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
          />
        </div>
      )}

      {screen === "game" && (
        <div key="game" className="screen-transition-enter w-full h-full flex justify-center items-center overflow-hidden">
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
        </div>
      )}

      {screen === "result" && (
        <div key="result" className="screen-transition-enter w-full flex justify-center">
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
        </div>
      )}
    </div>
  );
}
export default App;
