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
  exit: {
    standard: "EXIT",
    kids: "おわる",
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
  skip: {
    standard: "SKIP",
    kids: "スキップ",
  },
  auto: {
    standard: "AUTO",
    kids: "じどう",
  },
  log: {
    standard: "LOG",
    kids: "きろく",
  },
  title: {
    standard: "TITLE",
    kids: "タイトル",
  },
  locked: {
    standard: "LOCKED",
    kids: "まだだよ",
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

  // ゲーム中UI・スコア項目
  score: {
    standard: "SCORE",
    kids: "てんすう",
  },
  evaluationRank: {
    standard: "EVALUATION RANK",
    kids: "けっか",
  },
  finalScore: {
    standard: "FINAL SCORE",
    kids: "てんすう",
  },
  bestScore: {
    standard: "BEST SCORE",
    kids: "さいこう てんすう",
  },
  time: {
    standard: "TIME",
    kids: "じかん",
  },
  minoCount: {
    standard: "MINO COUNT",
    kids: "おいたブロック",
  },
  stage: {
    standard: "STAGE",
    kids: "ステージ",
  },
  mode: {
    standard: "MODE",
    kids: "モード",
  },
  height: {
    standard: "HEIGHT",
    kids: "たかさ",
  },
  bonus: {
    standard: "BONUS",
    kids: "ボーナス",
  },
  bonusStars: {
    standard: "BONUS STARS",
    kids: "ボーナススター",
  },
  virus: {
    standard: "VIRUS",
    kids: "ウイルス",
  },
  virusAdvancing: {
    standard: "▲ 感染進行中 ▲",
    kids: "▲ ウイルスが ちかづいてるよ！ ▲",
  },
  timePenalty: {
    standard: "タイム減点補正",
    kids: "じかんの げんてん",
  },
  minoBonus: {
    standard: "ミノ節約ボーナス",
    kids: "ブロック せつやくボーナス",
  },

  // スロット・操作ガイド
  next: {
    standard: "NEXT",
    kids: "つぎのブロック",
  },
  hold: {
    standard: "HOLD",
    kids: "キープ",
  },
  controlsGuide: {
    standard: "操作ガイド",
    kids: "あそびかた",
  },
  keyboard: {
    standard: "KEYBOARD",
    kids: "キーボード",
  },
  hardDrop: {
    standard: "即置き:",
    kids: "すぐにおく:",
  },
  rotate: {
    standard: "回転:",
    kids: "まわす:",
  },
  move: {
    standard: "移動:",
    kids: "うごかす:",
  },
  softDrop: {
    standard: "落下:",
    kids: "おとす:",
  },
  holdLabel: {
    standard: "ホールド:",
    kids: "キープ:",
  },
  minoExchange: {
    standard: "(ミノ交代)",
    kids: "(ブロックこうたい)",
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

// ステージ情報の多言語辞書
export const STAGE_TEXTS: Record<
  number,
  {
    name: { standard: string; kids: string };
    subtitle: { standard: string; kids: string };
    description: { standard: string; kids: string };
  }
> = {
  1: {
    name: {
      standard: "STAGE 1",
      kids: "ステージ 1",
    },
    subtitle: {
      standard: "入門・回路接続",
      kids: "はじめての みちづくり",
    },
    description: {
      standard:
        "回路を繋いでイティエルをGOALへ導こう！小さなお子様やご家族連れでも楽しめるやさしい難易度。",
      kids:
        "ブロックをおいて みちをつなげよう！イティエルを ゴールへつれていってね。",
    },
  },
  2: {
    name: {
      standard: "STAGE 2",
      kids: "ステージ 2",
    },
    subtitle: {
      standard: "サイバー迂回ルート",
      kids: "トゲをよけて すすもう",
    },
    description: {
      standard:
        "トゲ障害物を巧みに回避しながら回路を繋ぎ、迫り来るウイルスからイティエルを守り抜け！",
      kids:
        "あかいトゲにあたらないように みちをつくろう！おいかけてくる ウイルスから にげよう！",
    },
  },
  3: {
    name: {
      standard: "STAGE 3",
      kids: "ステージ 3",
    },
    subtitle: {
      standard: "最終防衛戦",
      kids: "さいごの たたかい",
    },
    description: {
      standard: "高速ウイルスとの最終決戦。(Coming Soon)",
      kids: "ウイルスとの さいごのたたかい。(まだあそべないよ)",
    },
  },
  99: {
    name: {
      standard: "ENDLESS",
      kids: "エンドレス",
    },
    subtitle: {
      standard: "無限クライミング",
      kids: "どこまでも のぼろう",
    },
    description: {
      standard:
        "天井のないサイバー空間をどこまでも登り続けろ！登った総高度とスコアの極限を目指すサバイバルモード。",
      kids:
        "てんじょうがない せかいを どこまでものぼろう！たかいところを めざしてね。",
    },
  },
};
