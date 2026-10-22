import ithielDefault from "../assets/story/ithiel_default.png";
import ithielDetermined from "../assets/story/ithiel_determined.png";
import ithielFrustrated from "../assets/story/ithiel_frustrated.png";
import ithielSmile from "../assets/story/ithiel_smile.png";
import ithielSmug from "../assets/story/ithiel_smug.png";
import ithielSurprised from "../assets/story/ithiel_surprised.png";
import ithielThinking from "../assets/story/ithiel_thinking.png";
import ithielTroubled from "../assets/story/ithiel_troubled.png";
import type { IthielExpression, StoryScene } from "../types/story";

// 表情画像マッピング
export const ITHIEL_EXPRESSION_IMAGES: Record<IthielExpression, string> = {
  default: ithielDefault,
  smile: ithielSmile,
  surprised: ithielSurprised,
  smug: ithielSmug,
  troubled: ithielTroubled,
  frustrated: ithielFrustrated,
  thinking: ithielThinking,
  determined: ithielDetermined,
};

// ステージ別ストーリーシナリオ (ライター向け仮テキストプレースホルダー)
export const STORY_SCENES: Record<string, StoryScene> = {
  // STAGE 1
  "stage-1-prologue": {
    id: "stage-1-prologue",
    stageId: 1,
    type: "prologue",
    title: "STAGE 01 : プロローグ",
    dialogues: [
      {
        speaker: "防衛本部",
        expression: "default",
        text: "中央大学 iTL サイバーセキュリティ防衛本部より入電――",
      },
      {
        speaker: "イティエル",
        expression: "surprised",
        text: "マルウェアがサーバーに侵入しようとしてる……？！",
      },
      {
        speaker: "イティエル",
        expression: "default",
        text: "手遅れになる前に防衛地点……ファイアーウォールまで急がないと行けませんね",
      },
      {
        speaker: "イティエル",
        expression: "determined",
        text: "学生の皆さんのためにも、私がここを守らないといけません！",
      },
    ],
  },
  "stage-1-epilogue": {
    id: "stage-1-epilogue",
    stageId: 1,
    type: "epilogue",
    title: "STAGE 01 : エピローグ",
    dialogues: [
      {
        speaker: "イティエル",
        expression: "surprised",
        text: "ここに「サーバーコア直結成功の驚き・速報」が入る",
      },
      {
        speaker: "イティエル",
        expression: "smile",
        text: "ここに「第1関門突破の喜び・プレイヤーへの感謝」が入る",
      },
      {
        speaker: "イティエル",
        expression: "smug",
        text: "ここに「次のステージへ向けた自信・意気込み」が入る",
      },
    ],
  },

  // STAGE 2
  "stage-2-prologue": {
    id: "stage-2-prologue",
    stageId: 2,
    type: "prologue",
    title: "STAGE 02 : プロローグ",
    dialogues: [
      {
        speaker: "防衛本部",
        expression: "default",
        text: "中央大学 iTL サイバーセキュリティ防衛本部より入電――",
      },
      {
        speaker: "イティエル",
        expression: "smile",
        text: "良かった、防衛作戦は順調みたいですね",
      },
      {
        speaker: "マルウェア",
        expression: "surprised",
        text: "――！ ――！！",
      },
      {
        speaker: "イティエル",
        expression: "surprised",
        text: "って、抜けられてる？！",
      },
      {
        speaker: "イティエル",
        expression: "troubled",
        text: "マルウェアたちより先にサーバーまで行って保護しないと……！",
      },
    ],
  },
  "stage-2-epilogue": {
    id: "stage-2-epilogue",
    stageId: 2,
    type: "epilogue",
    title: "STAGE 02 : エピローグ",
    dialogues: [
      {
        speaker: "イティエル",
        expression: "surprised",
        text: "ここに「危機一髪でのクリア・安堵の吐息」が入る",
      },
      {
        speaker: "イティエル",
        expression: "smile",
        text: "ここに「プレイヤーの操作を絶賛するセリフ」が入る",
      },
      {
        speaker: "イティエル",
        expression: "thinking",
        text: "ここに「奥のメインフレームから感じる不穏な予兆・最終決戦への警戒」が入る",
      },
    ],
  },

  // STAGE 3
  "stage-3-prologue": {
    id: "stage-3-prologue",
    stageId: 3,
    type: "prologue",
    title: "STAGE 03 : プロローグ",
    dialogues: [
      {
        speaker: "防衛本部",
        expression: "default",
        text: "中央大学 iTL サイバーセキュリティ防衛本部より入電――",
      },
      {
        speaker: "イティエル",
        expression: "troubled",
        text: "何とかサーバーまで辿り着けました……",
      },
      {
        speaker: "イティエル",
        expression: "thinking",
        text: "ですが、このままではいずれマルウェアもここまで来てしまいますね",
      },
      {
        speaker: "イティエル",
        expression: "thinking",
        text: "どうしたものでしょうか……",
      },
      {
        speaker: "マルウェア",
        expression: "troubled",
        text: "――！ ――！！",
      },
      {
        speaker: "イティエル",
        expression: "default",
        text: "悩んでいる暇はありませんね",
      },
      {
        speaker: "イティエル",
        expression: "default",
        text: "サーバーを守りながら離脱しましょう！",
      },
      {
        speaker: "イティエル",
        expression: "determined",
        text: "この大学は、私が守ります！",
      },
    ],
  },
  "stage-3-epilogue": {
    id: "stage-3-epilogue",
    stageId: 3,
    type: "epilogue",
    title: "STAGE 03 : エピローグ",
    dialogues: [
      {
        speaker: "イティエル",
        expression: "surprised",
        text: "ここに「ウイルスコア完全消滅を確認した瞬間の衝撃」が入る",
      },
      {
        speaker: "イティエル",
        expression: "smile",
        text: "ここに「サイバー空間完全防衛達成の最大級の喜び」が入る",
      },
      {
        speaker: "イティエル",
        expression: "smug",
        text: "ここに「最高のプレイヤーへの感謝と誇らしげな締めくくり」が入る",
      },
    ],
  },

  // ENDLESS
  "stage-99-prologue": {
    id: "stage-99-prologue",
    stageId: 99,
    type: "prologue",
    title: "ENDLESS : プロローグ",
    dialogues: [
      {
        speaker: "イティエル",
        expression: "surprised",
        text: "先のマルウェア侵入を受けた訓練、ですか？",
      },
      {
        speaker: "イティエル",
        expression: "smile",
        text: "そうですね。そういうのは大事です",
      },
      {
        speaker: "イティエル",
        expression: "smug",
        text: "先の防衛戦を経た私たちなら良いスコアが出せるはずです",
      },
      {
        speaker: "イティエル",
        expression: "smile",
        text: "どこまで記録を伸ばせるか、頑張って挑戦してみましょう！",
      },
    ],
  },
  "stage-99-epilogue": {
    id: "stage-99-epilogue",
    stageId: 99,
    type: "epilogue",
    title: "ENDLESS : エピローグ",
    dialogues: [
      {
        speaker: "イティエル",
        expression: "smile",
        text: "ここに「前人未到の最高到達高度記録達成への称賛」が入る",
      },
      {
        speaker: "イティエル",
        expression: "smug",
        text: "ここに「最高のパートナーとしての称賛セリフ」が入る",
      },
    ],
  },
};

/**
 * ステージIDと種類(prologue / epilogue)からシーンを取得する
 */
export function getStoryScene(
  stageId: number,
  type: "prologue" | "epilogue",
): StoryScene | null {
  const key = `stage-${stageId}-${type}`;
  return STORY_SCENES[key] ?? null;
}
