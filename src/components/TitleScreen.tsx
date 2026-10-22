import {
  ArrowLeft,
  Info,
  Lock,
  Play,
  Settings,
  Trophy,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { sounds } from "../audio/soundSystem";
import ithielArmHp5 from "../assets/character/ithiel_arm_hp5_smile.png";
import ithielStandingDefault from "../assets/character/ithiel_standing_default.png";
import ithielStandingSmile from "../assets/character/ithiel_standing_smile.png";
import ithielStandingSmug from "../assets/character/ithiel_standing_smug.png";
import titleKeyVisual from "../assets/visual/title_key_visual.png";
import { ENDLESS_STAGE, STAGES } from "../game/constants";
import type { StageData } from "../types/game";
import { preloadGameAssets } from "../utils/preloadAssets";
import {
  getScoreLogs,
  getStageBestRecords,
  resetAllRecords,
  type ScoreLogEntry,
  type StageBestRecord,
} from "../utils/scoreStorage";
import { KeyboardGuide } from "./KeyboardGuide";

// ホーム画面イティエル長押し隠し機能ポーズリスト
const ITHIEL_SECRET_POSES = [
  { src: ithielStandingDefault, label: "DEFAULT" },
  { src: ithielStandingSmile, label: "SMILE" },
  { src: ithielStandingSmug, label: "SMUG" },
  { src: ithielArmHp5, label: "ARM_RAISED" },
];

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
  const [selectedStageId, setSelectedStageId] = useState<number | null>(null);
  const [rankingTab, setRankingTab] = useState<"bests" | "logs">("bests");
  const [stageBests, setStageBests] = useState<Record<number, StageBestRecord>>({});
  const [scoreLogs, setScoreLogs] = useState<ScoreLogEntry[]>([]);

  // 隠し機能: イティエルポーズ差し替えステート (長押し・連打)
  const [poseIndex, setPoseIndex] = useState(0);
  const [isPressing, setIsPressing] = useState(false);
  const [isChangedAnim, setIsChangedAnim] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState<
    { id: number; x: number; y: number; text: string }[]
  >([]);
  const pressTimerRef = useRef<number | null>(null);
  const longPressTriggeredRef = useRef(false);
  const tapCountRef = useRef(0);
  const lastTapTimeRef = useRef(0);
  const rightColumnRef = useRef<HTMLDivElement>(null);

  // 親コンテナ基準のクリック座標を取得
  const getClickCoords = (e: React.PointerEvent) => {
    if (rightColumnRef.current) {
      const rect = rightColumnRef.current.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  // 隠しポーズ切り替え共通関数 (長押し・連打)
  const triggerSecretPose = useCallback((clickX: number, clickY: number) => {
    sounds.playItemGet();
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(40);
    }
    setPoseIndex((prev) => (prev + 1) % ITHIEL_SECRET_POSES.length);
    setIsChangedAnim(true);
    setTimeout(() => setIsChangedAnim(false), 480);

    // 差し替わり時の華やかなハート・キラキラ演出
    const newHearts = [
      { id: Date.now() + 1, x: clickX, y: clickY, text: "♥" },
      { id: Date.now() + 2, x: clickX - 25, y: clickY - 20, text: "✦" },
      { id: Date.now() + 3, x: clickX + 25, y: clickY - 20, text: "♥" },
      { id: Date.now() + 4, x: clickX, y: clickY - 40, text: "★" },
    ];
    setFloatingHearts((prev) => [...prev, ...newHearts]);
    setTimeout(() => {
      setFloatingHearts((prev) =>
        prev.filter((h) => !newHearts.some((nh) => nh.id === h.id)),
      );
    }, 850);
  }, []);

  // タッチ・クリック開始 (長押し または 連打判定)
  const handleIthielPointerDown = (e: React.PointerEvent<HTMLImageElement>) => {
    const { x, y } = getClickCoords(e);
    const now = Date.now();

    // 連続タップ判定 (前回タップから500ms以内ならカウントアップ)
    if (now - lastTapTimeRef.current < 500) {
      tapCountRef.current += 1;
    } else {
      tapCountRef.current = 1;
    }
    lastTapTimeRef.current = now;

    // 3回以上の連打で即座にポーズ切り替えトリガー
    if (tapCountRef.current >= 3) {
      tapCountRef.current = 0;
      longPressTriggeredRef.current = true;
      if (pressTimerRef.current) {
        window.clearTimeout(pressTimerRef.current);
        pressTimerRef.current = null;
      }
      setIsPressing(false);
      triggerSecretPose(x, y);
      return;
    }

    // 長押しタイマー開始
    setIsPressing(true);
    longPressTriggeredRef.current = false;

    if (pressTimerRef.current) {
      window.clearTimeout(pressTimerRef.current);
    }

    pressTimerRef.current = window.setTimeout(() => {
      longPressTriggeredRef.current = true;
      tapCountRef.current = 0;
      triggerSecretPose(x, y);
    }, 520);
  };

  // タッチ・クリック終了 / 指離し
  const handleIthielPointerUp = (e: React.PointerEvent<HTMLImageElement>) => {
    setIsPressing(false);
    if (pressTimerRef.current) {
      window.clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
    // ポーズ切り替えがトリガーされなかった単発タップ時はプチハート演出
    if (!longPressTriggeredRef.current) {
      const { x, y } = getClickCoords(e);
      const id = Date.now() + Math.random();
      setFloatingHearts((prev) => [
        ...prev,
        { id, x, y, text: "♥" },
      ]);
      setTimeout(() => {
        setFloatingHearts((prev) => prev.filter((h) => h.id !== id));
      }, 850);
    }
  };

  const handleIthielPointerCancel = () => {
    setIsPressing(false);
    if (pressTimerRef.current) {
      window.clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  };

  useEffect(() => {
    if (activeModal === "ranking") {
      setStageBests(getStageBestRecords());
      setScoreLogs(getScoreLogs());
    }
  }, [activeModal]);

  const handleStageSelectWithAnim = (stage: StageData) => {
    if (selectedStageId !== null) return;
    setSelectedStageId(stage.id);
    setTimeout(() => {
      onSelectStage(stage);
    }, 380);
  };

  useEffect(() => {
    preloadGameAssets();
  }, []);

  return (
    <div className="title-screen-container">
      {/* 背景のサイバーグロー演出 */}
      <div className="title-bg-glow-left" />
      <div className="title-bg-glow-right" />

      {menuView === "main" ? (
        /* メインメニューレイアウト: 左にロゴ+メニュー、右にイティエル立ち絵 */
        <div key="main" className="title-content-layout title-view-animated">
          {/* 左側カラム: 左上タイトル + 左中央〜左下メニュー */}
          <div className="title-left-column">
            {/* 1. 左上: ゲームタイトル & キービジュアル */}
            <div className="title-header-area">
              <img
                src={titleKeyVisual}
                alt="teThieL"
                className="title-logo-img"
              />
              <h1 className="sr-only">teThieL</h1>
            </div>

            {/* 2. メニューエリア */}
            <div className="title-menu-area">
              <div className="title-main-menu">
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
                </button>
              </div>
            </div>
          </div>

          {/* 右側カラム: イティエル立ち絵 (下部はみきれ・長押しや連打で隠しポーズ差し替え) */}
          <div ref={rightColumnRef} className="title-right-column">
            {/* サイバーホログラムサークル演出 (長押し時に高速回転・発光) */}
            <div
              className={`title-cyber-ring ${isPressing ? "is-charging" : ""}`}
            >
              <div className="title-cyber-ring-inner" />
            </div>

            {/* 浮遊ハートエフェクト */}
            {floatingHearts.map((heart) => (
              <span
                key={heart.id}
                className="title-heart-fx text-rose-400 font-bold drop-shadow-[0_0_8px_#ff1a4b]"
                style={{ left: heart.x, top: heart.y }}
              >
                {heart.text}
              </span>
            ))}

            {/* 立ち絵 (タッチ・連打・長押しで画像差し替え) */}
            <img
              src={ITHIEL_SECRET_POSES[poseIndex].src}
              alt="イティエル"
              onPointerDown={handleIthielPointerDown}
              onPointerUp={handleIthielPointerUp}
              onPointerLeave={handleIthielPointerCancel}
              onPointerCancel={handleIthielPointerCancel}
              className={`title-ithiel-standing ${isPressing ? "is-pressing" : ""} ${
                isChangedAnim ? "is-changed" : ""
              }`}
            />
          </div>
        </div>
      ) : (
        /* ステージ選択レイアウト: ロゴ・イティエル不要、画面全体の中央ぞろえ */
        <div
          key="select_level"
          className="title-select-level-container title-view-animated"
        >
          <div className="title-stages-wrapper">
            {/* レベル選択ヘッダー: 中央揃え */}
            <div className="title-level-header">
              <button
                type="button"
                className="title-back-btn"
                onClick={() => setMenuView("main")}
              >
                <ArrowLeft size={12} />
                <span>BACK</span>
              </button>
              <div className="title-level-title">{"// SELECT LEVEL"}</div>
              <div className="title-header-spacer" />
            </div>

            {/* ステージ選択垂直リスト (中央線でそろえる) */}
            <div className="title-stages-vertical">
              {/* STAGE 1 */}
              <div
                className={`title-stage-card ${
                  selectedStageId === STAGES[0].id
                    ? "title-stage-card-selected"
                    : ""
                }`}
              >
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
                  onClick={() => handleStageSelectWithAnim(STAGES[0])}
                >
                  <Play size={12} fill="currentColor" />
                  <span>START</span>
                </button>
              </div>

              {/* STAGE 2 */}
              <div
                className={`title-stage-card ${
                  selectedStageId === STAGES[1].id
                    ? "title-stage-card-selected"
                    : ""
                }`}
              >
                <div className="title-stage-info">
                  <div className="title-stage-name-row">
                    <span className="title-stage-name">{STAGES[1].name}</span>
                    <span className="title-stage-sub">
                      {STAGES[1].subtitle}
                    </span>
                  </div>
                  <p className="title-stage-desc">{STAGES[1].description}</p>
                </div>
                <button
                  type="button"
                  className="title-start-btn"
                  onClick={() => handleStageSelectWithAnim(STAGES[1])}
                >
                  <Play size={12} fill="currentColor" />
                  <span>START</span>
                </button>
              </div>

              {/* STAGE 3 (LOCKED) */}
              <div className="title-stage-card title-stage-card-locked">
                <div className="title-stage-info">
                  <div className="title-stage-name-row">
                    <span className="title-stage-name text-slate-500">
                      {STAGES[2].name}
                    </span>
                    <span className="title-stage-sub text-slate-500">
                      {STAGES[2].subtitle}
                    </span>
                  </div>
                  <p className="title-stage-desc text-slate-500">
                    {STAGES[2].description}
                  </p>
                </div>
                <div className="title-locked-badge">
                  <Lock size={12} />
                  <span>LOCKED</span>
                </div>
              </div>

              {/* ENDLESS MODE */}
              <div
                className={`title-stage-card title-stage-card-endless ${
                  selectedStageId === ENDLESS_STAGE.id
                    ? "title-stage-card-selected"
                    : ""
                }`}
              >
                <div className="title-stage-info">
                  <div className="title-stage-name-row">
                    <span className="title-stage-name-endless">
                      ENDLESS
                    </span>
                    <span className="title-stage-sub-endless">
                      {ENDLESS_STAGE.subtitle}
                    </span>
                  </div>
                  <p className="title-stage-desc-endless">
                    {ENDLESS_STAGE.description}
                  </p>
                </div>
                <button
                  type="button"
                  className="title-start-btn title-start-btn-endless"
                  onClick={() => handleStageSelectWithAnim(ENDLESS_STAGE)}
                >
                  <Play size={12} fill="currentColor" />
                  <span>START</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* モーダル群: RANKING, OPTION, CREDIT, CONTROLS */}
      {activeModal && (
        <div
          className="title-modal-overlay"
          onClick={() => setActiveModal(null)}
        >
          <div
            className={`title-modal-box ${
              activeModal === "option" ? "title-modal-box-wide" : ""
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* RANKING モーダル */}
            {activeModal === "ranking" && (
              <>
                <div className="title-modal-title">
                  <div className="flex items-center gap-2">
                    <Trophy size={16} className="text-amber-400" />
                    <span>DEFENSE SYSTEM RANKING & LOG</span>
                  </div>
                  <button
                    type="button"
                    className="title-modal-close-btn"
                    onClick={() => setActiveModal(null)}
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* タブ切り替え */}
                <div className="flex gap-2 border-b border-rose-950/60 pb-2">
                  <button
                    type="button"
                    onClick={() => setRankingTab("bests")}
                    className={`px-3 py-1 text-xs rounded font-bold transition-colors cursor-pointer ${
                      rankingTab === "bests"
                        ? "bg-rose-600 text-white shadow-[0_0_10px_rgba(255,26,75,0.5)]"
                        : "bg-slate-900/90 text-slate-400 hover:text-white"
                    }`}
                  >
                    BEST RECORDS (自己ベスト)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRankingTab("logs")}
                    className={`px-3 py-1 text-xs rounded font-bold transition-colors cursor-pointer ${
                      rankingTab === "logs"
                        ? "bg-rose-600 text-white shadow-[0_0_10px_rgba(255,26,75,0.5)]"
                        : "bg-slate-900/90 text-slate-400 hover:text-white"
                    }`}
                  >
                    SCORE LOGS (プレイ履歴)
                  </button>
                </div>

                {/* BEST RECORDS タブ */}
                {rankingTab === "bests" && (
                  <div className="space-y-2.5 text-xs">
                    {/* STAGE 1 */}
                    <div className="p-2.5 bg-slate-900/80 rounded border border-rose-500/30 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-amber-300 font-bold">STAGE 1: 入門・回路接続</span>
                        {stageBests[1]?.bestRank ? (
                          <span className="px-1.5 py-0.5 bg-amber-500/20 border border-amber-400 text-amber-300 rounded text-[10px] font-bold">
                            RANK {stageBests[1].bestRank}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500">未記録</span>
                        )}
                      </div>
                      <div className="flex justify-between text-slate-300 text-[11px]">
                        <span>
                          BEST SCORE: {stageBests[1]?.highScore ? `${stageBests[1].highScore.toLocaleString()} pts` : "--"}
                        </span>
                        <span>
                          CLEAR TIME: {stageBests[1]?.bestTimeSeconds ? `${Math.floor(stageBests[1].bestTimeSeconds / 60).toString().padStart(2, "0")}:${(stageBests[1].bestTimeSeconds % 60).toString().padStart(2, "0")}` : "--:--"}
                        </span>
                      </div>
                    </div>

                    {/* STAGE 2 */}
                    <div className="p-2.5 bg-slate-900/80 rounded border border-rose-500/30 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-rose-300 font-bold">STAGE 2: サイバー迂回ルート</span>
                        {stageBests[2]?.bestRank ? (
                          <span className="px-1.5 py-0.5 bg-rose-500/20 border border-rose-400 text-rose-300 rounded text-[10px] font-bold">
                            RANK {stageBests[2].bestRank}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500">未記録</span>
                        )}
                      </div>
                      <div className="flex justify-between text-slate-300 text-[11px]">
                        <span>
                          BEST SCORE: {stageBests[2]?.highScore ? `${stageBests[2].highScore.toLocaleString()} pts` : "--"}
                        </span>
                        <span>
                          CLEAR TIME: {stageBests[2]?.bestTimeSeconds ? `${Math.floor(stageBests[2].bestTimeSeconds / 60).toString().padStart(2, "0")}:${(stageBests[2].bestTimeSeconds % 60).toString().padStart(2, "0")}` : "--:--"}
                        </span>
                      </div>
                    </div>

                    {/* ENDLESS */}
                    <div className="p-2.5 bg-slate-900/80 rounded border border-amber-500/40 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-amber-400 font-bold">★ ENDLESS MODE: 無限クライミング</span>
                        <span className="text-[10px] text-amber-300">サバイバル</span>
                      </div>
                      <div className="flex justify-between text-slate-300 text-[11px]">
                        <span>
                          MAX ALTITUDE: {stageBests[99]?.maxAltitude ? `${stageBests[99].maxAltitude.toLocaleString()} m` : "--"}
                        </span>
                        <span>
                          BEST SCORE: {stageBests[99]?.highScore ? `${stageBests[99].highScore.toLocaleString()} pts` : "--"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* SCORE LOGS タブ */}
                {rankingTab === "logs" && (
                  <div className="space-y-2 text-xs max-h-[280px] overflow-y-auto pr-1">
                    {scoreLogs.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 bg-slate-900/40 rounded border border-slate-800">
                        <p>プレイ履歴がまだありません。</p>
                        <p className="text-[10px] text-slate-500 mt-1">ゲームをプレイすると直近30件のログがここに記録されます。</p>
                      </div>
                    ) : (
                      scoreLogs.map((log) => {
                        const date = new Date(log.timestamp);
                        const timeStr = `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getDate().toString().padStart(2, "0")} ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
                        return (
                          <div
                            key={log.id}
                            className="p-2 bg-slate-900/80 rounded border border-slate-800 hover:border-rose-500/40 transition-colors flex justify-between items-center"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                                  log.isCleared
                                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                    : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                                }`}>
                                  {log.isCleared ? (log.isBonusClear ? "BONUS" : "CLEAR") : "FAIL"}
                                </span>
                                <span className="font-bold text-slate-200">{log.stageName}</span>
                                <span className="text-[10px] text-slate-500">{timeStr}</span>
                              </div>
                              <div className="text-[10px] text-slate-400 flex gap-2">
                                <span>TIME: {Math.floor(log.clearTimeSeconds / 60)}:{(log.clearTimeSeconds % 60).toString().padStart(2, "0")}</span>
                                {log.climbedHeight ? (
                                  <span>高度: {log.climbedHeight}m</span>
                                ) : (
                                  <span>ミノ: {log.minoCount}手</span>
                                )}
                                <span>★ {log.bonusStars}</span>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="text-yellow-400 font-bold font-mono">
                                {log.score.toLocaleString()} pts
                              </div>
                              <div className="text-[10px] text-rose-300 font-bold">
                                RANK {log.rank}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
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

                  {/* キーボード操作ガイド */}
                  <div className="p-3 bg-slate-900/80 rounded border border-rose-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-slate-200">
                        キーボード操作ガイド (CONTROLS)
                      </div>
                      <div className="text-[11px] text-rose-400">
                        QWERTY & 十字キー対応
                      </div>
                    </div>
                    <div className="title-controls-modal-body">
                      <KeyboardGuide />
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
                      teThieL - iTL防衛戦
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
                      SPECIAL THANKS: プレイヤーの皆様
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="pt-2 border-t border-rose-950/60 flex justify-between items-center">
              {activeModal === "ranking" ? (
                <button
                  type="button"
                  className="px-2.5 py-1 text-[11px] text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded border border-slate-800 transition-colors cursor-pointer"
                  onClick={() => {
                    if (window.confirm("これまでの記録を初期化しますか？")) {
                      resetAllRecords();
                      setStageBests(getStageBestRecords());
                      setScoreLogs(getScoreLogs());
                    }
                  }}
                >
                  RESET RECORDS (記録初期化)
                </button>
              ) : (
                <div />
              )}
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
