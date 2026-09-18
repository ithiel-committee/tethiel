import {
  Bomb,
  Heart,
  Pause,
  Play,
  RotateCw,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    setIsPaused(engine.status === "paused");
  }, [engine.status]);

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
        <div className="flex items-center gap-2 text-cyan-400 font-['Press_Start_2P']">
          <span>tethiel</span>
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
      <div className="w-full flex flex-col lg:flex-row justify-center items-center lg:items-start gap-4">
        {/* ================= 左パネル ================= */}
        <div className="w-full lg:w-[220px] flex flex-col gap-3">
          {/* 1. 残りライフ（ハート5つ） */}
          <div className="flex items-center justify-center lg:justify-start gap-2 px-3 py-2 bg-slate-900/90 border border-cyan-500/40 rounded-xl shadow-[0_0_10px_rgba(0,240,255,0.1)]">
            {[0, 1, 2, 3, 4].map((i) => (
              <Heart
                key={`heart-${i}`}
                size={22}
                className={`transition-all ${
                  i < hearts
                    ? "text-rose-400 fill-rose-500 filter drop-shadow-[0_0_6px_rgba(244,63,94,0.8)]"
                    : "text-slate-700 fill-slate-800"
                }`}
              />
            ))}
          </div>

          {/* 2. ゲームタイトル枠 */}
          <div className="px-3 py-2 bg-slate-900/90 border border-cyan-500/40 rounded-xl text-center shadow-[0_0_10px_rgba(0,240,255,0.1)]">
            <div className="text-[10px] text-slate-500 font-bold tracking-widest">
              GAME TITLE
            </div>
            <div className="font-['Press_Start_2P'] text-cyan-300 text-sm tracking-wider mt-0.5">
              tethiel
            </div>
          </div>

          {/* 3. スコア・ステータスパネル (PDF 5p忠実再現) */}
          <div className="bg-slate-900/95 border-2 border-cyan-500/50 rounded-xl p-3 space-y-2.5 shadow-[0_0_15px_rgba(0,240,255,0.15)] text-left">
            <div className="text-[10px] text-slate-400 border-b border-slate-800 pb-1 flex justify-between items-center">
              <span>スコア・ステータス</span>
              <span className="font-['Press_Start_2P'] text-[9px] text-cyan-400">
                STATUS
              </span>
            </div>

            {/* SCORE */}
            <div>
              <div className="text-slate-400 text-[11px]">SCORE</div>
              <div className="font-['Press_Start_2P'] text-yellow-400 text-sm tracking-wider">
                {stats.score.toLocaleString()}
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
              <div className="font-['Press_Start_2P'] text-[10px] text-cyan-400 mb-1.5">
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
              <div className="font-['Press_Start_2P'] text-[10px] text-rose-400 mb-1.5 flex justify-between px-1">
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

            {/* イティエルのサイバーアートワーク */}
            <div className="relative z-10 flex flex-col items-center">
              {/* キャラクターアイコン */}
              <div className="w-20 h-20 rounded-full border-2 border-cyan-400/80 bg-slate-950/80 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.4)] overflow-hidden">
                <div className="relative flex flex-col items-center">
                  {/* 黒髪＋赤メッシュ */}
                  <div className="w-12 h-10 bg-slate-800 rounded-t-full relative">
                    <div className="absolute right-1 top-2 w-3 h-6 bg-rose-500 rounded" />
                  </div>
                  {/* 顔 */}
                  <div className="w-9 h-7 bg-amber-200 -mt-3 rounded-b-md flex justify-around items-center px-1">
                    <div className="w-1.5 h-1.5 bg-slate-900 rounded-full" />
                    <div className="w-1.5 h-1.5 bg-slate-900 rounded-full" />
                  </div>
                  {/* 制服 */}
                  <div className="w-11 h-6 bg-slate-900 rounded-t flex justify-center">
                    <div className="w-1.5 h-4 bg-red-600" />
                  </div>
                </div>
              </div>

              <div className="mt-2 text-center">
                <span className="font-['Press_Start_2P'] text-[10px] text-cyan-300 block">
                  ITHIEL
                </span>
                <span className="text-[10px] text-slate-400">
                  iTL Cyber Navigator
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

            {/* 展示PC用タッチ/マウスクリックボタン */}
            <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-1.5 justify-center">
              <button
                type="button"
                onClick={() => engine.moveLeft()}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 active:bg-cyan-600 border border-slate-600 rounded text-xs text-cyan-200 cursor-pointer font-bold"
              >
                ◀ LEFT
              </button>
              <button
                type="button"
                onClick={() => engine.rotate()}
                className="px-2.5 py-1.5 bg-cyan-950 hover:bg-cyan-800 active:bg-cyan-600 border border-cyan-500 rounded text-xs text-cyan-200 cursor-pointer font-bold flex items-center gap-1"
              >
                <RotateCw size={12} /> ROTATE
              </button>
              <button
                type="button"
                onClick={() => engine.moveRight()}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 active:bg-cyan-600 border border-slate-600 rounded text-xs text-cyan-200 cursor-pointer font-bold"
              >
                RIGHT ▶
              </button>
              <button
                type="button"
                onClick={() => engine.softDrop()}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 active:bg-cyan-600 border border-slate-600 rounded text-xs text-cyan-200 cursor-pointer font-bold"
              >
                ▼ DOWN
              </button>
              <button
                type="button"
                onClick={() => engine.hardDrop()}
                className="px-2.5 py-1.5 bg-amber-900/70 hover:bg-amber-800 active:bg-amber-600 border border-amber-500 rounded text-xs text-amber-200 cursor-pointer font-bold"
              >
                ⚡ DROP
              </button>
              <button
                type="button"
                onClick={() => engine.hold()}
                className="px-2.5 py-1.5 bg-purple-900/70 hover:bg-purple-800 active:bg-purple-600 border border-purple-500 rounded text-xs text-purple-200 cursor-pointer font-bold"
              >
                HOLD [C]
              </button>
              {engine.skills.length > 0 && (
                <button
                  type="button"
                  onClick={() => engine.useBomb()}
                  className="px-3 py-1.5 bg-rose-900 hover:bg-rose-800 active:bg-rose-600 border border-rose-500 rounded text-xs text-rose-100 cursor-pointer font-bold flex items-center gap-1 shadow-[0_0_10px_rgba(244,63,94,0.5)]"
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

// NEXTやHOLDのミニミノ描画
function MiniPieceView({ type }: { type: TetrominoType }) {
  const shape = TETROMINO_SHAPES[type];
  const matrix = shape.matrix;

  return (
    <div
      className="grid gap-[2px]"
      style={{ gridTemplateColumns: `repeat(${matrix[0].length}, 9px)` }}
    >
      {matrix.map((row, r) =>
        row.map((val, c) => (
          <div
            key={`mini-${type}-${r * 10 + c}`}
            className="w-[9px] h-[9px] rounded-[1px]"
            style={{
              backgroundColor: val ? shape.color : "transparent",
              boxShadow: val ? `0 0 3px ${shape.color}` : "none",
            }}
          />
        )),
      )}
    </div>
  );
}
