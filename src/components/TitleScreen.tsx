import {
  ArrowLeft,
  Info,
  Play,
  Settings,
  Trophy,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { sounds } from "../audio/soundSystem";
import ithielArmHp5 from "../assets/character/ithiel_arm_hp5_smile.png";
import ithielStandingDefault from "../assets/character/ithiel_standing_default.png";
import ithielStandingSmile from "../assets/character/ithiel_standing_smile.png";
import ithielStandingSmug from "../assets/character/ithiel_standing_smug.png";
import titleKeyVisual from "../assets/visual/title_key_visual.png";
import { ENDLESS_STAGE, STAGES } from "../game/constants";
import { useUIText } from "../context/UIModeContext";
import { STAGE_TEXTS } from "../data/uiTexts";
import type { StageData } from "../types/game";
import { preloadGameAssets } from "../utils/preloadAssets";
import {
  getScoreLogs,
  getStageBestRecords,
  resetAllRecords,
  type ScoreLogEntry,
  type StageBestRecord,
} from "../utils/scoreStorage";
import { CreditModal, OptionModal, RankingModal } from "./modals";
import { UIModeToggle } from "./ui";
import { useOverflowCheck } from "../utils/overflowChecker";

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
  initialMenuView?: MenuView;
}

type MenuView = "main" | "select_level";
type ModalType = null | "ranking" | "option" | "credit";

export const TitleScreen = ({
  onSelectStage,
  isMuted,
  onToggleMute,
  initialMenuView = "main",
}: TitleScreenProps) => {
  const { t, isKids } = useUIText();
  useOverflowCheck("TitleScreen");
  const [menuView, setMenuView] = useState<MenuView>(initialMenuView);

  useEffect(() => {
    setMenuView(initialMenuView);
  }, [initialMenuView]);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedStageId, setSelectedStageId] = useState<number | null>(null);
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
      {/* 画面右上: 表示モード切り替えトグル (未就学児〜大人) */}
      <div className="title-mode-toggle-wrap">
        <UIModeToggle size="sm" />
      </div>

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
                    <span>{t("start")}</span>
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
                    <span>{t("ranking")}</span>
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
                    <span>{t("option")}</span>
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
                    <span>{t("credit")}</span>
                  </div>
                </button>
              </div>
            </div>

            {/* 3. 左下: 操作ヒント (背景なしテキスト・左下マージン整列) */}
            <div className="title-control-hint">
              <span className="inline-flex items-center gap-1.5">
                <span role="img" aria-label="cursor">
                  🖱️
                </span>
                <span>カーソル</span>
              </span>
              <span className="opacity-70">または</span>
              <span className="inline-flex items-center gap-1">
                <kbd className="title-control-hint-kbd">Tab</kbd>
                <span className="opacity-70">/</span>
                <kbd className="title-control-hint-kbd">Space</kbd>
              </span>
              <span>キーで操作</span>
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
                <span>{t("back")}</span>
              </button>
              <div className="title-level-title">
                {isKids ? t("selectStageTitle") : "// SELECT LEVEL"}
              </div>
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
                    <span className="title-stage-name">
                      {STAGE_TEXTS[1]?.name[isKids ? "kids" : "standard"] ?? STAGES[0].name}
                    </span>
                    <span className="title-stage-sub">
                      {STAGE_TEXTS[1]?.subtitle[isKids ? "kids" : "standard"] ?? STAGES[0].subtitle}
                    </span>
                  </div>
                  <p className="title-stage-desc">
                    {STAGE_TEXTS[1]?.description[isKids ? "kids" : "standard"] ?? STAGES[0].description}
                  </p>
                </div>
                <button
                  type="button"
                  className="title-start-btn"
                  onClick={() => handleStageSelectWithAnim(STAGES[0])}
                >
                  <Play size={12} fill="currentColor" />
                  <span>{t("start")}</span>
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
                    <span className="title-stage-name">
                      {STAGE_TEXTS[2]?.name[isKids ? "kids" : "standard"] ?? STAGES[1].name}
                    </span>
                    <span className="title-stage-sub">
                      {STAGE_TEXTS[2]?.subtitle[isKids ? "kids" : "standard"] ?? STAGES[1].subtitle}
                    </span>
                  </div>
                  <p className="title-stage-desc">
                    {STAGE_TEXTS[2]?.description[isKids ? "kids" : "standard"] ?? STAGES[1].description}
                  </p>
                </div>
                <button
                  type="button"
                  className="title-start-btn"
                  onClick={() => handleStageSelectWithAnim(STAGES[1])}
                >
                  <Play size={12} fill="currentColor" />
                  <span>{t("start")}</span>
                </button>
              </div>

              {/* STAGE 3 */}
              <div
                className={`title-stage-card ${
                  selectedStageId === STAGES[2].id
                    ? "title-stage-card-selected"
                    : ""
                }`}
              >
                <div className="title-stage-info">
                  <div className="title-stage-name-row">
                    <span className="title-stage-name">
                      {STAGE_TEXTS[3]?.name[isKids ? "kids" : "standard"] ?? STAGES[2].name}
                    </span>
                    <span className="title-stage-sub">
                      {STAGE_TEXTS[3]?.subtitle[isKids ? "kids" : "standard"] ?? STAGES[2].subtitle}
                    </span>
                  </div>
                  <p className="title-stage-desc">
                    {STAGE_TEXTS[3]?.description[isKids ? "kids" : "standard"] ?? STAGES[2].description}
                  </p>
                </div>
                <button
                  type="button"
                  className="title-start-btn"
                  onClick={() => handleStageSelectWithAnim(STAGES[2])}
                >
                  <Play size={12} fill="currentColor" />
                  <span>{t("start")}</span>
                </button>
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
                      {STAGE_TEXTS[99]?.name[isKids ? "kids" : "standard"] ?? t("endlessMode")}
                    </span>
                    <span className="title-stage-sub-endless">
                      {STAGE_TEXTS[99]?.subtitle[isKids ? "kids" : "standard"] ?? ENDLESS_STAGE.subtitle}
                    </span>
                  </div>
                  <p className="title-stage-desc-endless">
                    {STAGE_TEXTS[99]?.description[isKids ? "kids" : "standard"] ?? ENDLESS_STAGE.description}
                  </p>
                </div>
                <button
                  type="button"
                  className="title-start-btn title-start-btn-endless"
                  onClick={() => handleStageSelectWithAnim(ENDLESS_STAGE)}
                >
                  <Play size={12} fill="currentColor" />
                  <span>{t("start")}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* モーダル群: RANKING, OPTION, CREDIT */}
      <RankingModal
        isOpen={activeModal === "ranking"}
        onClose={() => setActiveModal(null)}
        stageBests={stageBests}
        scoreLogs={scoreLogs}
        onResetRecords={() => {
          resetAllRecords();
          setStageBests(getStageBestRecords());
          setScoreLogs(getScoreLogs());
        }}
      />

      <OptionModal
        isOpen={activeModal === "option"}
        onClose={() => setActiveModal(null)}
        isMuted={isMuted}
        onToggleMute={onToggleMute}
      />

      <CreditModal
        isOpen={activeModal === "credit"}
        onClose={() => setActiveModal(null)}
      />
    </div>
  );
};
