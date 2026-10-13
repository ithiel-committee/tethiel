import {
  FastForward,
  History,
  Play,
  RotateCcw,
  Sparkles,
  Terminal,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ITHIEL_EXPRESSION_IMAGES } from "../data/storyData";
import type { StoryDialogue, StoryScene } from "../types/story";
import { CyberBadge, CyberButton } from "./ui";

interface NovelScreenProps {
  scene: StoryScene;
  onComplete: () => void;
  onBackToTitle?: () => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
}

export const NovelScreen = ({
  scene,
  onComplete,
  onBackToTitle,
  isMuted = false,
  onToggleMute,
}: NovelScreenProps) => {
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [isAuto, setIsAuto] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [isCharacterBumping, setIsCharacterBumping] = useState(false);

  const currentDialogue: StoryDialogue | undefined =
    scene.dialogues[dialogueIndex];
  const typingTimerRef = useRef<number | null>(null);
  const autoTimerRef = useRef<number | null>(null);

  // キャラクターの立ち絵切り替え時に軽くバウンス
  useEffect(() => {
    setIsCharacterBumping(true);
    const timer = window.setTimeout(() => setIsCharacterBumping(false), 250);
    return () => window.clearTimeout(timer);
  }, [dialogueIndex]);

  // タイプライター表示処理
  useEffect(() => {
    if (!currentDialogue) return;

    const fullText = currentDialogue.text;
    let charIndex = 0;
    setDisplayedText("");
    setIsTyping(true);

    if (typingTimerRef.current !== null) {
      window.clearInterval(typingTimerRef.current);
    }

    typingTimerRef.current = window.setInterval(() => {
      charIndex++;
      setDisplayedText(fullText.slice(0, charIndex));

      if (charIndex >= fullText.length) {
        if (typingTimerRef.current !== null) {
          window.clearInterval(typingTimerRef.current);
          typingTimerRef.current = null;
        }
        setIsTyping(false);
      }
    }, 28);

    return () => {
      if (typingTimerRef.current !== null) {
        window.clearInterval(typingTimerRef.current);
        typingTimerRef.current = null;
      }
    };
  }, [currentDialogue]);

  // 次のダイアログへ進む
  const handleNext = useCallback(() => {
    if (!currentDialogue) return;

    // タイプ中の場合は一括表示
    if (isTyping) {
      if (typingTimerRef.current !== null) {
        window.clearInterval(typingTimerRef.current);
        typingTimerRef.current = null;
      }
      setDisplayedText(currentDialogue.text);
      setIsTyping(false);
      return;
    }

    // 全文表示済みなら次のセリフへ
    if (dialogueIndex < scene.dialogues.length - 1) {
      setDialogueIndex((prev) => prev + 1);
    } else {
      // シナリオ完了
      onComplete();
    }
  }, [currentDialogue, isTyping, dialogueIndex, scene.dialogues.length, onComplete]);

  // AUTO機能の制御
  useEffect(() => {
    if (!isAuto || isTyping || showLog) {
      if (autoTimerRef.current !== null) {
        window.clearTimeout(autoTimerRef.current);
        autoTimerRef.current = null;
      }
      return;
    }

    autoTimerRef.current = window.setTimeout(() => {
      handleNext();
    }, 1800);

    return () => {
      if (autoTimerRef.current !== null) {
        window.clearTimeout(autoTimerRef.current);
        autoTimerRef.current = null;
      }
    };
  }, [isAuto, isTyping, showLog, handleNext]);

  // キーボード操作 (Space, Enter, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showLog) {
        if (e.key === "Escape") setShowLog(false);
        return;
      }

      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "Escape") {
        // スキップ確認または即スキップ
        onComplete();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, onComplete, showLog]);

  if (!currentDialogue) return null;

  const currentImgSrc =
    ITHIEL_EXPRESSION_IMAGES[currentDialogue.expression] ??
    ITHIEL_EXPRESSION_IMAGES.default;

  return (
    <div
      className="novel-wrapper"
      style={{ width: "min(840px, 96vw)", minWidth: "min(840px, 96vw)", maxWidth: 840, boxSizing: "border-box" }}
    >
      {/* 1. 背景演出 */}
      <div className="novel-bg-grid" />

      {/* 2. トップバー (ADVシステムコントロール) */}
      <div className="novel-topbar">
        <CyberBadge
          variant="red"
          icon={<Terminal size={13} className="text-rose-400" />}
        >
          {scene.title}
        </CyberBadge>

        {/* コントロールボタン群 */}
        <div className="novel-ctrl-group">
          {onToggleMute && (
            <button
              type="button"
              onClick={onToggleMute}
              className="novel-ctrl-btn"
              title={isMuted ? "ミュート解除" : "ミュート"}
            >
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowLog(true)}
            className="novel-ctrl-btn"
          >
            <History size={13} />
            <span className="hidden sm:inline">LOG</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAuto((prev) => !prev)}
            className={`novel-ctrl-btn ${
              isAuto ? "novel-ctrl-btn-auto-active" : ""
            }`}
          >
            <Play size={12} fill={isAuto ? "currentColor" : "none"} />
            <span>AUTO</span>
          </button>

          <button
            type="button"
            onClick={onComplete}
            className="novel-ctrl-btn novel-ctrl-btn-skip"
          >
            <FastForward size={13} />
            <span>SKIP</span>
          </button>

          {onBackToTitle && (
            <button
              type="button"
              onClick={onBackToTitle}
              className="novel-ctrl-btn"
              style={{ marginLeft: 4 }}
            >
              <RotateCcw size={12} />
              <span className="hidden sm:inline">TITLE</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. キャラクター立ち絵表示エリア (ノベル・ギャルゲー風大迫力表示) */}
      <div className="novel-char-stage">
        <img
          src={currentImgSrc}
          alt={currentDialogue.speaker}
          loading="eager"
          decoding="async"
          className={`novel-char-img ${isCharacterBumping ? "novel-char-bump" : ""}`}
        />
      </div>

      {/* 4. ノベルメッセージウィンドウ (画面下部) */}
      <div
        role="button"
        tabIndex={0}
        onClick={handleNext}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleNext();
          }
        }}
        className="novel-msg-container"
        style={{ width: "100%", minWidth: "100%", maxWidth: "100%", boxSizing: "border-box" }}
      >
        {/* ネームプレート (左上に飛び出たサイバーバッジ) */}
        <div className="novel-nameplate">
          <Sparkles size={14} className="text-amber-300 animate-spin" />
          <span>{currentDialogue.speaker}</span>
        </div>

        {/* メインテキストボックス (すりガラス調サイバーウィンドウ) */}
        <div
          className="novel-textbox"
          style={{ width: "100%", minWidth: "100%", maxWidth: "100%", boxSizing: "border-box" }}
        >
          {/* テキスト本文 */}
          <p
            className="novel-textbox-text"
            style={{ width: "100%", minWidth: "100%", maxWidth: "100%", boxSizing: "border-box" }}
          >
            {displayedText}
          </p>

          {/* 下部ガイド & 送りカーソル */}
          <div className="novel-textbox-footer">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "rgba(255, 175, 195, 0.85)" }}>
                {dialogueIndex + 1} / {scene.dialogues.length}
              </span>
              <span style={{ color: "#64748b" }}>|</span>
              <span style={{ color: "#64748b" }}>
                [SPACE / クリック] 次へ
              </span>
            </div>

            {/* 送り矢印インジケーター */}
            <div>
              {!isTyping && (
                <span className="novel-arrow-bounce">
                  ▼
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 5. バックログモーダル (ノベルゲーム定番機能) */}
      {showLog && (
        <div className="novel-log-modal">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 12, borderBottom: "1px solid rgba(255, 35, 75, 0.3)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#ff2a6d", fontWeight: "bold" }}>
              <History size={16} />
              <span>DIALOGUE LOG</span>
            </div>
            <button
              type="button"
              onClick={() => setShowLog(false)}
              className="novel-ctrl-btn"
            >
              <X size={16} />
            </button>
          </div>

          {/* ログリスト */}
          <div className="novel-log-content">
            {scene.dialogues.slice(0, dialogueIndex + 1).map((d, idx) => (
              <div
                key={`${d.speaker}-${d.expression}-${idx}`}
                className="novel-log-item"
              >
                <div style={{ fontSize: 12, fontWeight: "bold", color: "#ff2a6d", marginBottom: 4 }}>
                  {d.speaker}
                </div>
                <div style={{ fontSize: 14, color: "#f1f5f9", lineHeight: 1.6 }}>
                  {d.text}
                </div>
              </div>
            ))}
          </div>

          <div style={{ paddingTop: 8, textAlign: "center" }}>
            <CyberButton
              variant="secondary"
              size="sm"
              onClick={() => setShowLog(false)}
            >
              閉じる
            </CyberButton>
          </div>
        </div>
      )}
    </div>
  );
};
