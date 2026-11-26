/**
 * HUD, INTERACTIVE HOTSPOTS, MAGNETIC CTA & TRAINING MODAL
 * ---------------------------------------------------------------------------
 */

import { CHAPTERS } from '../config/chapters.js';
import { ASSETS } from '../config/assets.js';

export class HudController {
  constructor({ audioEngine, onJumpToChapter, reducedMotion = false }) {
    this.audioEngine = audioEngine;
    this.onJumpToChapter = onJumpToChapter;
    this.reducedMotion = reducedMotion;

    this.depthValEl = document.getElementById('hud-depth-val');
    this.pressureValEl = document.getElementById('hud-pressure-val');
    this.depthBarFillEl = document.getElementById('hud-depth-fill');
    this.speedValEl = document.getElementById('hud-speed-val');
    this.throttleStateEl = document.getElementById('hud-throttle-state');
    this.throttleBarEl = document.getElementById('hud-throttle-fill');
    this.routeListEl = document.getElementById('route-map-list');
    this.hotspotsLayerEl = document.getElementById('hotspots-layer');
    this.tooltipEl = document.getElementById('hotspot-tooltip');
    this.tooltipTitleEl = document.getElementById('tooltip-title');
    this.tooltipBodyEl = document.getElementById('tooltip-body');
    this.soundBtnEl = document.getElementById('sound-toggle-btn');

    this.activeChapterIndex = -1;
    this._buildRouteMap();
    this._bindSoundToggle();
    this._bindMagneticCta();
    this._bindTrainingModal();
    this._bindVideoModal();
    this.setActiveChapter(0);
  }

