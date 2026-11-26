/**
 * LAZY WEB AUDIO ENGINE (MUTED BY DEFAULT)
 * ---------------------------------------------------------------------------
 * Synthesizes soft ocean ambience, a velocity-reactive magnetic rail hum,
 * and a subtle gentle chime when crossing into a new chapter.
 * Never starts automatically; initializes only on explicit user click.
 */

import { SITE_CONFIG } from '../config/siteConfig';

export class OceanAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private humGain: GainNode | null = null;
  private humOsc: OscillatorNode | null = null;
  private humHarmonic: OscillatorNode | null = null;
  private oceanFilter: BiquadFilterNode | null = null;
  private externalAudio: HTMLAudioElement | null = null;
  public enabled = false;

  toggle(): boolean {
    if (!this.ctx) {
      this.init();
    }
    this.enabled = !this.enabled;

    if (this.ctx && this.ctx.state === 'suspended' && this.enabled) {
      this.ctx.resume().catch(() => {});
    }

    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setTargetAtTime(
        this.enabled ? SITE_CONFIG.audio.masterGain : 0,
        now,
        0.35
      );
    }

    if (this.externalAudio) {
      if (this.enabled) {
        this.externalAudio.play().catch(() => {});
      } else {
        this.externalAudio.pause();
      }
    }

    return this.enabled;
  }

  /**
   * Adjusts rail hum pitch & water warmth continuously from scroll velocity
   * (0..1) and normalized depth (0..1).
   */
  update(velocityNorm: number, depthNorm: number, isStarted: boolean): void {
    if (!this.enabled || !this.ctx || !this.humOsc || !this.humHarmonic || !this.humGain || !this.oceanFilter) {
      return;
    }

    const now = this.ctx.currentTime;
    const baseFreq = (isStarted ? 66 : 54) + velocityNorm * 38 - depthNorm * 8;
    this.humOsc.frequency.setTargetAtTime(baseFreq, now, 0.12);
    this.humHarmonic.frequency.setTargetAtTime(baseFreq * 1.5, now, 0.12);

    const targetHum = (isStarted ? 0.08 : 0.03) + velocityNorm * 0.14;
    this.humGain.gain.setTargetAtTime(targetHum, now, 0.15);

    const cutoff = 540 - depthNorm * 240 + velocityNorm * 200;
    this.oceanFilter.frequency.setTargetAtTime(Math.max(190, cutoff), now, 0.2);
  }

  /** Soft harmonic glass chime on chapter transitions */
  playChapterChime(chapterIndex: number): void {
    if (!this.enabled || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const notes = [392.0, 440.0, 493.88, 523.25, 587.33, 659.25, 783.99, 880.0];
    const freq = notes[chapterIndex % notes.length];

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.95);
  }

  private init(): void {
    if (SITE_CONFIG.audio.oceanTrackUrl) {
      this.externalAudio = new Audio(SITE_CONFIG.audio.oceanTrackUrl);
      this.externalAudio.loop = true;
      this.externalAudio.volume = 0.55;
    }

    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioCtx();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0;
    this.masterGain.connect(this.ctx.destination);

    // Pink-noise ocean ambience
    const bufferSize = this.ctx.sampleRate * 3;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99765 * b0 + white * 0.099046;
      b1 = 0.963 * b1 + white * 0.2965164;
      b2 = 0.57 * b2 + white * 1.0526913;
      data[i] = (b0 + b1 + b2 + white * 0.1848) * 0.04;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    this.oceanFilter = this.ctx.createBiquadFilter();
    this.oceanFilter.type = 'lowpass';
    this.oceanFilter.frequency.value = 460;
    this.oceanFilter.Q.value = 0.7;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.value = 0.65;

    noise.connect(this.oceanFilter);
    this.oceanFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noise.start();

    // Gentle magnetic rail hum
    this.humGain = this.ctx.createGain();
    this.humGain.gain.value = 0.04;

    this.humOsc = this.ctx.createOscillator();
    this.humOsc.type = 'sine';
    this.humOsc.frequency.value = 58;

    this.humHarmonic = this.ctx.createOscillator();
    this.humHarmonic.type = 'triangle';
    this.humHarmonic.frequency.value = 87;

    const harmonicGain = this.ctx.createGain();
    harmonicGain.gain.value = 0.22;

    this.humOsc.connect(this.humGain);
    this.humHarmonic.connect(harmonicGain);
    harmonicGain.connect(this.humGain);
    this.humGain.connect(this.masterGain);

    this.humOsc.start();
    this.humHarmonic.start();
  }
}
