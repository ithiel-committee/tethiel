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
        text: "すごい……！ もうファイアーウォールへの回路が繋がったんですか？！",
      },
      {
        speaker: "イティエル",
        expression: "smile",
        text: "あなたのブロック配置、迷いがなくて本当に的確でした！ ありがとうございます！",
      },
      {
        speaker: "イティエル",
        expression: "smug",
        text: "これで第1防衛ラインは確保完了です。この調子でどんどん進んじゃいましょう！",
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
        expression: "troubled",
        text: "ふぅ……！ ウイルスの浸食スピード、一時はどうなることかと思いました……！",
      },
      {
        speaker: "イティエル",
        expression: "smile",
        text: "あんな狭い迂回ルートを切り拓いて先回りできるなんて……あなたの神業操作のおかげです！",
      },
      {
        speaker: "イティエル",
        expression: "thinking",
        text: "でも、サーバー中枢の奥から……ものすごいトラフィックのノイズを感じます。",
      },
      {
        speaker: "イティエル",
        expression: "determined",
        text: "次が本当の正念場ですね。中央大学のサーバーを守るため、最後まで一緒に戦ってください！",
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
        text: "見てください……！ 侵入していたウイルスコアが、完全に霧散していきます……！",
      },
      {
        speaker: "防衛本部",
        expression: "default",
        text: "全セクターのウイルス消滅を確認。サーバーの正常稼働を再開します――",
      },
      {
        speaker: "イティエル",
        expression: "smile",
        text: "やりました……！ ついに全サーバーの防衛に成功しましたよ、プレイヤー！",
      },
      {
        speaker: "イティエル",
        expression: "smug",
        text: "ふふっ、あなたという最高のオペレーターがいてくれて、私、本当に誇らしいです！",
      },
      {
        speaker: "イティエル",
        expression: "smile",
        text: "これで学生の皆さんも安心してキャンパスライフを送れますね。本当に、ありがとうございました！",
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
        expression: "surprised",
        text: "こんな高度まで登りきるなんて……！ 信じられない記録が出ましたね！",
      },
      {
        speaker: "イティエル",
        expression: "smile",
        text: "迫り来るウイルスをものともしないステップ、隣で見ていて息を呑むほどでした！",
      },
      {
        speaker: "イティエル",
        expression: "smug",
        text: "これだけの訓練をこなした私たちなら、どんなサイバー攻撃が来ても怖くありませんね！",
      },
      {
        speaker: "イティエル",
        expression: "smile",
        text: "ふふっ、お疲れ様でした！ 次の限界突破も、楽しみにしていますね！",
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
