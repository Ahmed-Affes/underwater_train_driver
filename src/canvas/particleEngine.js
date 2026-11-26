/**
 * 60FPS CANVAS PARTICLE & LIGHT-STREAK ENGINE
 * ---------------------------------------------------------------------------
 * Renders:
 *  - Floating marine plankton & bioluminescent sparkles (stronger in Glow Zone)
 *  - Velocity-reactive turbine bubbles streaming from the train's rear pods
 *  - Subtle cursor micro-bubbles when moving the pointer across the ocean
 *  - Speed light-streaks when scrolling rapidly
 *
 * Respects `prefers-reduced-motion` by pausing continuous particle animation.
 */

export class ParticleEngine {
  constructor(canvas, { reducedMotion = false } = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: true });
    this.reducedMotion = reducedMotion;

    this.width = 0;
    this.height = 0;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.state = {
      velocityNorm: 0, // 0..1
      glowFactor: 0, // 0..1 (peaks in chapter 6: Glow Zone)
      cabFactor: 0, // 0..1 (reduces exterior turbine bubbles inside cab)
      trainTailX: 0.2, // normalized viewport X of rear turbine pods
      trainTailY: 0.62, // normalized viewport Y of rear turbine pods
      accentRgb: '34, 211, 238',
    };

    this.motes = [];
    this.bubbles = [];
    this.streaks = [];
    this.lastCursorEmit = 0;

    this.resize();
    this._seedMotes();
    this._seedStreaks();
  }

  resize() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  setState(patch) {
    Object.assign(this.state, patch);
  }

  emitCursorBubble(x, y) {
    if (this.reducedMotion) return;
    const now = performance.now();
    if (now - this.lastCursorEmit < 45 || this.bubbles.length > 160) return;
    this.lastCursorEmit = now;

    this.bubbles.push({
      x: x + (Math.random() - 0.5) * 10,
      y: y + (Math.random() - 0.5) * 8,
      vx: (Math.random() - 0.5) * 0.4 - this.state.velocityNorm * 1.4,
      vy: -(0.7 + Math.random() * 1.1),
      r: 1.5 + Math.random() * 3.2,
      alpha: 0.55 + Math.random() * 0.3,
      wobble: Math.random() * Math.PI * 2,
      life: 1,
      decay: 0.011 + Math.random() * 0.008,
    });
  }

  _seedMotes() {
    const count = this.width < 768 ? 42 : 85;
    this.motes = Array.from({ length: count }, () => ({
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      r: 0.9 + Math.random() * 2.4,
      speed: 0.18 + Math.random() * 0.55,
      driftY: (Math.random() - 0.5) * 0.25,
      phase: Math.random() * Math.PI * 2,
      hueType: Math.random(),
    }));
  }

  _seedStreaks() {
    const count = this.width < 768 ? 10 : 22;
    this.streaks = Array.from({ length: count }, () => ({
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      len: 40 + Math.random() * 90,
      speed: 8 + Math.random() * 14,
      alpha: 0.15 + Math.random() * 0.25,
    }));
  }

  _emitTurbineBubbles() {
    if (this.state.cabFactor > 0.65 || this.bubbles.length > 170) return;

    const rate = 0.22 + this.state.velocityNorm * 0.9;
    const count = Math.random() < rate ? (this.state.velocityNorm > 0.45 ? 2 : 1) : 0;
    const originX = this.width * this.state.trainTailX;
    const originY = this.height * this.state.trainTailY;

    for (let i = 0; i < count; i++) {
      this.bubbles.push({
        x: originX + (Math.random() - 0.5) * 14,
        y: originY + (Math.random() - 0.5) * 18,
        vx: -(1.6 + this.state.velocityNorm * 6.5 + Math.random() * 1.5),
        vy: -(0.35 + Math.random() * 1.15),
        r: 1.6 + Math.random() * (3.4 + this.state.velocityNorm * 2.2),
        alpha: 0.42 + Math.random() * 0.4,
        wobble: Math.random() * Math.PI * 2,
        life: 1,
        decay: 0.008 + Math.random() * 0.008,
      });
    }
  }

  tick(timeSec = 0) {
    const { ctx, width, height, state } = this;
    ctx.clearRect(0, 0, width, height);

    if (this.reducedMotion) {
      // Static gentle dust/starfield when reduced motion is preferred
      for (const m of this.motes) {
        ctx.fillStyle = `rgba(186, 230, 253, ${0.28 + state.glowFactor * 0.35})`;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fill();
      }
      return;
    }

    this._emitTurbineBubbles();

    const vel = state.velocityNorm;
    const glow = state.glowFactor;

    // 1. Floating ocean motes & bioluminescent sparkles
    for (const m of this.motes) {
      m.x -= m.speed * (1 + vel * 9.5);
      m.y += m.driftY + Math.sin(timeSec * 1.2 + m.phase) * 0.18;

      if (m.x < -10) m.x = width + 10;
      if (m.y < -10) m.y = height + 10;
      if (m.y > height + 10) m.y = -10;

      const twinkle = 0.45 + 0.55 * Math.sin(timeSec * 2.2 + m.phase);
      const radius = m.r * (1 + glow * 0.45);
      let color;
      if (glow > 0.25 && m.hueType > 0.65) {
        color = `rgba(244, 114, 182, ${(0.35 + glow * 0.55) * twinkle})`;
      } else if (glow > 0.25 && m.hueType > 0.32) {
        color = `rgba(251, 191, 36, ${(0.3 + glow * 0.5) * twinkle})`;
      } else {
        color = `rgba(165, 243, 252, ${(0.22 + glow * 0.45) * twinkle})`;
      }

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(m.x, m.y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Speed light-streaks (visible when scrolling fast)
    if (vel > 0.08) {
      const streakOpacity = Math.min(1, (vel - 0.08) * 1.35);
      ctx.lineCap = 'round';
      for (const s of this.streaks) {
        s.x -= s.speed * (0.4 + vel * 2.6);
        if (s.x + s.len < 0) {
          s.x = width + Math.random() * 140;
          s.y = Math.random() * height;
        }
        ctx.strokeStyle = `rgba(${state.accentRgb}, ${s.alpha * streakOpacity})`;
        ctx.lineWidth = 1 + vel * 1.2;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x + s.len * (0.4 + vel), s.y);
        ctx.stroke();
      }
    }

    // 3. Rising & trailing bubbles
    for (let i = this.bubbles.length - 1; i >= 0; i--) {
      const b = this.bubbles[i];
      b.x += b.vx + Math.sin(timeSec * 4 + b.wobble) * 0.35;
      b.y += b.vy;
      b.life -= b.decay;

      if (b.life <= 0 || b.y < -20 || b.x < -30) {
        this.bubbles.splice(i, 1);
        continue;
      }

      const alpha = b.alpha * b.life;
      ctx.strokeStyle = `rgba(207, 250, 254, ${alpha})`;
      ctx.fillStyle = `rgba(165, 243, 252, ${alpha * 0.18})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Tiny specular highlight dot
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.75})`;
      ctx.beginPath();
      ctx.arc(b.x - b.r * 0.32, b.y - b.r * 0.32, Math.max(0.6, b.r * 0.22), 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
