import {
  ArrowLeft,
  Cpu,
  Info,
  Play,
  Settings,
  ShieldAlert,
  Sparkles,
  Terminal,
  Trophy,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import ithielStandingDefault from "../assets/character/ithiel_standing_default.png";
import titleKeyVisual from "../assets/visual/title_key_visual.png";
import { ENDLESS_STAGE, STAGES } from "../game/constants";
import type { StageData } from "../types/game";
import { preloadGameAssets } from "../utils/preloadAssets";
import { KeyboardGuide } from "./KeyboardGuide";

interface TitleScreenProps {
  onSelectStage: (stage: StageData) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

type MenuView = "main" | "select_level";
type ModalType = null | "ranking" | "option" | "credit";

export const TitleScreen = ({
  onSelectStage,
  isMuted,
  onToggleMute,
}: TitleScreenProps) => {
  const [menuView, setMenuView] = useState<MenuView>("main");
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  useEffect(() => {
    preloadGameAssets();
  }, []);

  return (
    <div className="title-screen-container">
      {/* 背景のサイバーグロー演出 */}
      <div className="title-bg-glow-left" />
      <div className="title-bg-glow-right" />

      {/* メイン横分割レイアウト */}
      <div className="title-content-layout">
        {/* 左側カラム: 左上タイトル + 左中央〜左下メニュー */}
        <div className="title-left-column">
          {/* 1. 左上: ゲームタイトル & キービジュアル */}
          <div className="title-header-area">
            <div className="title-badge">
              <Terminal size={12} />
              <span>CHUO UNIV. iTL CYBER DEFENSE SYSTEM</span>
            </div>

            <img
              src={titleKeyVisual}
              alt="tethiel - iTL防衛戦 逆テトリス型アクションパズル"
              className="title-logo-img"
            />

            <h1 className="sr-only">
              tethiel - iTL防衛戦 逆テトリス型アクションパズル
            </h1>
            <p className="title-subtitle">
              - iTL防衛戦 逆テトリス型アクションパズル -
            </p>
          </div>

          {/* 2. 左中央〜左下: メニューエリア (START画面 / レベル選択画面) */}
          <div className="title-menu-area">
            {menuView === "main" ? (
              /* メインメニュー: START, RANKING, OPTION, CREDIT */
              <div className="title-main-menu">
                <div className="title-section-label">
                  <span className="label-prefix">{"// MAIN SYSTEM MENU"}</span>
                  <span className="label-status">PRESS START TO PLAY</span>
                </div>

                {/* 1. START ボタン */}
                <button
                  type="button"
                  className="title-menu-btn title-menu-btn-start"
                  onClick={() => setMenuView("select_level")}
                >
                  <div className="title-menu-btn-content">
                    <Play size={16} fill="currentColor" />
                    <span>START</span>
                  </div>
                  <span className="title-menu-btn-tag">MISSION SELECT ▶</span>
                </button>

                {/* 2. RANKING ボタン */}
                <button
                  type="button"
                  className="title-menu-btn title-menu-btn-sub"
                  onClick={() => setActiveModal("ranking")}
                >
                  <div className="title-menu-btn-content">
                    <Trophy size={15} className="text-amber-400" />
                    <span>RANKING</span>
                  </div>
                  <span className="title-menu-btn-tag">HIGH SCORES</span>
                </button>

                {/* 3. OPTION ボタン */}
                <button
                  type="button"
                  className="title-menu-btn title-menu-btn-sub"
                  onClick={() => setActiveModal("option")}
                >
                  <div className="title-menu-btn-content">
                    <Settings size={15} className="text-rose-400" />
                    <span>OPTION</span>
                  </div>
                  <span className="title-menu-btn-tag">SETTINGS</span>
                </button>

                {/* 4. CREDIT ボタン */}
                <button
                  type="button"
                  className="title-menu-btn title-menu-btn-sub"
                  onClick={() => setActiveModal("credit")}
                >
                  <div className="title-menu-btn-content">
                    <Info size={15} className="text-sky-400" />
                    <span>CREDIT</span>
                  </div>
                  <span className="title-menu-btn-tag">STAFF & SPECIAL</span>
                </button>
              </div>
            ) : (
              /* レベル選択画面: START押下後 */
              <div className="title-stages-wrapper">
                <div className="title-level-header">
                  <button
                    type="button"
                    className="title-back-btn"
                    onClick={() => setMenuView("main")}
                  >
                    <ArrowLeft size={12} />
                    <span>BACK (戻る)</span>
                  </button>
                  <span className="label-prefix">{"// SELECT LEVEL"}</span>
                  <span className="label-status">OPERATION READY</span>
                </div>

                {/* ミッション概要カード */}
                <div className="title-mission-card">
                  <div className="title-mission-header">
                    <ShieldAlert size={14} />
                    <span>MISSION: STAGE 1 入門・回路接続</span>
                  </div>
                  <p className="title-mission-desc">
                    突如キャンパスのネットワークを襲ったサイバー攻撃！
                    下から迫るウイルスに追いつかれないよう、上からブロックを積み上げて
                    最上部の<span className="text-amber">【サーバーコア】</span>
                    へ回路を接続せよ！
                  </p>
                </div>

                {/* STAGE 1 */}
                <div className="title-stage-card">
                  <div className="title-stage-info">
                    <div className="title-stage-name-row">
                      <span className="title-stage-name">{STAGES[0].name}</span>
                      <span className="title-stage-sub">
                        {STAGES[0].subtitle}
                      </span>
                    </div>
                    <p className="title-stage-desc">{STAGES[0].description}</p>
                  </div>
                  <button
                    type="button"
                    className="title-start-btn"
                    onClick={() => onSelectStage(STAGES[0])}
                  >
                    <Play size={13} fill="currentColor" />
                    <span>START</span>
                  </button>
                </div>

                {/* ENDLESS MODE */}
                <div className="title-stage-card title-stage-card-endless">
                  <div className="title-stage-info">
                    <div className="title-stage-name-row">
                      <span className="title-stage-name-endless">
                        ★ ENDLESS MODE
                      </span>
                      <span className="title-stage-sub-endless">
                        無限クライミング
                      </span>
                    </div>
                    <p className="title-stage-desc-endless">
                      {ENDLESS_STAGE.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="title-start-btn title-start-btn-endless"
                    onClick={() => onSelectStage(ENDLESS_STAGE)}
                  >
                    <Play size={13} fill="currentColor" />
                    <span>START ENDLESS</span>
                  </button>
                </div>
              </div>
            )}

            {/* 操作方法ガイド (QWERTYキーボードUI) */}
            <div className="title-controls-card">
              <div className="title-controls-header">
                <span>{"// HOW TO PLAY (キーボード操作ガイド)"}</span>
                <span className="title-controls-sub">QWERTY CONTROLS</span>
              </div>
              <KeyboardGuide />
            </div>
          </div>

          {/* 3. 左下: フッター (サウンド設定 & システムステータス) */}
          <div className="title-footer-row">
            <button
              type="button"
              className="title-sound-btn"
              onClick={onToggleMute}
            >
              {isMuted ? (
                <VolumeX size={13} className="text-rose-400" />
              ) : (
                <Volume2 size={13} className="text-rose-400" />
              )}
              <span>{isMuted ? "SOUND: OFF" : "SOUND: ON"}</span>
            </button>

            <div className="title-status-text">
              <Cpu size={12} />
              <span>DEFENSE SYSTEM ONLINE</span>
            </div>
          </div>
        </div>

        {/* 右側カラム: イティエル立ち絵 (下部はみきれ) */}
        <div className="title-right-column">
          {/* サイバーホログラムサークル演出 */}
          <div className="title-cyber-ring">
            <div className="title-cyber-ring-inner" />
          </div>

          {/* イティエルのHUDステータスプレート */}
          <div className="title-ithiel-hud-badge">
            <Sparkles size={13} />
            <div>
              <div className="hud-name">ITHIEL // AI NAVIGATOR</div>
              <div className="hud-status">STATUS: DEFENSE MODE READY</div>
            </div>
          </div>

          {/* 立ち絵 (下部はみきれ) */}
          <img
            src={ithielStandingDefault}
            alt="イティエル"
            className="title-ithiel-standing"
          />
        </div>
      </div>

      {/* モーダル群: RANKING, OPTION, CREDIT */}
      {activeModal && (
        <div
          className="title-modal-overlay"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="title-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            {/* RANKING モーダル */}
            {activeModal === "ranking" && (
              <>
                <div className="title-modal-title">
                  <div className="flex items-center gap-2">
                    <Trophy size={16} className="text-amber-400" />
                    <span>DEFENSE SYSTEM RANKING</span>
                  </div>
                  <button
                    type="button"
                    className="title-modal-close-btn"
                    onClick={() => setActiveModal(null)}
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-slate-900/80 rounded border border-rose-500/30 space-y-1">
                    <div className="text-amber-300 font-bold">
                      STAGE 1: 入門・回路接続
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>BEST SCORE: 987,654 pts</span>
                      <span>CLEAR TIME: 00:42.50</span>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-900/80 rounded border border-amber-500/30 space-y-1">
                    <div className="text-rose-400 font-bold">
                      ★ ENDLESS MODE: 無限クライミング
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>MAX ALTITUDE: 1,280 m</span>
                      <span>RECORD TIME: 05:14.20</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* OPTION モーダル */}
            {activeModal === "option" && (
              <>
                <div className="title-modal-title">
                  <div className="flex items-center gap-2">
                    <Settings size={16} className="text-rose-400" />
                    <span>SYSTEM SETTINGS (オプション)</span>
                  </div>
                  <button
                    type="button"
                    className="title-modal-close-btn"
                    onClick={() => setActiveModal(null)}
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-3 bg-slate-900/80 rounded border border-rose-500/30">
                    <div>
                      <div className="font-bold text-slate-200">
                        オーディオ設定
                      </div>
                      <div className="text-[11px] text-slate-400">
                        シンセ効果音 / SE
                      </div>
                    </div>
                    <button
                      type="button"
                      className="title-sound-btn"
                      onClick={onToggleMute}
                    >
                      {isMuted ? (
                        <VolumeX size={13} className="text-rose-400" />
                      ) : (
                        <Volume2 size={13} className="text-rose-400" />
                      )}
                      <span>{isMuted ? "SOUND: OFF" : "SOUND: ON"}</span>
                    </button>
                  </div>
                  <div className="p-3 bg-slate-900/80 rounded border border-rose-500/30 space-y-1">
                    <div className="font-bold text-slate-200">
                      操作モード設定
                    </div>
                    <div className="text-[11px] text-slate-400">
                      QWERTYキーボード + 十字キーハイブリッド対応
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* CREDIT モーダル */}
            {activeModal === "credit" && (
              <>
                <div className="title-modal-title">
                  <div className="flex items-center gap-2">
                    <Info size={16} className="text-sky-400" />
                    <span>PRODUCTION CREDITS (クレジット)</span>
                  </div>
                  <button
                    type="button"
                    className="title-modal-close-btn"
                    onClick={() => setActiveModal(null)}
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
                  <div className="p-2.5 bg-slate-900/80 rounded border border-rose-500/30">
                    <div className="text-rose-400 font-bold mb-1">
                      tethiel - iTL防衛戦
                    </div>
                    <p className="text-[11px]">
                      中央大学 国際情報学部 (iTL) 公式キャラクター
                      「イティエル」をモチーフにした逆テトリス型アクションパズル
                    </p>
                  </div>
                  <div className="p-2.5 bg-slate-900/80 rounded border border-rose-500/30 space-y-1 text-[11px]">
                    <div>企画・開発: iTL 委員会</div>
                    <div>キャラクターイラスト・原案: iTL 公式</div>
                    <div>サウンド: Web Audio API Synthesizer Engine</div>
                    <div className="pt-1 text-slate-400">
                      SPECIAL THANKS: オペレーターの皆様
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="pt-2 border-t border-rose-950/60 flex justify-end">
              <button
                type="button"
                className="title-back-btn"
                onClick={() => setActiveModal(null)}
              >
                CLOSE (閉じる)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
