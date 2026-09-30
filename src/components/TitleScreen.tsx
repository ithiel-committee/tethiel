import {
  Lock,
  Play,
  ShieldAlert,
  Terminal,
  Volume2,
  VolumeX,
} from "lucide-react";
import { ENDLESS_STAGE, STAGES } from "../game/constants";
import type { StageData } from "../types/game";
import { Keycap } from "./Keycap";

interface TitleScreenProps {
  onSelectStage: (stage: StageData) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const TitleScreen = ({
  onSelectStage,
  isMuted,
  onToggleMute,
}: TitleScreenProps) => {
  return (
    <div className="w-full max-w-2xl flex flex-col items-center gap-6 p-4 md:p-6 text-center font-['DotGothic16',sans-serif]">
      {/* 1. タイトルヘッダー */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-red-950/70 border border-rose-500/50 rounded-full text-xs text-rose-300 shadow-[0_0_10px_rgba(255,26,75,0.2)]">
          <Terminal size={14} className="text-rose-400" />
          <span>CHUO UNIV. iTL CYBER DEFENSE SYSTEM</span>
        </div>

        <h1 className="font-['Press_Start_2P'] text-4xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-amber-300 drop-shadow-[0_0_24px_rgba(255,26,75,0.7)] py-2 tracking-wider">
          tethiel
        </h1>
        <p className="text-sm md:text-base text-rose-200">
          - iTL防衛戦 逆テトリス型アクションパズル -
        </p>
      </div>

      {/* 2. ゲーム目的・イントロ */}
      <div className="w-full bg-slate-900/80 border border-rose-500/40 rounded-xl p-4 text-left text-xs md:text-sm text-slate-300 space-y-2 shadow-[0_0_12px_rgba(255,26,75,0.1)]">
        <div className="flex items-center gap-2 text-rose-400 font-bold">
          <ShieldAlert size={16} />
          <span>MISSION: STAGE 1</span>
        </div>
        <p className="leading-relaxed">
          突如としてキャンパスのネットワークを襲ったサイバー攻撃！
          下から迫り来るウイルスに追いつかれないよう、上からブロックを積み上げて
          最上部の
          <span className="text-amber-300 font-bold ml-1">
            【サーバーコア】
          </span>
          へ回路を接続せよ！
        </p>
      </div>

      {/* 3. ステージ選択 */}
      <div className="w-full space-y-3">
        <div className="text-left text-xs text-slate-400 flex justify-between items-center px-1">
          <span className="text-rose-400/80">{"// SELECT STAGE"}</span>
          <span>STAGE 1 PROTOTYPE READY</span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {STAGES.map((stage) => {
            const isUnlocked = stage.isUnlocked;

            return (
              <div
                key={stage.id}
                className={`relative flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-xl border text-left transition-all ${
                  isUnlocked
                    ? "bg-slate-900/90 hover:bg-slate-850 border-rose-500/50 shadow-[0_0_15px_rgba(255,26,75,0.15)] group"
                    : "bg-slate-950/60 border-slate-800 opacity-60"
                }`}
              >
                <div className="space-y-1 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="font-['Press_Start_2P'] text-xs text-rose-400">
                      {stage.name}
                    </span>
                    {stage.subtitle && (
                      <span className="text-slate-400 text-xs font-bold">
                        {stage.subtitle}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-2">
                    {stage.description}
                  </p>
                </div>

                <div className="mt-3 md:mt-0 flex items-center gap-2 shrink-0">
                  {isUnlocked ? (
                    <button
                      type="button"
                      onClick={() => onSelectStage(stage)}
                      className="px-4 py-2 bg-gradient-to-r from-red-600 via-rose-600 to-red-500 hover:from-red-500 hover:to-rose-500 text-white font-bold rounded-lg flex items-center gap-1.5 text-xs transition-all shadow-[0_0_12px_rgba(255,26,75,0.45)] cursor-pointer"
                    >
                      <Play size={14} fill="currentColor" />
                      START
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 rounded text-slate-500 text-xs font-['Press_Start_2P']">
                      <Lock size={12} />
                      LOCKED
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* エンドレスモード特別カード（無限クライミングバナー） */}
          <div
            className="relative flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-xl border border-rose-500/80 shadow-[0_0_24px_rgba(255,26,75,0.35)] text-left transition-all bg-endless-banner"
            style={{
              background:
                "linear-gradient(135deg, rgba(32, 9, 20, 0.98) 0%, rgba(75, 14, 36, 0.95) 50%, rgba(22, 6, 14, 0.98) 100%)",
            }}
          >
            <div className="space-y-1 pr-4">
              <div className="flex items-center gap-2">
                <span className="font-['Press_Start_2P'] text-xs text-rose-400 font-bold">
                  ★ ENDLESS MODE
                </span>
                <span className="text-amber-300 text-xs font-bold">
                  無限クライミング
                </span>
              </div>
              <p className="text-xs text-rose-100/90 leading-relaxed">
                {ENDLESS_STAGE.description}
              </p>
            </div>

            <div className="mt-3 md:mt-0 flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onSelectStage(ENDLESS_STAGE)}
                className="px-4 py-2 text-white font-bold rounded-lg flex items-center gap-1.5 text-xs transition-all shadow-[0_0_15px_rgba(255,26,75,0.5)] hover:shadow-[0_0_20px_rgba(255,26,75,0.7)] cursor-pointer"
                style={{
                  background:
                    "linear-gradient(to right, #dc2626, #e11d48, #ef4444)",
                }}
              >
                <Play size={14} fill="currentColor" />
                START ENDLESS
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. 操作方法＆ルールガイド（キートップUI化） */}
      <div className="w-full bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-300 text-left space-y-2">
        <div className="font-bold text-rose-400 flex items-center justify-between">
          <span>{"// HOW TO PLAY (操作ガイド)"}</span>
          <span className="text-[10px] text-slate-500 font-normal">
            KEYBOARD CONTROLS
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 w-16 shrink-0">・即置き:</span>
            <Keycap>↑</Keycap>
            <span className="text-slate-500 text-[10px]">or</span>
            <Keycap size="sm" className="px-2">
              SPACE
            </Keycap>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 w-16 shrink-0">・回転:</span>
            <Keycap>Z</Keycap>
            <span className="text-slate-500 text-[10px]">左</span>
            <Keycap>X</Keycap>
            <Keycap>W</Keycap>
            <span className="text-slate-500 text-[10px]">右</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 w-16 shrink-0">・移動:</span>
            <Keycap>←</Keycap>
            <Keycap>→</Keycap>
            <span className="text-slate-500 text-[10px]">or</span>
            <Keycap>A</Keycap>
            <Keycap>D</Keycap>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 w-16 shrink-0">・落下:</span>
            <Keycap>↓</Keycap>
            <span className="text-slate-500 text-[10px]">or</span>
            <Keycap>S</Keycap>
            <span className="text-slate-500 text-[10px]">Soft</span>
          </div>
          <div className="flex items-center gap-1.5 sm:col-span-2">
            <span className="text-slate-400 w-16 shrink-0">
              ・ホールド:
            </span>
            <Keycap variant="accent">C</Keycap>
            <span className="text-slate-400 text-[11px] ml-1">
              （キープしたミノと交代）
            </span>
          </div>
        </div>
        <div className="text-[11px] text-rose-300 pt-1.5 border-t border-slate-800">
          ★
          ルール：下から上へ回路を繋げ！回路から外れたトゲに触れるとミノが破壊されハート減少！
        </div>
      </div>

      {/* 5. サウンド切り替え */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={onToggleMute}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-rose-500/50 rounded-lg text-xs text-slate-300 transition-colors cursor-pointer"
        >
          {isMuted ? (
            <VolumeX size={14} className="text-rose-400" />
          ) : (
            <Volume2 size={14} className="text-rose-400" />
          )}
          <span>
            {isMuted
              ? "SOUND: OFF (クリックでON)"
              : "SOUND: ON (シンセSE)"}
          </span>
        </button>
      </div>
    </div>
  );
};
