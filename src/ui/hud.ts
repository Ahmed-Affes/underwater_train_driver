/**
 * CONTRÔLEUR HUD, INFO-BULLES, DOSSIER COMPLET, QUIZ & FILM 4K
 * ---------------------------------------------------------------------------
 */

import { SITE_CONFIG, HotspotConfig } from '../config/siteConfig';
import { OceanAudioEngine } from '../audio/oceanAudio';
import { FxOverlayCanvas } from '../canvas/fxCanvas';

export class HudController {
  private audioEngine: OceanAudioEngine;
  private fxCanvas: FxOverlayCanvas;
  private reducedMotion: boolean;

  private topProgressFill = document.getElementById('top-progress-fill');
  private depthValEl = document.getElementById('hud-depth-val');
  private pressureValEl = document.getElementById('hud-pressure-val');
  private depthMarkerEl = document.getElementById('hud-depth-marker');
  private depthFillEl = document.getElementById('hud-depth-fill');
  private speedValEl = document.getElementById('hud-speed-val');
  private throttleStateEl = document.getElementById('hud-throttle-state');
  private throttleBarEl = document.getElementById('hud-throttle-fill');
  private routeListEl = document.getElementById('route-map-list');
  private hotspotsLayerEl = document.getElementById('hotspots-layer');
  private tooltipEl = document.getElementById('hotspot-tooltip');
  private tooltipTitleEl = document.getElementById('tooltip-title');
  private tooltipBodyEl = document.getElementById('tooltip-body');
  private soundBtnEl = document.getElementById('sound-toggle-btn');

  private onJumpToChapter: ((idx: number) => void) | null = null;
  private onReplay: (() => void) | null = null;
  private activeChapterIndex = -1;

  constructor(opts: {
    audioEngine: OceanAudioEngine;
    fxCanvas: FxOverlayCanvas;
    reducedMotion: boolean;
  }) {
    this.audioEngine = opts.audioEngine;
    this.fxCanvas = opts.fxCanvas;
    this.reducedMotion = opts.reducedMotion;

    this.buildRouteMap();
    this.bindSoundToggle();
    this.bindVideoModal();
    this.bindQuizModal();
    this.bindDossierModal();
    this.bindDismissTooltip();
    this.setActiveChapter(0);
  }

  setNavigationHandlers(onJump: (idx: number) => void, onReplay: () => void): void {
    this.onJumpToChapter = onJump;
    this.onReplay = onReplay;
    this.bindArrivalControls();
  }

