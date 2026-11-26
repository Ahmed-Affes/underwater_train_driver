/**
 * MASTER SCROLL-DRIVEN CINEMATIC TIMELINE
 * ---------------------------------------------------------------------------
 * Orchestrates Lenis smooth scroll + GSAP ScrollTrigger across all 8 chapters
 * as ONE continuous camera shot (zero hard cuts).
 *
 * Timeline Progress Map (0.0 -> 1.0 across #scroll-track):
 *   0.00 - 0.11 : Ch 0 Boarding (dark calm -> headlights fade on)
 *   0.11 - 0.23 : Ch 1 Departure (airlock -> bright turquoise shallows)
 *   0.23 - 0.36 : Ch 2 The Reef (coral terraces, fish school scatter & regather)
 *   0.36 - 0.52 : Ch 3 The Cab (signature iris-zoom INTO driver cockpit POV)
 *   0.52 - 0.64 : Ch 4 The Kelp Forest (slower calm pace, fg kelp passes train)
 *   0.64 - 0.76 : Ch 5 The Sunken City (train passes inside grand 3D arch)
 *   0.76 - 0.89 : Ch 6 The Glow Zone (380m indigo trench, whale shark & sparkles)
 *   0.89 - 1.00 : Ch 7 Arrival (ascending climb into glowing glass-dome station)
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { CHAPTERS } from '../config/chapters.js';

gsap.registerPlugin(ScrollTrigger);

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function lerpHex(hexA, hexB, t) {
  const [r1, g1, b1] = hexToRgb(hexA);
  const [r2, g2, b2] = hexToRgb(hexB);
  const r = Math.round(lerp(r1, r2, t));
  const g = Math.round(lerp(g1, g2, t));
  const b = Math.round(lerp(b1, b2, t));
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Wraps each line/word inside `.split-reveal` elements in overflow-hidden masks
 * for crisp editorial expo.out reveals.
 */
export function prepareSplitText() {
  const targets = document.querySelectorAll('[data-split]');
  targets.forEach((el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words
      .map(
        (word) =>
          `<span class="split-mask"><span class="split-word">${word}</span></span>`
      )
      .join(' ');
  });
}

