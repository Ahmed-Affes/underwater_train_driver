/**
 * LENIS + GSAP SCROLLTRIGGER MASTER TIMELINE
 * ---------------------------------------------------------------------------
 * Scroll = Playback across ~2000vh (~100vh per second of video).
 * - Maps scroll position to per-chapter video timestamps using monotonic dwell
 *   easing (calm slow-down in middle of chapters & dramatic beats).
 * - Lerps `smoothedTime` toward `targetTime` inside requestAnimationFrame
 *   (smoothing factor 0.08–0.12) so forward & backward scrubbing stay silky.
 * - Enforces strict single-card visibility: only the active chapter card is
 *   visible at any moment, with a clean exit gap before the next enters.
 * - Orchestrates the native Command Cab holographic HUD & hotspots.
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { SITE_CONFIG, ChapterConfig } from '../config/siteConfig';
import { VideoScrubber } from '../media/videoScrubber';
import { FxOverlayCanvas } from '../canvas/fxCanvas';
import { OceanAudioEngine } from '../audio/oceanAudio';
import { HudController } from '../ui/hud';

gsap.registerPlugin(ScrollTrigger);

interface ChapterRange extends ChapterConfig {
  startNorm: number;
  endNorm: number;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / Math.max(0.0001, edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/** Monotonic C-infinity dwell curve: slower in chapter middle (t=0.5), smoother across cuts */
function applyDwellCurve(t: number, dwell: number): number {
  const d = Math.max(0, Math.min(0.75, dwell));
  return t + (d * Math.sin(2 * Math.PI * t)) / (2 * Math.PI);
}

/** Deterministic envelope: ensures a clean exit before the next chapter card enters */
function computeCardEnvelope(localT: number, index: number, totalChapters: number): number {
  if (index === 0) {
    // Hero starts fully visible at 0 and exits cleanly before cut
    return localT < 0.78 ? 1 : 1 - smoothstep(0.78, 0.94, localT);
  }
  if (index === totalChapters - 1) {
    // Final chapter enters cleanly and remains visible through the end
    return smoothstep(0.06, 0.2, localT);
  }
  const enter = smoothstep(0.06, 0.2, localT);
  const exit = 1 - smoothstep(0.78, 0.94, localT);
  return Math.min(enter, exit);
}

export interface TimelineHandle {
  scrollToChapter: (index: number) => void;
  scrollToTop: () => void;
  getActiveChapter: () => number;
}

