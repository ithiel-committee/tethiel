export type UIMode = "standard" | "kids";

export const UI_TEXTS = {
  // メインアクション・ボタン
  start: {
    standard: "START",
    kids: "あそぶ",
  },
  ranking: {
    standard: "RANKING",
    kids: "ランキング",
  },
  option: {
    standard: "OPTION",
    kids: "せってい",
  },
  credit: {
    standard: "CREDIT",
    kids: "クレジット",
  },
  retry: {
    standard: "RETRY",
    kids: "もういちど あそぶ",
  },
  nextLevel: {
    standard: "NEXT LEVEL",
    kids: "つぎのステージへ",
  },
  stageSelect: {
    standard: "STAGE SELECT",
    kids: "ステージを えらぶ",
  },
  home: {
    standard: "HOME",
    kids: "おうちへ もどる",
  },
  back: {
    standard: "BACK",
    kids: "もどる",
  },
  pause: {
    standard: "PAUSE",
    kids: "ひとやすみ",
  },
  resume: {
    standard: "RESUME",
    kids: "つづける",
  },
  close: {
    standard: "CLOSE",
    kids: "とじる",
  },

  // 画面タイトル・ステータス
  stageClear: {
    standard: "STAGE CLEAR!",
    kids: "クリアできたよ！",
  },
  gameOver: {
    standard: "GAME OVER",
    kids: "ざんねん… またちょうせん！",
  },
  selectStageTitle: {
    standard: "SELECT STAGE",
    kids: "ステージを えらぼう",
  },
  endlessMode: {
    standard: "ENDLESS MODE",
    kids: "エンドレス (どこまでも)",
  },
  endlessRecord: {
    standard: "ENDLESS RECORD",
    kids: "エンドレス きろく",
  },
  climbedHeight: {
    standard: "到達高度",
    kids: "のぼった たかさ",
  },
  virusCaught: {
    standard: "ウイルスに追いつかれました",
    kids: "ウイルスにおいつかれちゃった",
  },

  // リザルト・スコア項目
  evaluationRank: {
    standard: "EVALUATION RANK",
    kids: "けっか",
  },
  finalScore: {
    standard: "FINAL SCORE",
    kids: "てんすう",
  },
  time: {
    standard: "TIME",
    kids: "じかん",
  },
  minoCount: {
    standard: "MINO COUNT",
    kids: "おいたブロック",
  },
  bonusStars: {
    standard: "BONUS STARS",
    kids: "ボーナススター",
  },
  timePenalty: {
    standard: "タイム減点補正",
    kids: "じかんの げんてん",
  },
  minoBonus: {
    standard: "ミノ節約ボーナス",
    kids: "ブロック せつやくボーナス",
  },

  // モード切替ラベル
  modeStandardLabel: {
    standard: "つうじょう",
    kids: "つうじょう",
  },
  modeKidsLabel: {
    standard: "ひらがな",
    kids: "ひらがな",
  },
  uiModeSetting: {
    standard: "表示モード (未就学児〜大人)",
    kids: "もじの ひょうじ",
  },
} as const;

export type UITextKey = keyof typeof UI_TEXTS;
