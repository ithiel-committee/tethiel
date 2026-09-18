// Web Audio APIによる完全軽量シンセサウンドシステム（外部ファイル0KB）

class SoundSystem {
  private ctx: AudioContext | null = null;
  private muted = false;

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
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    return this.muted;
  }

  public isMuted(): boolean {
    return this.muted;
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
      gain.connect(this.ctx.destination);
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
      gain.connect(this.ctx.destination);
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
      gain.connect(this.ctx.destination);
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
      gain.connect(this.ctx.destination);
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
      gain.connect(this.ctx.destination);
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
        gain.connect(this.ctx.destination);
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
        gain.connect(this.ctx.destination);
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
      gain.connect(this.ctx.destination);
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
      noiseGain.connect(this.ctx.destination);
      noise.start();
      noise.stop(this.ctx.currentTime + 0.3);
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
      gain.connect(this.ctx.destination);
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
        gain.connect(this.ctx.destination);
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
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.18);
        osc.stop(this.ctx.currentTime + idx * 0.18 + 0.35);
      });
    } catch {}
  }
}

export const sounds = new SoundSystem();
