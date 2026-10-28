// Web Audio APIによる完全軽量シンセサウンドシステム（外部ファイル0KB）

class SoundSystem {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private muted = false;
  private volume = 0.8; // 0.0 〜 1.0 (デフォルト 80%)

  constructor() {
    if (typeof localStorage !== "undefined") {
      const saved = localStorage.getItem("tethiel_se_volume");
      if (saved !== null) {
        const val = Number.parseInt(saved, 10);
        if (!Number.isNaN(val) && val >= 0 && val <= 100) {
          this.volume = val / 100;
        }
      }
    }
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    if (!this.masterGain && this.ctx) {
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(
        this.muted ? 0 : this.volume,
        this.ctx.currentTime,
      );
      this.masterGain.connect(this.ctx.destination);
    }
  }

  private getDestination(): AudioNode {
    this.initCtx();
    return this.masterGain ?? this.ctx?.destination ?? ({} as AudioNode);
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setValueAtTime(
        this.muted ? 0 : this.volume,
        this.ctx.currentTime,
      );
    }
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("tethiel_se_volume", String(Math.round(this.volume * 100)));
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setValueAtTime(
        this.muted ? 0 : this.volume,
        this.ctx.currentTime,
      );
    }
    return this.muted;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  // UIボタンクリック音 (キレのある心地よいサイバークリスタルタップ)
  public playBtnClick() {
    if (this.muted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(1050, now);
      osc.frequency.exponentialRampToValueAtTime(1600, now + 0.04);

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.getDestination());
      osc.start(now);
      osc.stop(now + 0.045);
    } catch {}
  }

  // UIボタンキャンセル・閉じる音 (落ち着いたソフトな下降トーン)
  public playBtnClose() {
    if (this.muted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(700, now);
      osc.frequency.exponentialRampToValueAtTime(450, now + 0.045);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      osc.connect(gain);
      gain.connect(this.getDestination());
      osc.start(now);
      osc.stop(now + 0.05);
    } catch {}
  }

  // 左右移動音
  public playMove() {
    if (this.muted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(300, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(
        150,
        this.ctx.currentTime + 0.05,
      );

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        this.ctx.currentTime + 0.05,
      );

      osc.connect(gain);
      gain.connect(this.getDestination());
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch {
      // Audio context error ignore
    }
  }

  // 回転音
  public playRotate() {
    if (this.muted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(400, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(
        700,
        this.ctx.currentTime + 0.07,
      );

      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        this.ctx.currentTime + 0.07,
      );

      osc.connect(gain);
      gain.connect(this.getDestination());
      osc.start();
      osc.stop(this.ctx.currentTime + 0.07);
    } catch {}
  }

  // ホールド音
  public playHold() {
    if (this.muted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(
        450,
        this.ctx.currentTime + 0.08,
      );

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        this.ctx.currentTime + 0.08,
      );

      osc.connect(gain);
      gain.connect(this.getDestination());
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch {}
  }

  // ハードドロップ音
  public playHardDrop() {
    if (this.muted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(250, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(
        50,
        this.ctx.currentTime + 0.12,
      );

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        this.ctx.currentTime + 0.12,
      );

      osc.connect(gain);
      gain.connect(this.getDestination());
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch {}
  }

  // ミノ固定音
  public playLock() {
    if (this.muted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(200, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(
        100,
        this.ctx.currentTime + 0.06,
      );

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        this.ctx.currentTime + 0.06,
      );

      osc.connect(gain);
      gain.connect(this.getDestination());
      osc.start();
      osc.stop(this.ctx.currentTime + 0.06);
    } catch {}
  }

  // 回路フル接続（ライン揃え）ボーナス音（爽快な3連和音）
  public playLineBonus() {
    if (this.muted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      freqs.forEach((f, index) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(
          f,
          this.ctx.currentTime + index * 0.06,
        );

        gain.gain.setValueAtTime(0, this.ctx.currentTime + index * 0.06);
        gain.gain.linearRampToValueAtTime(
          0.12,
          this.ctx.currentTime + index * 0.06 + 0.02,
        );
        gain.gain.exponentialRampToValueAtTime(
          0.001,
          this.ctx.currentTime + index * 0.06 + 0.25,
        );

        osc.connect(gain);
        gain.connect(this.getDestination());
        osc.start(this.ctx.currentTime + index * 0.06);
        osc.stop(this.ctx.currentTime + index * 0.06 + 0.25);
      });
    } catch {}
  }

  // アイテム回収音（キラキラアルペジオ）
  public playItemGet() {
    if (this.muted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const freqs = [880, 1174.66, 1760]; // A5, D6, A6
      freqs.forEach((f, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(f, this.ctx.currentTime + i * 0.07);

        gain.gain.setValueAtTime(0.12, this.ctx.currentTime + i * 0.07);
        gain.gain.exponentialRampToValueAtTime(
          0.001,
          this.ctx.currentTime + i * 0.07 + 0.15,
        );

        osc.connect(gain);
        gain.connect(this.getDestination());
        osc.start(this.ctx.currentTime + i * 0.07);
        osc.stop(this.ctx.currentTime + i * 0.07 + 0.15);
      });
    } catch {}
  }

  // ボム爆破音（ノイズ＋急激な周波数降下）
  public playBomb() {
    if (this.muted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      // 低音の衝撃波
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(160, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(
        30,
        this.ctx.currentTime + 0.4,
      );

      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        this.ctx.currentTime + 0.4,
      );

      osc.connect(gain);
      gain.connect(this.getDestination());
      osc.start();
      osc.stop(this.ctx.currentTime + 0.4);

      // ホワイトノイズバースト
      const bufferSize = this.ctx.sampleRate * 0.3;
      const buffer = this.ctx.createBuffer(
        1,
        bufferSize,
        this.ctx.sampleRate,
      );
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(
        0.001,
        this.ctx.currentTime + 0.3,
      );

      noise.connect(noiseGain);
      noiseGain.connect(this.getDestination());
      noise.start();
      noise.stop(this.ctx.currentTime + 0.3);
    } catch {}
  }

  // トゲ障害物接触・ミノ破壊音（金属衝突＋激しい破砕ノイズ）
  public playSpikeTrap() {
    if (this.muted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      // 鋭い衝撃音
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(
        40,
        this.ctx.currentTime + 0.25,
      );

      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        this.ctx.currentTime + 0.25,
      );

      osc.connect(gain);
      gain.connect(this.getDestination());
      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);

      // クラッシュノイズ
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.2);
      const buffer = this.ctx.createBuffer(
        1,
        bufferSize,
        this.ctx.sampleRate,
      );
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(
        0.001,
        this.ctx.currentTime + 0.2,
      );

      noise.connect(noiseGain);
      noiseGain.connect(this.getDestination());
      noise.start();
      noise.stop(this.ctx.currentTime + 0.2);
    } catch {}
  }

  // 警告アラート音
  public playAlert() {
    if (this.muted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.setValueAtTime(600, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        this.ctx.currentTime + 0.16,
      );

      osc.connect(gain);
      gain.connect(this.getDestination());
      osc.start();
      osc.stop(this.ctx.currentTime + 0.16);
    } catch {}
  }

  // クリアファンファーレ
  public playClear() {
    if (this.muted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51]; // C, E, G, C, E
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(
          freq,
          this.ctx.currentTime + idx * 0.12,
        );

        gain.gain.setValueAtTime(0, this.ctx.currentTime + idx * 0.12);
        gain.gain.linearRampToValueAtTime(
          0.15,
          this.ctx.currentTime + idx * 0.12 + 0.03,
        );
        gain.gain.exponentialRampToValueAtTime(
          0.001,
          this.ctx.currentTime + idx * 0.12 + 0.4,
        );

        osc.connect(gain);
        gain.connect(this.getDestination());
        osc.start(this.ctx.currentTime + idx * 0.12);
        osc.stop(this.ctx.currentTime + idx * 0.12 + 0.4);
      });
    } catch {}
  }

  // ゲームオーバー音
  public playGameOver() {
    if (this.muted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const notes = [400, 350, 300, 200];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(
          freq,
          this.ctx.currentTime + idx * 0.18,
        );

        gain.gain.setValueAtTime(0.12, this.ctx.currentTime + idx * 0.18);
        gain.gain.exponentialRampToValueAtTime(
          0.001,
          this.ctx.currentTime + idx * 0.18 + 0.35,
        );

        osc.connect(gain);
        gain.connect(this.getDestination());
        osc.start(this.ctx.currentTime + idx * 0.18);
        osc.stop(this.ctx.currentTime + idx * 0.18 + 0.35);
      });
    } catch {}
  }
}

export const sounds = new SoundSystem();