  private buildRouteMap(): void {
    if (!this.routeListEl) return;
    this.routeListEl.innerHTML = SITE_CONFIG.chapters
      .map(
        (ch) => `
      <li>
        <button
          type="button"
          class="route-node"
          data-chapter-jump="${ch.index}"
          aria-label="Aller à : ${ch.label}"
        >
          <span class="route-dot" aria-hidden="true"></span>
          <span class="route-label">${ch.label}</span>
        </button>
      </li>
    `
      )
      .join('');

    this.routeListEl.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-chapter-jump]');
      if (!btn || !this.onJumpToChapter) return;
      this.onJumpToChapter(Number(btn.dataset.chapterJump));
    });
  }

  setActiveChapter(index: number): void {
    if (index === this.activeChapterIndex) return;
    this.activeChapterIndex = index;

    if (this.routeListEl) {
      const nodes = this.routeListEl.querySelectorAll<HTMLElement>('.route-node');
      nodes.forEach((node, i) => {
        const isCurrent = i === index;
        node.classList.toggle('is-active', isCurrent);
        node.classList.toggle('is-visited', i < index);
        if (isCurrent) {
          node.setAttribute('aria-current', 'step');
        } else {
          node.removeAttribute('aria-current');
        }
      });
    }

    const chapter = SITE_CONFIG.chapters[index];
    this.renderChapterHotspots(chapter?.hotspots || []);
  }

  updateTelemetry(data: {
    depth: number;
    pressure: number;
    speed: number;
    velocityNorm: number;
    progress: number;
    isStarted: boolean;
  }): void {
    const { depth, pressure, speed, velocityNorm, progress, isStarted } = data;

    if (this.topProgressFill) {
      this.topProgressFill.style.transform = `scaleX(${Math.max(0.01, progress).toFixed(4)})`;
    }
    if (this.depthValEl) {
      this.depthValEl.textContent = `${Math.round(depth)}m`;
    }
    if (this.pressureValEl) {
      this.pressureValEl.textContent = `${pressure.toFixed(1)} ATM`;
    }
    const depthRatio = Math.min(1, Math.max(0.01, depth / 380));
    if (this.depthFillEl) {
      this.depthFillEl.style.transform = `scaleY(${depthRatio.toFixed(3)})`;
    }
    if (this.depthMarkerEl) {
      this.depthMarkerEl.style.top = `${(depthRatio * 100).toFixed(1)}%`;
    }

    if (this.speedValEl) {
      this.speedValEl.textContent = `${speed} km/h`;
    }
    if (this.throttleStateEl) {
      const mode =
        !isStarted || speed < 8
          ? SITE_CONFIG.hud.throttleIdle
          : velocityNorm > 0.45 || speed >= 230
          ? SITE_CONFIG.hud.throttleFull
          : SITE_CONFIG.hud.throttleCruise;
      this.throttleStateEl.textContent = mode;
    }
    if (this.throttleBarEl) {
      const ratio = Math.min(1, Math.max(0.04, speed / 270));
      this.throttleBarEl.style.transform = `scaleX(${ratio.toFixed(3)})`;
    }
  }

  private renderChapterHotspots(spots: HotspotConfig[]): void {
    if (!this.hotspotsLayerEl) return;
    this.hideTooltip();

    if (spots.length === 0) {
      this.hotspotsLayerEl.innerHTML = '';
      return;
    }

    this.hotspotsLayerEl.innerHTML = spots
      .map(
        (spot) => `
      <button
        type="button"
        class="hotspot-pin"
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

    this.bindHotspotButtons(this.hotspotsLayerEl);
  }

  bindHotspotButtons(container: HTMLElement): void {
    container.querySelectorAll<HTMLElement>('.hotspot-pin').forEach((pin) => {
      pin.addEventListener('pointerenter', (e) => {
        if (e.pointerType !== 'touch') this.showTooltip(pin);
      });
      pin.addEventListener('focus', () => this.showTooltip(pin));
      pin.addEventListener('pointerleave', (e) => {
        if (e.pointerType !== 'touch') this.hideTooltip();
      });
      pin.addEventListener('blur', () => this.hideTooltip());
      pin.addEventListener('click', (e) => {
        e.stopPropagation();
        this.showTooltip(pin);
      });
    });
  }

  private showTooltip(pinEl: HTMLElement): void {
    if (!this.tooltipEl || !this.tooltipTitleEl || !this.tooltipBodyEl) return;
    const rect = pinEl.getBoundingClientRect();
    this.tooltipTitleEl.textContent = pinEl.dataset.title || '';
    this.tooltipBodyEl.textContent = pinEl.dataset.fact || '';

    const tipWidth = 285;
    const x = Math.min(window.innerWidth - tipWidth - 16, Math.max(16, rect.left - tipWidth * 0.35));
    const y = rect.top > 165 ? rect.top - 115 : rect.bottom + 14;
    this.tooltipEl.style.transform = `translate3d(${x.toFixed(0)}px, ${y.toFixed(0)}px, 0)`;
    this.tooltipEl.classList.add('is-visible');
    this.tooltipEl.setAttribute('aria-hidden', 'false');
  }

  hideTooltip(): void {
    if (!this.tooltipEl) return;
    this.tooltipEl.classList.remove('is-visible');
    this.tooltipEl.setAttribute('aria-hidden', 'true');
  }

  private bindDismissTooltip(): void {
    document.addEventListener('click', (e) => {
      if (!(e.target as HTMLElement).closest('.hotspot-pin')) {
        this.hideTooltip();
      }
    });
  }

  private bindSoundToggle(): void {
    if (!this.soundBtnEl) return;
    this.soundBtnEl.addEventListener('click', () => {
      const on = this.audioEngine.toggle();
      this.soundBtnEl?.setAttribute('aria-pressed', String(on));
      this.soundBtnEl?.classList.toggle('is-on', on);
      const label = this.soundBtnEl?.querySelector('.sound-label');
      if (label) {
        label.textContent = on ? SITE_CONFIG.hud.audioOn : SITE_CONFIG.hud.audioOff;
      }
    });
  }

  private bindArrivalControls(): void {
    const ctaBtn = document.getElementById('cta-training-btn');
    const replayBtn = document.getElementById('replay-journey-btn');
    const quizTriggerBtn = document.getElementById('open-quiz-btn');

    if (ctaBtn && !this.reducedMotion) {
      ctaBtn.addEventListener('mousemove', (e) => {
        const rect = ctaBtn.getBoundingClientRect();
        const dx = (e.clientX - (rect.left + rect.width / 2)) * 0.25;
        const dy = (e.clientY - (rect.top + rect.height / 2)) * 0.25;
        ctaBtn.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0)`;
      });
      ctaBtn.addEventListener('mouseleave', () => {
        ctaBtn.style.transform = 'translate3d(0, 0, 0)';
      });
    }

    ctaBtn?.addEventListener('click', () => this.openDossierModal());
    quizTriggerBtn?.addEventListener('click', () => this.openQuizModal());
    replayBtn?.addEventListener('click', () => {
      if (this.onReplay) this.onReplay();
    });
  }

  private openDossierModal(): void {
    const modal = document.getElementById('dossier-modal');
    const closeBtn = document.getElementById('close-dossier-modal');
    if (!modal) return;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    closeBtn?.focus();
  }

  private bindDossierModal(): void {
    const openBtn = document.getElementById('open-dossier-btn');
    const modal = document.getElementById('dossier-modal');
    const closeBtn = document.getElementById('close-dossier-modal');
    if (!modal) return;

    const closeModal = () => {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      openBtn?.focus();
    };

    openBtn?.addEventListener('click', () => this.openDossierModal());
    closeBtn?.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
    });
  }

  private openQuizModal(): void {
    const modal = document.getElementById('training-modal');
    const closeBtn = document.getElementById('close-training-modal');
    if (!modal) return;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    closeBtn?.focus();
  }

  private bindQuizModal(): void {
    const modal = document.getElementById('training-modal');
    const closeBtn = document.getElementById('close-training-modal');
    const form = document.getElementById('training-check-form') as HTMLFormElement | null;
    const resultEl = document.getElementById('training-result');

    if (!modal) return;

    const closeModal = () => {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.getElementById('open-quiz-btn')?.focus();
    };

    closeBtn?.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
    });

    if (form && resultEl) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const data = new FormData(form);
        let score = 0;
        for (const q of SITE_CONFIG.quizQuestions) {
          if (data.get(q.id) === q.correctValue) score++;
        }

        resultEl.hidden = false;
        if (score === SITE_CONFIG.quizQuestions.length) {
          this.fxCanvas.emitCelebrationBurst();
          resultEl.innerHTML = `
            <div class="cadet-pass-card">
              <span class="pass-badge">BREVET D'APPRENTI CONDUCTEUR // VALIDÉ</span>
              <strong>3/3 bonnes réponses — Prêt pour le simulateur Secteur 04</strong>
              <p>Maîtrise des trois métiers, réflexe d'urgence sous-marine et parcours complet validés.</p>
            </div>
          `;
        } else {
          resultEl.innerHTML = `
            <div class="cadet-pass-card is-retry">
              <strong>${score}/3 bonnes réponses</strong>
              <p>Indice : le conducteur réunit train, sous-marin et pilote ; reste calme et alerte la surface en cas de fuite ; et valide études, simulateur, secours et contrôles médicaux.</p>
            </div>
          `;
        }
      });
    }
  }

  private bindVideoModal(): void {
    const openBtn = document.getElementById('open-film-btn');
    const modal = document.getElementById('video-modal');
    const closeBtn = document.getElementById('close-video-modal');
    const videoEl = document.getElementById('concept-video-player') as HTMLVideoElement | null;

    if (!openBtn || !modal || !videoEl) return;

    const close = () => {
      videoEl.pause();
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      openBtn.focus();
    };

    openBtn.addEventListener('click', () => {
      if (!videoEl.getAttribute('src')) {
        videoEl.src = SITE_CONFIG.videoSources.conceptFilmMp4;
        videoEl.poster = SITE_CONFIG.videoSources.conceptFilmPoster;
      }
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      videoEl.play().catch(() => {});
      closeBtn?.focus();
    });

    closeBtn?.addEventListener('click', close);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) close();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) close();
    });
  }
}
