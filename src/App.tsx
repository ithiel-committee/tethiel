import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { sounds } from "./audio/soundSystem";
import { GameCanvas } from "./components/GameCanvas";
import { GameUI } from "./components/GameUI";
import { NovelScreen } from "./components/NovelScreen";
import { ResultScreen } from "./components/ResultScreen";
import { TitleScreen } from "./components/TitleScreen";
import { UIModeProvider } from "./context/UIModeContext";
import { getStoryScene } from "./data/storyData";
import { getNextStage, STAGES } from "./game/constants";
import { GameEngine } from "./game/engine";
import { dispatchGameAction, getGameActionFromEvent } from "./game/input";
import type {
  GameStats,
  GameStatus,
  StageData,
  TetrominoType,
} from "./types/game";
import { getStageBestRecords, saveGameResult } from "./utils/scoreStorage";
import { cleanStageUrl, parseStageFromUrl } from "./utils/url";

type Screen = "title" | "prologue" | "game" | "epilogue" | "result";

export function App() {
  const directStage = useMemo(() => parseStageFromUrl(), []);
  const [screen, setScreen] = useState<Screen>(
    directStage ? "game" : "title",
  );
  const [titleMenuView, setTitleMenuView] = useState<"main" | "select_level">(
    "main",
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
    bestScore: getStageBestRecords()[directStage?.id ?? 1]?.highScore ?? 0,
  });
  const [gameOverReason, setGameOverReason] = useState<string>("");

  // GameEngineの初期化
  const engine = useMemo(() => {
    const stageBests = getStageBestRecords();
    const initialBestScore = stageBests[selectedStage.id]?.highScore ?? 0;

    return new GameEngine(
      selectedStage,
      {
        onStatusChange: (status) => setGameStatus(status),
        onHeartsChange: (newHearts) => setHearts(newHearts),
        onCharacterMove: () => {},
        onHoldChange: (piece) => setHoldPiece(piece),
        onNextChange: (next) => setNextPieces(next),
        onStatsChange: (newStats) => setStats(newStats),
        onStageClear: (isBonus, finalStats) => {
          setIsBonusClear(isBonus);
          saveGameResult({
            stage: selectedStage,
            stats: finalStats,
            hearts: 5, // クリア時のハート数 (クリアボーナス計算済)
            isCleared: true,
            isBonusClear: isBonus,
          });
          const epilogue = getStoryScene(selectedStage.id, "epilogue");
          if (epilogue) {
            setScreen("epilogue");
          } else {
            setScreen("result");
          }
        },
        onGameOver: (reason, finalStats) => {
          setGameOverReason(reason);
          saveGameResult({
            stage: selectedStage,
            stats: finalStats,
            hearts: 0,
            isCleared: false,
            gameOverReason: reason,
          });
          setScreen("result");
        },
      },
      initialBestScore,
    );
  }, [selectedStage]);

  // ステージ切り替え後の自動開始管理
  const pendingStartStageIdRef = useRef<number | null>(null);

  // URL直接指定やプロローグなしステージ遷移時の自動開始管理
  useEffect(() => {
    if (engine.status !== "ready") return;

    if (directStage) {
      engine.start();
    } else if (
      pendingStartStageIdRef.current !== null &&
      selectedStage.id === pendingStartStageIdRef.current
    ) {
      pendingStartStageIdRef.current = null;
      engine.start();
    }
  }, [directStage, selectedStage, engine]);

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
      pendingStartStageIdRef.current = stage.id;
    }
  }, []);

  // 次のステージへ進む
  const handleNextStage = useCallback(() => {
    const next = getNextStage(selectedStage);
    if (next) {
      handleSelectStage(next);
    }
  }, [selectedStage, handleSelectStage]);

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

  // ホーム画面へ戻る
  const handleBackToHome = useCallback(() => {
    cleanStageUrl();
    setTitleMenuView("main");
    setScreen("title");
  }, []);

  // ステージ選択画面へ直行する
  const handleGoToStageSelect = useCallback(() => {
    cleanStageUrl();
    setTitleMenuView("select_level");
    setScreen("title");
  }, []);

  // 長押し(キーリピート)による連続暴発を防ぐキーの押下状態管理
  const activeSinglePressKeysRef = useRef<Set<string>>(new Set());

  // キーボード操作 (日本語IME/全角状態/物理キー判定を100%吸収)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. フォーカスがボタンなどのインタラクティブ要素にある場合、Space/Enterはボタンの実行を優先
      const activeEl = document.activeElement;
      const isInteractive =
        activeEl &&
        activeEl !== document.body &&
        (activeEl.tagName === "BUTTON" ||
          activeEl.tagName === "INPUT" ||
          activeEl.tagName === "SELECT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.tagName === "A" ||
          activeEl.getAttribute("role") === "button" ||
          activeEl.getAttribute("tabindex") !== null);

      if (
        isInteractive &&
        (e.key === " " || e.key === "Enter" || e.code === "Space")
      ) {
        // div role="button" 等の非button要素でSpaceキーによるスクロールを防ぎつつクリック発火
        if (
          activeEl.tagName !== "BUTTON" &&
          typeof (activeEl as HTMLElement).click === "function"
        ) {
          e.preventDefault();
          (activeEl as HTMLElement).click();
        }
        return;
      }

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
    <UIModeProvider>
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
            initialMenuView={titleMenuView}
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
            onBackToTitle={handleBackToHome}
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
            onExitGame={handleBackToHome}
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
            nextStage={getNextStage(selectedStage)}
            onRetry={handleRetry}
            onSelectStage={handleGoToStageSelect}
            onGoHome={handleBackToHome}
            onNextStage={handleNextStage}
          />
        </div>
      )}
      </div>
    </UIModeProvider>
  );
}
export default App;
