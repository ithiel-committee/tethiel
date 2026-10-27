import ithielStandingDefault from "../assets/character/ithiel_standing_default.png";
import ithielStandingImg from "../assets/character/ithiel_standing_smile.png";
import ithielStandingSmug from "../assets/character/ithiel_standing_smug.png";
import ithielArmHp5 from "../assets/character/ithiel_arm_hp5_smile.png";
import ithielArmHp4 from "../assets/character/ithiel_arm_hp4_default.png";
import ithielArmHp3 from "../assets/character/ithiel_arm_hp3_determined.png";
import ithielArmHp2 from "../assets/character/ithiel_arm_hp2_frustrated.png";
import ithielArmHp1 from "../assets/character/ithiel_arm_hp1_tearful.png";
import ithielArmHp0 from "../assets/character/ithiel_arm_hp0_down.png";
import ithielArmSmug from "../assets/character/ithiel_arm_smug.png";
import playerLeftImg from "../assets/character/player_left.png";
import playerRightImg from "../assets/character/player_right.png";
import playerDotImg from "../assets/character/player_dot.png";
import playerDotRightImg from "../assets/character/player_dot_right.png";
import titleKeyVisual from "../assets/visual/title_key_visual.png";
import virusImg from "../assets/obstacle/virus.png";
import { ITHIEL_EXPRESSION_IMAGES } from "../data/storyData";

// ミニストーリー (プロローグ・エピローグ) で使用する全キャラ画像リスト (最優先)
export const STORY_ASSET_IMAGES = [
  ...Object.values(ITHIEL_EXPRESSION_IMAGES),
  virusImg,
];

// ゲームおよびストーリー画面で使用する全画像アセットリスト
export const GAME_ASSET_IMAGES = [
  ...STORY_ASSET_IMAGES,
  ithielStandingDefault,
  ithielStandingImg,
  ithielStandingSmug,
  ithielArmHp5,
  ithielArmHp4,
  ithielArmHp3,
  ithielArmHp2,
  ithielArmHp1,
  ithielArmHp0,
  ithielArmSmug,
  playerLeftImg,
  playerRightImg,
  playerDotImg,
  playerDotRightImg,
  titleKeyVisual,
];

// GCによるデコード結果解放を防ぐための参照保持キャッシュ
const imageCache = new Map<string, HTMLImageElement>();

/**
 * 指定画像リストを事前ロード・デコードする共通ヘルパー
 */
function preloadImages(
  sources: string[],
  priority: "high" | "auto" = "auto",
): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  // <link rel="preload" as="image"> の追加 (ブラウザスケジューラへの先行フェッチ指示)
  for (const src of sources) {
    const selector = `link[rel="preload"][href="${src}"]`;
    if (!document.querySelector(selector)) {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = src;
      if (priority === "high") {
        link.setAttribute("fetchpriority", "high");
      }
      document.head.appendChild(link);
    }
  }

  // Imageインスタンス生成とデコード
  const promises = sources.map((src) => {
    const cached = imageCache.get(src);
    if (cached) {
      if (typeof cached.decode === "function") {
        return cached.decode().catch(() => {});
      }
      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      const img = new Image();
      imageCache.set(src, img);

      const done = () => resolve();

      img.src = src;
      if (typeof img.decode === "function") {
        img.decode().then(done).catch(done);
      } else {
        img.onload = done;
        img.onerror = done;
      }
    });
  });

  return Promise.all(promises).then(() => {});
}

/**
 * ミニストーリーのキャラ画像を最優先で余裕をもって事前ロード・デコードする
 */
export function preloadStoryAssets(): Promise<void> {
  return preloadImages(STORY_ASSET_IMAGES, "high");
}

/**
 * ゲーム画面で使用する全画像アセットを事前ロード・デコードする
 */
export function preloadGameAssets(): Promise<void> {
  // まずストーリー画像を最優先、続けて全アセットを読み込み
  preloadStoryAssets();
  return preloadImages(GAME_ASSET_IMAGES);
}
