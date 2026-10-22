import {
  Heart,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ithielArmHp0 from "../assets/character/ithiel_arm_hp0_down.png";
import ithielArmHp1 from "../assets/character/ithiel_arm_hp1_tearful.png";
import ithielArmHp2 from "../assets/character/ithiel_arm_hp2_frustrated.png";
import ithielArmHp3 from "../assets/character/ithiel_arm_hp3_determined.png";
import ithielArmHp4 from "../assets/character/ithiel_arm_hp4_default.png";
import ithielArmHp5 from "../assets/character/ithiel_arm_hp5_smile.png";
import { TETROMINO_SHAPES } from "../game/constants";
import { useUIText } from "../context/UIModeContext";
import type { GameEngine } from "../game/engine";
import type { GameStats, TetrominoType } from "../types/game";
import { useOverflowCheck } from "../utils/overflowChecker";
import { Keycap } from "./Keycap";

// 現在HPに応じたイティエルの腕上げ立ち絵を取得
const getIthielStandingImage = (currentHearts: number) => {
  if (currentHearts >= 5) return ithielArmHp5;
  if (currentHearts === 4) return ithielArmHp4;
  if (currentHearts === 3) return ithielArmHp3;
  if (currentHearts === 2) return ithielArmHp2;
  if (currentHearts === 1) return ithielArmHp1;
  return ithielArmHp0;
};

interface GameUIProps {
  engine: GameEngine;
  hearts: number;
  holdPiece: TetrominoType | null;
  nextPieces: TetrominoType[];
  stats: GameStats;
  isMuted: boolean;
  onToggleMute: () => void;
  onExitGame: () => void;
  children: React.ReactNode; // 中央Canvasスロット
}

export const GameUI = ({
  engine,
  hearts,
  holdPiece,
  nextPieces,
  stats,
  isMuted,
  onToggleMute,
  onExitGame,
  children,
}: GameUIProps) => {
  const { t, isKids } = useUIText();
  useOverflowCheck("GameUI");
  const [isPaused, setIsPaused] = useState(engine.status === "paused");
  const [floatingScores, setFloatingScores] = useState<
    { id: number; text: string }[]
  >([]);
  const [isScoreBumping, setIsScoreBumping] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [damagePopups, setDamagePopups] = useState<
    { id: number; text: string }[]
  >([]);
  const [brokenHeartIndices, setBrokenHeartIndices] = useState<number[]>(
    [],
  );
  const prevStarsRef = useRef(stats.bonusStars);
  const prevHeartsRef = useRef(hearts);

  useEffect(() => {
    setIsPaused(engine.status === "paused");
  }, [engine.status]);

  // 星獲得時の +スコア ポップアップ演出
  useEffect(() => {
    if (stats.bonusStars > prevStarsRef.current) {
      const diff = stats.bonusStars - prevStarsRef.current;
      const addedScore = diff * 800;
      const id = Date.now() + Math.random();
      setFloatingScores((prev) => [
        ...prev,
        { id, text: `+${addedScore}` },
      ]);
      setIsScoreBumping(true);
      const bumpTimer = setTimeout(() => setIsScoreBumping(false), 400);
      const popupTimer = setTimeout(() => {
        setFloatingScores((prev) => prev.filter((item) => item.id !== id));
      }, 1000);

      return () => {
        clearTimeout(bumpTimer);
        clearTimeout(popupTimer);
      };
    }
    prevStarsRef.current = stats.bonusStars;
  }, [stats.bonusStars]);

  // ハート減少時の被弾アニメーション（画面振動・ハート破裂・♡-1表示）
  useEffect(() => {
    if (hearts < prevHeartsRef.current) {
      const diff = prevHeartsRef.current - hearts;
      setIsShaking(true);
      const shakeTimer = setTimeout(() => setIsShaking(false), 450);

      const lostIndices: number[] = [];
      for (let i = hearts; i < prevHeartsRef.current; i++) {
        lostIndices.push(i);
      }
      setBrokenHeartIndices((prev) => [...prev, ...lostIndices]);
      const brokenTimer = setTimeout(() => {
        setBrokenHeartIndices((prev) =>
          prev.filter((idx) => !lostIndices.includes(idx)),
        );
      }, 650);

      const newId = Date.now() + Math.random();
      setDamagePopups((prev) => [
        ...prev,
        { id: newId, text: `♡ -${diff}` },
      ]);
      const popupTimer = setTimeout(() => {
        setDamagePopups((prev) =>
          prev.filter((item) => item.id !== newId),
        );
      }, 1000);

      return () => {
        clearTimeout(shakeTimer);
        clearTimeout(brokenTimer);
        clearTimeout(popupTimer);
      };
    }
    prevHeartsRef.current = hearts;
  }, [hearts]);

  // タイムフォーマット mm:ss.SS
  const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    const hundredths = Math.floor((ms % 1000) / 10);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${hundredths.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full max-w-5xl h-full flex flex-col justify-center items-center font-['DotGothic16',sans-serif]">
      {/* 3カラムメインレイアウト */}
      <div
        className={`w-full flex flex-col lg:flex-row justify-center items-center lg:items-start gap-4 ${
          isShaking ? "animate-screen-shake" : ""
        }`}
      >
        {/* ================= 左パネル ================= */}
        <div className="w-full lg:w-[260px] flex flex-col gap-3">
          {/* システムバー (STAGE名 & PAUSE / MUTE / EXIT コントロール) */}
          <div className="game-hud-card game-hud-system-bar w-full">
            <div className="font-pixel-en text-rose-400 text-xs font-bold tracking-wider">
              {stats.gameMode === "endless"
                ? (isKids ? "エンドレス" : "ENDLESS")
                : (isKids
                    ? `ステージ ${stats.stageNumber.toString().padStart(2, "0")}`
                    : `STAGE ${stats.stageNumber.toString().padStart(2, "0")}`)}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  engine.togglePause();
                  setIsPaused(engine.status === "paused");
                }}
                title={isKids ? (isPaused ? "つづける" : "ひとやすみ") : (isPaused ? "再開" : "一時停止")}
                className="game-hud-btn"
              >
                {isPaused ? <Play size={13} fill="currentColor" /> : <Pause size={13} />}
              </button>

              <button
                type="button"
                onClick={onToggleMute}
                title={isKids ? (isMuted ? "おとをだす" : "おとをけす") : (isMuted ? "ミュート解除" : "ミュート")}
                className="game-hud-btn"
              >
                {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
              </button>

              <button
                type="button"
                onClick={onExitGame}
                title={isKids ? "おわる" : "タイトルへ戻る"}
                className="game-hud-btn-danger"
              >
                {t("exit")}
              </button>
            </div>
          </div>

          {/* 1. 残りライフ (ハート5つ) */}
          <div className="game-hud-card game-hud-hearts-card relative">
            {[0, 1, 2, 3, 4].map((i) => {
              const isBroken = brokenHeartIndices.includes(i);
              const isAlive = i < hearts;

              return (
                <div key={`heart-${i}`} className="game-hud-heart-slot">
                  <Heart
                    size={20}
                    className={`transition-colors duration-300 ${
                      isAlive
                        ? "text-rose-400 fill-rose-500 filter drop-shadow-[0_0_6px_rgba(244,63,94,0.8)]"
                        : "text-slate-700 fill-slate-800"
                    }`}
                  />
                  {/* 消える瞬間の破裂アニメーション */}
                  {isBroken && (
                    <div className="absolute inset-0 flex items-center justify-center animate-heart-break pointer-events-none">
                      <Heart
                        size={20}
                        className="text-rose-300 fill-rose-500 filter drop-shadow-[0_0_14px_rgba(255,0,85,1)]"
                      />
                    </div>
                  )}
                </div>
              );
            })}

            {/* ♡ -1 ダメージポップアップ */}
            <div className="absolute left-full ml-2 flex flex-col gap-1 pointer-events-none">
              {damagePopups.map((item) => (
                <span
                  key={item.id}
                  className="font-pixel-en text-xs font-bold text-rose-400 animate-damage-popup drop-shadow-[0_0_8px_rgba(244,63,94,0.9)] whitespace-nowrap"
                >
                  {item.text}
                </span>
              ))}
            </div>
          </div>

          {/* 2. ステータス情報カード */}
          <div className="game-hud-card p-3.5 flex flex-col text-left">
            {/* SCORE */}
            <div className="game-stat-row relative">
              <span className="game-stat-label">{t("score")}</span>
              <div className="relative flex items-center gap-2">
                <span
                  className={`game-stat-val text-yellow-400 font-pixel-en text-sm transition-transform ${
                    isScoreBumping
                      ? "animate-score-bump text-yellow-300"
                      : ""
                  }`}
                >
                  {stats.score.toLocaleString()}
                </span>
                {/* 星獲得時の浮き上がる+スコアアニメーション */}
                <div className="absolute left-full ml-1.5 flex flex-col gap-1 pointer-events-none">
                  {floatingScores.map((item) => (
                    <span
                      key={item.id}
                      className="font-pixel-en text-xs font-bold text-amber-300 animate-score-popup drop-shadow-[0_0_8px_rgba(251,191,36,0.9)] whitespace-nowrap"
                    >
                      {item.text}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* TIME */}
            <div className="game-stat-row">
              <span className="game-stat-label">{t("time")}</span>
              <span className="game-stat-val text-rose-200">
                {formatTime(stats.clearTimeMs)}
              </span>
            </div>

            {/* MINO COUNT */}
            <div className="game-stat-row">
              <span className="game-stat-label">{t("minoCount")}</span>
              <span className="game-stat-val text-pink-400">
                {stats.minoCount.toString().padStart(3, "0")}
              </span>
            </div>

            {/* STAGE or MODE */}
            <div className="game-stat-row">
              <span className="game-stat-label">
                {engine.gameMode === "endless" ? t("mode") : t("stage")}
              </span>
              <span className="game-stat-val text-rose-400">
                {engine.gameMode === "endless"
                  ? (isKids ? "エンドレス" : "ENDLESS")
                  : stats.stageNumber.toString().padStart(2, "0")}
              </span>
            </div>

            {/* HEIGHT (エンドレス時) または BONUS (ステージ時) */}
            {engine.gameMode === "endless" ? (
              <div className="game-stat-row">
                <span className="game-stat-label">{t("height")}</span>
                <span className="game-stat-val text-amber-300 font-bold">
                  {engine.climbedHeight} m
                </span>
              </div>
            ) : (
              <div className="game-stat-row">
                <span className="game-stat-label">{t("bonus")}</span>
                <span className="game-stat-val text-amber-300 flex items-center gap-1">
                  <span>★</span>
                  <span>{`${stats.bonusStars}/${stats.totalStars}`}</span>
                </span>
              </div>
            )}

            {/* VIRUS STATUS */}
            <div className="game-stat-row">
              <span className="game-stat-label">{t("virus")}</span>
              {engine.minosUntilInfection > 0 ? (
                <span className="text-amber-300 text-xs font-bold animate-pulse font-['DotGothic16',sans-serif]">
                  {isKids
                    ? `まってます (あと${engine.minosUntilInfection}かい)`
                    : `待機中 (あと${engine.minosUntilInfection}手)`}
                </span>
              ) : (
                <span className="text-rose-400 text-xs font-bold font-['DotGothic16',sans-serif]">
                  {t("virusAdvancing")}
                </span>
              )}
            </div>

            {/* BEST SCORE (区切りボーダー) */}
            <div className="border-t border-slate-800/80 mt-1.5 pt-1.5">
              <div className="game-stat-row">
                <span className="game-stat-label text-slate-500">{t("bestScore")}</span>
                <span className="game-stat-val text-purple-400">
                  {stats.bestScore.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= 中央パネル (Canvas) ================= */}
        <div className="flex justify-center shrink-0">{children}</div>

        {/* ================= 右パネル ================= */}
        <div className="w-full lg:w-[260px] flex flex-col gap-3">
          {/* NEXT & HOLD スロット */}
          <div className="grid grid-cols-2 gap-2">
            {/* NEXT */}
            <div className="game-hud-card p-2.5 text-center">
              <div className="font-pixel-en text-[10px] text-rose-400 mb-1.5 font-bold tracking-wider">
                {t("next")}
              </div>
              <div className="w-full h-14 bg-slate-950/90 rounded border border-slate-800/80 flex items-center justify-center">
                {nextPieces[0] ? (
                  <MiniPieceView type={nextPieces[0]} />
                ) : (
                  <span className="text-slate-600 text-xs">--</span>
                )}
              </div>
            </div>

            {/* HOLD */}
            <div className="game-hud-card p-2.5 text-center">
              <div className="font-pixel-en text-[10px] text-rose-400 mb-1.5 flex items-center justify-between px-0.5 font-bold tracking-wider">
                <span>{t("hold")}</span>
                <Keycap
                  variant="accent"
                  className="text-[9px] min-w-[18px] h-[18px] leading-none px-1"
                >
                  C / SHIFT
                </Keycap>
              </div>
              <div className="w-full h-14 bg-slate-950/90 rounded border border-slate-800/80 flex items-center justify-center">
                {holdPiece ? (
                  <MiniPieceView type={holdPiece} />
                ) : (
                  <span className="text-slate-600 text-xs">--</span>
                )}
              </div>
            </div>
          </div>

          {/* イティエル立ち絵表示枠 (HP連動表情・腕上げポーズ) */}
          <div className="game-hud-card relative w-full h-44 overflow-hidden flex flex-col items-center justify-end p-2.5 border-rose-500/35">
            {/* サイバー背景エフェクト */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ff1a4b_1px,transparent_1px)] [background-size:12px_12px]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,26,75,0.2)_0%,transparent_70%)] pointer-events-none" />

            {/* イティエル公式立ち絵イラスト (HP連動) */}
            <img
              src={getIthielStandingImage(hearts)}
              alt="イティエル"
              loading="eager"
              decoding="async"
              className={`relative z-10 w-full h-full object-contain object-bottom drop-shadow-[0_0_14px_rgba(255,26,75,0.35)] select-none pointer-events-none transition-all duration-300 ${
                isShaking ? "scale-95 brightness-125 filter drop-shadow-[0_0_20px_#ff1a4b]" : "scale-100"
              }`}
            />
          </div>

          {/* 操作説明枠 (キーボード操作ガイド - キーUIはそのまま維持) */}
          <div className="game-hud-card p-3.5 text-left space-y-1.5 shadow-[0_0_12px_rgba(255,26,75,0.12)]">
            <div className="border-b border-slate-800/80 pb-1.5 mb-1 flex justify-between items-center text-[10px]">
              <span className="text-rose-400 font-bold font-['DotGothic16',sans-serif] text-xs tracking-wider">
                {t("controlsGuide")}
              </span>
              <span className="text-[9px] text-slate-500 tracking-wider font-pixel-en">{t("keyboard")}</span>
            </div>

            <div className="flex flex-col gap-1 text-[11px] pt-0.5">
              <div className="game-guide-row">
                <span className="game-guide-label">{t("hardDrop")}</span>
                <Keycap>↑</Keycap>
                <Keycap wide>SPACE</Keycap>
              </div>
              <div className="game-guide-row">
                <span className="game-guide-label">{t("rotate")}</span>
                <Keycap>Q</Keycap>
                <Keycap>W</Keycap>
                <Keycap>Z</Keycap>
                <Keycap>X</Keycap>
              </div>
              <div className="game-guide-row">
                <span className="game-guide-label">{t("move")}</span>
                <Keycap>←</Keycap>
                <Keycap>→</Keycap>
                <Keycap>A</Keycap>
                <Keycap>D</Keycap>
              </div>
              <div className="game-guide-row">
                <span className="game-guide-label">{t("softDrop")}</span>
                <Keycap>↓</Keycap>
                <Keycap>S</Keycap>
              </div>
              <div className="game-guide-row">
                <span className="game-guide-label">{t("holdLabel")}</span>
                <Keycap variant="accent">C</Keycap>
                <Keycap variant="accent" wide>SHIFT</Keycap>
                <span className="text-slate-500 text-[10px] ml-1">{t("minoExchange")}</span>
              </div>
              {engine.skills.length > 0 && (
                <div className="game-guide-row">
                  <span className="game-guide-label">{t("bombGuideLabel")}</span>
                  <Keycap variant="accent">B</Keycap>
                  <Keycap>1</Keycap>
                  <span className="text-amber-300 font-pixel-en text-[11px] font-bold ml-0.5">
                    ×{engine.skills.length}
                  </span>
                  <span className="text-slate-500 text-[10px] ml-1">
                    {t("bombDesc")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// NEXTやHOLDのミニミノ描画（SVGによる確実なピクセル描画）
function MiniPieceView({ type }: { type: TetrominoType }) {
  const shape = TETROMINO_SHAPES[type];
  const matrix = shape.matrix;
  const blockSize = 11;
  const gap = 2;

  const rows = matrix.length;
  const cols = matrix[0].length;
  const width = cols * blockSize + (cols - 1) * gap;
  const height = rows * blockSize + (rows - 1) * gap;

  return (
    <svg
      role="img"
      aria-label={`Tetromino ${type}`}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: "block" }}
    >
      <title>{`Tetromino ${type}`}</title>
      {matrix.map((row, r) =>
        row.map((val, c) => {
          if (!val) return null;
          const x = c * (blockSize + gap);
          const y = r * (blockSize + gap);
          return (
            <rect
              key={`mini-${type}-${r * 10 + c}`}
              x={x}
              y={y}
              width={blockSize}
              height={blockSize}
              rx={1.5}
              fill={shape.color}
              stroke="rgba(255, 255, 255, 0.4)"
              strokeWidth="0.8"
            />
          );
        }),
      )}
    </svg>
  );
}
