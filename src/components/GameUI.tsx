import {
  Bomb,
  Heart,
  Pause,
  Play,
  RotateCw,
  User,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { TETROMINO_SHAPES } from "../game/constants";
import type { GameEngine } from "../game/engine";
import type { GameStats, TetrominoType } from "../types/game";

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
  const [isPaused, setIsPaused] = useState(engine.status === "paused");
  const [floatingScores, setFloatingScores] = useState<
    { id: number; text: string }[]
  >([]);
  const [isScoreBumping, setIsScoreBumping] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [damagePopups, setDamagePopups] = useState<
    { id: number; text: string }[]
  >([]);
  const [brokenHeartIndices, setBrokenHeartIndices] = useState<number[]>([]);
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
      setFloatingScores((prev) => [...prev, { id, text: `+${addedScore}` }]);
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
      setDamagePopups((prev) => [...prev, { id: newId, text: `♡ -${diff}` }]);
      const popupTimer = setTimeout(() => {
        setDamagePopups((prev) => prev.filter((item) => item.id !== newId));
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
    <div className="w-full max-w-5xl flex flex-col items-center gap-3 font-['DotGothic16',sans-serif]">
      {/* トップコントロールバー（一時停止・ミュート・終了） */}
      <div className="w-full flex items-center justify-between px-3 py-1.5 bg-slate-900/80 border border-cyan-500/30 rounded-lg text-xs">
        <div className="flex items-center gap-2 text-cyan-400 font-pixel-en">
          <span className="text-slate-400 text-xs font-['DotGothic16']">
            {`// STAGE ${stats.stageNumber.toString().padStart(2, "0")}`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              engine.togglePause();
              setIsPaused(engine.status === "paused");
            }}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-cyan-300 transition-colors cursor-pointer text-xs"
          >
            {isPaused ? <Play size={13} /> : <Pause size={13} />}
            <span>{isPaused ? "RESUME" : "PAUSE"}</span>
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-cyan-300 transition-colors cursor-pointer"
            title={isMuted ? "ミュート解除" : "ミュート"}
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>

          <button
            type="button"
            onClick={onExitGame}
            className="px-2.5 py-1 bg-rose-950/60 hover:bg-rose-900 border border-rose-500/50 rounded text-rose-300 transition-colors cursor-pointer text-xs"
          >
            EXIT
          </button>
        </div>
      </div>

      {/* 3カラムメインレイアウト (PDF 5, 6p 完全準拠) */}
      <div
        className={`w-full flex flex-col lg:flex-row justify-center items-center lg:items-start gap-4 ${
          isShaking ? "animate-screen-shake" : ""
        }`}
      >
        {/* ================= 左パネル ================= */}
        <div className="w-full lg:w-[220px] flex flex-col gap-3">
          {/* 1. 残りライフ（ハート5つ） */}
          <div className="relative flex items-center justify-center lg:justify-start gap-2 px-3 py-2 bg-slate-900/90 border border-cyan-500/40 rounded-xl shadow-[0_0_10px_rgba(0,240,255,0.1)]">
            {[0, 1, 2, 3, 4].map((i) => {
              const isBroken = brokenHeartIndices.includes(i);
              const isAlive = i < hearts;

              return (
                <div key={`heart-${i}`} className="relative">
                  <Heart
                    size={22}
                    className={`transition-colors duration-300 ${
                      isAlive
                        ? "text-rose-400 fill-rose-500 filter drop-shadow-[0_0_6px_rgba(244,63,94,0.8)]"
                        : "text-slate-700 fill-slate-800"
                    }`}
                  />
                  {/* 消える瞬間の破裂アニメーション */}
                  {isBroken && (
                    <div className="absolute inset-0 animate-heart-break pointer-events-none">
                      <Heart
                        size={22}
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


          <div className="bg-slate-900/95 border-2 border-cyan-500/50 rounded-xl p-3 space-y-2.5 shadow-[0_0_15px_rgba(0,240,255,0.15)] text-left">
            <div className="font-pixel-en text-[10px] text-cyan-400 border-b border-slate-800 pb-1">
              STATUS
            </div>

            {/* SCORE */}
            <div className="relative">
              <div className="text-slate-400 text-[11px]">SCORE</div>
              <div className="relative flex items-center gap-2">
                <div
                  className={`font-pixel-en text-yellow-400 text-sm tracking-wider transition-transform ${
                    isScoreBumping ? "animate-score-bump text-yellow-300" : ""
                  }`}
                >
                  {stats.score.toLocaleString()}
                </div>
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
            <div>
              <div className="text-slate-400 text-[11px]">TIME</div>
              <div className="font-['Press_Start_2P'] text-cyan-300 text-xs tracking-wider">
                {formatTime(stats.clearTimeMs)}
              </div>
            </div>

            {/* MINO COUNT */}
            <div>
              <div className="text-slate-400 text-[11px]">MINO COUNT</div>
              <div className="font-['Press_Start_2P'] text-pink-400 text-xs tracking-wider">
                {stats.minoCount.toString().padStart(3, "0")}
              </div>
            </div>

            {/* BONUS (★ 7/12) */}
            <div>
              <div className="text-slate-400 text-[11px]">BONUS</div>
              <div className="font-['Press_Start_2P'] text-amber-300 text-xs flex items-center gap-1">
                <span>★</span>
                <span>{`${stats.bonusStars}/${stats.totalStars}`}</span>
              </div>
            </div>

            {/* STAGE */}
            <div>
              <div className="text-slate-400 text-[11px]">STAGE</div>
              <div className="font-['Press_Start_2P'] text-emerald-400 text-xs tracking-wider">
                {stats.stageNumber.toString().padStart(2, "0")}
              </div>
            </div>

            {/* BEST SCORE */}
            <div className="pt-1 border-t border-slate-800">
              <div className="text-slate-500 text-[10px]">BEST SCORE</div>
              <div className="font-['Press_Start_2P'] text-purple-400 text-xs tracking-wider">
                {stats.bestScore.toLocaleString()}
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
            <div className="bg-slate-900/90 border-2 border-cyan-500/50 rounded-xl p-2 text-center">
              <div className="font-pixel-en text-[10px] text-cyan-400 mb-1.5">
                NEXT
              </div>
              <div className="w-full h-14 bg-slate-950 rounded flex items-center justify-center border border-slate-800">
                {nextPieces[0] ? (
                  <MiniPieceView type={nextPieces[0]} />
                ) : (
                  <span className="text-slate-600 text-xs">--</span>
                )}
              </div>
            </div>

            {/* HOLD */}
            <div className="bg-slate-900/90 border-2 border-cyan-500/50 rounded-xl p-2 text-center">
              <div className="font-pixel-en text-[10px] text-rose-400 mb-1.5 flex justify-between px-1">
                <span>HOLD</span>
                <span className="text-[8px] text-slate-500">[C]</span>
              </div>
              <div className="w-full h-14 bg-slate-950 rounded flex items-center justify-center border border-slate-800">
                {holdPiece ? (
                  <MiniPieceView type={holdPiece} />
                ) : (
                  <span className="text-slate-600 text-xs">--</span>
                )}
              </div>
            </div>
          </div>

          {/* イティエル立ち絵表示枠 (PDF 5p/6p) */}
          <div className="relative w-full h-44 bg-slate-900/90 border-2 border-cyan-500/50 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(0,240,255,0.15)] flex flex-col items-center justify-center p-2">
            {/* サイバー背景エフェクト */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#00f0ff_1px,transparent_1px)] [background-size:12px_12px]" />

            {/* イティエルのサイバーアートワーク（無機質な白い人形シルエット） */}
            <div className="relative z-10 flex flex-col items-center">
              {/* キャラクターアイコン */}
              <div className="w-20 h-20 rounded-full border-2 border-slate-600 bg-slate-950/80 flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.1)] overflow-hidden">
                <User size={44} className="text-white" />
              </div>

              <div className="mt-2 text-center">
                <span className="font-bold text-xs text-slate-200 block">
                  イティエル
                </span>
              </div>
            </div>
          </div>

          {/* 操作説明枠 & オンスクリーンコントローラー (PDF 6p) */}
          <div className="bg-slate-900/90 border-2 border-cyan-500/50 rounded-xl p-3 text-left space-y-2">
            <div className="font-['Press_Start_2P'] text-[10px] text-cyan-400 border-b border-slate-800 pb-1">
              CONTROLS
            </div>

            <div className="text-[11px] text-slate-300 space-y-1">
              <div>・移動: [←] [→] / [A] [D]</div>
              <div>・回転: [↑] / [W] / [ROTATE]</div>
              <div>・落下: [↓] (Soft) / [Space] (Drop)</div>
              <div>・ホールド: [C] キー</div>
            </div>

            {/* 展示PC用タッチ/マウスクリックボタン（統一デザイン） */}
            <div className="pt-2 border-t border-slate-800 grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => engine.moveLeft()}
                className="py-2 px-1 bg-slate-800/80 hover:bg-cyan-950/80 active:bg-cyan-600/40 border border-cyan-500/40 hover:border-cyan-400 rounded-lg text-xs text-cyan-200 cursor-pointer font-bold transition-all shadow-[0_0_6px_rgba(0,240,255,0.15)] hover:shadow-[0_0_10px_rgba(0,240,255,0.3)] flex items-center justify-center gap-1"
              >
                ◀ LEFT
              </button>
              <button
                type="button"
                onClick={() => engine.rotate()}
                className="py-2 px-1 bg-slate-800/80 hover:bg-cyan-950/80 active:bg-cyan-600/40 border border-cyan-500/40 hover:border-cyan-400 rounded-lg text-xs text-cyan-200 cursor-pointer font-bold transition-all shadow-[0_0_6px_rgba(0,240,255,0.15)] hover:shadow-[0_0_10px_rgba(0,240,255,0.3)] flex items-center justify-center gap-1"
              >
                <RotateCw size={12} /> ROTATE
              </button>
              <button
                type="button"
                onClick={() => engine.moveRight()}
                className="py-2 px-1 bg-slate-800/80 hover:bg-cyan-950/80 active:bg-cyan-600/40 border border-cyan-500/40 hover:border-cyan-400 rounded-lg text-xs text-cyan-200 cursor-pointer font-bold transition-all shadow-[0_0_6px_rgba(0,240,255,0.15)] hover:shadow-[0_0_10px_rgba(0,240,255,0.3)] flex items-center justify-center gap-1"
              >
                RIGHT ▶
              </button>
              <button
                type="button"
                onClick={() => engine.softDrop()}
                className="py-2 px-1 bg-slate-800/80 hover:bg-cyan-950/80 active:bg-cyan-600/40 border border-cyan-500/40 hover:border-cyan-400 rounded-lg text-xs text-cyan-200 cursor-pointer font-bold transition-all shadow-[0_0_6px_rgba(0,240,255,0.15)] hover:shadow-[0_0_10px_rgba(0,240,255,0.3)] flex items-center justify-center gap-1"
              >
                ▼ DOWN
              </button>
              <button
                type="button"
                onClick={() => engine.hardDrop()}
                className="py-2 px-1 bg-slate-800/80 hover:bg-cyan-950/80 active:bg-cyan-600/40 border border-cyan-500/40 hover:border-cyan-400 rounded-lg text-xs text-cyan-200 cursor-pointer font-bold transition-all shadow-[0_0_6px_rgba(0,240,255,0.15)] hover:shadow-[0_0_10px_rgba(0,240,255,0.3)] flex items-center justify-center gap-1"
              >
                ⚡ DROP
              </button>
              <button
                type="button"
                onClick={() => engine.hold()}
                className="py-2 px-1 bg-slate-800/80 hover:bg-cyan-950/80 active:bg-cyan-600/40 border border-cyan-500/40 hover:border-cyan-400 rounded-lg text-xs text-cyan-200 cursor-pointer font-bold transition-all shadow-[0_0_6px_rgba(0,240,255,0.15)] hover:shadow-[0_0_10px_rgba(0,240,255,0.3)] flex items-center justify-center gap-1"
              >
                HOLD [C]
              </button>
              {engine.skills.length > 0 && (
                <button
                  type="button"
                  onClick={() => engine.useBomb()}
                  className="col-span-3 py-2 px-2 bg-slate-800/80 hover:bg-cyan-950/80 active:bg-cyan-600/40 border border-cyan-500/40 hover:border-cyan-400 rounded-lg text-xs text-cyan-200 cursor-pointer font-bold transition-all shadow-[0_0_6px_rgba(0,240,255,0.15)] hover:shadow-[0_0_10px_rgba(0,240,255,0.3)] flex items-center justify-center gap-1.5"
                >
                  <Bomb size={12} /> BOMB!
                </button>
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
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: "block" }}
    >
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