  _buildRouteMap() {
    if (!this.routeListEl) return;
    this.routeListEl.innerHTML = CHAPTERS.map(
      (ch) => `
      <li>
        <button
          type="button"
          class="route-node"
          data-chapter-jump="${ch.index}"
          aria-label="Jump to ${ch.label}"
        >
          <span class="route-dot" aria-hidden="true"></span>
          <span class="route-label">${ch.label}</span>
        </button>
      </li>
    `
    ).join('');

    this.routeListEl.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-chapter-jump]');
      if (!btn) return;
      const idx = Number(btn.dataset.chapterJump);
      if (this.onJumpToChapter) this.onJumpToChapter(idx);
    });
  }

  setJumpHandler(fn) {
    this.onJumpToChapter = fn;
  }

  setActiveChapter(index) {
    if (index === this.activeChapterIndex) return;
    this.activeChapterIndex = index;

    if (this.routeListEl) {
      const nodes = this.routeListEl.querySelectorAll('.route-node');
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

    this._renderHotspots(CHAPTERS[index]);
  }

  updateTelemetry({ depth, pressure, speed, velocityNorm }) {
    if (this.depthValEl) {
      this.depthValEl.textContent = `${Math.round(depth)}m`;
    }
    if (this.pressureValEl) {
      this.pressureValEl.textContent = `${pressure.toFixed(1)} ATM`;
    }
    if (this.depthBarFillEl) {
      const depthPct = Math.min(100, Math.max(2, (depth / 380) * 100));
      this.depthBarFillEl.style.transform = `scaleY(${(depthPct / 100).toFixed(3)})`;
    }
    if (this.speedValEl) {
      this.speedValEl.textContent = `${speed} km/h`;
    }
    if (this.throttleStateEl) {
      this.throttleStateEl.textContent =
        velocityNorm > 0.45 ? 'HYPER-GLIDE' : speed > 10 ? 'CRUISE' : 'IDLE';
    }
    if (this.throttleBarEl) {
      const fill = Math.min(1, Math.max(0.06, speed / 210 + velocityNorm * 0.25));
      this.throttleBarEl.style.transform = `scaleX(${fill.toFixed(3)})`;
    }
  }

  _renderHotspots(chapter) {
    if (!this.hotspotsLayerEl) return;
    this.hideTooltip();

    if (!chapter || !chapter.hotspots || chapter.hotspots.length === 0) {
      this.hotspotsLayerEl.innerHTML = '';
      return;
    }

    this.hotspotsLayerEl.innerHTML = chapter.hotspots
      .map(
        (spot) => `
      <button
        type="button"
        class="hotspot-pin"
        style="left: ${spot.x}%; top: ${spot.y}%;"
        data-title="${spot.title}"
        data-fact="${spot.fact}"
        aria-label="${spot.title}: ${spot.fact}"
      >
        <span class="hotspot-ring" aria-hidden="true"></span>
        <span class="hotspot-core" aria-hidden="true"></span>
        <span class="hotspot-tag">${spot.title}</span>
      </button>
    `
      )
      .join('');

    this.hotspotsLayerEl.querySelectorAll('.hotspot-pin').forEach((pin) => {
      pin.addEventListener('mouseenter', () => this.showTooltip(pin));
      pin.addEventListener('focus', () => this.showTooltip(pin));
      pin.addEventListener('mouseleave', () => this.hideTooltip());
      pin.addEventListener('blur', () => this.hideTooltip());
      pin.addEventListener('click', () => this.showTooltip(pin));
    });
  }

  showTooltip(pinEl) {
    if (!this.tooltipEl) return;
    const rect = pinEl.getBoundingClientRect();
    this.tooltipTitleEl.textContent = pinEl.dataset.title || '';
    this.tooltipBodyEl.textContent = pinEl.dataset.fact || '';

    const x = Math.min(window.innerWidth - 290, Math.max(16, rect.left - 90));
    const y = Math.max(72, rect.top - 110);
    this.tooltipEl.style.transform = `translate3d(${x.toFixed(0)}px, ${y.toFixed(0)}px, 0)`;
    this.tooltipEl.classList.add('is-visible');
    this.tooltipEl.setAttribute('aria-hidden', 'false');
  }

  hideTooltip() {
    if (!this.tooltipEl) return;
    this.tooltipEl.classList.remove('is-visible');
    this.tooltipEl.setAttribute('aria-hidden', 'true');
  }

  _bindSoundToggle() {
    if (!this.soundBtnEl) return;
    this.soundBtnEl.addEventListener('click', () => {
      const on = this.audioEngine.toggle();
      this.soundBtnEl.setAttribute('aria-pressed', String(on));
      this.soundBtnEl.classList.toggle('is-on', on);
      const label = this.soundBtnEl.querySelector('.sound-label');
      if (label) label.textContent = on ? 'Ocean Audio: On' : 'Ocean Audio: Off';
    });
  }

  _bindMagneticCta() {
    const btn = document.getElementById('cta-training-btn');
    if (!btn || this.reducedMotion) return;

    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const dx = (e.clientX - (rect.left + rect.width / 2)) * 0.28;
      const dy = (e.clientY - (rect.top + rect.height / 2)) * 0.28;
      btn.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate3d(0, 0, 0)';
    });
  }

  _bindTrainingModal() {
    const openBtn = document.getElementById('cta-training-btn');
    const modal = document.getElementById('training-modal');
    const closeBtn = document.getElementById('close-training-modal');
    const form = document.getElementById('training-check-form');
    const resultEl = document.getElementById('training-result');

    if (!openBtn || !modal) return;

    const closeModal = () => {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      openBtn.focus();
    };

    openBtn.addEventListener('click', () => {
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      closeBtn?.focus();
    });

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
        const q1 = data.get('q1');
        const q2 = data.get('q2');
        const q3 = data.get('q3');
        let score = 0;
        if (q1 === 'pressure') score++;
        if (q2 === 'slow') score++;
        if (q3 === '300') score++;

        resultEl.hidden = false;
        resultEl.innerHTML =
          score === 3
            ? `<strong>Cleared for Simulator Bay 04!</strong> 3/3 checks passed. Your Abyssline Cadet Pass is ready.`
            : `<strong>${score}/3 Checks Passed.</strong> Tip: Pilots watch pressure readings (not weather), ease speed in kelp forests, and log 300 simulator hours.`;
      });
    }
  }

  _bindVideoModal() {
    const openBtn = document.getElementById('open-film-btn');
    const modal = document.getElementById('video-modal');
    const closeBtn = document.getElementById('close-video-modal');
    const videoEl = document.getElementById('concept-video-player');

    if (!openBtn || !modal || !videoEl) return;

    const close = () => {
      videoEl.pause();
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
    };

    openBtn.addEventListener('click', () => {
      // Lazy-attach video src only when user explicitly opens the film reel
      if (!videoEl.getAttribute('src')) {
        videoEl.setAttribute('src', ASSETS.conceptVideo.mp4);
        videoEl.setAttribute('poster', ASSETS.conceptVideo.poster);
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