export function initCinematicTimeline(opts: {
  scrubber: VideoScrubber;
  fxCanvas: FxOverlayCanvas;
  audioEngine: OceanAudioEngine;
  hud: HudController;
  reducedMotion: boolean;
}): TimelineHandle {
  const { scrubber, fxCanvas, audioEngine, hud, reducedMotion } = opts;

  const stageEl = document.getElementById('stage') as HTMLElement;
  const cabOverlayEl = document.getElementById('cab-overlay') as HTMLElement;
  const cabVideoEl = document.getElementById('cab-video-player') as HTMLVideoElement | null;

  // Live Cab UI HUD gauges
  const cabPressureBar = document.getElementById('cab-ui-pressure-bar');
  const cabPressureVal = document.getElementById('cab-ui-pressure-val');
  const cabDepthVal = document.getElementById('cab-ui-depth-val');
  const cabSpeedVal = document.getElementById('cab-ui-speed-val');
  const cabSonarSweep = document.getElementById('cab-ui-sonar-sweep');
  const cabThrottleLever = document.getElementById('cab-ui-throttle-lever');
  const cityStepNodes = Array.from(document.querySelectorAll<HTMLElement>('.city-step-item'));

  const cardNodes = SITE_CONFIG.chapters.map((_, i) =>
    document.querySelector<HTMLElement>(`#chapter-${i} .chapter-card`)
  );

  // Build normalized chapter scroll windows
  const totalVh = SITE_CONFIG.chapters.reduce(
    (sum, ch) => sum + ch.scrollVh * SITE_CONFIG.scrollMultiplier,
    0
  );
  let cursorVh = 0;
  const ranges: ChapterRange[] = SITE_CONFIG.chapters.map((ch) => {
    const startNorm = cursorVh / totalVh;
    cursorVh += ch.scrollVh * SITE_CONFIG.scrollMultiplier;
    const endNorm = cursorVh / totalVh;
    return { ...ch, startNorm, endNorm };
  });

  // Lenis smooth scroll
  const lenis = new Lenis({
    duration: reducedMotion ? 0.2 : 1.25,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 0.92,
    touchMultiplier: 1.35,
  });
  lenis.on('scroll', ScrollTrigger.update);

  const state = {
    scrollProgress: 0,
    targetTime: 0,
    smoothedTime: 0,
    velocitySmooth: 0,
    sonarDeg: 0,
    activeChapterIdx: 0,
    hasScrolled: false,
  };

  // Master continuous scroll tracker
  ScrollTrigger.create({
    trigger: '#scroll-track',
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: (self) => {
      state.scrollProgress = self.progress;
      if (self.progress > 0.004) state.hasScrolled = true;
    },
  });

  const scrollToChapter = (index: number): void => {
    const target = document.getElementById(`chapter-${index}`);
    if (!target) return;
    scrubber.prioritizeTime(SITE_CONFIG.chapters[index]?.videoStart || 0);

    // Land inside the chapter's clean hold window so its card & scene are immediately active
    const targetScrollY =
      index === 0 ? 0 : target.offsetTop + Math.round(target.offsetHeight * 0.28);

    if (reducedMotion) {
      window.scrollTo({ top: targetScrollY, behavior: 'auto' });
      return;
    }
    lenis.scrollTo(targetScrollY, {
      duration: 1.35,
      easing: (t) => 1 - Math.pow(1 - t, 4),
    });
  };

  const scrollToTop = (): void => {
    if (reducedMotion) {
      window.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }
    lenis.scrollTo(0, {
      duration: 1.6,
      easing: (t) => 1 - Math.pow(1 - t, 4),
    });
  };

  // Main 60fps loop synced with Lenis + GSAP ticker
  gsap.ticker.add((timeSec) => {
    lenis.raf(timeSec * 1000);

    const rawVel = Math.abs(lenis.velocity || 0);
    const velTarget = Math.min(1, rawVel / 40);
    state.velocitySmooth = lerp(state.velocitySmooth, velTarget, 0.11);

    const p = state.scrollProgress;
    const vel = state.velocitySmooth;

    // Determine active chapter from scroll progress
    let ch = ranges[0];
    for (let i = 0; i < ranges.length; i++) {
      if (p >= ranges[i].startNorm && p <= ranges[i].endNorm) {
        ch = ranges[i];
        break;
      }
      if (i === ranges.length - 1) ch = ranges[i];
    }

    const span = Math.max(0.0001, ch.endNorm - ch.startNorm);
    const localT = clamp01((p - ch.startNorm) / span);
    const dwelledT = applyDwellCurve(localT, ch.dwell);

    // Map dwelled chapter progress -> exact video timestamp
    state.targetTime = lerp(ch.videoStart, ch.videoEnd, dwelledT);
    state.smoothedTime = reducedMotion
      ? state.targetTime
      : lerp(state.smoothedTime, state.targetTime, SITE_CONFIG.scrubLerp);

    if (ch.index !== state.activeChapterIdx) {
      state.activeChapterIdx = ch.index;
      hud.setActiveChapter(ch.index);
      audioEngine.playChapterChime(ch.index);
      scrubber.prioritizeTime(ch.videoEnd);
    }

    // Strictly ONE card visible at a time with clean enter/exit envelope
    const totalChapters = ranges.length;
    const activeEnv = computeCardEnvelope(localT, ch.index, totalChapters);
    for (let i = 0; i < cardNodes.length; i++) {
      const card = cardNodes[i];
      if (!card) continue;
      if (i === ch.index && activeEnv > 0.01) {
        const yOffset = reducedMotion ? 0 : (1 - activeEnv) * 14;
        card.style.opacity = activeEnv.toFixed(3);
        card.style.visibility = 'visible';
        card.style.transform = `translate3d(0, ${yOffset.toFixed(1)}px, 0)`;
        card.classList.add('is-active');
      } else {
        card.style.opacity = '0';
        card.style.visibility = 'hidden';
        card.style.transform = 'translate3d(0, 14px, 0)';
        card.classList.remove('is-active');
      }
    }

    // Telemetry smoothly follows video/chapter progress
    const depth = lerp(ch.depthRange[0], ch.depthRange[1], dwelledT);
    const pressure = lerp(ch.pressureRange[0], ch.pressureRange[1], dwelledT);
    const baseSpeed = lerp(ch.speedRange[0], ch.speedRange[1], dwelledT);
    const liveSpeed = Math.round(
      ch.index === 0 && !state.hasScrolled
        ? 0
        : ch.id === 'platform' && localT > 0.45
        ? 0
        : Math.min(182, baseSpeed + vel * 24)
    );

    hud.updateTelemetry({
      depth,
      pressure,
      speed: liveSpeed,
      velocityNorm: vel,
      progress: p,
      isStarted: state.hasScrolled,
    });

    stageEl.style.setProperty('--accent-color', ch.accent);

    // Command Cab holographic gauges & interactive hotspots (native video cab moment)
    let cabHudFactor = 0;
    if (ch.id === 'cab') {
      cabHudFactor = Math.min(smoothstep(0.08, 0.24, localT), 1 - smoothstep(0.78, 0.94, localT));
    }
    const cabEase = cabHudFactor;

    if (cabOverlayEl) {
      cabOverlayEl.style.opacity = cabEase.toFixed(3);
      cabOverlayEl.style.pointerEvents = cabEase > 0.45 ? 'auto' : 'none';
      cabOverlayEl.setAttribute('aria-hidden', cabEase > 0.1 ? 'false' : 'true');

      if (cabVideoEl) {
        if (cabEase > 0.2 && cabVideoEl.paused) {
          cabVideoEl.play().catch(() => {});
        } else if (cabEase <= 0.05 && !cabVideoEl.paused) {
          cabVideoEl.pause();
        }
      }
    }

    if (cabEase > 0.05) {
      state.sonarDeg = (state.sonarDeg + 1.45 + vel * 2.4) % 360;
      if (cabSonarSweep) {
        cabSonarSweep.style.transform = `rotate(${state.sonarDeg.toFixed(1)}deg)`;
      }
      if (cabPressureVal) {
        cabPressureVal.textContent = `${pressure.toFixed(1)} ATM`;
      }
      if (cabPressureBar) {
        const pct = Math.min(100, Math.max(8, (pressure / 38) * 100));
        cabPressureBar.style.transform = `scaleX(${(pct / 100).toFixed(3)})`;
      }
      if (cabDepthVal) {
        cabDepthVal.textContent = `${Math.round(depth)}m`;
      }
      if (cabSpeedVal) {
        cabSpeedVal.textContent = `${liveSpeed} km/h`;
      }
      if (cabThrottleLever) {
        const tilt = (-6 + vel * 16).toFixed(1);
        cabThrottleLever.style.transform = `rotate(${tilt}deg)`;
      }
    }

    // Sunken Arch 3-or-4-step certification rail
    if (ch.id === 'sunken-arch' && cityStepNodes.length >= 3) {
      const activeStep = Math.min(
        cityStepNodes.length - 1,
        Math.floor(localT * cityStepNodes.length)
      );
      cityStepNodes.forEach((el, sIdx) => {
        el.classList.toggle('is-active', sIdx === activeStep);
        el.classList.toggle('is-done', sIdx < activeStep);
      });
    }

    // Tiny idle drift & capped micro-scale (strictly <= 1.045x, never soft)
    const idleBreath = reducedMotion ? 0 : 0.008 * (0.5 + 0.5 * Math.sin(timeSec * 0.85));
    const speedZoom = reducedMotion ? 0 : vel * 0.022;
    const scaleMultiplier = Math.min(1.045, 1 + idleBreath + speedZoom);
    const driftX = reducedMotion ? 0 : Math.sin(timeSec * 0.55) * 3.0;
    const driftY = reducedMotion ? 0 : Math.cos(timeSec * 0.42) * 2.0;

    // Interpolate mobile focal crop smoothly into next chapter near boundaries
    const nextCh = ranges[Math.min(ranges.length - 1, ch.index + 1)];
    const gradeBlend = Math.max(0, (localT - 0.65) / 0.35);
    const focalX = lerp(ch.focalX, nextCh.focalX, gradeBlend);

    scrubber.render(state.smoothedTime, focalX, scaleMultiplier, ch.index, driftX, driftY);

    fxCanvas.setState({
      velocityNorm: vel,
      sparkleFactor: lerp(ch.sparkleFactor, nextCh.sparkleFactor, gradeBlend),
      accentRgb:
        ch.id === 'glow-zone'
          ? '244, 114, 182'
          : ch.id === 'kelp-skyline'
          ? '52, 211, 153'
          : '34, 211, 238',
    });
    fxCanvas.tick(timeSec);

    audioEngine.update(vel, clamp01(depth / 380), state.hasScrolled);
  });

  gsap.ticker.lagSmoothing(0);

  return {
    scrollToChapter,
    scrollToTop,
    getActiveChapter: () => state.activeChapterIdx,
  };
}
