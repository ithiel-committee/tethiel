import { useEffect, useState } from "react";
import { useUIText } from "../context/UIModeContext";

interface KeyboardGuideProps {
  className?: string;
}

/**
 * QWERTYキーボードUIと直感的な操作一覧凡例カードによるキーボード操作ガイド
 */
export const KeyboardGuide = ({ className = "" }: KeyboardGuideProps) => {
  const { isKids } = useUIText();
  // 押下中のキーをリアルタイム検知してキートップおよび凡例カードをアクティブ発光
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

  interface KeyGroup {
    keys: string[];
    codes: string[];
    note?: string;
  }

  interface ControlItem {
    id: string;
    label: string;
    color: string;
    keyGroups: KeyGroup[];
    activeCodes: string[];
  }

  // 操作一覧定義 (案A: 凡例リスト)
  const controlItems: ControlItem[] = [
    {
      id: "move",
      label: isKids ? "ひだり・みぎ いどう" : "左右移動",
      color: "#38bdf8",
      keyGroups: [
        { keys: ["A", "D"], codes: ["keya", "keyd"] },
        { keys: ["←", "→"], codes: ["arrowleft", "arrowright"] },
      ],
      activeCodes: ["keya", "keyd", "arrowleft", "arrowright"],
    },
    {
      id: "rotate",
      label: isKids ? "かいてん (みぎ / ひだり)" : "回転 (右 / 左)",
      color: "#ff2a6d",
      keyGroups: [
        {
          keys: ["W", "X"],
          codes: ["keyw", "keyx"],
          note: isKids ? "みぎ" : "右",
        },
        {
          keys: ["Q", "Z"],
          codes: ["keyq", "keyz"],
          note: isKids ? "ひだり" : "左",
        },
      ],
      activeCodes: ["keyw", "keyx", "keyq", "keyz"],
    },
    {
      id: "hardDrop",
      label: isKids ? "すぐおとす (即置き)" : "即置き (ハードドロップ)",
      color: "#f59e0b",
      keyGroups: [
        { keys: ["SPACE"], codes: ["space"] },
        { keys: ["↑"], codes: ["arrowup"] },
      ],
      activeCodes: ["space", "arrowup"],
    },
    {
      id: "softDrop",
      label: isKids ? "おとす (高速落下)" : "高速落下 (ソフトドロップ)",
      color: "#f43f5e",
      keyGroups: [
        { keys: ["S"], codes: ["keys"] },
        { keys: ["↓"], codes: ["arrowdown"] },
      ],
      activeCodes: ["keys", "arrowdown"],
    },
    {
      id: "hold",
      label: isKids ? "キープ (ホールド)" : "ホールド (キープ)",
      color: "#eab308",
      keyGroups: [
        { keys: ["SHIFT"], codes: ["shiftleft", "shiftright"] },
        { keys: ["C"], codes: ["keyc"] },
      ],
      activeCodes: ["shiftleft", "shiftright", "keyc"],
    },
    {
      id: "bomb",
      label: isKids ? "ボム (必殺技)" : "ボム (ライン消去)",
      color: "#c084fc",
      keyGroups: [
        { keys: ["B"], codes: ["keyb"] },
        { keys: ["1"], codes: ["digit1"] },
      ],
      activeCodes: ["keyb", "digit1"],
    },
    {
      id: "pause",
      label: isKids ? "ひとやすみ" : "一時停止 (ポーズ)",
      color: "#94a3b8",
      keyGroups: [
        { keys: ["ESC"], codes: ["escape"] },
        { keys: ["P"], codes: ["keyp"] },
      ],
      activeCodes: ["escape", "keyp"],
    },
  ];

  return (
    <div className={`keyboard-guide-container ${className}`}>
      {/* 1. キーボード盤面 (引き出し線を全廃し、本体だけをクリアに表示) */}
      <div className="keyboard-guide-board">
        <svg
          viewBox="126 26 310 126"
          className="keyboard-guide-svg"
          xmlns="http://www.w3.org/2000/svg"
          style={{ fontFamily: "var(--font-pixel)" }}
        >
          <title>
            {isKids ? "キーボードそうさガイド" : "キーボード操作ガイド"}
          </title>
          <defs>
            {/* ネオングローフィルター */}
            <filter
              id="neon-glow"
              x="-30%"
              y="-30%"
              width="160%"
              height="160%"
            >
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

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

          {/* キーボード本体ベースプレート */}
          <rect
            x="132"
            y="32"
            width="298"
            height="114"
            rx="8"
            fill="#0e0307"
            stroke="rgba(255, 26, 75, 0.4)"
            strokeWidth="1.2"
          />

          {/* Row 1 (数字 / Esc) */}
          <g className="kb-row-1">
            {/* Esc */}
            <rect
              x="138"
              y="37"
              width="18"
              height="18"
              rx="3"
              fill={
                isPressed("escape")
                  ? "url(#key-pressed)"
                  : "url(#key-active)"
              }
              stroke="#ff2a6d"
              strokeWidth={isPressed("escape") ? "2" : "1.2"}
            />
            <text
              x="147"
              y="49"
              textAnchor="middle"
              fill="#ff708f"
              fontSize="7"
              fontWeight="bold"
            >
              ESC
            </text>

            {/* 1 (BOMB) */}
            <rect
              x="159"
              y="37"
              width="18"
              height="18"
              rx="3"
              fill={
                isPressed("digit1")
                  ? "url(#key-pressed)"
                  : "url(#key-active)"
              }
              stroke="#c084fc"
              strokeWidth={isPressed("digit1") ? "2" : "1.2"}
              filter={isPressed("digit1") ? "url(#neon-glow)" : undefined}
            />
            <text
              x="168"
              y="49"
              textAnchor="middle"
              fill="#e9d5ff"
              fontSize="8"
              fontWeight="bold"
            >
              1
            </text>

            {/* 2 - 0 */}
            {["2", "3", "4", "5", "6", "7", "8", "9", "0"].map(
              (num, i) => (
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
                  <text
                    x={189 + i * 21}
                    y="49"
                    textAnchor="middle"
                    fill="#64748b"
                    fontSize="8"
                  >
                    {num}
                  </text>
                </g>
              ),
            )}

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
            <text
              x="381.5"
              y="49"
              textAnchor="middle"
              fill="#64748b"
              fontSize="7"
            >
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
            <text
              x="150"
              y="70"
              textAnchor="middle"
              fill="#64748b"
              fontSize="7"
            >
              TAB
            </text>

            {/* Q (左回転) */}
            <rect
              x="165"
              y="58"
              width="18"
              height="18"
              rx="3"
              fill={
                isPressed("keyq")
                  ? "url(#key-pressed)"
                  : "url(#key-active)"
              }
              stroke="#ff2a6d"
              strokeWidth={isPressed("keyq") ? "2" : "1.2"}
              filter={isPressed("keyq") ? "url(#neon-glow)" : undefined}
            />
            <text
              x="174"
              y="70"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="9"
              fontWeight="bold"
            >
              Q
            </text>

            {/* W (右回転) */}
            <rect
              x="186"
              y="58"
              width="18"
              height="18"
              rx="3"
              fill={
                isPressed("keyw")
                  ? "url(#key-pressed)"
                  : "url(#key-active)"
              }
              stroke="#ff2a6d"
              strokeWidth={isPressed("keyw") ? "2" : "1.2"}
              filter={isPressed("keyw") ? "url(#neon-glow)" : undefined}
            />
            <text
              x="195"
              y="70"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="9"
              fontWeight="bold"
            >
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
                <text
                  x={216 + i * 21}
                  y="70"
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize="8"
                >
                  {ch}
                </text>
              </g>
            ))}

            {/* P (一時停止) */}
            <rect
              x="354"
              y="58"
              width="18"
              height="18"
              rx="3"
              fill={
                isPressed("keyp")
                  ? "url(#key-pressed)"
                  : "url(#key-active)"
              }
              stroke="#ff2a6d"
              strokeWidth={isPressed("keyp") ? "2" : "1.2"}
            />
            <text
              x="363"
              y="70"
              textAnchor="middle"
              fill="#ff708f"
              fontSize="9"
              fontWeight="bold"
            >
              P
            </text>

            {/* @ / [ */}
            <rect
              x="375"
              y="58"
              width="18"
              height="18"
              rx="3"
              fill="url(#key-idle)"
              stroke="rgba(100, 116, 139, 0.25)"
            />
            <text
              x="384"
              y="70"
              textAnchor="middle"
              fill="#64748b"
              fontSize="8"
            >
              @
            </text>
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
            <text
              x="152"
              y="91"
              textAnchor="middle"
              fill="#64748b"
              fontSize="6"
            >
              CAPS
            </text>

            {/* A (左移動) */}
            <rect
              x="169"
              y="79"
              width="18"
              height="18"
              rx="3"
              fill={
                isPressed("keya")
                  ? "url(#key-pressed)"
                  : "url(#key-active)"
              }
              stroke="#38bdf8"
              strokeWidth={isPressed("keya") ? "2" : "1.4"}
              filter={isPressed("keya") ? "url(#neon-glow)" : undefined}
            />
            <text
              x="178"
              y="91"
              textAnchor="middle"
              fill="#38bdf8"
              fontSize="9"
              fontWeight="bold"
            >
              A
            </text>

            {/* S (高速落下) */}
            <rect
              x="190"
              y="79"
              width="18"
              height="18"
              rx="3"
              fill={
                isPressed("keys")
                  ? "url(#key-pressed)"
                  : "url(#key-active)"
              }
              stroke="#f43f5e"
              strokeWidth={isPressed("keys") ? "2" : "1.4"}
              filter={isPressed("keys") ? "url(#neon-glow)" : undefined}
            />
            <text
              x="199"
              y="91"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="9"
              fontWeight="bold"
            >
              S
            </text>

            {/* D (右移動) */}
            <rect
              x="211"
              y="79"
              width="18"
              height="18"
              rx="3"
              fill={
                isPressed("keyd")
                  ? "url(#key-pressed)"
                  : "url(#key-active)"
              }
              stroke="#38bdf8"
              strokeWidth={isPressed("keyd") ? "2" : "1.4"}
              filter={isPressed("keyd") ? "url(#neon-glow)" : undefined}
            />
            <text
              x="220"
              y="91"
              textAnchor="middle"
              fill="#38bdf8"
              fontSize="9"
              fontWeight="bold"
            >
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
                <text
                  x={241 + i * 21}
                  y="91"
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize="8"
                >
                  {ch}
                </text>
              </g>
            ))}

            {/* Enter */}
            <rect
              x="361"
              y="79"
              width="33"
              height="18"
              rx="3"
              fill="url(#key-idle)"
              stroke="rgba(100, 116, 139, 0.25)"
            />
            <text
              x="377.5"
              y="91"
              textAnchor="middle"
              fill="#64748b"
              fontSize="7"
            >
              ENTER
            </text>
          </g>

          {/* Row 4 (ZXCV) */}
          <g className="kb-row-4">
            {/* Shift (ホールド) */}
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
              stroke="#eab308"
              strokeWidth={
                isPressed("shiftleft") || isPressed("shiftright")
                  ? "2"
                  : "1.2"
              }
              filter={
                isPressed("shiftleft") || isPressed("shiftright")
                  ? "url(#neon-glow)"
                  : undefined
              }
            />
            <text
              x="155"
              y="112"
              textAnchor="middle"
              fill="#fef08a"
              fontSize="7"
              fontWeight="bold"
            >
              SHIFT
            </text>

            {/* Z (左回転) */}
            <rect
              x="175"
              y="100"
              width="18"
              height="18"
              rx="3"
              fill={
                isPressed("keyz")
                  ? "url(#key-pressed)"
                  : "url(#key-active)"
              }
              stroke="#ff2a6d"
              strokeWidth={isPressed("keyz") ? "2" : "1.2"}
              filter={isPressed("keyz") ? "url(#neon-glow)" : undefined}
            />
            <text
              x="184"
              y="112"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="9"
              fontWeight="bold"
            >
              Z
            </text>

            {/* X (右回転) */}
            <rect
              x="196"
              y="100"
              width="18"
              height="18"
              rx="3"
              fill={
                isPressed("keyx")
                  ? "url(#key-pressed)"
                  : "url(#key-active)"
              }
              stroke="#ff2a6d"
              strokeWidth={isPressed("keyx") ? "2" : "1.2"}
              filter={isPressed("keyx") ? "url(#neon-glow)" : undefined}
            />
            <text
              x="205"
              y="112"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="9"
              fontWeight="bold"
            >
              X
            </text>

            {/* C (ホールド) */}
            <rect
              x="217"
              y="100"
              width="18"
              height="18"
              rx="3"
              fill={
                isPressed("keyc") ? "url(#key-pressed)" : "url(#key-gold)"
              }
              stroke="#eab308"
              strokeWidth={isPressed("keyc") ? "2" : "1.2"}
              filter={isPressed("keyc") ? "url(#neon-glow)" : undefined}
            />
            <text
              x="226"
              y="112"
              textAnchor="middle"
              fill="#fef08a"
              fontSize="9"
              fontWeight="bold"
            >
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
            <text
              x="247"
              y="112"
              textAnchor="middle"
              fill="#64748b"
              fontSize="8"
            >
              V
            </text>

            {/* B (ボム) */}
            <rect
              x="259"
              y="100"
              width="18"
              height="18"
              rx="3"
              fill={
                isPressed("keyb")
                  ? "url(#key-pressed)"
                  : "url(#key-active)"
              }
              stroke="#c084fc"
              strokeWidth={isPressed("keyb") ? "2" : "1.2"}
              filter={isPressed("keyb") ? "url(#neon-glow)" : undefined}
            />
            <text
              x="268"
              y="112"
              textAnchor="middle"
              fill="#e9d5ff"
              fontSize="8"
              fontWeight="bold"
            >
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
                <text
                  x={289 + i * 21}
                  y="112"
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize="8"
                >
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
            <text
              x="339"
              y="112"
              textAnchor="middle"
              fill="#64748b"
              fontSize="7"
            >
              SHIFT
            </text>

            {/* ↑ 矢印 (即置き) */}
            <rect
              x="380"
              y="100"
              width="18"
              height="18"
              rx="3"
              fill={
                isPressed("arrowup")
                  ? "url(#key-pressed)"
                  : "url(#key-gold)"
              }
              stroke="#f59e0b"
              strokeWidth={isPressed("arrowup") ? "2" : "1.2"}
              filter={isPressed("arrowup") ? "url(#neon-glow)" : undefined}
            />
            <text
              x="389"
              y="112"
              textAnchor="middle"
              fill="#fef08a"
              fontSize="10"
              fontWeight="bold"
            >
              ↑
            </text>
          </g>

          {/* Row 5 (Space / 矢印キー) */}
          <g className="kb-row-5">
            {/* Ctrl, Alt */}
            <rect
              x="138"
              y="121"
              width="22"
              height="18"
              rx="3"
              fill="url(#key-idle)"
              stroke="rgba(100, 116, 139, 0.25)"
            />
            <text
              x="149"
              y="133"
              textAnchor="middle"
              fill="#64748b"
              fontSize="7"
            >
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
            <text
              x="173"
              y="133"
              textAnchor="middle"
              fill="#64748b"
              fontSize="7"
            >
              ALT
            </text>

            {/* SPACE (即置き) */}
            <rect
              x="186"
              y="121"
              width="104"
              height="18"
              rx="3"
              fill={
                isPressed("space") ? "url(#key-pressed)" : "url(#key-gold)"
              }
              stroke="#f59e0b"
              strokeWidth={isPressed("space") ? "2" : "1.2"}
              filter={isPressed("space") ? "url(#neon-glow)" : undefined}
            />
            <text
              x="238"
              y="133"
              textAnchor="middle"
              fill="#fef08a"
              fontSize="8"
              fontWeight="bold"
              letterSpacing="0.1em"
            >
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
            <text
              x="303"
              y="133"
              textAnchor="middle"
              fill="#64748b"
              fontSize="7"
            >
              ALT
            </text>

            {/* ← (左移動) */}
            <rect
              x="359"
              y="121"
              width="18"
              height="18"
              rx="3"
              fill={
                isPressed("arrowleft")
                  ? "url(#key-pressed)"
                  : "url(#key-active)"
              }
              stroke="#38bdf8"
              strokeWidth={isPressed("arrowleft") ? "2" : "1.2"}
              filter={
                isPressed("arrowleft") ? "url(#neon-glow)" : undefined
              }
            />
            <text
              x="368"
              y="133"
              textAnchor="middle"
              fill="#38bdf8"
              fontSize="10"
              fontWeight="bold"
            >
              ←
            </text>

            {/* ↓ (落下) */}
            <rect
              x="380"
              y="121"
              width="18"
              height="18"
              rx="3"
              fill={
                isPressed("arrowdown")
                  ? "url(#key-pressed)"
                  : "url(#key-active)"
              }
              stroke="#f43f5e"
              strokeWidth={isPressed("arrowdown") ? "2" : "1.2"}
              filter={
                isPressed("arrowdown") ? "url(#neon-glow)" : undefined
              }
            />
            <text
              x="389"
              y="133"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="10"
              fontWeight="bold"
            >
              ↓
            </text>

            {/* → (右移動) */}
            <rect
              x="401"
              y="121"
              width="18"
              height="18"
              rx="3"
              fill={
                isPressed("arrowright")
                  ? "url(#key-pressed)"
                  : "url(#key-active)"
              }
              stroke="#38bdf8"
              strokeWidth={isPressed("arrowright") ? "2" : "1.2"}
              filter={
                isPressed("arrowright") ? "url(#neon-glow)" : undefined
              }
            />
            <text
              x="410"
              y="133"
              textAnchor="middle"
              fill="#38bdf8"
              fontSize="10"
              fontWeight="bold"
            >
              →
            </text>
          </g>
        </svg>
      </div>

      {/* 2. 操作一覧凡例カード (引き出し線の代わりにすっきり2列配置) */}
      <div className="keyboard-guide-legend">
        {controlItems.map((item) => {
          const isItemActive = item.activeCodes.some((code) =>
            isPressed(code),
          );

          return (
            <div
              key={item.id}
              className={`keyboard-guide-item ${
                isItemActive ? "keyboard-guide-item-active" : ""
              }`}
            >
              <div
                className="keyboard-guide-badge"
                style={{ color: item.color }}
              >
                <span
                  className="keyboard-guide-dot"
                  style={{
                    backgroundColor: item.color,
                    color: item.color,
                  }}
                />
                <span>{item.label}</span>
              </div>

              <div className="keyboard-guide-keys">
                {item.keyGroups.map((group, gIdx) => (
                  <span
                    key={`${item.id}-group-${gIdx}`}
                    className="inline-flex items-center gap-1"
                  >
                    {gIdx > 0 && (
                      <span className="keyboard-guide-or">/</span>
                    )}
                    {group.keys.map((k, kIdx) => {
                      const code = group.codes[kIdx];
                      const isKeyActive = code ? isPressed(code) : false;

                      return (
                        <kbd
                          key={`${item.id}-${k}`}
                          className={`keyboard-guide-kbd ${
                            isKeyActive ? "keyboard-guide-kbd-active" : ""
                          }`}
                        >
                          {k}
                        </kbd>
                      );
                    })}
                    {group.note && (
                      <span className="text-[9px] text-slate-400 font-pixel">
                        {group.note}
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
