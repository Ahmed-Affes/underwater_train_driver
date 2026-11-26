import './styles/main.css';
import { SITE_CONFIG } from './config/siteConfig';
import { VideoScrubber } from './media/videoScrubber';
import { FxOverlayCanvas } from './canvas/fxCanvas';
import { OceanAudioEngine } from './audio/oceanAudio';
import { HudController } from './ui/hud';
import { initCinematicTimeline } from './scene/timeline';

function renderChapterSections(): void {
  const track = document.getElementById('scroll-track');
  if (!track) return;

  track.innerHTML = SITE_CONFIG.chapters
    .map((ch) => {
      const isHero = ch.index === 0;
      const isArrival = ch.index === SITE_CONFIG.chapters.length - 1;
      const HeadingTag = isHero ? 'h1' : 'h2';
      const titleClass = isHero ? 'chapter-headline is-hero' : 'chapter-headline';
      const totalHeightVh = Math.round(ch.scrollVh * SITE_CONFIG.scrollMultiplier);

      let extraBlock = '';

      if (isHero) {
        extraBlock = `
          ${ch.subline ? `<p class="hero-subline">${ch.subline}</p>` : ''}
          <p class="chapter-body">${ch.body}</p>
          ${
            ch.hint
              ? `<div class="scroll-cue chapter-meta" aria-hidden="true">
                   <span class="scroll-cue-line"></span>
                   <span>${ch.hint}</span>
                 </div>`
              : ''
          }
        `;
      } else {
        extraBlock = `<p class="chapter-body">${ch.body}</p>`;
      }

      if (ch.fact && !isHero) {
        extraBlock += `<p class="chapter-fact chapter-meta">${ch.fact}</p>`;
      }

      if (ch.trainingSteps && ch.trainingSteps.length > 0) {
        extraBlock += `
          <ol class="city-steps-rail chapter-meta" aria-label="Driver certification steps">
            ${ch.trainingSteps
              .map(
                (step, i) => `
              <li class="city-step-item ${i === 0 ? 'is-active' : ''}">
                <span class="step-dot" aria-hidden="true"></span>
                <span class="step-name">${step}</span>
              </li>
            `
              )
              .join('')}
          </ol>
        `;
      }

      if (ch.compensationCard) {
        extraBlock += `
          <div class="concept-comp-card chapter-meta">
            <span class="comp-tag">${ch.compensationCard.title}</span>
            <p>${ch.compensationCard.salary}</p>
            <p>${ch.compensationCard.schedule} · ${ch.compensationCard.perks}</p>
          </div>
        `;
      }

      if (isArrival) {
        const recapMarkup = SITE_CONFIG.recapFacts
          .map(
            (item) => `
            <div class="recap-item">
              <span class="recap-label">${item.label}</span>
              <strong class="recap-val">${item.value}</strong>
            </div>
          `
          )
          .join('');

        extraBlock += `
          <div class="arrival-actions chapter-meta">
            <div class="arrival-btn-row">
              <button type="button" id="cta-training-btn" class="magnetic-cta">
                <span>${SITE_CONFIG.hud.ctaPrimary}</span>
                <span aria-hidden="true">→</span>
              </button>
              <button type="button" id="replay-journey-btn" class="secondary-cta">
                <span>${SITE_CONFIG.hud.replayLabel}</span>
              </button>
            </div>
            <button type="button" id="open-quiz-btn" class="quiz-link-btn">
              ${SITE_CONFIG.hud.quizButton} (3 questions)
            </button>
            <div class="recap-grid" aria-label="Career summary">
              ${recapMarkup}
            </div>
          </div>
        `;
      }

      return `
        <section
          id="chapter-${ch.index}"
          class="chapter-section side-${ch.textSide} align-${ch.textVertical}"
          data-chapter-index="${ch.index}"
          data-chapter-id="${ch.id}"
          style="min-height: ${totalHeightVh}vh;"
          aria-labelledby="heading-${ch.index}"
        >
          <article class="chapter-card ${isHero ? 'is-active' : ''}">
            <div class="chapter-kicker">
              <span class="kicker-code">${ch.stationCode}</span>
              <span aria-hidden="true">/</span>
              <span>${ch.label}</span>
            </div>
            <${HeadingTag} id="heading-${ch.index}" class="${titleClass}">
              ${ch.headline}
            </${HeadingTag}>
            ${extraBlock}
          </article>
        </section>
      `;
    })
    .join('');
}

