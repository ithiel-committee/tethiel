import { useEffect } from "react";

/**
 * 各画面・モーダルがビューポートからはみ出していないか (スクロールが発生していないか) を検証するチェッカー
 */

export interface OverflowViolation {
  element: HTMLElement;
  tagName: string;
  className: string;
  id: string;
  rect: {
    top: number;
    bottom: number;
    left: number;
    right: number;
    width: number;
    height: number;
  };
  overflowY: number;
  overflowX: number;
}

export interface OverflowCheckResult {
  screenName: string;
  isOverflowing: boolean;
  viewport: {
    width: number;
    height: number;
  };
  containerRect?: {
    width: number;
    height: number;
    scrollHeight: number;
    clientHeight: number;
  };
  violations: OverflowViolation[];
  summary: string;
}

/**
 * 対象要素およびその子孫要素が、指定したビューポートまたは親境界からはみ出していないか検査する
 */
export function checkElementOverflow(
  container: HTMLElement | null,
  options: {
    screenName?: string;
    viewport?: { width: number; height: number };
    tolerancePx?: number;
  } = {},
): OverflowCheckResult {
  const screenName = options.screenName ?? "UnknownScreen";
  const tolerance = options.tolerancePx ?? 1; // 1px未満のサブピクセル誤差は許容
  const vpWidth =
    options.viewport?.width ??
    (typeof window !== "undefined" ? window.innerWidth : 1280);
  const vpHeight =
    options.viewport?.height ??
    (typeof window !== "undefined" ? window.innerHeight : 768);

  const result: OverflowCheckResult = {
    screenName,
    isOverflowing: false,
    viewport: { width: vpWidth, height: vpHeight },
    violations: [],
    summary: "",
  };

  if (!container) {
    result.summary = `[${screenName}] コンテナ要素が存在しません`;
    return result;
  }

  // 1. コンテナ自身のスクロールバー発生チェック
  const scrollOverflowY = container.scrollHeight - container.clientHeight;
  const scrollOverflowX = container.scrollWidth - container.clientWidth;

  result.containerRect = {
    width: container.clientWidth,
    height: container.clientHeight,
    scrollHeight: container.scrollHeight,
    clientHeight: container.clientHeight,
  };

  if (scrollOverflowY > tolerance || scrollOverflowX > tolerance) {
    result.isOverflowing = true;
    result.violations.push({
      element: container,
      tagName: container.tagName.toLowerCase(),
      className: container.className,
      id: container.id,
      rect: container.getBoundingClientRect(),
      overflowY: Math.max(0, scrollOverflowY),
      overflowX: Math.max(0, scrollOverflowX),
    });
  }

  // 2. ビューポート枠からの実画面はみ出しチェック
  const allElements = [container, ...Array.from(container.querySelectorAll<HTMLElement>("*"))];

  for (const el of allElements) {
    // 非表示要素は除外
    if (el.offsetParent === null && el.offsetWidth === 0 && el.offsetHeight === 0) {
      continue;
    }

    const rect = el.getBoundingClientRect();
    const bottomOverflow = rect.bottom - vpHeight;
    const topOverflow = -rect.top;
    const rightOverflow = rect.right - vpWidth;
    const leftOverflow = -rect.left;

    const excessY = Math.max(0, bottomOverflow, topOverflow);
    const excessX = Math.max(0, rightOverflow, leftOverflow);

    if (excessY > tolerance || excessX > tolerance) {
      result.isOverflowing = true;
      // 重複登録を防止
      const alreadyReported = result.violations.some((v) => v.element === el);
      if (!alreadyReported) {
        result.violations.push({
          element: el,
          tagName: el.tagName.toLowerCase(),
          className: el.className,
          id: el.id,
          rect: {
            top: rect.top,
            bottom: rect.bottom,
            left: rect.left,
            right: rect.right,
            width: rect.width,
            height: rect.height,
          },
          overflowY: Math.round(excessY),
          overflowX: Math.round(excessX),
        });
      }
    }
  }

  if (result.isOverflowing) {
    result.summary = `[${screenName}] はみ出し検知: ${result.violations.length} 個の要素がビューポート (${vpWidth}x${vpHeight}) を超過しています (最大Y超過: ${Math.max(...result.violations.map((v) => v.overflowY))}px)`;
  } else {
    result.summary = `[${screenName}] OK: ビューポート (${vpWidth}x${vpHeight}) 内に完全に収まっています`;
  }

  return result;
}

/**
 * はみ出しがないことをアサートする (テスト用)
 * はみ出しが検知された場合はエラーをスローする
 */
export function assertNoScreenOverflow(
  container: HTMLElement | null,
  screenName: string,
  viewport?: { width: number; height: number },
): void {
  const check = checkElementOverflow(container, { screenName, viewport });
  if (check.isOverflowing) {
    const details = check.violations
      .slice(0, 5)
      .map((v) => `  - <${v.tagName} class="${v.className}">: Y超過=${v.overflowY}px, X超過=${v.overflowX}px`)
      .join("\n");
    throw new Error(`${check.summary}\n超過要素リスト:\n${details}`);
  }
}

/**
 * 画面コンポーネント用のはみ出し監視フック
 * 開発時やテスト時に各画面で呼び出すことで、レンダリング直後およびリサイズ時のオーバーフローを自動監視します
 */
export function useOverflowCheck(screenName: string, enabled = true): void {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const runCheck = () => {
      const root = document.getElementById("root");
      const result = checkElementOverflow(root, { screenName });
      if (result.isOverflowing) {
        console.warn(`[OverflowWatcher] ${result.summary}`, result.violations);
      }
    };

    // レンダリング完了後にチェック
    const timer = window.setTimeout(runCheck, 200);
    window.addEventListener("resize", runCheck);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", runCheck);
    };
  }, [screenName, enabled]);
}

// ブラウザ開発環境から即座にテストできるようにグローバル関数としても登録
if (typeof window !== "undefined") {
  (window as unknown as { __checkTethielOverflow?: () => OverflowCheckResult }).__checkTethielOverflow = () => {
    const root = document.getElementById("root");
    const result = checkElementOverflow(root, { screenName: "ActiveScreen" });
    console.info(result.summary);
    if (result.isOverflowing) {
      console.warn("はみ出し詳細:", result.violations);
    }
    return result;
  };
}
