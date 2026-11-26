/**
 * OVERLAY-ONLY PARTICLE, LIGHT-STREAK & CURSOR EFFECTS CANVAS
 * ---------------------------------------------------------------------------
 * Draws ONLY overlay atmosphere (never scenery, train, or creatures):
 *  - 150-300 depth-sorted bubbles and light dust motes
 *  - Speed-reactive light streaks & Glow Zone bioluminescent sparkles
 *  - Trailing cursor bubbles & soft ring expanding over interactive controls
 *  - Confetti-bubble celebration burst on Cadet Pass completion
 */

import { SITE_CONFIG } from '../config/siteConfig';

interface DustMote {
  x: number;
  y: number;
  z: number; // 0.3..1.0 depth factor
  r: number;
  vx: number;
  vy: number;
  phase: number;
  hueBucket: number;
}

interface BubbleParticle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  r: number;
  alpha: number;
  life: number;
  decay: number;
  wobble: number;
  tint?: string;
}

interface LightStreak {
  x: number;
  y: number;
  len: number;
  speed: number;
  alpha: number;
}

export class FxOverlayCanvas {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width = 0;
  private height = 0;
  private dpr = 1;
  private reducedMotion: boolean;

  private motes: DustMote[] = [];
  private bubbles: BubbleParticle[] = [];
  private streaks: LightStreak[] = [];

  private pointer = { x: -999, y: -999, active: false, ringScale: 1, targetScale: 1 };
  private lastPointerEmit = 0;

  private state = {
    velocityNorm: 0,
    sparkleFactor: 0,
    accentRgb: '34, 211, 238',
  };

  constructor(canvas: HTMLCanvasElement, reducedMotion: boolean) {
    this.canvas = canvas;
    const context = canvas.getContext('2d', { alpha: true });
    if (!context) {
      throw new Error('Could not initialize 2D context for fx-canvas');
    }
    this.ctx = context;
    this.reducedMotion = reducedMotion;

    this.resize();
    this.seedParticles();
  }

