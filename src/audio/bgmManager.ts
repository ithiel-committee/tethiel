// BGM管理システム (超軽量オンデマンド読み込み・クロスフェード・ミュート・ポーズ連動)

export type BGMTrack = "title" | "game" | "story";

class BGMManager {
  private currentTrack: BGMTrack | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private audioInstances: Map<BGMTrack, HTMLAudioElement> = new Map();
  private muted = false;
  private baseVolume = 0.28; // 効果音(SE)を邪魔しない心地よい音量
  private isDucked = false; // ポーズ時の音量減衰
  private hasUserInteracted = false;
  private pendingTrack: BGMTrack | null = null;
  private fadeTimer: number | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      const unlockAudio = () => {
        if (!this.hasUserInteracted) {
          this.hasUserInteracted = true;
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

  // オンデマンド取得 (必要な時までインスタンス化・HTTP通信しない)
  private getAudioInstance(track: BGMTrack): HTMLAudioElement {
    let audio = this.audioInstances.get(track);
    if (!audio) {
      const basePath = import.meta.env.BASE_URL || "./";
      const cleanBase = basePath.endsWith("/") ? basePath : `${basePath}/`;
      const url = `${cleanBase}audio/bgm/bgm_${track}.mp3`;

      audio = new Audio(url);
      audio.loop = true;
      audio.preload = "auto";
      this.audioInstances.set(track, audio);
    }
    return audio;
  }

  private getEffectiveVolume(): number {
    if (this.muted) return 0;
    return this.isDucked ? this.baseVolume * 0.35 : this.baseVolume;
  }

  // フェードアニメーション
  private fadeTo(
    audio: HTMLAudioElement,
    targetVolume: number,
    durationMs: number,
    onComplete?: () => void,
  ) {
    if (this.fadeTimer !== null) {
      clearInterval(this.fadeTimer);
      this.fadeTimer = null;
    }

    const steps = 16;
    const interval = Math.max(10, Math.floor(durationMs / steps));
    const startVolume = audio.volume;
    const diff = targetVolume - startVolume;
    let stepCount = 0;

    this.fadeTimer = window.setInterval(() => {
      stepCount++;
      const current = Math.min(
        1,
        Math.max(0, startVolume + diff * (stepCount / steps)),
      );
      audio.volume = current;

      if (stepCount >= steps) {
        if (this.fadeTimer !== null) {
          clearInterval(this.fadeTimer);
          this.fadeTimer = null;
        }
        audio.volume = targetVolume;
        if (onComplete) onComplete();
      }
    }, interval);
  }

  // BGM再生 (画面切り替え時に自動フェード)
  public play(track: BGMTrack) {
    if (this.currentTrack === track && this.currentAudio && !this.currentAudio.paused) {
      return;
    }

    this.currentTrack = track;

    if (this.muted) {
      return;
    }

    const newAudio = this.getAudioInstance(track);
    const oldAudio = this.currentAudio;

    // 前のトラックをフェードアウト
    if (oldAudio && oldAudio !== newAudio) {
      this.fadeTo(oldAudio, 0, 300, () => {
        oldAudio.pause();
        oldAudio.currentTime = 0;
      });
    }

    this.currentAudio = newAudio;
    newAudio.volume = 0;

    const targetVolume = this.getEffectiveVolume();
    const playPromise = newAudio.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.fadeTo(newAudio, targetVolume, 400);
        })
        .catch(() => {
          // ブラウザのAutoplayブロック時: ユーザーの初回操作まで保留
          this.pendingTrack = track;
        });
    }
  }

  // 一時停止/減衰 (ポーズ画面用)
  public setDucked(ducked: boolean) {
    this.isDucked = ducked;
    if (this.currentAudio && !this.muted) {
      const targetVolume = this.getEffectiveVolume();
      this.fadeTo(this.currentAudio, targetVolume, 200);
    }
  }

  // ミュート状態の設定
  public setMuted(muted: boolean) {
    this.muted = muted;
    if (muted) {
      if (this.currentAudio) {
        this.currentAudio.pause();
      }
    } else {
      if (this.currentTrack) {
        const audio = this.getAudioInstance(this.currentTrack);
        this.currentAudio = audio;
        audio.volume = this.getEffectiveVolume();
        audio.play().catch(() => {
          this.pendingTrack = this.currentTrack;
        });
      }
    }
  }

  // 停止
  public stop(fadeDuration = 300) {
    if (this.currentAudio) {
      const audio = this.currentAudio;
      this.fadeTo(audio, 0, fadeDuration, () => {
        audio.pause();
        audio.currentTime = 0;
      });
    }
    this.currentTrack = null;
    this.currentAudio = null;
    this.pendingTrack = null;
  }
}

export const bgm = new BGMManager();
