// BGM管理システム (Web Audio APIによる完全シームレスループ・超軽量オンデマンド読み込み・ハードウェアクロスフェード)

export type BGMTrack = "title" | "game" | "story";

interface ActiveTrack {
  source: AudioBufferSourceNode;
  gainNode: GainNode;
  track: BGMTrack;
}

class BGMManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private audioBuffers: Map<BGMTrack, AudioBuffer> = new Map();
  private loadingPromises: Map<BGMTrack, Promise<AudioBuffer>> = new Map();
  private activeTrack: ActiveTrack | null = null;
  private fadingTracks: Set<ActiveTrack> = new Set();

  private currentTrack: BGMTrack | null = null;
  private muted = false;
  private userVolume = 0.7; // 0.0 〜 1.0 (デフォルト 70%)
  private maxScale = 0.35; // BGMの実効音量上限 (SEと調和する心地よい上限)
  private isDucked = false;
  private hasUserInteracted = false;
  private pendingTrack: BGMTrack | null = null;

  constructor() {
    if (typeof localStorage !== "undefined") {
      const saved = localStorage.getItem("tethiel_bgm_volume");
      if (saved !== null) {
        const val = Number.parseInt(saved, 10);
        if (!Number.isNaN(val) && val >= 0 && val <= 100) {
          this.userVolume = val / 100;
        }
      }
    }

    if (typeof window !== "undefined") {
      const unlockAudio = () => {
        if (!this.hasUserInteracted) {
          this.hasUserInteracted = true;
          this.initCtx();
          if (this.ctx && this.ctx.state === "suspended") {
            this.ctx.resume();
          }
          if (this.pendingTrack && !this.muted) {
            const track = this.pendingTrack;
            this.pendingTrack = null;
            this.play(track);
          }
        }
        window.removeEventListener("pointerdown", unlockAudio);
        window.removeEventListener("keydown", unlockAudio);
        window.removeEventListener("touchstart", unlockAudio);
      };

      window.addEventListener("pointerdown", unlockAudio, { passive: true });
      window.addEventListener("keydown", unlockAudio, { passive: true });
      window.addEventListener("touchstart", unlockAudio, { passive: true });
    }
  }

  private initCtx() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(
        this.getEffectiveVolume(),
        this.ctx.currentTime,
      );
      this.masterGain.connect(this.ctx.destination);
    }
  }

  private getEffectiveVolume(): number {
    if (this.muted || this.userVolume <= 0) return 0;
    const base = this.userVolume * this.maxScale;
    return this.isDucked ? base * 0.35 : base;
  }

  public setVolume(val: number) {
    this.userVolume = Math.max(0, Math.min(1, val));
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setValueAtTime(
        this.getEffectiveVolume(),
        this.ctx.currentTime,
      );
    }
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(
        "tethiel_bgm_volume",
        String(Math.round(this.userVolume * 100)),
      );
    }
  }

  public getVolume(): number {
    return this.userVolume;
  }

  // オンデマンド読み込み＆デコード (AudioBufferキャッシュ)
  private async loadBuffer(track: BGMTrack): Promise<AudioBuffer> {
    const cached = this.audioBuffers.get(track);
    if (cached) return cached;

    const existingPromise = this.loadingPromises.get(track);
    if (existingPromise) return existingPromise;

    this.initCtx();
    const ctx = this.ctx;
    if (!ctx) throw new Error("AudioContext not initialized");

    const loadPromise = (async () => {
      const basePath = import.meta.env.BASE_URL || "./";
      const cleanBase = basePath.endsWith("/") ? basePath : `${basePath}/`;
      const url = `${cleanBase}audio/bgm/bgm_${track}.mp3`;

      const res = await fetch(url);
      const arrayBuffer = await res.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      this.audioBuffers.set(track, audioBuffer);
      this.loadingPromises.delete(track);
      return audioBuffer;
    })();

    this.loadingPromises.set(track, loadPromise);
    return loadPromise;
  }

  // BGM再生 (AudioBufferSourceNodeによる完全ギャップレス・ゼロレイテンシループ)
  public async play(track: BGMTrack) {
    if (this.currentTrack === track && this.activeTrack) {
      return;
    }

    this.currentTrack = track;
    this.pendingTrack = track;

    if (this.muted) {
      this.stopAll();
      return;
    }

    this.initCtx();
    if (!this.ctx) return;
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    let buffer: AudioBuffer;
    try {
      buffer = await this.loadBuffer(track);
    } catch {
      return;
    }

    // 読み込み中に曲変更やミュート等があった場合は再生中止
    if (this.currentTrack !== track || this.muted) {
      return;
    }

    const ctx = this.ctx;
    if (!ctx || !this.masterGain) return;

    // 既存のアクティブトラックをスムーズにフェードアウト停止
    if (this.activeTrack) {
      const old = this.activeTrack;
      this.activeTrack = null;
      this.fadeOutAndStop(old, 0.25);
    }

    // 新しいトラックの生成 (Web Audio APIの完全シームレスループ)
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true; // ★ブラウザのデコーダーシークを経由しないため、末尾での乱れ・ブツブツが一切発生しない！

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.3); // スムーズフェードイン

    source.connect(gainNode);
    gainNode.connect(this.masterGain);

    source.start(0);

    this.activeTrack = {
      source,
      gainNode,
      track,
    };
    this.pendingTrack = null;
  }

  private fadeOutAndStop(item: ActiveTrack, durationSec: number) {
    if (!this.ctx) return;
    this.fadingTracks.add(item);
    const now = this.ctx.currentTime;
    try {
      item.gainNode.gain.setValueAtTime(item.gainNode.gain.value, now);
      item.gainNode.gain.linearRampToValueAtTime(0, now + durationSec);
    } catch {}

    setTimeout(() => {
      try {
        item.source.stop();
        item.source.disconnect();
        item.gainNode.disconnect();
      } catch {}
      this.fadingTracks.delete(item);
    }, durationSec * 1000 + 50);
  }

  // ポーズ時の音量制御
  public setDucked(ducked: boolean) {
    this.isDucked = ducked;
    if (this.ctx && this.masterGain) {
      const target = this.getEffectiveVolume();
      const now = this.ctx.currentTime;
      try {
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
        this.masterGain.gain.linearRampToValueAtTime(target, now + 0.15);
      } catch {
        this.masterGain.gain.value = target;
      }
    }
  }

  // 全トラックの即時停止
  public stopAll() {
    if (this.activeTrack) {
      try {
        this.activeTrack.source.stop();
        this.activeTrack.source.disconnect();
        this.activeTrack.gainNode.disconnect();
      } catch {}
      this.activeTrack = null;
    }
    for (const item of this.fadingTracks) {
      try {
        item.source.stop();
        item.source.disconnect();
        item.gainNode.disconnect();
      } catch {}
    }
    this.fadingTracks.clear();
    this.pendingTrack = null;
    this.currentTrack = null;
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setValueAtTime(
        this.getEffectiveVolume(),
        this.ctx.currentTime,
      );
    }
    if (muted) {
      this.stopAll();
    } else {
      if (this.currentTrack) {
        const track = this.currentTrack;
        this.currentTrack = null;
        this.play(track);
      }
    }
  }

  public stop(fadeDurationSec = 0.25) {
    if (this.activeTrack) {
      this.fadeOutAndStop(this.activeTrack, fadeDurationSec);
      this.activeTrack = null;
    }
    this.currentTrack = null;
    this.pendingTrack = null;
  }
}

export const bgm = new BGMManager();
