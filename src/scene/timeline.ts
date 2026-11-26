/**
 * LENIS + GSAP SCROLLTRIGGER MASTER TIMELINE
 * ---------------------------------------------------------------------------
 * Scroll = Throttle across ~1000vh.
 * - Maps scroll position to per-chapter video timestamps using monotonic dwell
 *   easing (calm slow-down in middle of chapters, smooth pace across cuts).
 * - Lerps `smoothedTime` toward `targetTime` inside requestAnimationFrame so
 *   both forward and backward scrubbing feel weighty and fluid.
 * - Triggers soft light-bloom + subtle scale push across cut boundaries.
 * - Orchestrates Chapter 3's signature Cab circular iris reveal & live UI HUD.
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

/** Monotonic C-infinity dwell curve: slower in chapter middle (t=0.5), smoother across cuts */
function applyDwellCurve(t: number, dwell: number): number {
  const d = Math.max(0, Math.min(0.75, dwell));
  return t + (d * Math.sin(2 * Math.PI * t)) / (2 * Math.PI);
}

/** Wraps headline lines/words in overflow-hidden masks for expo/quart reveals */
export function prepareSplitText(): void {
  const nodes = document.querySelectorAll<HTMLElement>('[data-split]');
  nodes.forEach((el) => {
    const words = (el.textContent || '').trim().split(/\s+/);
    el.innerHTML = words
      .map(
        (w) =>
          `<span class="split-mask"><span class="split-word">${w}</span></span>`
      )
      .join(' ');
  });
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
  const cutBloomEl = document.getElementById('cut-bloom') as HTMLElement;
  const colorGradeEl = document.getElementById('color-grade') as HTMLElement;
  const causticEl = document.getElementById('caustic-overlay') as HTMLElement;
  const vignetteEl = document.getElementById('vignette-overlay') as HTMLElement;
  const cabOverlayEl = document.getElementById('cab-overlay') as HTMLElement;
  const cabVideoEl = document.getElementById('cab-video-player') as HTMLVideoElement | null;

  // Live Cab UI HUD gauges
  const cabPressureBar = document.getElementById('cab-ui-pressure-bar');
  const cabPressureVal = document.getElementById('cab-ui-pressure-val');
  const cabDepthVal = document.getElementById('cab-ui-depth-val');
  const cabSpeedVal = document.getElementById('cab-ui-speed-val');
  const cabSonarSweep = document.getElementById('cab-ui-sonar-sweep');
  const cabThrottleLever = document.getElementById('cab-ui-throttle-lever');
  const cityStepNodes = Array.from(
    document.querySelectorAll<HTMLElement>('.city-step-item')
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

  // Per-chapter split-text & editorial reveals
  const sections = gsap.utils.toArray<HTMLElement>('.chapter-section');
  sections.forEach((sec, idx) => {
    const card = sec.querySelector<HTMLElement>('.chapter-card');
    const words = sec.querySelectorAll<HTMLElement>('.split-word');
    const body = sec.querySelector<HTMLElement>('.chapter-body');
    const meta = sec.querySelector<HTMLElement>('.chapter-meta');

    if (idx === 0) {
      if (!reducedMotion) {
        gsap.fromTo(
          words,
          { yPercent: 115, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 1.0,
            stagger: 0.055,
            ease: 'expo.out',
            delay: 0.15,
          }
        );
        if (body) {
          gsap.fromTo(
            body,
            { y: 18, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.85, ease: 'quart.out', delay: 0.4 }
          );
        }
        if (meta) {
          gsap.fromTo(
            meta,
            { y: 14, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.75, ease: 'quart.out', delay: 0.55 }
          );
        }
      }
      return;
    }

    const revealTl = gsap.timeline({
      scrollTrigger: {
        trigger: sec,
        start: 'top 66%',
        end: 'bottom 34%',
        toggleActions: 'play reverse play reverse',
      },
    });

    if (reducedMotion) {
      if (card) revealTl.fromTo(card, { opacity: 0 }, { opacity: 1, duration: 0.3 });
    } else {
      revealTl.fromTo(
        words,
        { yPercent: 115, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.85,
          stagger: 0.04,
          ease: 'expo.out',
        }
      );
      if (body) {
        revealTl.fromTo(
          body,
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, ease: 'quart.out' },
          '-=0.55'
        );
      }
      if (meta) {
        revealTl.fromTo(
          meta,
          { y: 14, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.65, ease: 'quart.out' },
          '-=0.45'
        );
      }
    }
  });

  // Master continuous scroll tracker
  ScrollTrigger.create({
    trigger: '#scroll-track',
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: (self) => {
      state.scrollProgress = self.progress;
      if (self.progress > 0.005) state.hasScrolled = true;
    },
  });

  const scrollToChapter = (index: number): void => {
    const target = document.getElementById(`chapter-${index}`);
    if (!target) return;
    scrubber.prioritizeTime(SITE_CONFIG.chapters[index]?.videoStart || 0);

    if (reducedMotion) {
      target.scrollIntoView({ behavior: 'auto' });
      return;
    }
    lenis.scrollTo(target, {
      offset: 0,
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

    // Telemetry smoothly follows video/chapter progress
    const depth = lerp(ch.depthRange[0], ch.depthRange[1], dwelledT);
    const pressure = lerp(ch.pressureRange[0], ch.pressureRange[1], dwelledT);
    const baseSpeed = lerp(ch.speedRange[0], ch.speedRange[1], dwelledT);
    const liveSpeed = Math.round(
      ch.index === 0 && !state.hasScrolled
        ? 0
        : ch.index === 7 && localT > 0.72
        ? Math.max(0, baseSpeed * (1 - (localT - 0.72) * 3.5))
        : Math.min(182, baseSpeed + vel * 34)
    );

    hud.updateTelemetry({
      depth,
      pressure,
      speed: liveSpeed,
      velocityNorm: vel,
      progress: p,
      isStarted: state.hasScrolled,
    });

    // Subtle cut-transition bloom + micro scale push around cutTimestamps
    let cutBloom = 0;
    if (!reducedMotion) {
      for (const cutSec of SITE_CONFIG.cutTimestamps) {
        const dist = Math.abs(state.smoothedTime - cutSec);
        if (dist < 0.22) {
          cutBloom = Math.max(cutBloom, 1 - dist / 0.22);
        }
      }
    }
    if (cutBloomEl) {
      cutBloomEl.style.opacity = (cutBloom * 0.42).toFixed(3);
    }

    // Depth-linked color grading & atmosphere overlays
    const nextCh = ranges[Math.min(ranges.length - 1, ch.index + 1)];
    const gradeBlend = Math.max(0, (localT - 0.55) / 0.45);
    if (colorGradeEl) {
      colorGradeEl.style.background = ch.colorGrade.tint;
      colorGradeEl.style.opacity = lerp(
        ch.colorGrade.tintOpacity,
        nextCh.colorGrade.tintOpacity,
        gradeBlend
      ).toFixed(3);
    }
    if (causticEl) {
      causticEl.style.opacity = lerp(
        ch.colorGrade.causticOpacity,
        nextCh.colorGrade.causticOpacity,
        gradeBlend
      ).toFixed(3);
    }
    if (vignetteEl) {
      vignetteEl.style.opacity = lerp(
        ch.colorGrade.vignette,
        nextCh.colorGrade.vignette,
        gradeBlend
      ).toFixed(3);
    }
    stageEl.style.setProperty('--accent-color', ch.colorGrade.accent);
    stageEl.style.setProperty(
      '--chroma-shift',
      reducedMotion ? '0px' : `${(vel * 3.2).toFixed(2)}px`
    );

    // Chapter 3 SIGNATURE CAB POV: seamless camera dive into the REAL video cab (no teleporting cut)
    // `cabEnter` ramps smoothly as the video approaches & passes through the cockpit glass (2.85s..3.25s)
    let cabHudFactor = 0;
    let cabPushZoom = 0;
    if (ch.index === 3) {
      if (localT < 0.28) {
        cabPushZoom = Math.sin((localT / 0.28) * Math.PI) * 0.12;
        cabHudFactor = Math.max(0, (localT - 0.14) / 0.14);
      } else if (localT > 0.8) {
        cabHudFactor = Math.max(0, (1 - localT) / 0.2);
      } else {
        cabHudFactor = 1;
      }
    }
    const cabEase = cabHudFactor * cabHudFactor * (3 - 2 * cabHudFactor);

    if (cabOverlayEl) {
      if (SITE_CONFIG.cabMedia.overrideVideo && !reducedMotion) {
        const radius = (cabEase * 82).toFixed(1);
        cabOverlayEl.style.clipPath = `circle(${radius}% at 50% 48%)`;
        cabOverlayEl.style.opacity = cabEase > 0.02 ? '1' : '0';
      } else {
        cabOverlayEl.style.clipPath = 'none';
        cabOverlayEl.style.opacity = cabEase.toFixed(3);
        cabOverlayEl.style.transform = reducedMotion
          ? 'none'
          : `scale(${(0.95 + cabEase * 0.05).toFixed(4)})`;
      }
      cabOverlayEl.style.pointerEvents = cabEase > 0.45 ? 'auto' : 'none';

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

    // Chapter 5 Sunken City 3-step training progress rail
    if (ch.index === 5 && cityStepNodes.length === 3) {
      const activeStep = localT < 0.34 ? 0 : localT < 0.7 ? 1 : 2;
      cityStepNodes.forEach((el, sIdx) => {
        el.classList.toggle('is-active', sIdx === activeStep);
        el.classList.toggle('is-done', sIdx < activeStep);
      });
    }

    // Idle breathing (1-1.4%) + subtle speed zoom (1-2.2%) + seamless cab push
    const idleBreath = reducedMotion ? 0 : 0.006 * (0.5 + 0.5 * Math.sin(timeSec * 0.9));
    const speedZoom = reducedMotion ? 0 : vel * 0.022;
    const cutPush = cutBloom * 0.014;
    const scaleMultiplier = 1 + idleBreath + speedZoom + cutPush + (reducedMotion ? 0 : cabPushZoom);

    // Interpolate mobile focal crop smoothly into next chapter near boundaries
    const focalX = lerp(ch.focalX, nextCh.focalX, gradeBlend);

    scrubber.render(state.smoothedTime, focalX, scaleMultiplier, ch.index);

    fxCanvas.setState({
      velocityNorm: vel,
      sparkleFactor: lerp(
        ch.colorGrade.sparkleFactor,
        nextCh.colorGrade.sparkleFactor,
        gradeBlend
      ),
      accentRgb:
        ch.index === 6
          ? '244, 114, 182'
          : ch.index === 4
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
