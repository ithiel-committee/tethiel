import {
  Lock,
  Play,
  ShieldAlert,
  Terminal,
  Volume2,
  VolumeX,
} from "lucide-react";
import { STAGES } from "../game/constants";
import type { StageData } from "../types/game";

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
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-950/70 border border-cyan-500/50 rounded-full text-xs text-cyan-300">
          <Terminal size={14} />
          <span>CHUO UNIV. iTL CYBER DEFENSE SYSTEM</span>
        </div>

        <h1 className="font-['Press_Start_2P'] text-4xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 drop-shadow-[0_0_20px_rgba(0,240,255,0.6)] py-2 tracking-wider">
          tethiel
        </h1>
        <p className="text-sm md:text-base text-cyan-200">
          - iTL防衛戦 逆テトリス型アクションパズル -
        </p>
      </div>

      {/* 2. ゲーム目的・イントロ */}
      <div className="w-full bg-slate-900/80 border border-cyan-500/30 rounded-xl p-4 text-left text-xs md:text-sm text-slate-300 space-y-2">
        <div className="flex items-center gap-2 text-cyan-400 font-bold">
          <ShieldAlert size={16} />
          <span>MISSION: STAGE 1</span>
        </div>
        <p className="leading-relaxed">
          突如としてキャンパスのネットワークを襲ったサイバー攻撃！
          下から迫り来るウイルスに追いつかれないよう、上からブロックを積み上げて
          最上部の
          <span className="text-emerald-400 font-bold">
            【サーバーコア】
          </span>
          へ回路を接続せよ！
        </p>
      </div>

      {/* 3. ステージ選択 */}
      <div className="w-full space-y-3">
        <div className="text-left text-xs text-slate-400 flex justify-between items-center px-1">
          <span>{"// SELECT STAGE"}</span>
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
                    ? "bg-slate-900/90 hover:bg-slate-850 border-cyan-500/60 shadow-[0_0_15px_rgba(0,240,255,0.15)] group"
                    : "bg-slate-950/60 border-slate-800 opacity-60"
                }`}
              >
                <div className="space-y-1 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="font-['Press_Start_2P'] text-xs text-cyan-400">
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
                      className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-slate-950 font-bold rounded-lg flex items-center gap-1.5 text-xs transition-all shadow-[0_0_10px_rgba(0,240,255,0.4)] cursor-pointer"
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
        </div>
      </div>

      {/* 4. 操作方法＆ルールガイド */}
      <div className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-400 text-left space-y-1.5">
        <div className="font-bold text-slate-300">
          {"// HOW TO PLAY (操作ガイド)"}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
          <div>・左右移動: [←] [→] または [A] [D]</div>
          <div>・回転: [↑] [W] [Z] [X]</div>
          <div>・ソフトドロップ: [↓] または [S]</div>
          <div>・ハードドロップ: [SPACE]</div>
          <div>・ホールド: [C] キー</div>
        </div>
        <div className="text-[11px] text-cyan-300 pt-1 border-t border-slate-800">
          ★ルール：横一列揃えても消えません！回路が通電してウイルスが一時停止＋HPが回復します！
        </div>
      </div>

      {/* 5. サウンド切り替え */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={onToggleMute}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 transition-colors cursor-pointer"
        >
          {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
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
