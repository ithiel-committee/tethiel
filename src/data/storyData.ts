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
        speaker: "イティエル",
        expression: "determined",
        text: "ここに「オペレーターへの呼びかけ・緊急事態発生の状況説明」が入る",
      },
      {
        speaker: "イティエル",
        expression: "troubled",
        text: "ここに「キャンパス外郭へのウイルス侵入と危険性」が入る",
      },
      {
        speaker: "イティエル",
        expression: "thinking",
        text: "ここに「上から回路ブロックを投下して足場を作るというルール説明」が入る",
      },
      {
        speaker: "イティエル",
        expression: "smug",
        text: "ここに「最上部サーバーコア到達への意気込み・激励」が入る",
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
        text: "ここに「第1関門突破の喜び・オペレーターへの感謝」が入る",
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
        speaker: "イティエル",
        expression: "frustrated",
        text: "ここに「敵の侵入ルート増加への焦り・悔しさ」が入る",
      },
      {
        speaker: "イティエル",
        expression: "troubled",
        text: "ここに「黒色感染ウイルスの新登場・注意喚起」が入る",
      },
      {
        speaker: "イティエル",
        expression: "determined",
        text: "ここに「落ち着いて回路を繋げば突破できるという励まし」が入る",
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
        text: "ここに「オペレーターの操作を絶賛するセリフ」が入る",
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
        speaker: "イティエル",
        expression: "determined",
        text: "ここに「最終防衛ライン・メインフレーム前に到着した緊張感」が入る",
      },
      {
        speaker: "イティエル",
        expression: "troubled",
        text: "ここに「高速で迫るウイルスと星回収の難しさについての説明」が入る",
      },
      {
        speaker: "イティエル",
        expression: "thinking",
        text: "ここに「二人ならきっと完全防衛できるという信頼」が入る",
      },
      {
        speaker: "イティエル",
        expression: "smug",
        text: "ここに「iTLの平和を守るため全力で挑む決意」が入る",
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
        text: "ここに「最高のオペレーターへの感謝と誇らしげな締めくくり」が入る",
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
        text: "ここに「未曾有の大規模サイバー侵攻アラート・警報音への驚き」が入る",
      },
      {
        speaker: "イティエル",
        expression: "thinking",
        text: "ここに「高度制限解除・無限クライミング迎撃のルール説明」が入る",
      },
      {
        speaker: "イティエル",
        expression: "determined",
        text: "ここに「限界まで登り続ける挑戦への気合い」が入る",
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
