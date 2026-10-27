// BGM管理システム (超軽量オンデマンド読み込み・独立クロスフェード・完全排他制御・ミュート連動)

export type BGMTrack = "title" | "game" | "story";

class BGMManager {
  private currentTrack: BGMTrack | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private audioInstances: Map<BGMTrack, HTMLAudioElement> = new Map();
  private fadeIntervals: Map<HTMLAudioElement, number> = new Map();
  private muted = false;
  private baseVolume = 0.28; // 効果音(SE)を邪魔しない心地よい音量
  private isDucked = false; // ポーズ時の音量減衰
  private hasUserInteracted = false;
  private pendingTrack: BGMTrack | null = null;

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

  // 指定オーディオのフェードアニメーション (オーディオごとに独立タイマーを管理し上書き衝突を防止)
  private fadeAudio(
    audio: HTMLAudioElement,
    targetVolume: number,
    durationMs: number,
    onComplete?: () => void,
  ) {
    // 既存のこのオーディオのタイマーがあれば破棄
    const existing = this.fadeIntervals.get(audio);
    if (existing !== undefined) {
      clearInterval(existing);
      this.fadeIntervals.delete(audio);
    }

    if (durationMs <= 0) {
      audio.volume = targetVolume;
      if (onComplete) onComplete();
      return;
    }

    const steps = 15;
    const interval = Math.max(10, Math.floor(durationMs / steps));
    const startVolume = audio.volume;
    const diff = targetVolume - startVolume;
    let stepCount = 0;

    const timer = window.setInterval(() => {
      stepCount++;
      const current = Math.min(
        1,
        Math.max(0, startVolume + diff * (stepCount / steps)),
      );
      audio.volume = current;

      if (stepCount >= steps) {
        clearInterval(timer);
        this.fadeIntervals.delete(audio);
        audio.volume = targetVolume;
        if (onComplete) onComplete();
      }
    }, interval);

    this.fadeIntervals.set(audio, timer);
  }

  // BGM再生 (他トラックの完全停止・確実な排他切り替え)
  public play(track: BGMTrack) {
    if (this.currentTrack === track && this.currentAudio && !this.currentAudio.paused) {
      return;
    }

    this.currentTrack = track;
    this.pendingTrack = track;

    if (this.muted) {
      this.stopAll();
      return;
    }

    const newAudio = this.getAudioInstance(track);

    // 【重要】再生対象以外のすべてのBGMを確実にフェードアウト＆停止
    for (const [t, audio] of this.audioInstances.entries()) {
      if (t !== track) {
        const a = audio;
        if (!a.paused) {
          this.fadeAudio(a, 0, 250, () => {
            a.pause();
            a.currentTime = 0;
          });
        }
      }
    }

    this.currentAudio = newAudio;
    newAudio.volume = 0;

    const targetVolume = this.getEffectiveVolume();
    const playPromise = newAudio.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.pendingTrack = null;
          this.fadeAudio(newAudio, targetVolume, 300);
        })
        .catch(() => {
          // ブラウザのAutoplay制限時: 次のユーザー操作時に安全に再生
        });
    }
  }

  // ポーズ時の音量減衰
  public setDucked(ducked: boolean) {
    this.isDucked = ducked;
    if (this.currentAudio && !this.muted && !this.currentAudio.paused) {
      const targetVolume = this.getEffectiveVolume();
      this.fadeAudio(this.currentAudio, targetVolume, 200);
    }
  }

  // 全トラックの即時完全停止
  public stopAll() {
    for (const timer of this.fadeIntervals.values()) {
      clearInterval(timer);
    }
    this.fadeIntervals.clear();

    for (const audio of this.audioInstances.values()) {
      audio.pause();
      audio.currentTime = 0;
      audio.volume = 0;
    }
    this.currentAudio = null;
    this.pendingTrack = null;
  }

  // ミュート状態の設定
  public setMuted(muted: boolean) {
    this.muted = muted;
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

  // 停止
  public stop(fadeDuration = 250) {
    if (this.currentAudio) {
      const audio = this.currentAudio;
      this.fadeAudio(audio, 0, fadeDuration, () => {
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