export function initCinematicTimeline({
  assetManager,
  particleEngine,
  audioEngine,
  hud,
  reducedMotion,
}) {
  const stageEl = document.getElementById('stage');
  const worldMidEl = document.getElementById('world-mid');
  const worldFgEl = document.getElementById('world-fg');
  const trackPulsesEl = document.getElementById('track-pulses');
  const trackContainerEl = document.getElementById('layer-track');
  const trainLayerEl = document.getElementById('layer-train');
  const trainSvgEl = document.getElementById('hero-train-svg');
  const headlightsEl = document.getElementById('train-headlights');
  const turbineRotorEl = document.querySelector('#turbine-rotor .rotor-blades');
  const thrusterPlumeEl = document.getElementById('thruster-plume');
  const cabLayerEl = document.getElementById('layer-cab');
  const cabSonarEl = document.getElementById('cab-sonar-needle');
  const cabPressureValEl = document.getElementById('cab-pressure-val');
  const cabPressureBarEl = document.getElementById('cab-pressure-bar');
  const cabSpeedValEl = document.getElementById('cab-speed-val');
  const cabThrottleDotEl = document.getElementById('cab-throttle-dot');
  const raysEl = document.getElementById('layer-rays');
  const vignetteEl = document.getElementById('layer-vignette');

  const fishNodes = Array.from(document.querySelectorAll('.reef-fish')).map((el) => ({
    el,
    index: Number(el.dataset.fishIndex || 0),
    baseX: Number(el.dataset.baseX || 0),
    baseY: Number(el.dataset.baseY || 0),
  }));

  // Compute cumulative normalized scroll range [start, end] for each chapter
  const totalVh = CHAPTERS.reduce((sum, ch) => sum + ch.scrollVh, 0);
  let cursorVh = 0;
  const chapterRanges = CHAPTERS.map((ch) => {
    const start = cursorVh / totalVh;
    cursorVh += ch.scrollVh;
    const end = cursorVh / totalVh;
    return { ...ch, start, end };
  });

  // 1. Setup Lenis smooth scroll
  const lenis = new Lenis({
    duration: reducedMotion ? 0.4 : 1.25,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 0.9,
    touchMultiplier: 1.4,
  });

  lenis.on('scroll', ScrollTrigger.update);

  // State tracked per animation frame
  const state = {
    progress: 0,
    velocityRaw: 0,
    velocitySmooth: 0,
    activeChapterIdx: 0,
    rotorAngle: 0,
    sonarAngle: 0,
    trackScrollX: 0,
    fishWasScattered: false,
  };

  // Expose scroll-to-chapter helper for mini route map & keyboard nav
  const scrollToChapter = (index) => {
    const section = document.getElementById(`chapter-${index}`);
    if (!section) return;
    if (reducedMotion) {
      section.scrollIntoView({ behavior: 'auto' });
    } else {
      lenis.scrollTo(section, {
        offset: 0,
        duration: 1.4,
        easing: (t) => 1 - Math.pow(1 - t, 4),
      });
    }
  };

  // 2. Chapter section editorial text reveals (ScrollTrigger per section)
  const sections = gsap.utils.toArray('.chapter-section');
  sections.forEach((sec, idx) => {
    const card = sec.querySelector('.chapter-editorial');
    const words = sec.querySelectorAll('.split-word');
    const body = sec.querySelector('.chapter-body');
    const extra = sec.querySelector('.chapter-extra');

    if (idx === 0) {
      // Boarding hero plays immediately on load after headlight intro
      if (!reducedMotion) {
        gsap.fromTo(
          words,
          { yPercent: 115, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 1.05,
            stagger: 0.06,
            ease: 'expo.out',
            delay: 0.25,
          }
        );
        if (body) {
          gsap.fromTo(
            body,
            { y: 18, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.9, ease: 'quart.out', delay: 0.5 }
          );
        }
      }
    } else {
      // Editorial split-text reveal + gentle parallax slide
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sec,
          start: 'top 68%',
          end: 'bottom 35%',
          toggleActions: 'play reverse play reverse',
        },
      });

      if (reducedMotion) {
        tl.fromTo(card, { opacity: 0 }, { opacity: 1, duration: 0.35 });
      } else {
        tl.fromTo(
          words,
          { yPercent: 112, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 0.85,
            stagger: 0.045,
            ease: 'expo.out',
          }
        );
        if (body) {
          tl.fromTo(
            body,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.75, ease: 'quart.out' },
            '-=0.55'
          );
        }
        if (extra) {
          tl.fromTo(
            extra,
            { y: 16, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.65, ease: 'quart.out' },
            '-=0.45'
          );
        }
      }

      // Subtle vertical parallax on the editorial block itself
      if (!reducedMotion && card) {
        gsap.fromTo(
          card,
          { y: 34 },
          {
            y: -34,
            ease: 'none',
            scrollTrigger: {
              trigger: sec,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          }
        );
      }
    }

    // Activate lazy-loading + next-chapter preloading on enter
    ScrollTrigger.create({
      trigger: sec,
      start: 'top 80%',
      onEnter: () => assetManager.activateChapter(idx),
      onEnterBack: () => assetManager.activateChapter(idx),
    });
  });

  // 3. Master ScrollTrigger tracking continuous 0..1 progress across #scroll-track
  ScrollTrigger.create({
    trigger: '#scroll-track',
    start: 'top top',
    end: 'bottom bottom',
    scrub: 0.25,
    onUpdate: (self) => {
      state.progress = self.progress;
    },
  });

  // 4. Main 60fps render loop synchronized with Lenis + GSAP ticker
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);

    // Smooth scroll velocity (px/frame -> normalized 0..1)
    const rawVel = Math.abs(lenis.velocity || 0);
    state.velocityRaw = Math.min(1, rawVel / 42);
    state.velocitySmooth = lerp(state.velocitySmooth, state.velocityRaw, 0.09);

    const p = state.progress;
    const vel = state.velocitySmooth;

    // Locate current chapter & local interpolation factor `localT`
    let currentRange = chapterRanges[0];
    for (let i = 0; i < chapterRanges.length; i++) {
      if (p >= chapterRanges[i].start && p <= chapterRanges[i].end) {
        currentRange = chapterRanges[i];
        break;
      }
      if (i === chapterRanges.length - 1) currentRange = chapterRanges[i];
    }

    const idx = currentRange.index;
    const nextRange = chapterRanges[Math.min(chapterRanges.length - 1, idx + 1)];
    const span = Math.max(0.0001, currentRange.end - currentRange.start);
    const localT = Math.max(0, Math.min(1, (p - currentRange.start) / span));

    if (idx !== state.activeChapterIdx) {
      state.activeChapterIdx = idx;
      assetManager.activateChapter(idx);
      hud.setActiveChapter(idx);
    }

    // Interpolate ocean depth, water pressure, and target cruise speed
    const depth = lerp(currentRange.depthStart, currentRange.depthEnd, localT);
    const pressure = lerp(currentRange.pressureStart, currentRange.pressureEnd, localT);
    const baseSpeed = lerp(currentRange.speedTarget, nextRange.speedTarget, localT * 0.4);
    const liveSpeed = Math.round(
      idx === 0 && localT < 0.35
        ? localT * 45
        : idx === 7 && localT > 0.6
        ? Math.max(0, baseSpeed * (1 - (localT - 0.6) * 2.5))
        : baseSpeed + vel * 38
    );

    hud.updateTelemetry({
      depth,
      pressure,
      speed: liveSpeed,
      velocityNorm: vel,
      progress: p,
      chapter: currentRange,
    });

    // Smooth water color & lighting transitions tied to scroll/depth
    const blendT = Math.max(0, (localT - 0.45) / 0.55);
    const palA = currentRange.palette;
    const palB = nextRange.palette;

    stageEl.style.setProperty('--water-top', lerpHex(palA.top, palB.top, blendT));
    stageEl.style.setProperty('--water-mid', lerpHex(palA.mid, palB.mid, blendT));
    stageEl.style.setProperty('--water-bottom', lerpHex(palA.bottom, palB.bottom, blendT));
    stageEl.style.setProperty('--accent-color', lerpHex(palA.accent, palB.accent, blendT));

    if (raysEl) {
      raysEl.style.opacity = String(lerp(palA.rayOpacity, palB.rayOpacity, blendT));
    }
    if (vignetteEl) {
      vignetteEl.style.opacity = String(lerp(palA.vignette, palB.vignette, blendT));
    }

    // Cross-fade chapter backdrop plates (bg layer, slow parallax)
    for (let i = 0; i < CHAPTERS.length; i++) {
      const plate = assetManager.getPlateElement(i);
      if (!plate) continue;
      const r = chapterRanges[i];
      const center = (r.start + r.end) * 0.5;
      const half = (r.end - r.start) * 0.72;
      const dist = Math.abs(p - center);
      const vis = Math.max(0, 1 - dist / half);
      plate.style.opacity = vis.toFixed(3);
      if (!reducedMotion && vis > 0.01) {
        const bgShiftX = (p - center) * -140;
        plate.style.transform = `translate3d(${bgShiftX.toFixed(1)}px, 0, 0) scale(1.06)`;
      }
    }

    // -----------------------------------------------------------------------
    // 6-LAYER CONTINUOUS HORIZONTAL WORLD PARALLAX
    // -----------------------------------------------------------------------
    if (!reducedMotion) {
      const worldWidth = window.innerWidth < 768 ? 4600 : 6650;
      const midX = -p * worldWidth;
      const fgX = -p * worldWidth * 1.38;

      if (worldMidEl) {
        worldMidEl.style.transform = `translate3d(${midX.toFixed(1)}px, 0, 0)`;
      }
      if (worldFgEl) {
        worldFgEl.style.transform = `translate3d(${fgX.toFixed(1)}px, 0, 0)`;
      }

      // Magnetic track pulses speed along continuously with scroll & velocity
      state.trackScrollX = (state.trackScrollX - (1.1 + vel * 18)) % 120;
      if (trackPulsesEl) {
        trackPulsesEl.style.transform = `translate3d(${state.trackScrollX.toFixed(1)}px, 0, 0)`;
      }

      // Subtle track & train elevation / pitch: descend gently into trench, climb smoothly at Arrival
      const arrivalClimb = idx === 7 ? localT : 0;
      const trenchDip = idx === 6 ? Math.sin(localT * Math.PI) * 18 : 0;
      const pitchDeg = idx === 7 ? -4.2 * (1 - localT) : idx === 6 ? 1.8 * (1 - localT) : 0;
      const bobY = Math.sin(time * 1.7) * (3.2 - vel * 1.4) + trenchDip - arrivalClimb * 28;
      const surgeX = vel * 26 - (idx === 7 && localT > 0.65 ? (localT - 0.65) * 45 : 0);

      if (trackContainerEl) {
        trackContainerEl.style.transform = `translate3d(0, ${(trenchDip - arrivalClimb * 28).toFixed(1)}px, 0) rotate(${pitchDeg.toFixed(2)}deg)`;
      }

      // ---------------------------------------------------------------------
      // SIGNATURE MOMENT: CHAPTER 3 (THE CAB) IRIS ZOOM & HOLOGRAPHIC HUD
      // ---------------------------------------------------------------------
      const cabStart = chapterRanges[3].start;
      const cabEnd = chapterRanges[3].end;
      let cabFactor = 0;
      if (p >= cabStart - 0.03 && p <= cabEnd + 0.03) {
        const cabT = (p - cabStart) / (cabEnd - cabStart);
        if (cabT < 0.22) {
          cabFactor = Math.max(0, (cabT + 0.12) / 0.34);
        } else if (cabT > 0.78) {
          cabFactor = Math.max(0, 1 - (cabT - 0.78) / 0.28);
        } else {
          cabFactor = 1;
        }
      }
      // Smoothstep easing for cinematic zoom
      const cabEase = cabFactor * cabFactor * (3 - 2 * cabFactor);

      if (trainLayerEl) {
        const trainScale = 1 + cabEase * 1.9;
        const trainShiftX = surgeX - cabEase * 220;
        const trainShiftY = bobY - cabEase * 32;
        trainLayerEl.style.transform = `translate3d(${trainShiftX.toFixed(1)}px, ${trainShiftY.toFixed(1)}px, 0) scale(${trainScale.toFixed(3)}) rotate(${pitchDeg.toFixed(2)}deg)`;
        trainLayerEl.style.opacity = (1 - Math.max(0, (cabEase - 0.55) / 0.45)).toFixed(3);
      }

      if (cabLayerEl) {
        const rx = (cabEase * 95).toFixed(1);
        const ry = (cabEase * 95).toFixed(1);
        cabLayerEl.style.clipPath = `ellipse(${rx}% ${ry}% at 58% 52%)`;
        cabLayerEl.style.opacity = cabEase > 0.02 ? '1' : '0';
        cabLayerEl.style.pointerEvents = cabEase > 0.6 ? 'auto' : 'none';
      }

      // Update live holographic HUD inside Chapter 3 Cab
      if (cabEase > 0.05) {
        state.sonarAngle = (state.sonarAngle + 1.4 + vel * 2.5) % 360;
        if (cabSonarEl) {
          cabSonarEl.setAttribute('transform', `rotate(${state.sonarAngle.toFixed(1)})`);
        }
        if (cabPressureValEl) {
          cabPressureValEl.textContent = `${pressure.toFixed(1)} ATM`;
        }
        if (cabPressureBarEl) {
          const barW = Math.min(216, Math.max(24, (pressure / 39) * 216));
          cabPressureBarEl.setAttribute('width', barW.toFixed(0));
        }
        if (cabSpeedValEl) {
          cabSpeedValEl.textContent = String(liveSpeed).padStart(3, '0');
        }
        if (cabThrottleDotEl) {
          cabThrottleDotEl.setAttribute('cy', (-6 - vel * 14).toFixed(1));
        }
      }

      // Headlights fade ON during Chapter 0, soften at Arrival
      if (headlightsEl) {
        const headlightOn = idx === 0 ? Math.min(1, localT * 2.2 + 0.15) : idx === 6 ? 1 : 0.82;
        headlightsEl.style.opacity = (headlightOn * (0.85 + vel * 0.15)).toFixed(2);
      }

      // Spinning rear turbine rotor & velocity thruster glow
      state.rotorAngle = (state.rotorAngle + 4 + vel * 28) % 360;
      if (turbineRotorEl) {
        turbineRotorEl.setAttribute('transform', `rotate(${state.rotorAngle.toFixed(1)})`);
      }
      if (thrusterPlumeEl) {
        const rx = 28 + vel * 38;
        thrusterPlumeEl.setAttribute('rx', rx.toFixed(1));
        thrusterPlumeEl.style.opacity = (0.35 + vel * 0.6).toFixed(2);
      }

      // Velocity-based subtle motion blur CSS var
      stageEl.style.setProperty('--vel-blur', `${(vel * 2.2).toFixed(2)}px`);

      // Chapter 2: Fish school scatter away from train nose and regather behind
      const reefCenter = (chapterRanges[2].start + chapterRanges[2].end) * 0.5;
      const reefProximity = Math.max(0, 1 - Math.abs(p - reefCenter) / 0.08);
      if (reefProximity > 0.01) {
        state.fishWasScattered = true;
        for (const f of fishNodes) {
          const dirY = f.index % 2 === 0 ? -1 : 1;
          const scatterY = dirY * reefProximity * (34 + (f.index % 4) * 14);
          const scatterX = reefProximity * (18 + (f.index % 3) * 12);
          f.el.setAttribute(
            'transform',
            `translate(${(f.baseX + scatterX).toFixed(1)}, ${(f.baseY + scatterY).toFixed(1)})`
          );
        }
      } else if (state.fishWasScattered) {
        state.fishWasScattered = false;
        for (const f of fishNodes) {
          f.el.setAttribute('transform', `translate(${f.baseX}, ${f.baseY})`);
        }
      }

      // Particle & audio modulation
      const glowFactor =
        idx === 6
          ? Math.sin(localT * Math.PI * 0.85 + 0.15)
          : idx === 5 && localT > 0.6
          ? (localT - 0.6) * 1.2
          : 0;

      const trainRect = trainSvgEl ? trainSvgEl.getBoundingClientRect() : null;
      const tailX = trainRect ? (trainRect.left + trainRect.width * 0.04) / window.innerWidth : 0.2;
      const tailY = trainRect ? (trainRect.top + trainRect.height * 0.48) / window.innerHeight : 0.62;

      particleEngine.setState({
        velocityNorm: vel,
        glowFactor,
        cabFactor: cabEase,
        trainTailX: tailX,
        trainTailY: tailY,
        accentRgb: idx === 6 ? '244, 114, 182' : idx === 4 ? '52, 211, 153' : '34, 211, 238',
      });
    } else {
      // Reduced motion fallback: simple clean Cab reveal inside Chapter 3
      const inCab = idx === 3;
      if (cabLayerEl) {
        cabLayerEl.style.clipPath = 'none';
        cabLayerEl.style.opacity = inCab ? '1' : '0';
        cabLayerEl.style.pointerEvents = inCab ? 'auto' : 'none';
      }
      if (trainLayerEl) {
        trainLayerEl.style.opacity = inCab ? '0' : '1';
      }
    }

    particleEngine.tick(time);
    audioEngine.update({
      velocityNorm: vel,
      depthNorm: Math.min(1, depth / 380),
    });
  });

  gsap.ticker.lagSmoothing(0);

  return {
    lenis,
    scrollToChapter,
    destroy: () => {
      lenis.destroy();
      ScrollTrigger.getAll().forEach((st) => st.kill());
    },
  };
}
