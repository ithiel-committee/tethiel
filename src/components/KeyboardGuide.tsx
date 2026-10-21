import { useEffect, useState } from "react";

interface KeyboardGuideProps {
  className?: string;
}

/**
 * QWERTYキーボードUIと外側へ伸びる引き出し線(矢印)による直感的操作ガイド
 */
export const KeyboardGuide = ({ className = "" }: KeyboardGuideProps) => {
  // 押下中のキーをリアルタイム検知してキートップをアクティブ発光
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const code = e.code.toLowerCase();
      setPressedKeys((prev) => {
        const next = new Set(prev);
        next.add(code);
        return next;
      });
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const code = e.code.toLowerCase();
      setPressedKeys((prev) => {
        const next = new Set(prev);
        next.delete(code);
        return next;
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const isPressed = (code: string) => pressedKeys.has(code.toLowerCase());

  return (
    <div className={`keyboard-guide-container ${className}`}>
      <svg
        viewBox="0 0 660 195"
        className="keyboard-guide-svg"
        xmlns="http://www.w3.org/2000/svg"
        style={{ fontFamily: "var(--font-pixel)" }}
      >
        <defs>
          {/* ネオングローフィルター */}
          <filter id="neon-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="badge-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* 矢印マーカー */}
          <marker
            id="arrow-rose"
            viewBox="0 0 8 6"
            refX="6"
            refY="3"
            markerWidth="6"
            markerHeight="5"
            orient="auto"
          >
            <polygon points="0 0, 8 3, 0 6" fill="#ff2a6d" />
          </marker>

          <marker
            id="arrow-amber"
            viewBox="0 0 8 6"
            refX="6"
            refY="3"
            markerWidth="6"
            markerHeight="5"
            orient="auto"
          >
            <polygon points="0 0, 8 3, 0 6" fill="#f59e0b" />
          </marker>

          <marker
            id="arrow-cyan"
            viewBox="0 0 8 6"
            refX="6"
            refY="3"
            markerWidth="6"
            markerHeight="5"
            orient="auto"
          >
            <polygon points="0 0, 8 3, 0 6" fill="#38bdf8" />
          </marker>

          {/* キートップのグラデーション */}
          <linearGradient id="key-idle" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2e0d1b" />
            <stop offset="100%" stopColor="#16050d" />
          </linearGradient>

          <linearGradient id="key-active" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#54142c" />
            <stop offset="100%" stopColor="#280614" />
          </linearGradient>

          <linearGradient id="key-pressed" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff2a6d" />
            <stop offset="100%" stopColor="#99002a" />
          </linearGradient>

          <linearGradient id="key-gold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#572e0d" />
            <stop offset="100%" stopColor="#2b1404" />
          </linearGradient>
        </defs>

        {/* 1. キーボード本体のベースプレート */}
        <rect
          x="132"
          y="32"
          width="298"
          height="114"
          rx="8"
          fill="#0e0307"
          stroke="rgba(255, 26, 75, 0.35)"
          strokeWidth="1.2"
        />

        {/* 2. キーキャップ群 */}

        {/* Row 1 (数字/Esc) */}
        <g className="kb-row-1">
          {/* Esc */}
          <rect
            x="138"
            y="37"
            width="18"
            height="18"
            rx="3"
            fill={isPressed("escape") ? "url(#key-pressed)" : "url(#key-idle)"}
            stroke={isPressed("escape") ? "#ff2a6d" : "rgba(100, 116, 139, 0.3)"}
          />
          <text x="147" y="49" textAnchor="middle" fill="#64748b" fontSize="7">
            ESC
          </text>

          {/* 1 (BOMB) */}
          <rect
            x="159"
            y="37"
            width="18"
            height="18"
            rx="3"
            fill={isPressed("digit1") ? "url(#key-pressed)" : "url(#key-active)"}
            stroke="#ff2a6d"
            strokeWidth={isPressed("digit1") ? "1.8" : "1"}
            filter={isPressed("digit1") ? "url(#neon-glow)" : undefined}
          />
          <text x="168" y="49" textAnchor="middle" fill="#ff708f" fontSize="8" fontWeight="bold">
            1
          </text>

          {/* 2 - 0 */}
          {["2", "3", "4", "5", "6", "7", "8", "9", "0"].map((num, i) => (
            <g key={num}>
              <rect
                x={180 + i * 21}
                y="37"
                width="18"
                height="18"
                rx="3"
                fill="url(#key-idle)"
                stroke="rgba(100, 116, 139, 0.25)"
              />
              <text x={189 + i * 21} y="49" textAnchor="middle" fill="#64748b" fontSize="8">
                {num}
              </text>
            </g>
          ))}

          {/* Backspace */}
          <rect
            x="369"
            y="37"
            width="25"
            height="18"
            rx="3"
            fill="url(#key-idle)"
            stroke="rgba(100, 116, 139, 0.25)"
          />
          <text x="381.5" y="49" textAnchor="middle" fill="#64748b" fontSize="7">
            BS
          </text>
        </g>

        {/* Row 2 (QWERTY) */}
        <g className="kb-row-2">
          {/* Tab */}
          <rect
            x="138"
            y="58"
            width="24"
            height="18"
            rx="3"
            fill="url(#key-idle)"
            stroke="rgba(100, 116, 139, 0.25)"
          />
          <text x="150" y="70" textAnchor="middle" fill="#64748b" fontSize="7">
            TAB
          </text>

          {/* Q (左回転 - アクティブ) */}
          <rect
            x="165"
            y="58"
            width="18"
            height="18"
            rx="3"
            fill={isPressed("keyq") ? "url(#key-pressed)" : "url(#key-active)"}
            stroke="#ff2a6d"
            strokeWidth={isPressed("keyq") ? "2" : "1.2"}
            filter={isPressed("keyq") ? "url(#neon-glow)" : undefined}
          />
          <text x="174" y="70" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
            Q
          </text>

          {/* W (右回転 - アクティブ) */}
          <rect
            x="186"
            y="58"
            width="18"
            height="18"
            rx="3"
            fill={isPressed("keyw") ? "url(#key-pressed)" : "url(#key-active)"}
            stroke="#ff2a6d"
            strokeWidth={isPressed("keyw") ? "2" : "1.2"}
            filter={isPressed("keyw") ? "url(#neon-glow)" : undefined}
          />
          <text x="195" y="70" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
            W
          </text>

          {/* E, R, T, Y, U, I, O */}
          {["E", "R", "T", "Y", "U", "I", "O"].map((ch, i) => (
            <g key={ch}>
              <rect
                x={207 + i * 21}
                y="58"
                width="18"
                height="18"
                rx="3"
                fill="url(#key-idle)"
                stroke="rgba(100, 116, 139, 0.25)"
              />
              <text x={216 + i * 21} y="70" textAnchor="middle" fill="#64748b" fontSize="8">
                {ch}
              </text>
            </g>
          ))}

          {/* P (一時停止 - アクティブ) */}
          <rect
            x="354"
            y="58"
            width="18"
            height="18"
            rx="3"
            fill={isPressed("keyp") ? "url(#key-pressed)" : "url(#key-active)"}
            stroke="#ff2a6d"
            strokeWidth={isPressed("keyp") ? "2" : "1.2"}
          />
          <text x="363" y="70" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
            P
          </text>

          {/* Enter上部 */}
          <rect
            x="375"
            y="58"
            width="19"
            height="18"
            rx="3"
            fill="url(#key-idle)"
            stroke="rgba(100, 116, 139, 0.25)"
          />
        </g>

        {/* Row 3 (ASDF) */}
        <g className="kb-row-3">
          {/* Caps */}
          <rect
            x="138"
            y="79"
            width="28"
            height="18"
            rx="3"
            fill="url(#key-idle)"
            stroke="rgba(100, 116, 139, 0.25)"
          />
          <text x="152" y="91" textAnchor="middle" fill="#64748b" fontSize="7">
            CAPS
          </text>

          {/* A (左移動 - アクティブ) */}
          <rect
            x="169"
            y="79"
            width="18"
            height="18"
            rx="3"
            fill={isPressed("keya") ? "url(#key-pressed)" : "url(#key-active)"}
            stroke="#38bdf8"
            strokeWidth={isPressed("keya") ? "2" : "1.2"}
            filter={isPressed("keya") ? "url(#neon-glow)" : undefined}
          />
          <text x="178" y="91" textAnchor="middle" fill="#38bdf8" fontSize="9" fontWeight="bold">
            A
          </text>

          {/* S (高速落下 - アクティブ) */}
          <rect
            x="190"
            y="79"
            width="18"
            height="18"
            rx="3"
            fill={isPressed("keys") ? "url(#key-pressed)" : "url(#key-active)"}
            stroke="#ff2a6d"
            strokeWidth={isPressed("keys") ? "2" : "1.2"}
            filter={isPressed("keys") ? "url(#neon-glow)" : undefined}
          />
          <text x="199" y="91" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
            S
          </text>

          {/* D (右移動 - アクティブ) */}
          <rect
            x="211"
            y="79"
            width="18"
            height="18"
            rx="3"
            fill={isPressed("keyd") ? "url(#key-pressed)" : "url(#key-active)"}
            stroke="#38bdf8"
            strokeWidth={isPressed("keyd") ? "2" : "1.2"}
            filter={isPressed("keyd") ? "url(#neon-glow)" : undefined}
          />
          <text x="220" y="91" textAnchor="middle" fill="#38bdf8" fontSize="9" fontWeight="bold">
            D
          </text>

          {/* F, G, H, J, K, L */}
          {["F", "G", "H", "J", "K", "L"].map((ch, i) => (
            <g key={ch}>
              <rect
                x={232 + i * 21}
                y="79"
                width="18"
                height="18"
                rx="3"
                fill="url(#key-idle)"
                stroke="rgba(100, 116, 139, 0.25)"
              />
              <text x={241 + i * 21} y="91" textAnchor="middle" fill="#64748b" fontSize="8">
                {ch}
              </text>
            </g>
          ))}

          {/* Enter */}
          <rect
            x="358"
            y="79"
            width="36"
            height="18"
            rx="3"
            fill="url(#key-idle)"
            stroke="rgba(100, 116, 139, 0.25)"
          />
          <text x="376" y="91" textAnchor="middle" fill="#64748b" fontSize="7">
            ENTER
          </text>
        </g>

        {/* Row 4 (ZXCV) */}
        <g className="kb-row-4">
          {/* Shift (ホールド - アクティブゴールド) */}
          <rect
            x="138"
            y="100"
            width="34"
            height="18"
            rx="3"
            fill={
              isPressed("shiftleft") || isPressed("shiftright")
                ? "url(#key-pressed)"
                : "url(#key-gold)"
            }
            stroke="#f59e0b"
            strokeWidth={
              isPressed("shiftleft") || isPressed("shiftright") ? "2" : "1.2"
            }
            filter={
              isPressed("shiftleft") || isPressed("shiftright")
                ? "url(#neon-glow)"
                : undefined
            }
          />
          <text x="155" y="112" textAnchor="middle" fill="#fef08a" fontSize="7" fontWeight="bold">
            SHIFT
          </text>

          {/* Z (左回転 - アクティブ) */}
          <rect
            x="175"
            y="100"
            width="18"
            height="18"
            rx="3"
            fill={isPressed("keyz") ? "url(#key-pressed)" : "url(#key-active)"}
            stroke="#ff2a6d"
            strokeWidth={isPressed("keyz") ? "2" : "1.2"}
            filter={isPressed("keyz") ? "url(#neon-glow)" : undefined}
          />
          <text x="184" y="112" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
            Z
          </text>

          {/* X (右回転 - アクティブ) */}
          <rect
            x="196"
            y="100"
            width="18"
            height="18"
            rx="3"
            fill={isPressed("keyx") ? "url(#key-pressed)" : "url(#key-active)"}
            stroke="#ff2a6d"
            strokeWidth={isPressed("keyx") ? "2" : "1.2"}
            filter={isPressed("keyx") ? "url(#neon-glow)" : undefined}
          />
          <text x="205" y="112" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
            X
          </text>

          {/* C (ホールド - アクティブゴールド) */}
          <rect
            x="217"
            y="100"
            width="18"
            height="18"
            rx="3"
            fill={isPressed("keyc") ? "url(#key-pressed)" : "url(#key-gold)"}
            stroke="#f59e0b"
            strokeWidth={isPressed("keyc") ? "2" : "1.2"}
            filter={isPressed("keyc") ? "url(#neon-glow)" : undefined}
          />
          <text x="226" y="112" textAnchor="middle" fill="#fef08a" fontSize="9" fontWeight="bold">
            C
          </text>

          {/* V */}
          <rect
            x="238"
            y="100"
            width="18"
            height="18"
            rx="3"
            fill="url(#key-idle)"
            stroke="rgba(100, 116, 139, 0.25)"
          />
          <text x="247" y="112" textAnchor="middle" fill="#64748b" fontSize="8">
            V
          </text>

          {/* B (ボム - アクティブ) */}
          <rect
            x="259"
            y="100"
            width="18"
            height="18"
            rx="3"
            fill={isPressed("keyb") ? "url(#key-pressed)" : "url(#key-active)"}
            stroke="#ff2a6d"
            strokeWidth={isPressed("keyb") ? "2" : "1.2"}
          />
          <text x="268" y="112" textAnchor="middle" fill="#ff708f" fontSize="8" fontWeight="bold">
            B
          </text>

          {/* N, M */}
          {["N", "M"].map((ch, i) => (
            <g key={ch}>
              <rect
                x={280 + i * 21}
                y="100"
                width="18"
                height="18"
                rx="3"
                fill="url(#key-idle)"
                stroke="rgba(100, 116, 139, 0.25)"
              />
              <text x={289 + i * 21} y="112" textAnchor="middle" fill="#64748b" fontSize="8">
                {ch}
              </text>
            </g>
          ))}

          {/* Shift (右) */}
          <rect
            x="322"
            y="100"
            width="34"
            height="18"
            rx="3"
            fill="url(#key-idle)"
            stroke="rgba(100, 116, 139, 0.25)"
          />
          <text x="339" y="112" textAnchor="middle" fill="#64748b" fontSize="7">
            SHIFT
          </text>

          {/* ↑ 矢印 (即置き - アクティブゴールド) */}
          <rect
            x="380"
            y="100"
            width="18"
            height="18"
            rx="3"
            fill={isPressed("arrowup") ? "url(#key-pressed)" : "url(#key-gold)"}
            stroke="#f59e0b"
            strokeWidth={isPressed("arrowup") ? "2" : "1.2"}
            filter={isPressed("arrowup") ? "url(#neon-glow)" : undefined}
          />
          <text x="389" y="112" textAnchor="middle" fill="#fef08a" fontSize="10" fontWeight="bold">
            ↑
          </text>
        </g>

        {/* Row 5 (Space / 矢印キー) */}
        <g className="kb-row-5">
          {/* Ctrl, Win, Alt */}
          <rect
            x="138"
            y="121"
            width="22"
            height="18"
            rx="3"
            fill="url(#key-idle)"
            stroke="rgba(100, 116, 139, 0.25)"
          />
          <text x="149" y="133" textAnchor="middle" fill="#64748b" fontSize="7">
            CTRL
          </text>

          <rect
            x="163"
            y="121"
            width="20"
            height="18"
            rx="3"
            fill="url(#key-idle)"
            stroke="rgba(100, 116, 139, 0.25)"
          />
          <text x="173" y="133" textAnchor="middle" fill="#64748b" fontSize="7">
            ALT
          </text>

          {/* SPACE (即置き - アクティブゴールド) */}
          <rect
            x="186"
            y="121"
            width="104"
            height="18"
            rx="3"
            fill={isPressed("space") ? "url(#key-pressed)" : "url(#key-gold)"}
            stroke="#f59e0b"
            strokeWidth={isPressed("space") ? "2" : "1.2"}
            filter={isPressed("space") ? "url(#neon-glow)" : undefined}
          />
          <text x="238" y="133" textAnchor="middle" fill="#fef08a" fontSize="8" fontWeight="bold" letterSpacing="0.1em">
            SPACE
          </text>

          <rect
            x="293"
            y="121"
            width="20"
            height="18"
            rx="3"
            fill="url(#key-idle)"
            stroke="rgba(100, 116, 139, 0.25)"
          />
          <text x="303" y="133" textAnchor="middle" fill="#64748b" fontSize="7">
            ALT
          </text>

          {/* ← (左移動 - アクティブ) */}
          <rect
            x="359"
            y="121"
            width="18"
            height="18"
            rx="3"
            fill={isPressed("arrowleft") ? "url(#key-pressed)" : "url(#key-active)"}
            stroke="#38bdf8"
            strokeWidth={isPressed("arrowleft") ? "2" : "1.2"}
            filter={isPressed("arrowleft") ? "url(#neon-glow)" : undefined}
          />
          <text x="368" y="133" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="bold">
            ←
          </text>

          {/* ↓ (落下 - アクティブ) */}
          <rect
            x="380"
            y="121"
            width="18"
            height="18"
            rx="3"
            fill={isPressed("arrowdown") ? "url(#key-pressed)" : "url(#key-active)"}
            stroke="#ff2a6d"
            strokeWidth={isPressed("arrowdown") ? "2" : "1.2"}
            filter={isPressed("arrowdown") ? "url(#neon-glow)" : undefined}
          />
          <text x="389" y="133" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">
            ↓
          </text>

          {/* → (右移動 - アクティブ) */}
          <rect
            x="401"
            y="121"
            width="18"
            height="18"
            rx="3"
            fill={isPressed("arrowright") ? "url(#key-pressed)" : "url(#key-active)"}
            stroke="#38bdf8"
            strokeWidth={isPressed("arrowright") ? "2" : "1.2"}
            filter={isPressed("arrowright") ? "url(#neon-glow)" : undefined}
          />
          <text x="410" y="133" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="bold">
            →
          </text>
        </g>

        {/* 3. 各キーから外側へ引っ張る矢印線 & 説明ラベル */}

        {/* [1] 上側: W / X -> 右回転 */}
        <path
          d="M 195 58 L 195 18 L 165 18"
          fill="none"
          stroke="#ff2a6d"
          strokeWidth="1.4"
          markerEnd="url(#arrow-rose)"
        />
        <g transform="translate(48, 8)">
          <rect
            width="112"
            height="20"
            rx="4"
            fill="rgba(24, 7, 16, 0.92)"
            stroke="rgba(255, 42, 109, 0.7)"
            strokeWidth="1"
          />
          <text x="56" y="14" textAnchor="middle" fill="#ffaec0" fontSize="10" fontWeight="bold">
            ↻ 右回転 (W / X)
          </text>
        </g>

        {/* [2] 左側: A / D -> 左右移動 */}
        <path
          d="M 169 88 L 122 88 L 122 68 L 110 68"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="1.4"
          markerEnd="url(#arrow-cyan)"
        />
        <g transform="translate(6, 58)">
          <rect
            width="100"
            height="20"
            rx="4"
            fill="rgba(10, 20, 30, 0.92)"
            stroke="rgba(56, 189, 248, 0.7)"
            strokeWidth="1"
          />
          <text x="50" y="14" textAnchor="middle" fill="#7dd3fc" fontSize="10" fontWeight="bold">
            ◀ 左右移動 (A / D) ▶
          </text>
        </g>

        {/* [3] 左下: Z -> 左回転 */}
        <path
          d="M 175 109 L 115 109"
          fill="none"
          stroke="#ff2a6d"
          strokeWidth="1.4"
          markerEnd="url(#arrow-rose)"
        />
        <g transform="translate(10, 99)">
          <rect
            width="100"
            height="20"
            rx="4"
            fill="rgba(24, 7, 16, 0.92)"
            stroke="rgba(255, 42, 109, 0.7)"
            strokeWidth="1"
          />
          <text x="50" y="14" textAnchor="middle" fill="#ffaec0" fontSize="10" fontWeight="bold">
            ↺ 左回転 (Z)
          </text>
        </g>

        {/* [4] 下側左: S -> 高速落下 */}
        <path
          d="M 199 97 L 199 158 L 175 158"
          fill="none"
          stroke="#ff2a6d"
          strokeWidth="1.4"
          markerEnd="url(#arrow-rose)"
        />
        <g transform="translate(70, 148)">
          <rect
            width="100"
            height="20"
            rx="4"
            fill="rgba(24, 7, 16, 0.92)"
            stroke="rgba(255, 42, 109, 0.7)"
            strokeWidth="1"
          />
          <text x="50" y="14" textAnchor="middle" fill="#ffaec0" fontSize="10" fontWeight="bold">
            ▼ 落下 (S / ↓)
          </text>
        </g>

        {/* [5] 下側中央: SPACE -> 即置き */}
        <path
          d="M 238 139 L 238 165"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="1.4"
          markerEnd="url(#arrow-amber)"
        />
        <g transform="translate(182, 168)">
          <rect
            width="114"
            height="20"
            rx="4"
            fill="rgba(35, 15, 5, 0.95)"
            stroke="rgba(245, 158, 11, 0.85)"
            strokeWidth="1.2"
          />
          <text x="57" y="14" textAnchor="middle" fill="#fde047" fontSize="10" fontWeight="bold">
            ⚡ 即置き (SPACE / ↑)
          </text>
        </g>

        {/* [6] 下側右: C -> ホールド */}
        <path
          d="M 226 118 L 226 158 L 305 158"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="1.4"
          markerEnd="url(#arrow-amber)"
        />
        <g transform="translate(310, 148)">
          <rect
            width="108"
            height="20"
            rx="4"
            fill="rgba(35, 15, 5, 0.95)"
            stroke="rgba(245, 158, 11, 0.85)"
            strokeWidth="1.2"
          />
          <text x="54" y="14" textAnchor="middle" fill="#fde047" fontSize="10" fontWeight="bold">
            ★ ホールド (C)
          </text>
        </g>

        {/* [7] 右上: P / Esc -> 一時停止 */}
        <path
          d="M 363 58 L 363 18 L 440 18"
          fill="none"
          stroke="#ff2a6d"
          strokeWidth="1.4"
          markerEnd="url(#arrow-rose)"
        />
        <g transform="translate(445, 8)">
          <rect
            width="110"
            height="20"
            rx="4"
            fill="rgba(24, 7, 16, 0.92)"
            stroke="rgba(255, 42, 109, 0.7)"
            strokeWidth="1"
          />
          <text x="55" y="14" textAnchor="middle" fill="#ffaec0" fontSize="10" fontWeight="bold">
            ⏸ 一時停止 (P / ESC)
          </text>
        </g>

        {/* [8] 右側: 矢印キー群 -> 十字キー操作 */}
        <path
          d="M 419 130 L 450 130"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="1.4"
          markerEnd="url(#arrow-cyan)"
        />
        <g transform="translate(455, 96)">
          <rect
            width="195"
            height="46"
            rx="5"
            fill="rgba(12, 18, 28, 0.94)"
            stroke="rgba(56, 189, 248, 0.7)"
            strokeWidth="1.2"
          />
          <text x="12" y="18" fill="#38bdf8" fontSize="11" fontWeight="bold">
            十字キーでも完全操作可能
          </text>
          <text x="12" y="34" fill="#94a3b8" fontSize="9">
            ↑:即置き / ←→:左右移動 / ↓:落下
          </text>
        </g>
      </svg>
    </div>
  );
};
