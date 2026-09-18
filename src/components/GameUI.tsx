import {
  Bomb,
  Flame,
  Heart,
  Pause,
  Play,
  RotateCw,
  Snowflake,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useEffect, useState } from "react";
import { GRID_HEIGHT, TETROMINO_SHAPES } from "../game/constants";
import type { GameEngine } from "../game/engine";
import type { GameStats, SkillType, TetrominoType } from "../types/game";

interface GameUIProps {
  engine: GameEngine;
  hp: number;
  virusRow: number;
  skills: SkillType[];
  holdPiece: TetrominoType | null;
  nextPieces: TetrominoType[];
  stats: GameStats;
  isMuted: boolean;
  onToggleMute: () => void;
  onExitGame: () => void;
}

export const GameUI = ({
  engine,
  hp,
  virusRow,
  skills,
  holdPiece,
  nextPieces,
  stats,
  isMuted,
  onToggleMute,
  onExitGame,
}: GameUIProps) => {
  const [isPaused, setIsPaused] = useState(engine.status === "paused");

  useEffect(() => {
    setIsPaused(engine.status === "paused");
  }, [engine.status]);

  // HPバーのカラー計算
  const getHpColor = () => {
    if (hp > 60)
      return "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.7)]";
    if (hp > 25)
      return "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.7)]";
    return "bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.9)] animate-pulse";
  };

  // ゴールまでの残り段数
  const remainingRows = Math.max(0, stats.highestRow - 1);

  return (
    <div className="w-full max-w-4xl flex flex-col gap-3 font-['DotGothic16',sans-serif]">
      {/* 1. トップステータスバー */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-cyan-500/30 px-4 py-2 rounded-lg text-xs md:text-sm">
        <div className="flex items-center gap-3">
          <span className="font-['Press_Start_2P'] text-cyan-400 font-bold">
            {engine.stage.name}
          </span>
          <span className="text-slate-400 hidden sm:inline">
            {`// ${engine.stage.codeName}`}
          </span>
        </div>

        {/* 右上コントローラー（ポーズ、ミュート、終了） */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              engine.togglePause();
              setIsPaused(engine.status === "paused");
            }}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-cyan-300 transition-colors cursor-pointer text-xs"
          >
            {isPaused ? <Play size={14} /> : <Pause size={14} />}
            <span className="hidden sm:inline">
              {isPaused ? "RESUME" : "PAUSE"}
            </span>
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-cyan-300 transition-colors cursor-pointer"
            title={isMuted ? "ミュート解除" : "ミュート"}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
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

      {/* 2. ゲーム画面左右パネルレイアウト */}
      <div className="grid grid-cols-1 md:grid-cols-[160px_1fr_160px] gap-4 items-start">
        {/* 左サイドパネル（HOLD, HPバー, スキル） */}
        <div className="flex flex-row md:flex-col gap-3 justify-between md:justify-start">
          {/* HOLDスロット */}
          <div className="flex-1 md:flex-initial bg-slate-900/85 border border-cyan-500/30 rounded-lg p-2.5">
            <div className="flex justify-between items-center mb-1 text-slate-400 text-xs">
              <span>HOLD</span>
              <span className="text-[10px] text-cyan-400 font-['Press_Start_2P']">
                [C]
              </span>
            </div>
            <div className="w-full h-16 bg-slate-950/90 rounded border border-slate-800 flex items-center justify-center">
              {holdPiece ? (
                <MiniPieceView type={holdPiece} />
              ) : (
                <span className="text-slate-600 text-xs">EMPTY</span>
              )}
            </div>
          </div>

          {/* HPバー */}
          <div className="flex-1 md:flex-initial bg-slate-900/85 border border-cyan-500/30 rounded-lg p-2.5">
            <div className="flex justify-between items-center mb-1 text-xs">
              <span className="flex items-center gap-1 text-rose-400">
                <Heart size={13} />
                SYSTEM HP
              </span>
              <span className="font-['Press_Start_2P'] text-[10px] text-rose-300">
                {Math.round(hp)}%
              </span>
            </div>
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-150 ${getHpColor()}`}
                style={{ width: `${Math.max(0, hp)}%` }}
              />
            </div>
          </div>

          {/* VIRUS WARN METER */}
          <div className="flex-1 md:flex-initial bg-slate-900/85 border border-cyan-500/30 rounded-lg p-2.5">
            <div className="flex justify-between items-center mb-1 text-xs">
              <span className="flex items-center gap-1 text-rose-500 font-bold">
                <Flame size={13} />
                VIRUS
              </span>
              <span className="font-['Press_Start_2P'] text-[10px] text-rose-400">
                Lv.{Math.max(0, Math.floor(GRID_HEIGHT - virusRow))}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-rose-600 shadow-[0_0_8px_rgba(255,0,80,0.8)] transition-all duration-150"
                style={{
                  width: `${Math.min(100, ((GRID_HEIGHT - virusRow) / GRID_HEIGHT) * 100)}%`,
                }}
              />
            </div>
          </div>

          {/* スキルスロット */}
          <div className="flex-1 md:flex-initial bg-slate-900/85 border border-cyan-500/30 rounded-lg p-2.5">
            <div className="text-slate-400 text-xs mb-1.5 flex justify-between">
              <span>SKILLS</span>
              <span className="text-[10px] text-cyan-400 font-['Press_Start_2P']">
                [1-3]
              </span>
            </div>
            <div className="flex gap-1.5">
              {[0, 1, 2].map((slotIdx) => {
                const skill = skills[slotIdx];
                return (
                  <button
                    key={`slot-${slotIdx}`}
                    type="button"
                    onClick={() => engine.useSkill(slotIdx)}
                    disabled={!skill}
                    className={`flex-1 h-12 rounded border flex flex-col items-center justify-center transition-all cursor-pointer ${
                      skill
                        ? "bg-cyan-950/60 hover:bg-cyan-900/80 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.4)]"
                        : "bg-slate-950/50 border-slate-800 text-slate-600 cursor-not-allowed"
                    }`}
                  >
                    {skill === "bomb" && (
                      <Bomb size={18} className="text-pink-400" />
                    )}
                    {skill === "freeze" && (
                      <Snowflake size={18} className="text-cyan-400" />
                    )}
                    {skill === "heal" && (
                      <Heart size={18} className="text-emerald-400" />
                    )}
                    <span className="text-[9px] font-['Press_Start_2P'] mt-0.5">
                      {slotIdx + 1}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 中央：Canvasコンポーネント（外側から渡される） */}
        <div className="flex justify-center">
          {/* Slot for canvas in parent */}
        </div>

        {/* 右サイドパネル（NEXT, GOAL METER, SCORE） */}
        <div className="flex flex-row md:flex-col gap-3 justify-between md:justify-start">
          {/* NEXTミノスロット */}
          <div className="flex-1 md:flex-initial bg-slate-900/85 border border-cyan-500/30 rounded-lg p-2.5">
            <div className="text-slate-400 text-xs mb-1">NEXT</div>
            <div className="flex flex-row md:flex-col gap-2 justify-center items-center bg-slate-950/90 rounded border border-slate-800 p-2">
              {[0, 1, 2].map((slotIndex) => {
                const type = nextPieces[slotIndex];
                if (!type) return null;
                return (
                  <div
                    key={`next-preview-slot-${slotIndex}`}
                    className={`flex items-center justify-center ${
                      slotIndex === 0 ? "scale-100" : "scale-75 opacity-70"
                    }`}
                  >
                    <MiniPieceView type={type} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* GOALまでの残りマス */}
          <div className="flex-1 md:flex-initial bg-slate-900/85 border border-cyan-500/30 rounded-lg p-2.5">
            <div className="text-slate-400 text-xs mb-1">
              TO SERVER CORE
            </div>
            <div className="font-['Press_Start_2P'] text-xl text-emerald-400 flex items-baseline gap-1">
              <span>{remainingRows}</span>
              <span className="text-xs text-slate-500">ROWS</span>
            </div>
          </div>

          {/* スコア・タイム */}
          <div className="flex-1 md:flex-initial bg-slate-900/85 border border-cyan-500/30 rounded-lg p-2.5 space-y-2">
            <div>
              <div className="text-slate-400 text-[11px]">SCORE</div>
              <div className="font-['Press_Start_2P'] text-sm text-cyan-300">
                {stats.score.toString().padStart(6, "0")}
              </div>
            </div>
            <div>
              <div className="text-slate-400 text-[11px]">
                LINES CONNECTED
              </div>
              <div className="font-['Press_Start_2P'] text-sm text-yellow-400">
                {stats.linesConnected}
              </div>
            </div>
            <div>
              <div className="text-slate-400 text-[11px]">TIME</div>
              <div className="font-['Press_Start_2P'] text-xs text-slate-300">
                {Math.floor(stats.clearTimeSeconds / 60)}:
                {(stats.clearTimeSeconds % 60).toString().padStart(2, "0")}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. 展示用オンスクリーンコントローラー（キーボード非搭載PC・タッチパネル対応） */}
      <div className="bg-slate-900/90 border border-cyan-500/30 rounded-lg p-2 flex flex-wrap items-center justify-center gap-2 select-none">
        {/* 移動・回転ボタン */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => engine.moveLeft()}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 active:bg-cyan-600 border border-slate-600 rounded text-cyan-200 font-bold cursor-pointer text-sm"
          >
            ◀ LEFT
          </button>
          <button
            type="button"
            onClick={() => engine.rotate()}
            className="px-3 py-2 bg-cyan-900/70 hover:bg-cyan-800 active:bg-cyan-600 border border-cyan-500 rounded text-cyan-200 font-bold flex items-center gap-1 cursor-pointer text-sm"
          >
            <RotateCw size={15} /> ROTATE
          </button>
          <button
            type="button"
            onClick={() => engine.moveRight()}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 active:bg-cyan-600 border border-slate-600 rounded text-cyan-200 font-bold cursor-pointer text-sm"
          >
            RIGHT ▶
          </button>
        </div>

        {/* 落下・ホールド・スキル */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => engine.softDrop()}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 active:bg-cyan-600 border border-slate-600 rounded text-cyan-200 font-bold cursor-pointer text-sm"
          >
            ▼ DOWN
          </button>
          <button
            type="button"
            onClick={() => engine.hardDrop()}
            className="px-3 py-2 bg-amber-900/60 hover:bg-amber-800 active:bg-amber-600 border border-amber-500 rounded text-amber-200 font-bold cursor-pointer text-sm"
          >
            ⚡ DROP
          </button>
          <button
            type="button"
            onClick={() => engine.hold()}
            className="px-3 py-2 bg-purple-900/60 hover:bg-purple-800 active:bg-purple-600 border border-purple-500 rounded text-purple-200 font-bold cursor-pointer text-sm"
          >
            HOLD [C]
          </button>
          {skills.length > 0 && (
            <button
              type="button"
              onClick={() => engine.useSkill(0)}
              className="px-3 py-2 bg-pink-900/80 hover:bg-pink-800 active:bg-pink-600 border border-pink-500 rounded text-pink-100 font-bold animate-pulse flex items-center gap-1 cursor-pointer text-sm shadow-[0_0_10px_rgba(255,42,109,0.5)]"
            >
              <Bomb size={15} /> BOMB!
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// NEXTやHOLDのミニミノ描画コンポーネント
function MiniPieceView({ type }: { type: TetrominoType }) {
  const shape = TETROMINO_SHAPES[type];
  const matrix = shape.matrix;

  return (
    <div
      className="grid gap-[2px]"
      style={{ gridTemplateColumns: `repeat(${matrix[0].length}, 10px)` }}
    >
      {matrix.map((row, r) =>
        row.map((val, c) => (
          <div
            key={`block-${type}-${r * 10 + c}`}
            className="w-[10px] h-[10px] rounded-[1px]"
            style={{
              backgroundColor: val ? shape.color : "transparent",
              boxShadow: val ? `0 0 4px ${shape.color}` : "none",
            }}
          />
        )),
      )}
    </div>
  );
}
