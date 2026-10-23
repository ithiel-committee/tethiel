/**
 * ゲームの起動・動作フラグ設定
 *
 * 【切り替え方法】
 * 1. このファイルの定数 (DEFAULT_GAME_FLAGS) を書き換える
 * 2. 起動URLのクエリパラメータで指定する:
 *    - クリア後ストーリー: ?story=true / ?story=false (または ?story=1 / ?story=0)
 *    - 自機グラフィック: ?sprite=deformed (立ち絵) / ?sprite=pixel (ドット絵カーソル)
 * 3. タイトル画面の「設定」モーダルからGUIで切り替える (ブラウザに保存されます)
 */

export type PlayerSpriteMode = "deformed" | "pixel";

export interface GameFlags {
  // クリア後にストーリー(エピローグ)を表示するかどうか
  showStoryOnClear: boolean;
  // 自機キャラクターの画像種別 ("pixel": ドット絵, "deformed": デフォルメ立ち絵)
  playerSpriteMode: PlayerSpriteMode;
}

// デフォルト設定フラグ (コード直接編集で切り替える場合はここを変更)
export const DEFAULT_GAME_FLAGS: GameFlags = {
  showStoryOnClear: false,
  playerSpriteMode: "pixel",
};

const STORAGE_KEY = "tethiel_game_flags";

let cachedFlags: GameFlags | null = null;

function loadFlags(): GameFlags {
  const flags: GameFlags = { ...DEFAULT_GAME_FLAGS };

  // 1. localStorage からの復帰
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.showStoryOnClear === "boolean") {
          flags.showStoryOnClear = parsed.showStoryOnClear;
        }
        if (
          parsed.playerSpriteMode === "deformed" ||
          parsed.playerSpriteMode === "pixel"
        ) {
          flags.playerSpriteMode = parsed.playerSpriteMode;
        }
      }
    } catch {}
  }

  // 2. URL クエリパラメータによる上書き (起動時の最優先指定)
  if (typeof window !== "undefined" && window.location) {
    try {
      const params = new URLSearchParams(window.location.search);

      // ストーリーフラグ: ?story=0 / ?story=false / ?story=1 / ?story=true
      if (params.has("story")) {
        const val = params.get("story")?.toLowerCase();
        if (
          val === "false" ||
          val === "0" ||
          val === "off" ||
          val === "no"
        ) {
          flags.showStoryOnClear = false;
        } else if (
          val === "true" ||
          val === "1" ||
          val === "on" ||
          val === "yes"
        ) {
          flags.showStoryOnClear = true;
        }
      }

      // 自機スプライトフラグ: ?sprite=pixel / ?sprite=cursor / ?sprite=deformed / ?player=...
      const spriteVal = (
        params.get("sprite") || params.get("player")
      )?.toLowerCase();
      if (spriteVal) {
        if (
          spriteVal === "pixel" ||
          spriteVal === "cursor" ||
          spriteVal === "dot"
        ) {
          flags.playerSpriteMode = "pixel";
        } else if (
          spriteVal === "deformed" ||
          spriteVal === "standing" ||
          spriteVal === "illust"
        ) {
          flags.playerSpriteMode = "deformed";
        }
      }
    } catch {}
  }

  return flags;
}

// URLパラメータおよびlocalStorageからフラグを読み込む
export function getGameFlags(): GameFlags {
  if (!cachedFlags) {
    cachedFlags = loadFlags();
  }
  return cachedFlags;
}

// フラグの保存
export function setGameFlags(partial: Partial<GameFlags>): GameFlags {
  const current = getGameFlags();
  const next = { ...current, ...partial };
  cachedFlags = next;
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  }
  return next;
}
