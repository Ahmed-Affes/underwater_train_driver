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

      if (ch.tabs && ch.tabs.length > 0) {
        extraBlock += `
          <div class="chapter-tabs-box chapter-meta" data-chapter-tabs="${ch.index}">
            <div class="chapter-tabs-row" role="tablist" aria-label="Détails : ${ch.label}">
              ${ch.tabs
                .map(
                  (tab, tIdx) => `
                <button
                  type="button"
                  role="tab"
                  class="chapter-tab-btn ${tIdx === 0 ? 'is-active' : ''}"
                  aria-selected="${tIdx === 0 ? 'true' : 'false'}"
                  data-tab-target="${ch.index}-${tab.id}"
                >
                  ${tab.label}
                </button>
              `
                )
                .join('')}
            </div>
            <div class="chapter-tabs-panels">
              ${ch.tabs
                .map(
                  (tab, tIdx) => `
                <p
                  class="chapter-tab-panel ${tIdx === 0 ? 'is-active' : ''}"
                  data-tab-panel="${ch.index}-${tab.id}"
                  ${tIdx === 0 ? '' : 'hidden'}
                >
                  ${tab.text}
                </p>
              `
                )
                .join('')}
            </div>
          </div>
        `;
      }

      if (ch.fact && !isHero) {
        extraBlock += `<p class="chapter-fact chapter-meta">${ch.fact}</p>`;
      }

      if (ch.trainingSteps && ch.trainingSteps.length > 0) {
        extraBlock += `
          <ol class="city-steps-rail chapter-meta" aria-label="Parcours de formation">
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
              ${SITE_CONFIG.hud.quizButton}
            </button>
            <div class="recap-grid" aria-label="Synthèse du métier">
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

function bindChapterTabs(): void {
  const track = document.getElementById('scroll-track');
  if (!track) return;

  track.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('.chapter-tab-btn');
    if (!btn) return;
    const box = btn.closest<HTMLElement>('.chapter-tabs-box');
    const targetId = btn.dataset.tabTarget;
    if (!box || !targetId) return;

    box.querySelectorAll<HTMLButtonElement>('.chapter-tab-btn').forEach((b) => {
      const active = b === btn;
      b.classList.toggle('is-active', active);
      b.setAttribute('aria-selected', String(active));
    });

    box.querySelectorAll<HTMLElement>('.chapter-tab-panel').forEach((panel) => {
      const active = panel.dataset.tabPanel === targetId;
      panel.classList.toggle('is-active', active);
      panel.hidden = !active;
    });
  });
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
        aria-label="${spot.label} : ${spot.description}"
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
      <!-- Bulle du robot co-pilote -->
      <div class="robot-tip-bubble" role="note" aria-label="Message du robot co-pilote">
        <span class="robot-blink-eye" aria-hidden="true"></span>
        <span>${cabMedia.robotTip}</span>
      </div>

      <!-- Panneau gauche : Pression, Profondeur & Coque -->
      <div class="cab-hud-panel cab-hud-left">
        <div class="cab-hud-block">
          <span class="cab-hud-tag">PRESSION DE L'EAU</span>
          <strong id="cab-ui-pressure-val" class="cab-hud-val">11.8 ATM</strong>
          <div class="cab-bar-track" aria-hidden="true">
            <div id="cab-ui-pressure-bar" class="cab-bar-fill"></div>
          </div>
        </div>
        <div class="cab-hud-row">
          <div>
            <span class="cab-hud-tag">PROFONDEUR</span>
            <strong id="cab-ui-depth-val" class="cab-hud-sub">108m</strong>
          </div>
          <div>
            <span class="cab-hud-tag">COQUE ÉTANCHE</span>
            <div class="hull-segments" aria-label="Intégrité de la coque 100 pour cent">
              <i></i><i></i><i></i><i></i><i></i><i></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Panneau droit : Sonar, Vitesse & Manette -->
      <div class="cab-hud-panel cab-hud-right">
        <div class="sonar-radar" aria-hidden="true">
          <div class="sonar-ring r1"></div>
          <div class="sonar-ring r2"></div>
          <div id="cab-ui-sonar-sweep" class="sonar-sweep"></div>
          <span class="sonar-blip b1"></span>
          <span class="sonar-blip b2"></span>
        </div>
        <div class="cab-sonar-stats">
          <span class="cab-hud-tag">SONAR // 4 KM</span>
          <strong id="cab-ui-speed-val" class="cab-hud-val">240 km/h</strong>
          <div class="cab-throttle-mini">
            <span class="cab-hud-tag">MANETTE</span>
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

function renderDossierModal(): void {
  const tabsBar = document.getElementById('dossier-tabs-bar');
  const contentHost = document.getElementById('dossier-content-host');
  if (!tabsBar || !contentHost) return;

  tabsBar.innerHTML = SITE_CONFIG.dossierSections
    .map(
      (sec, idx) => `
      <button
        type="button"
        role="tab"
        class="dossier-tab-btn ${idx === 0 ? 'is-active' : ''}"
        aria-selected="${idx === 0 ? 'true' : 'false'}"
        data-dossier-tab="${sec.id}"
      >
        ${sec.tabLabel}
      </button>
    `
    )
    .join('');

  contentHost.innerHTML = SITE_CONFIG.dossierSections
    .map(
      (sec, idx) => `
      <section
        class="dossier-section ${idx === 0 ? 'is-active' : ''}"
        data-dossier-section="${sec.id}"
        ${idx === 0 ? '' : 'hidden'}
      >
        <h3 class="dossier-sec-title">${sec.title}</h3>
        ${sec.blocks
          .map(
            (blk) => `
          <div class="dossier-block">
            <h4>${blk.heading}</h4>
            ${(blk.paragraphs || []).map((p) => `<p>${p}</p>`).join('')}
            ${
              blk.bullets
                ? `<ul>${blk.bullets.map((b) => `<li>${b}</li>`).join('')}</ul>`
                : ''
            }
          </div>
        `
          )
          .join('')}
      </section>
    `
    )
    .join('');

  tabsBar.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('.dossier-tab-btn');
    if (!btn) return;
    const id = btn.dataset.dossierTab;
    tabsBar.querySelectorAll<HTMLButtonElement>('.dossier-tab-btn').forEach((b) => {
      const active = b === btn;
      b.classList.toggle('is-active', active);
      b.setAttribute('aria-selected', String(active));
    });
    contentHost.querySelectorAll<HTMLElement>('.dossier-section').forEach((sec) => {
      const active = sec.dataset.dossierSection === id;
      sec.classList.toggle('is-active', active);
      sec.hidden = !active;
    });
  });
}

async function bootstrap(): Promise<void> {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  renderChapterSections();
  bindChapterTabs();
  renderQuizQuestions();
  renderDossierModal();

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

  const loaderEl = document.getElementById('loader');
  const progressFill = document.getElementById('loader-progress-fill');
  const pctEl = document.getElementById('loader-pct');

  await scrubber.preloadBoot((pct) => {
    if (progressFill) progressFill.style.transform = `scaleX(${(pct / 100).toFixed(3)})`;
    if (pctEl) pctEl.textContent = `${pct}%`;
  });

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
