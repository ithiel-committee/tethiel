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

  // ボム・スキル操作ガイド
  bombGuideLabel: {
    standard: "ボム:",
    kids: "ばくだん:",
  },
  bombDesc: {
    standard: "(ウイルス爆破)",
    kids: "(ウイルスばくは)",
  },

  // タイトル画面モーダル・ランキング
  bestRecords: {
    standard: "BEST RECORDS (自己ベスト)",
    kids: "さいこう きろく",
  },
  scoreLogs: {
    standard: "SCORE LOGS (プレイ履歴)",
    kids: "あそんだ りれき",
  },
  noRecord: {
    standard: "NO RECORD",
    kids: "きろくなし",
  },
  survivor: {
    standard: "SURVIVOR",
    kids: "サバイバー",
  },
  bestScoreLabel: {
    standard: "BEST SCORE:",
    kids: "さいこう てんすう:",
  },
  maxAltitudeLabel: {
    standard: "MAX ALTITUDE:",
    kids: "さいこう たかさ:",
  },
  clearTimeLabel: {
    standard: "CLEAR TIME:",
    kids: "クリア じかん:",
  },
  altitudeUnit: {
    standard: "高度",
    kids: "たかさ",
  },
  minoUnit: {
    standard: "ミノ",
    kids: "ブロック",
  },
  movesUnit: {
    standard: "手",
    kids: "かい",
  },

  // オプション・クレジット
  settingsTitle: {
    standard: "SYSTEM SETTINGS (オプション)",
    kids: "せってい",
  },
  audioSetting: {
    standard: "オーディオ設定",
    kids: "おとの せってい",
  },
  soundEffectLabel: {
    standard: "シンセ効果音 / SE",
    kids: "こうかおん",
  },
  soundOff: {
    standard: "SOUND: OFF",
    kids: "おと: なし",
  },
  soundOn: {
    standard: "SOUND: ON",
    kids: "おと: あり",
  },
  controlsTitle: {
    standard: "キーボード操作ガイド (CONTROLS)",
    kids: "キーボードの つかいかた",
  },
  controlsSubtitle: {
    standard: "QWERTY & 十字キー対応",
    kids: "やじるしキーでも うごかせるよ",
  },
  creditsTitle: {
    standard: "PRODUCTION CREDITS (クレジット)",
    kids: "クレジット",
  },
  resetRecords: {
    standard: "RESET RECORDS (記録初期化)",
    kids: "きろくを けす",
  },
  closeButton: {
    standard: "CLOSE (閉じる)",
    kids: "とじる",
  },

  // キーボード操作ガイド (KeyboardGuide)
  guideRotateRight: {
    standard: "↻ 右回転 (W / X)",
    kids: "↻ みぎにまわす (W / X)",
  },
  guideRotateLeft: {
    standard: "↺ 左回転 (Q / Z)",
    kids: "↺ ひだりにまわす (Q / Z)",
  },
  guideBomb: {
    standard: "💣 ボム (B / 1)",
    kids: "💣 ばくだん (B / 1)",
  },
  guideMove: {
    standard: "◀ 左右移動 (A / D) ▶",
    kids: "◀ よこにいどう (A / D) ▶",
  },
  guideDrop: {
    standard: "▼ 落下 (S / ↓)",
    kids: "▼ おとす (S / ↓)",
  },
  guideHardDrop: {
    standard: "⚡ 即置き (SPACE / ↑)",
    kids: "⚡ すぐにおく (SPACE / ↑)",
  },
  guideHold: {
    standard: "★ ホールド (C / SHIFT)",
    kids: "★ キープ (C / SHIFT)",
  },
  guidePause: {
    standard: "⏸ 一時停止 (P / ESC)",
    kids: "⏸ ひとやすみ (P / ESC)",
  },
  guideArrowKeys: {
    standard: "十字キーでも完全操作可能",
    kids: "やじるしキーでも あそべるよ",
  },
  guideArrowKeysDetail: {
    standard: "↑:即置き / ←→:左右移動 / ↓:落下",
    kids: "↑:すぐにおく / ←→:いどう / ↓:おとす",
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
      standard: "回路を繋いでイティエルをGOALへ導こう！",
      kids: "ブロックをおいて イティエルをゴールへつれていってね！",
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
      standard: "トゲを巧みに回避し、迫り来るウイルスから守り抜け！",
      kids: "あかいトゲをよけて、ウイルスから にげよう！",
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
      standard: "サーバー中枢の最終防衛戦！迫る高速ウイルスを突破せよ！",
      kids: "さいごのたたかい！トゲをよけて ゴールをめざそう！",
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
      standard: "天井のないサイバー空間をどこまでも登り続けろ！",
      kids: "てんじょうがない せかいを どこまでものぼろう！",
    },
  },
};
