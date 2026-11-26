/**
 * PROGRESSIVE VIDEO & CANVAS FRAME-SEQUENCE SCRUBBER
 * ---------------------------------------------------------------------------
 * Supports two engines configurable in `SITE_CONFIG.playbackEngine`:
 *  1. 'frames' (default): Progressive WebP frame sequence decoded via
 *     `createImageBitmap`, drawn onto a cover-fitted `<canvas>` with:
 *       - Sub-frame crossfade blending for silky slow motion
 *       - Per-chapter mobile `focalX` crop keeping the train centered
 *       - Nearest-loaded-frame fallback (never flashes blank)
 *       - Chapters 0 + 1 preloaded before opening; Chapters 2..7 streamed
 *         progressively in the background (or prioritized on chapter jump)
 *  2. 'video': All-keyframe H.264 (-g 1) `<video>` scrubbed via currentTime
 *     inside requestAnimationFrame, with poster fallback on error.
 */

import { SITE_CONFIG, TierSpec } from '../config/siteConfig';

type FrameAsset = ImageBitmap | HTMLImageElement;

export class VideoScrubber {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private videoEl: HTMLVideoElement | null = null;
  private reducedMotion: boolean;
  private tier: TierSpec;

  private frames: (FrameAsset | null)[] = [];
  private loadingFlags: boolean[] = [];
  private posterImages: Map<number, HTMLImageElement> = new Map();
  private useVideoMode: boolean;

  private width = 0;
  private height = 0;
  private dpr = 1;
  private lastDrawnKey = '';
  private priorityIndex = 0;

  constructor(canvas: HTMLCanvasElement, reducedMotion: boolean) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('Unable to acquire 2D context for video-canvas');
    this.ctx = ctx;
    this.reducedMotion = reducedMotion;
    this.tier = this.selectTier();
    this.useVideoMode = !reducedMotion && SITE_CONFIG.playbackEngine === 'video';

    this.frames = new Array(this.tier.frameCount).fill(null);
    this.loadingFlags = new Array(this.tier.frameCount).fill(false);

