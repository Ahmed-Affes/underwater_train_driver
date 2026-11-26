/**
 * PROCEDURAL OCEAN & MAGLEV AUDIO ENGINE
 * ---------------------------------------------------------------------------
 * Uses the Web Audio API to synthesize a soft, calming underwater ambience
 * and a gentle magnetic-train hum without downloading external audio files.
 *
 * Always starts MUTED by default and only initializes AudioContext on user
 * interaction (clicking the Sound Toggle button).
 */

export class OceanAudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = false;
    this.masterGain = null;
    this.humGain = null;
    this.humOsc = null;
    this.humHarmonic = null;
    this.oceanFilter = null;
  }

  toggle() {
    if (!this.ctx) {
      this._init();
    }
    this.enabled = !this.enabled;

    if (this.ctx.state === 'suspended' && this.enabled) {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setTargetAtTime(this.enabled ? 0.28 : 0.0, now, 0.35);

    return this.enabled;
  }

  /**
   * Modulate maglev hum pitch/volume and ocean filter warmth based on scroll
   * velocity (0..1) and normalized depth (0..1).
   */
  update({ velocityNorm = 0, depthNorm = 0 }) {
    if (!this.enabled || !this.ctx) return;

    const now = this.ctx.currentTime;
    const baseFreq = 62 + velocityNorm * 34 - depthNorm * 10;
    this.humOsc.frequency.setTargetAtTime(baseFreq, now, 0.12);
    this.humHarmonic.frequency.setTargetAtTime(baseFreq * 1.5, now, 0.12);

    const targetHumGain = 0.05 + velocityNorm * 0.14;
    this.humGain.gain.setTargetAtTime(targetHumGain, now, 0.15);

    // Deeper water sounds slightly warmer / more muffled
    const cutoff = 520 - depthNorm * 240 + velocityNorm * 180;
    this.oceanFilter.frequency.setTargetAtTime(Math.max(180, cutoff), now, 0.2);
  }

  _init() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioCtx();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0;
    this.masterGain.connect(this.ctx.destination);

    // 1. Soft underwater pink-noise ambience
    const bufferSize = this.ctx.sampleRate * 3;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99765 * b0 + white * 0.099046;
      b1 = 0.963 * b1 + white * 0.2965164;
      b2 = 0.57 * b2 + white * 1.0526913;
      output[i] = (b0 + b1 + b2 + white * 0.1848) * 0.04;
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    this.oceanFilter = this.ctx.createBiquadFilter();
    this.oceanFilter.type = 'lowpass';
    this.oceanFilter.frequency.value = 460;
    this.oceanFilter.Q.value = 0.8;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.value = 0.65;

    noiseSource.connect(this.oceanFilter);
    this.oceanFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noiseSource.start();

    // 2. Gentle maglev turbine hum
    this.humGain = this.ctx.createGain();
    this.humGain.gain.value = 0.05;

    this.humOsc = this.ctx.createOscillator();
    this.humOsc.type = 'sine';
    this.humOsc.frequency.value = 64;

    this.humHarmonic = this.ctx.createOscillator();
    this.humHarmonic.type = 'triangle';
    this.humHarmonic.frequency.value = 96;

    const harmonicGain = this.ctx.createGain();
    harmonicGain.gain.value = 0.25;

    this.humOsc.connect(this.humGain);
    this.humHarmonic.connect(harmonicGain);
    harmonicGain.connect(this.humGain);
    this.humGain.connect(this.masterGain);

    this.humOsc.start();
    this.humHarmonic.start();
  }
}
