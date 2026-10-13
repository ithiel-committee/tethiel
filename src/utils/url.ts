import { STAGES } from "../game/constants";
import type { StageData } from "../types/game";

/**
 * URLから直接開始するステージを判定する
 * (/play/stage-1, #/play/stage-1, ?stage=1 などに対応)
 */
export function parseStageFromUrl(): StageData | null {
  if (typeof window === "undefined") return null;
  const url =
    `${window.location.pathname}${window.location.search}${window.location.hash}`.toLowerCase();
  const match = url.match(
    /(?:play\/stage-|play\/stage|stage-|stage=)(\d+)/,
  );
  if (match) {
    const stageId = Number.parseInt(match[1], 10);
    const found = STAGES.find((s) => s.id === stageId);
    if (found) return found;
  }
  return null;
}

/**
 * URLパスをタイトル画面用のクリーンなパスにリセットする
 */
export function cleanStageUrl(): void {
  if (typeof window === "undefined") return;
  if (
    window.location.pathname.includes("/play/") ||
    window.location.hash ||
    window.location.search.includes("stage=")
  ) {
    const cleanPath = window.location.pathname.replace(/\/play\/.*$/, "/");
    window.history.replaceState(null, "", cleanPath || "/");
  }
}
