import {
  Cpu,
  Play,
  ShieldAlert,
  Sparkles,
  Terminal,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useEffect } from "react";
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

export const TitleScreen = ({
  onSelectStage,
  isMuted,
  onToggleMute,
}: TitleScreenProps) => {
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

          {/* 2. 左中央〜左下: メニューエリア */}
          <div className="title-menu-area">
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

            {/* ステージ選択カード */}
            <div className="title-stages-wrapper">
              <div className="title-section-label">
                <span className="label-prefix">{"// SELECT MISSION"}</span>
                <span className="label-status">OPERATION READY</span>
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
    </div>
  );
};