    this.resize();
  }

  private selectTier(): TierSpec {
    const w = window.innerWidth;
    if (w < 768) return SITE_CONFIG.tiers.mobile;
    if (w < 1200) return SITE_CONFIG.tiers.laptop;
    return SITE_CONFIG.tiers.desktop;
  }

  resize(): void {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.lastDrawnKey = '';
  }

  private frameUrl(zeroBasedIndex: number): string {
    const clamped = Math.max(0, Math.min(this.tier.frameCount - 1, zeroBasedIndex));
    const numStr = String(clamped + 1).padStart(4, '0');
    return this.tier.pattern.replace('{index}', numStr);
  }

  private async fetchAndDecodeFrame(index: number): Promise<void> {
    if (index < 0 || index >= this.tier.frameCount) return;
    if (this.frames[index] || this.loadingFlags[index]) return;
    this.loadingFlags[index] = true;

    const url = this.frameUrl(index);
    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const blob = await resp.blob();

      if (typeof createImageBitmap === 'function') {
        const bitmap = await createImageBitmap(blob);
        this.frames[index] = bitmap;
      } else {
        const img = await this.loadHtmlImage(URL.createObjectURL(blob));
        this.frames[index] = img;
      }
    } catch {
      // Leave null; nearest loaded frame will cover cleanly
    } finally {
      this.loadingFlags[index] = false;
    }
  }

  private loadHtmlImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  /**
   * Preloads Chapters 0 + 1 frames (or reduced-motion poster frames) before
   * unlocking the headlight preloader.
   */
  async preloadBoot(onProgress: (pct: number) => void): Promise<void> {
    if (this.reducedMotion) {
      // Load lightweight chapter posters only
      const chapters = SITE_CONFIG.chapters;
      let done = 0;
      await Promise.all(
        chapters.map(async (ch) => {
          try {
            const img = await this.loadHtmlImage(ch.posterFallback);
            this.posterImages.set(ch.index, img);
          } catch {
            // ignore missing fallback
          } finally {
            done++;
            onProgress(Math.round((done / chapters.length) * 100));
          }
        })
      );
      return;
    }

    if (this.useVideoMode) {
      await this.initVideoEngine(onProgress);
      return;
    }

    // Chapters 0 + 1 cover 0.00s -> 1.95s
    const bootEndRatio = Math.min(1, 2.0 / SITE_CONFIG.durationSec);
    const bootCount = Math.max(12, Math.ceil(this.tier.frameCount * bootEndRatio));
    let decoded = 0;

    const queue = Array.from({ length: bootCount }, (_, i) => i);
    const workers = Array.from({ length: 6 }, async () => {
      while (queue.length > 0) {
        const idx = queue.shift();
        if (idx === undefined) break;
        await this.fetchAndDecodeFrame(idx);
        decoded++;
        onProgress(Math.min(100, Math.round((decoded / bootCount) * 100)));
      }
    });

    await Promise.all(workers);

    // Stream remaining chapters progressively in the background
    this.startBackgroundPreload(bootCount);
  }

  private startBackgroundPreload(startIndex: number): void {
    let cursor = startIndex;
    const worker = async () => {
      while (true) {
        // Check if user jumped ahead — decode around priorityIndex first
        let nextIdx: number | null = null;
        if (this.priorityIndex > 0) {
          for (let offset = 0; offset < 28; offset++) {
            const probe = Math.min(this.tier.frameCount - 1, this.priorityIndex + offset);
            if (!this.frames[probe] && !this.loadingFlags[probe]) {
              nextIdx = probe;
              break;
            }
          }
        }
        if (nextIdx === null) {
          while (cursor < this.tier.frameCount && (this.frames[cursor] || this.loadingFlags[cursor])) {
            cursor++;
          }
          if (cursor < this.tier.frameCount) {
            nextIdx = cursor++;
          }
        }
        if (nextIdx === null) break;
        await this.fetchAndDecodeFrame(nextIdx);
      }
    };

    for (let w = 0; w < 4; w++) {
      void worker();
    }
  }

  prioritizeTime(timeSec: number): void {
    const norm = Math.max(0, Math.min(1, timeSec / SITE_CONFIG.durationSec));
    this.priorityIndex = Math.floor(norm * (this.tier.frameCount - 1));
  }

  private async initVideoEngine(onProgress: (pct: number) => void): Promise<void> {
    const video = document.createElement('video');
    video.src = SITE_CONFIG.videoSources.scrub48fpsG1;
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.crossOrigin = 'anonymous';
    this.videoEl = video;

    await new Promise<void>((resolve) => {
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        onProgress(100);
        resolve();
      };
      video.addEventListener('canplaythrough', finish, { once: true });
      video.addEventListener(
        'progress',
        () => {
          if (video.buffered.length > 0 && video.duration) {
            const pct = Math.min(95, Math.round((video.buffered.end(0) / video.duration) * 100));
            onProgress(pct);
          }
        },
        { passive: true }
      );
      video.addEventListener(
        'error',
        () => {
          // Graceful automatic fallback to progressive frames
          this.useVideoMode = false;
          this.videoEl = null;
          finish();
        },
        { once: true }
      );
      setTimeout(finish, 4500);
      video.load();
    });

    if (!this.useVideoMode) {
      await this.preloadBoot(onProgress);
    }
  }

  /**
   * Renders the current scrubbed video timestamp with sub-frame blending,
   * focal-point crop, and subtle idle/velocity scale.
   */
  render(
    timeSec: number,
    focalX: number,
    scaleMultiplier: number,
    activeChapterIdx: number
  ): void {
    const { ctx, width, height } = this;

    if (this.reducedMotion) {
      const poster =
        this.posterImages.get(activeChapterIdx) ||
        this.posterImages.get(0);
      if (poster) {
        this.drawCover(poster, focalX, 1, 1);
      }
      return;
    }

    if (this.useVideoMode && this.videoEl && this.videoEl.readyState >= 2) {
      const target = Math.max(0, Math.min(SITE_CONFIG.durationSec, timeSec));
      if (Math.abs(this.videoEl.currentTime - target) > 0.008) {
        this.videoEl.currentTime = target;
      }
      this.drawCover(this.videoEl, focalX, scaleMultiplier, 1);
      return;
    }

    const norm = Math.max(0, Math.min(1, timeSec / SITE_CONFIG.durationSec));
    const exactFrame = norm * (this.tier.frameCount - 1);
    const idxA = Math.floor(exactFrame);
    const idxB = Math.min(this.tier.frameCount - 1, idxA + 1);
    const frac = exactFrame - idxA;

    const frameA = this.findNearestLoaded(idxA);
    const frameB = this.frames[idxB];

    if (!frameA) return;

    const drawKey = `${idxA}:${idxB}:${frac.toFixed(2)}:${focalX.toFixed(2)}:${scaleMultiplier.toFixed(4)}:${width}x${height}`;
    if (drawKey === this.lastDrawnKey) return;
    this.lastDrawnKey = drawKey;

    ctx.globalAlpha = 1;
    this.drawCover(frameA, focalX, scaleMultiplier, 1);

    // Smooth sub-frame blend eliminates stepping during ultra-slow dwell
    if (frameB && frameB !== frameA && frac > 0.04) {
      ctx.globalAlpha = frac;
      this.drawCover(frameB, focalX, scaleMultiplier, 1);
      ctx.globalAlpha = 1;
    }
  }

  private findNearestLoaded(targetIdx: number): FrameAsset | null {
    if (this.frames[targetIdx]) return this.frames[targetIdx];
    for (let d = 1; d < this.tier.frameCount; d++) {
      if (targetIdx - d >= 0 && this.frames[targetIdx - d]) {
        return this.frames[targetIdx - d];
      }
      if (targetIdx + d < this.tier.frameCount && this.frames[targetIdx + d]) {
        return this.frames[targetIdx + d];
      }
    }
    return null;
  }

  private drawCover(
    source: FrameAsset | HTMLVideoElement,
    focalX: number,
    scaleMultiplier: number,
    alpha: number
  ): void {
    const srcW =
      source instanceof HTMLVideoElement
        ? source.videoWidth || 1280
        : source.width;
    const srcH =
      source instanceof HTMLVideoElement
        ? source.videoHeight || 720
        : source.height;
    if (!srcW || !srcH) return;

    const { ctx, width, height } = this;
    const isPortraitMobile = width < 768 && height > width;

    if (isPortraitMobile) {
      // Frame the upper-middle cinema band so the entire train stays visible above the bottom glass sheet
      const cinemaHeight = height * 0.58;
      const scale = Math.max(width / srcW, cinemaHeight / srcH) * scaleMultiplier;
      const drawW = srcW * scale;
      const drawH = srcH * scale;
      const overflowX = Math.max(0, drawW - width);
      const offsetX = -overflowX * focalX;
      const offsetY = height * 0.08 + (cinemaHeight - drawH) * 0.5;

      ctx.fillStyle = '#020a11';
      if (alpha >= 0.99) {
        ctx.fillRect(0, 0, width, height);
      } else {
        ctx.globalAlpha = alpha;
      }
      ctx.drawImage(source, offsetX, offsetY, drawW, drawH);
      return;
    }

    const scale = Math.max(width / srcW, height / srcH) * scaleMultiplier;
    const drawW = srcW * scale;
    const drawH = srcH * scale;

    const overflowX = Math.max(0, drawW - width);
    const overflowY = Math.max(0, drawH - height);
    const offsetX = -overflowX * focalX;
    const offsetY = -overflowY * 0.5;

    if (alpha < 1) ctx.globalAlpha = alpha;
    ctx.drawImage(source, offsetX, offsetY, drawW, drawH);
  }
}
