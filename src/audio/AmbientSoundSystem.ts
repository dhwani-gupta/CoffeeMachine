/**
 * Every sound in the café is synthesised with the Web Audio API — no audio
 * files to download, and the steam hiss is generated from filtered noise.
 */
const MUSIC_CHORDS: readonly number[][] = [
  [261.63, 329.63, 392.0, 493.88], // Cmaj7
  [220.0, 261.63, 329.63, 392.0], // Am7
  [174.61, 220.0, 261.63, 329.63], // Fmaj7
  [196.0, 246.94, 293.66, 349.23], // G7
];

const MUSIC_STEP_MS = 3600;

type AudioContextCtor = typeof AudioContext;

function getAudioContextCtor(): AudioContextCtor | undefined {
  if (typeof window === "undefined") return undefined;
  return (
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: AudioContextCtor })
      .webkitAudioContext
  );
}

export class AmbientSoundSystem {
  #ctx: AudioContext | null = null;
  #master: GainNode | null = null;
  #noise: AudioBuffer | null = null;
  #musicTimer: number | null = null;
  #chordStep = 0;
  #muted = false;

  get musicPlaying(): boolean {
    return this.#musicTimer !== null;
  }

  get muted(): boolean {
    return this.#muted;
  }

  /** Creates (or resumes) the audio context. Safe to call on every gesture. */
  init(): AudioContext | null {
    if (!this.#ctx) {
      const Ctor = getAudioContextCtor();
      if (!Ctor) return null;

      const ctx = new Ctor();
      const master = ctx.createGain();
      master.gain.setValueAtTime(this.#muted ? 0 : 1, ctx.currentTime);
      master.connect(ctx.destination);

      this.#ctx = ctx;
      this.#master = master;
      this.#noise = this.#buildNoiseBuffer(ctx);
    }

    if (this.#ctx.state === "suspended") {
      void this.#ctx.resume();
    }
    return this.#ctx;
  }

  setMuted(muted: boolean): void {
    this.#muted = muted;
    if (!this.#ctx || !this.#master) return;

    const now = this.#ctx.currentTime;
    this.#master.gain.cancelScheduledValues(now);
    this.#master.gain.setTargetAtTime(muted ? 0 : 1, now, 0.04);
  }

  toggleMusic(): boolean {
    if (this.#musicTimer !== null) {
      this.#stopMusic();
      return false;
    }

    const ctx = this.init();
    if (!ctx) return false;

    this.#playChord();
    this.#musicTimer = window.setInterval(
      () => this.#playChord(),
      MUSIC_STEP_MS,
    );
    return true;
  }

  playClick(): void {
    const ctx = this.init();
    if (!ctx || !this.#master) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(560, now);
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.06);
    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
    osc.connect(gain).connect(this.#master);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  /** Soft, non-distracting steam hiss for each pulse of the brew cycle. */
  playGentleSteamPuff(): void {
    const ctx = this.init();
    if (!ctx || !this.#master || !this.#noise) return;

    const now = ctx.currentTime;
    const duration = 0.9 + Math.random() * 0.35;

    const source = ctx.createBufferSource();
    source.buffer = this.#noise;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1100 + Math.random() * 500, now);
    filter.Q.setValueAtTime(1.4, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.032, now + 0.18);
    gain.gain.exponentialRampToValueAtTime(0.0004, now + duration);

    source.connect(filter).connect(gain).connect(this.#master);
    const offset = Math.random() * (this.#noise.duration - duration - 0.1);
    source.start(now, Math.max(0, offset));
    source.stop(now + duration + 0.05);
  }

  /** Celebratory steam blast + chime when a pomodoro is served. */
  playLoudFinishSteam(): void {
    const ctx = this.init();
    if (!ctx || !this.#master || !this.#noise) return;

    const now = ctx.currentTime;

    const source = ctx.createBufferSource();
    source.buffer = this.#noise;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(2600, now);
    filter.frequency.exponentialRampToValueAtTime(700, now + 1.6);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.22, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.0005, now + 2.1);

    source.connect(filter).connect(gain).connect(this.#master);
    source.start(now);
    source.stop(now + 2.15);

    [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
      const osc = ctx.createOscillator();
      const chime = ctx.createGain();
      const start = now + index * 0.12;
      osc.type = "sine";
      osc.frequency.setValueAtTime(frequency, start);
      chime.gain.setValueAtTime(0.0001, start);
      chime.gain.exponentialRampToValueAtTime(0.09, start + 0.04);
      chime.gain.exponentialRampToValueAtTime(0.0001, start + 0.9);
      osc.connect(chime).connect(this.#master!);
      osc.start(start);
      osc.stop(start + 0.95);
    });
  }

  /** Soft two-note bell when a break ends and the café resets. */
  playBreakChime(): void {
    const ctx = this.init();
    if (!ctx || !this.#master) return;

    const now = ctx.currentTime;
    [659.25, 880].forEach((frequency, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = now + index * 0.14;
      osc.type = "sine";
      osc.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.055, start + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 1.1);
      osc.connect(gain).connect(this.#master!);
      osc.start(start);
      osc.stop(start + 1.15);
    });
  }

  /** Small ceramic "clink" when the mug is placed or lifted. */
  playPlaceCup(): void {
    const ctx = this.init();
    if (!ctx || !this.#master) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.09);
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
    osc.connect(gain).connect(this.#master);
    osc.start(now);
    osc.stop(now + 0.13);
  }

  /** Tiny sip sound as the coffee level drops during a break. */
  playSip(): void {
    const ctx = this.init();
    if (!ctx || !this.#master || !this.#noise) return;

    const now = ctx.currentTime;
    const source = ctx.createBufferSource();
    source.buffer = this.#noise;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(700, now);
    filter.frequency.exponentialRampToValueAtTime(1900, now + 0.25);
    filter.Q.setValueAtTime(2.4, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.05, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);

    source.connect(filter).connect(gain).connect(this.#master);
    source.start(now);
    source.stop(now + 0.35);
  }

  dispose(): void {
    this.#stopMusic();
    if (this.#ctx) {
      void this.#ctx.close();
      this.#ctx = null;
      this.#master = null;
      this.#noise = null;
    }
  }

  #stopMusic(): void {
    if (this.#musicTimer !== null) {
      window.clearInterval(this.#musicTimer);
      this.#musicTimer = null;
    }
  }

  #playChord(): void {
    const ctx = this.init();
    if (!ctx || !this.#master) return;

    const now = ctx.currentTime;
    const chord = MUSIC_CHORDS[this.#chordStep % MUSIC_CHORDS.length];

    chord.forEach((frequency, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = now + index * 0.06;

      osc.type = "sine";
      osc.frequency.setValueAtTime(frequency, start);

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.018, start + 0.45);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 3.5);

      osc.connect(gain).connect(this.#master!);
      osc.start(start);
      osc.stop(start + 3.6);
    });

    this.#chordStep += 1;
  }

  #buildNoiseBuffer(ctx: AudioContext): AudioBuffer {
    const length = Math.floor(ctx.sampleRate * 2);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }
}

/** Shared singleton so every component talks to the same audio graph. */
export const sound = new AmbientSoundSystem();