function mountCabOverlay(hud: HudController): void {
  const cabEl = document.getElementById('cab-overlay');
  if (!cabEl) return;

  const { cabMedia } = SITE_CONFIG;
  const mediaHtml = cabMedia.overrideVideo
    ? cabMedia.type === 'video' && cabMedia.videoMp4
      ? `<video id="cab-video-player" class="cab-media-el" src="${cabMedia.videoMp4}" muted loop playsinline preload="metadata"></video>`
      : `<img class="cab-media-el" src="${cabMedia.imageWebp}" alt="${cabMedia.alt}" loading="lazy" decoding="async" />`
    : '';

  const hotspotsHtml = cabMedia.hotspots
    .map(
      (spot) => `
      <button
        type="button"
        class="hotspot-pin is-cab-pin"
        data-spot-id="${spot.id}"
        style="left: ${spot.x}%; top: ${spot.y}%;"
        data-title="${spot.label}"
        data-fact="${spot.description}"
        aria-label="${spot.label}: ${spot.description}"
      >
        <span class="hotspot-ring" aria-hidden="true"></span>
        <span class="hotspot-core" aria-hidden="true"></span>
        <span class="hotspot-tag">${spot.label}</span>
      </button>
    `
    )
    .join('');

  cabEl.innerHTML = `
    ${mediaHtml}
    <div class="cab-ui-hud">
      <!-- Co-Pilot Robot Assistant Tip Bubble -->
      <div class="robot-tip-bubble" role="note" aria-label="Co-pilot robot tip">
        <span class="robot-blink-eye" aria-hidden="true"></span>
        <span>${cabMedia.robotTip}</span>
      </div>

      <!-- Left Holographic Telemetry UI -->
      <div class="cab-hud-panel cab-hud-left">
        <div class="cab-hud-block">
          <span class="cab-hud-tag">WATER PRESSURE</span>
          <strong id="cab-ui-pressure-val" class="cab-hud-val">11.8 ATM</strong>
          <div class="cab-bar-track" aria-hidden="true">
            <div id="cab-ui-pressure-bar" class="cab-bar-fill"></div>
          </div>
        </div>
        <div class="cab-hud-row">
          <div>
            <span class="cab-hud-tag">DEPTH</span>
            <strong id="cab-ui-depth-val" class="cab-hud-sub">108m</strong>
          </div>
          <div>
            <span class="cab-hud-tag">HULL INTEGRITY</span>
            <div class="hull-segments" aria-label="Hull integrity 100 percent">
              <i></i><i></i><i></i><i></i><i></i><i></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Holographic Sonar & Speed UI -->
      <div class="cab-hud-panel cab-hud-right">
        <div class="sonar-radar" aria-hidden="true">
          <div class="sonar-ring r1"></div>
          <div class="sonar-ring r2"></div>
          <div id="cab-ui-sonar-sweep" class="sonar-sweep"></div>
          <span class="sonar-blip b1"></span>
          <span class="sonar-blip b2"></span>
        </div>
        <div class="cab-sonar-stats">
          <span class="cab-hud-tag">SONAR // 4KM</span>
          <strong id="cab-ui-speed-val" class="cab-hud-val">158 km/h</strong>
          <div class="cab-throttle-mini">
            <span class="cab-hud-tag">THROTTLE</span>
            <div class="throttle-lever-track" aria-hidden="true">
              <div id="cab-ui-throttle-lever" class="throttle-lever-arm"></div>
            </div>
          </div>
        </div>
      </div>

      ${hotspotsHtml}
    </div>
  `;

  hud.bindHotspotButtons(cabEl);
}

function renderQuizQuestions(): void {
  const host = document.getElementById('quiz-questions-host');
  if (!host) return;
  host.innerHTML = SITE_CONFIG.quizQuestions
    .map(
      (q) => `
    <fieldset>
      <legend>${q.prompt}</legend>
      ${q.options
        .map(
          (opt) => `
        <label>
          <input type="radio" name="${q.id}" value="${opt.value}" required />
          <span>${opt.label}</span>
        </label>
      `
        )
        .join('')}
    </fieldset>
  `
    )
    .join('');
}

async function bootstrap(): Promise<void> {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  renderChapterSections();
  renderQuizQuestions();

  const videoCanvas = document.getElementById('video-canvas') as HTMLCanvasElement;
  const fxCanvasEl = document.getElementById('fx-canvas') as HTMLCanvasElement;

  const scrubber = new VideoScrubber(videoCanvas, reducedMotion);
  const fxCanvas = new FxOverlayCanvas(fxCanvasEl, reducedMotion);
  const audioEngine = new OceanAudioEngine();

  const hud = new HudController({
    audioEngine,
    fxCanvas,
    reducedMotion,
  });

  mountCabOverlay(hud);

  window.addEventListener(
    'resize',
    () => {
      scrubber.resize();
      fxCanvas.resize();
    },
    { passive: true }
  );

  window.addEventListener(
    'pointermove',
    (e) => {
      const target = e.target as HTMLElement | null;
      const isInteractive = Boolean(
        target?.closest('button, a, input, label, .hotspot-pin, .route-node')
      );
      fxCanvas.onPointerMove(e.clientX, e.clientY, isInteractive);
    },
    { passive: true }
  );

  // Train Headlight Loader tied to initial chapter preload progress
  const loaderEl = document.getElementById('loader');
  const progressFill = document.getElementById('loader-progress-fill');
  const pctEl = document.getElementById('loader-pct');

  await scrubber.preloadBoot((pct) => {
    if (progressFill) progressFill.style.transform = `scaleX(${(pct / 100).toFixed(3)})`;
    if (pctEl) pctEl.textContent = `${pct}%`;
  });

  // Render initial frame 0 before revealing stage
  scrubber.render(0, SITE_CONFIG.chapters[0].focalX, 1, 0);

  if (loaderEl) {
    loaderEl.classList.add('is-done');
    loaderEl.setAttribute('aria-hidden', 'true');
  }

  const timeline = initCinematicTimeline({
    scrubber,
    fxCanvas,
    audioEngine,
    hud,
    reducedMotion,
  });

  hud.setNavigationHandlers(
    (idx) => timeline.scrollToChapter(idx),
    () => timeline.scrollToTop()
  );

  // Keyboard chapter navigation (ArrowRight/Left & PageUp/PageDown)
  document.addEventListener('keydown', (e) => {
    const active = document.activeElement as HTMLElement | null;
    if (active?.closest('input, textarea, select')) return;

    const current = timeline.getActiveChapter();
    if (e.key === 'ArrowRight' || e.key === 'PageDown') {
      e.preventDefault();
      timeline.scrollToChapter(Math.min(SITE_CONFIG.chapters.length - 1, current + 1));
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      timeline.scrollToChapter(Math.max(0, current - 1));
    }
  });
}

void bootstrap();
