import ithielStandingDefault from "../assets/character/ithiel_standing_default.png";
import ithielStandingImg from "../assets/character/ithiel_standing_smile.png";
import playerLeftImg from "../assets/character/player_left.png";
import playerRightImg from "../assets/character/player_right.png";
import { ITHIEL_EXPRESSION_IMAGES } from "../data/storyData";

// ゲームおよびストーリー画面で使用する画像アセットリスト
export const GAME_ASSET_IMAGES = [
  ithielStandingDefault,
  ithielStandingImg,
  playerLeftImg,
  playerRightImg,
  ...Object.values(ITHIEL_EXPRESSION_IMAGES),
];

// GCによるデコード結果解放を防ぐための参照保持キャッシュ
const imageCache = new Map<string, HTMLImageElement>();

/**
 * ゲーム画面で使用する画像アセットを事前ロード・デコードする
 */
export function preloadGameAssets(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  // <link rel="preload" as="image"> の追加 (ブラウザスケジューラへの最優先ヒント)
  for (const src of GAME_ASSET_IMAGES) {
    const existing = document.querySelector(
      `link[rel="preload"][href="${src}"]`,
    );
    if (!existing) {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = src;
      document.head.appendChild(link);
    }
  }

  // Imageインスタンス生成とデコード
  const promises = GAME_ASSET_IMAGES.map((src) => {
    if (imageCache.has(src)) {
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
        (img as HTMLImageElement).onload = done;
        (img as HTMLImageElement).onerror = done;
      }
    });
  });

  return Promise.all(promises).then(() => {});
}
