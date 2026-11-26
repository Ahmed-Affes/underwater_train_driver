/**
 * LAZY-LOADING CHAPTER ASSET MANAGER & HEADLIGHT PRELOADER
 * ---------------------------------------------------------------------------
 * - Runs the brief Train Headlight loading reveal for initial boot.
 * - Creates `<picture>` backdrop layers per chapter with AVIF + WebP sources.
 * - Lazy-loads chapter artwork only when needed and preloads ONLY chapter N+1.
 */

import { ASSETS } from '../config/assets.js';
import { CHAPTERS } from '../config/chapters.js';

export class ChapterAssetManager {
  constructor(backdropHost) {
    this.backdropHost = backdropHost;
    this.loadedChapters = new Set();
    this.plates = new Map();
    this.supportsAvif = null;

    this._buildEmptyPlates();
  }

  _buildEmptyPlates() {
    for (const ch of CHAPTERS) {
      const cfg = ASSETS.chapters[ch.id];
      const div = document.createElement('div');
      div.className = 'bg-plate';
      div.dataset.chapter = ch.id;
      div.style.setProperty('--plate-opacity', cfg?.opacity ?? 0.45);

      const picture = document.createElement('picture');
      const srcAvif = document.createElement('source');
      srcAvif.type = 'image/avif';
      const srcWebp = document.createElement('source');
      srcWebp.type = 'image/webp';
      const img = document.createElement('img');
      img.alt = cfg?.alt || ch.label;
      img.decoding = 'async';
      img.loading = 'lazy';

      picture.appendChild(srcAvif);
      picture.appendChild(srcWebp);
      picture.appendChild(img);
      div.appendChild(picture);
      this.backdropHost.appendChild(div);

      this.plates.set(ch.index, {
        el: div,
        srcAvif,
        srcWebp,
        img,
        cfg,
      });
    }
  }

  /**
   * Activates chapter `index` image and preloads ONLY `index + 1`.
   */
  activateChapter(index) {
    this._loadChapterImage(index);
    if (index + 1 < CHAPTERS.length) {
      this._loadChapterImage(index + 1);
    }
  }

  _loadChapterImage(index) {
    if (this.loadedChapters.has(index)) return;
    const entry = this.plates.get(index);
    if (!entry || !entry.cfg) return;

    this.loadedChapters.add(index);
    if (entry.cfg.avif) entry.srcAvif.srcset = entry.cfg.avif;
    if (entry.cfg.webp) entry.srcWebp.srcset = entry.cfg.webp;
    entry.img.src = entry.cfg.webp || entry.cfg.avif || '';
    entry.img.addEventListener(
      'load',
      () => {
        entry.el.classList.add('is-loaded');
      },
      { once: true }
    );
  }

  getPlateElement(index) {
    return this.plates.get(index)?.el || null;
  }
}

/**
 * Animates the Train Headlight Loader and resolves once Chapter 0 + fonts are ready.
 */
export function runInitialLoader(assetManager) {
  const loader = document.getElementById('loader');
  const progressBar = document.getElementById('loader-progress-fill');
  const pctEl = document.getElementById('loader-pct');

  // Load only Chapter 0 & preload Chapter 1 at boot
  assetManager.activateChapter(0);

  return new Promise((resolve) => {
    let pct = 0;
    const step = () => {
      pct = Math.min(100, pct + (pct < 70 ? 14 : 9));
      if (progressBar) progressBar.style.transform = `scaleX(${pct / 100})`;
      if (pctEl) pctEl.textContent = `${pct}%`;

      if (pct < 100) {
        requestAnimationFrame(step);
      } else {
        setTimeout(() => {
          if (loader) {
            loader.classList.add('is-done');
            loader.setAttribute('aria-hidden', 'true');
          }
          resolve();
        }, 220);
      }
    };

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => requestAnimationFrame(step));
    } else {
      requestAnimationFrame(step);
    }
  });
}
