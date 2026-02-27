
export class SoundService {
  private audioCtx: AudioContext | null = null;
  private sfxVolume: number = 0.5;
  private ambientVolume: number = 0.3;
  private isMuted: boolean = false;

  private init() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  setSfxVolume(volume: number) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
  }

  setAmbientVolume(volume: number) {
    this.ambientVolume = Math.max(0, Math.min(1, volume));
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  private getEffectiveVolume(baseVolume: number, category: 'sfx' | 'ambient'): number {
    if (this.isMuted) return 0;
    const categoryVolume = category === 'sfx' ? this.sfxVolume : this.ambientVolume;
    return baseVolume * categoryVolume;
  }

  playBirdChirp() {
    this.init();
    if (!this.audioCtx || this.isMuted || this.ambientVolume === 0) return;
    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    const playChirp = (time: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const vibrato = ctx.createOscillator();
      const vibratoGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(2000 + Math.random() * 1000, time);
      osc.frequency.exponentialRampToValueAtTime(4000 + Math.random() * 1000, time + 0.08);
      osc.frequency.exponentialRampToValueAtTime(1500, time + 0.2);

      vibrato.type = 'sine';
      vibrato.frequency.setValueAtTime(30, time);
      vibratoGain.gain.setValueAtTime(100, time);

      vibrato.connect(vibratoGain);
      vibratoGain.connect(osc.frequency);

      const volume = this.getEffectiveVolume(0.03, 'ambient');
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(volume, time + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      vibrato.start(time);
      osc.start(time);
      vibrato.stop(time + 0.2);
      osc.stop(time + 0.2);
    };

    playChirp(now);
    if (Math.random() > 0.3) playChirp(now + 0.25);
    if (Math.random() > 0.6) playChirp(now + 0.5);
  }

  playSquirrelChirp() {
    this.init();
    if (!this.audioCtx || this.isMuted || this.ambientVolume === 0) return;
    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    const playPulse = (time: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(3000 + Math.random() * 1000, time);
      osc.frequency.exponentialRampToValueAtTime(200, time + 0.04);

      const volume = this.getEffectiveVolume(0.015, 'ambient');
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(volume, time + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + 0.04);
    };

    playPulse(now);
    playPulse(now + 0.08);
    if (Math.random() > 0.5) playPulse(now + 0.16);
  }

  playLaserSpark() {
    this.init();
    if (!this.audioCtx || this.isMuted || this.ambientVolume === 0) return;
    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(6000 + Math.random() * 2000, now);
    osc.frequency.exponentialRampToValueAtTime(2000, now + 0.03);

    const volume = this.getEffectiveVolume(0.01, 'ambient');
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.03);
  }

  playBubble() {
    this.init();
    if (!this.audioCtx || this.isMuted || this.ambientVolume === 0) return;
    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400 + Math.random() * 200, now);
    osc.frequency.exponentialRampToValueAtTime(800 + Math.random() * 400, now + 0.1);

    const volume = this.getEffectiveVolume(0.04, 'ambient');
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  playStringWobble() {
    this.init();
    if (!this.audioCtx || this.isMuted || this.ambientVolume === 0) return;
    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(100 + Math.random() * 50, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.2);

    const volume = this.getEffectiveVolume(0.02, 'ambient');
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  playCatchEffect(mode: string) {
    this.init();
    if (!this.audioCtx || this.isMuted || this.sfxVolume === 0) return;
    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    switch (mode) {
      case 'bird':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
        break;
      case 'mouse':
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);
        break;
      case 'laser':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1000, now);
        osc.frequency.exponentialRampToValueAtTime(2000, now + 0.05);
        break;
      case 'fish':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
        break;
      case 'string':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
        break;
      default:
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
    }

    const volume = this.getEffectiveVolume(0.1, 'sfx');
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.001, 0.01 * this.getEffectiveVolume(1, 'sfx')), now + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  }
}

export const soundService = new SoundService();
