import './styles/main.css';
import { CHAPTERS } from './config/chapters.js';
import { ASSETS } from './config/assets.js';
import {
  buildTrainSVG,
  buildCabHudSVG,
  buildWorldMidSVG,
  buildWorldFgSVG,
} from './scene/svgArt.js';
import { ChapterAssetManager, runInitialLoader } from './scene/assetLoader.js';
import { ParticleEngine } from './canvas/particleEngine.js';
import { OceanAudioEngine } from './audio/oceanAudio.js';
import { HudController } from './ui/hud.js';
import { initCinematicTimeline, prepareSplitText } from './scene/timeline.js';

function renderChapterSections() {
  const scrollTrack = document.getElementById('scroll-track');
  if (!scrollTrack) return;

  scrollTrack.innerHTML = CHAPTERS.map((ch) => {
    const isHero = ch.index === 0;
    const isCab = ch.index === 3;
    const isArrival = ch.index === CHAPTERS.length - 1;

    const headingTag = isHero ? 'h1' : 'h2';
    const headingClass = isHero ? 'chapter-headline hero-title' : 'chapter-headline';

    let extraHtml = '';
    if (isHero) {
      extraHtml = `
        <p class="hero-tagline">${ch.tagline}</p>
        <div class="scroll-cue chapter-extra" aria-hidden="true">
          <span class="scroll-cue-line"></span>
          <span class="scroll-cue-text">${ch.body}</span>
        </div>
      `;
    } else if (isCab && ch.highlightQuote) {
      extraHtml = `
        <p class="chapter-quote chapter-extra">“${ch.highlightQuote}”</p>
      `;
    } else if (isArrival) {
      const statsHtml = (ch.recapStats || [])
        .map(
          (stat) => `
          <div class="recap-item">
            <span class="recap-label">${stat.label}</span>
            <strong class="recap-val">${stat.value}</strong>
          </div>
        `
        )
        .join('');

      extraHtml = `
        <div class="arrival-actions chapter-extra">
          <button type="button" id="cta-training-btn" class="magnetic-cta">
            <span class="cta-glow" aria-hidden="true"></span>
            <span class="cta-text">Start your training</span>
            <span class="cta-arrow" aria-hidden="true">→</span>
          </button>
          <div class="recap-grid" aria-label="Career summary">
            ${statsHtml}
          </div>
        </div>
      `;
    }

    return `
      <section
        id="chapter-${ch.index}"
        class="chapter-section chapter-${ch.id}"
        data-chapter-index="${ch.index}"
        style="min-height: ${ch.scrollVh}vh;"
        aria-labelledby="heading-${ch.index}"
      >
        <div class="chapter-editorial ${isCab ? 'is-cab-layout' : ''}">
          <div class="chapter-kicker">
            <span class="kicker-code">${ch.stationCode}</span>
            <span class="kicker-sep" aria-hidden="true">/</span>
            <span class="kicker-label">${ch.label}</span>
          </div>
          <${headingTag} id="heading-${ch.index}" class="${headingClass}" data-split>
            ${ch.headline}
          </${headingTag}>
          ${
            !isHero
              ? `<p class="chapter-body">${ch.body}</p>`
              : ''
          }
          ${extraHtml}
        </div>
      </section>
    `;
  }).join('');
}

function mountSceneLayers() {
  const worldMid = document.getElementById('world-mid');
  const worldFg = document.getElementById('world-fg');
  const trainLayer = document.getElementById('layer-train');
  const cabLayer = document.getElementById('layer-cab');

  if (worldMid) worldMid.innerHTML = buildWorldMidSVG();
  if (worldFg) worldFg.innerHTML = buildWorldFgSVG();

  if (trainLayer) {
    if (ASSETS.train.sideImage) {
      trainLayer.innerHTML = `<img class="train-custom-img" src="${ASSETS.train.sideImage}" alt="${ASSETS.train.sideAlt}" />`;
    } else {
      trainLayer.innerHTML = buildTrainSVG();
    }
  }

  if (cabLayer) {
    const cabCfg = ASSETS.train.cabBackdrop;
    cabLayer.innerHTML = `
      ${
        cabCfg
          ? `<picture class="cab-backdrop-picture">
               <source type="image/avif" srcset="${cabCfg.avif}" />
               <source type="image/webp" srcset="${cabCfg.webp}" />
               <img src="${cabCfg.webp}" alt="${cabCfg.alt}" loading="lazy" decoding="async" />
             </picture>`
          : ''
      }
      <div class="cab-hud-overlay">
        ${buildCabHudSVG()}
      </div>
    `;
  }
}

async function bootstrap() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  renderChapterSections();
  prepareSplitText();
  mountSceneLayers();

  const backdropHost = document.getElementById('bg-plates');
  const assetManager = new ChapterAssetManager(backdropHost);

  const canvas = document.getElementById('particle-canvas');
  const particleEngine = new ParticleEngine(canvas, { reducedMotion });
  window.addEventListener('resize', () => particleEngine.resize(), { passive: true });

  const audioEngine = new OceanAudioEngine();
  const hud = new HudController({
    audioEngine,
    reducedMotion,
  });

  // Subtle cursor bubbles
  window.addEventListener(
    'pointermove',
    (e) => {
      particleEngine.emitCursorBubble(e.clientX, e.clientY);
    },
    { passive: true }
  );

  await runInitialLoader(assetManager);

  const timeline = initCinematicTimeline({
    assetManager,
    particleEngine,
    audioEngine,
    hud,
    reducedMotion,
  });

  hud.setJumpHandler((idx) => timeline.scrollToChapter(idx));

  // Keyboard chapter stepping (ArrowRight / ArrowLeft or Page keys)
  document.addEventListener('keydown', (e) => {
    if (e.target.closest('input, textarea, button, a')) return;
    if (e.key === 'ArrowRight') {
      timeline.scrollToChapter(Math.min(CHAPTERS.length - 1, hud.activeChapterIndex + 1));
    } else if (e.key === 'ArrowLeft') {
      timeline.scrollToChapter(Math.max(0, hud.activeChapterIndex - 1));
    }
  });
}

bootstrap();