  resize(): void {
    this.dpr = Math.min(window.devicePixelRatio || 1, 1.25);
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  setState(patch: Partial<typeof this.state>): void {
    Object.assign(this.state, patch);
  }

  onPointerMove(x: number, y: number, isInteractiveTarget: boolean): void {
    if (this.reducedMotion) return;
    this.pointer.x = x;
    this.pointer.y = y;
    this.pointer.active = true;
    this.pointer.targetScale = isInteractiveTarget ? 1.85 : 1.0;

    const now = performance.now();
    if (now - this.lastPointerEmit < 42 || this.bubbles.length > 220) return;
    this.lastPointerEmit = now;

    this.bubbles.push({
      x: x + (Math.random() - 0.5) * 10,
      y: y + (Math.random() - 0.5) * 8,
      z: 0.7 + Math.random() * 0.3,
      vx: (Math.random() - 0.5) * 0.45 - this.state.velocityNorm * 1.2,
      vy: -(0.8 + Math.random() * 1.2),
      r: 1.5 + Math.random() * 2.8,
      alpha: 0.52 + Math.random() * 0.25,
      life: 1,
      decay: 0.014 + Math.random() * 0.008,
      wobble: Math.random() * Math.PI * 2,
    });
  }

  emitCelebrationBurst(): void {
    if (this.reducedMotion) return;
    const cx = this.width * 0.5;
    const cy = this.height * 0.55;
    const colors = ['34, 211, 238', '251, 191, 36', '244, 114, 182', '110, 231, 183'];

    for (let i = 0; i < 64; i++) {
      const angle = (Math.PI * 2 * i) / 64 + (Math.random() - 0.5) * 0.2;
      const speed = 2.2 + Math.random() * 5.2;
      this.bubbles.push({
        x: cx,
        y: cy,
        z: 0.9,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        r: 2.5 + Math.random() * 4.5,
        alpha: 0.9,
        life: 1,
        decay: 0.008 + Math.random() * 0.006,
        wobble: Math.random() * Math.PI * 2,
        tint: colors[i % colors.length],
      });
    }
  }

  private seedParticles(): void {
    const mobileScale = this.width < 768 ? 0.55 : 1;
    const moteCount = Math.round(SITE_CONFIG.particleDensity * mobileScale);

    // Depth-sorted (0.35 -> 1.0) so front dust moves faster than distant motes
    this.motes = Array.from({ length: moteCount }, () => {
      const z = 0.35 + Math.random() * 0.65;
      return {
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        z,
        r: (0.8 + Math.random() * 2.2) * z,
        vx: -(0.18 + Math.random() * 0.45) * z,
        vy: -(0.08 + Math.random() * 0.25) * z,
        phase: Math.random() * Math.PI * 2,
        hueBucket: Math.random(),
      };
    }).sort((a, b) => a.z - b.z);

    const streakCount = this.width < 768 ? 10 : 24;
    this.streaks = Array.from({ length: streakCount }, () => ({
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      len: 42 + Math.random() * 110,
      speed: 9 + Math.random() * 16,
      alpha: 0.14 + Math.random() * 0.24,
    }));
  }

  tick(timeSec: number): void {
    const { ctx, width, height, state } = this;
    ctx.clearRect(0, 0, width, height);

    if (this.reducedMotion) return;

    const vel = state.velocityNorm;
    const sparkle = state.sparkleFactor;

    // Emit gentle ambient rising bubbles proportional to scroll velocity
    if (this.bubbles.length < 180 && Math.random() < 0.18 + vel * 0.65) {
      const z = 0.4 + Math.random() * 0.6;
      this.bubbles.push({
        x: Math.random() * width,
        y: height + 12,
        z,
        vx: -(0.4 + vel * 5.2) * z,
        vy: -(0.75 + Math.random() * 1.45) * z,
        r: (1.5 + Math.random() * 3.4) * z,
        alpha: 0.32 + Math.random() * 0.34,
        life: 1,
        decay: 0.004 + Math.random() * 0.005,
        wobble: Math.random() * Math.PI * 2,
      });
    }

    // 1. Depth-sorted floating dust & bioluminescent sparkles
    for (const m of this.motes) {
      m.x += m.vx * (1 + vel * 11.5);
      m.y += m.vy + Math.sin(timeSec * 1.1 + m.phase) * 0.16;

      if (m.x < -12) m.x = width + 12;
      if (m.y < -12) m.y = height + 12;

      const twinkle = 0.45 + 0.55 * Math.sin(timeSec * 2.1 + m.phase);
      const radius = m.r * (1 + sparkle * 0.55);

      let rgba: string;
      if (sparkle > 0.25 && m.hueBucket > 0.68) {
        rgba = `rgba(244, 114, 182, ${(0.28 + sparkle * 0.58) * twinkle})`;
      } else if (sparkle > 0.25 && m.hueBucket > 0.36) {
        rgba = `rgba(251, 191, 36, ${(0.26 + sparkle * 0.52) * twinkle})`;
      } else {
        rgba = `rgba(186, 230, 253, ${(0.18 + sparkle * 0.42) * twinkle * m.z})`;
      }

      ctx.fillStyle = rgba;
      ctx.beginPath();
      ctx.arc(m.x, m.y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Speed light streaks during brisk scroll
    if (vel > 0.08) {
      const streakAlpha = Math.min(1, (vel - 0.08) * 1.35);
      ctx.lineCap = 'round';
      for (const s of this.streaks) {
        s.x -= s.speed * (0.45 + vel * 2.8);
        if (s.x + s.len < 0) {
          s.x = width + Math.random() * 160;
          s.y = Math.random() * height;
        }
        ctx.strokeStyle = `rgba(${state.accentRgb}, ${s.alpha * streakAlpha})`;
        ctx.lineWidth = 1 + vel * 1.3;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x + s.len * (0.45 + vel), s.y);
        ctx.stroke();
      }
    }

    // 3. Rising & celebration bubbles
    for (let i = this.bubbles.length - 1; i >= 0; i--) {
      const b = this.bubbles[i];
      b.x += b.vx + Math.sin(timeSec * 3.6 + b.wobble) * 0.3;
      b.y += b.vy;
      b.life -= b.decay;

      if (b.life <= 0 || b.y < -25 || b.x < -35) {
        this.bubbles.splice(i, 1);
        continue;
      }

      const alpha = b.alpha * b.life;
      const rgb = b.tint || '186, 230, 253';
      ctx.strokeStyle = `rgba(${rgb}, ${alpha})`;
      ctx.fillStyle = `rgba(${rgb}, ${alpha * 0.2})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // 4. Soft interactive cursor ring (desktop pointers only)
    if (this.pointer.active && this.width >= 768) {
      this.pointer.ringScale += (this.pointer.targetScale - this.pointer.ringScale) * 0.16;
      const ringR = 13 * this.pointer.ringScale;
      ctx.strokeStyle = `rgba(${state.accentRgb}, ${this.pointer.targetScale > 1.2 ? 0.65 : 0.3})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(this.pointer.x, this.pointer.y, ringR, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}
