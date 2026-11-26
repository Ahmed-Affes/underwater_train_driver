/**
 * PROGRESSIVE VIDEO & CANVAS FRAME-SEQUENCE SCRUBBER
 * ---------------------------------------------------------------------------
 * Supports two engines configurable in `SITE_CONFIG.playbackEngine`:
 *  1. 'frames' (default): Progressive WebP frame sequence with compact Blob
 *     storage and a bounded sliding-window ImageBitmap cache for silky
 *     forward & backward scrubbing at full devicePixelRatio sharpness.
 *     - Desktop (>= 1200px) always loads the highest 1080p tier (480 frames).
 *     - Tablet (768–1199px) loads 720p (400 frames).
 *     - Mobile (< 768px) loads 540p (320 frames).
 *     - Preloads Chapters 0–2 before unlocking the headlight loader, then
 *       streams the rest in the background (prioritizing chapter jumps).
 *  2. 'video': Direct `<video>` scrubbed via currentTime with poster fallback.
 */

import { SITE_CONFIG, TierSpec } from '../config/siteConfig';

type FrameAsset = ImageBitmap | HTMLImageElement;

export class VideoScrubber {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private videoEl: HTMLVideoElement | null = null;
  private reducedMotion: boolean;
  private tier: TierSpec;

  private frameBlobs: (Blob | null)[] = [];
  private decodedFrames: Map<number, FrameAsset> = new Map();
  private fetchingFlags: boolean[] = [];
  private decodingFlags: boolean[] = [];
  private posterImages: Map<number, HTMLImageElement> = new Map();
  private useVideoMode: boolean;

  private maxDecodedCache: number;
  private decodeRadius = 18;
  private width = 0;
  private height = 0;
  private dpr = 1;
  private lastDrawnKey = '';
  private lastFocalX = 0.5;
  private lastScale = 1;
  private lastDriftX = 0;
  private lastDriftY = 0;
  private lastTargetIdx = 0;
  private priorityIndex = 0;

  constructor(canvas: HTMLCanvasElement, reducedMotion: boolean) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('Unable to acquire 2D context for video-canvas');
    this.ctx = ctx;
    this.reducedMotion = reducedMotion;
    this.tier = this.selectTier();
    this.useVideoMode = !reducedMotion && SITE_CONFIG.playbackEngine === 'video';
    this.maxDecodedCache = this.tier.id === 'mobile' ? 48 : 72;

    this.frameBlobs = new Array(this.tier.frameCount).fill(null);
    this.fetchingFlags = new Array(this.tier.frameCount).fill(false);
    this.decodingFlags = new Array(this.tier.frameCount).fill(false);

    this.resize();
  }

  private selectTier(): TierSpec {
    const w = window.innerWidth;
    if (w < 768) return SITE_CONFIG.tiers.mobile;
    if (w < 1200) return SITE_CONFIG.tiers.tablet;
    return SITE_CONFIG.tiers.desktop;
  }

  resize(): void {
    this.dpr = Math.min(window.devicePixelRatio || 1, 3);
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.lastDrawnKey = '';
  }

  private frameUrl(zeroBasedIndex: number): string {
    const clamped = Math.max(0, Math.min(this.tier.frameCount - 1, zeroBasedIndex));
    const numStr = String(clamped + 1).padStart(4, '0');
    return this.tier.pattern.replace('{index}', numStr);
  }

  private async fetchBlob(index: number): Promise<Blob | null> {
    if (index < 0 || index >= this.tier.frameCount) return null;
    if (this.frameBlobs[index]) return this.frameBlobs[index];
    if (this.fetchingFlags[index]) return null;
    this.fetchingFlags[index] = true;

    try {
      const resp = await fetch(this.frameUrl(index));
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const blob = await resp.blob();
      this.frameBlobs[index] = blob;
      return blob;
    } catch {
      return null;
    } finally {
      this.fetchingFlags[index] = false;
    }
  }

  private async decodeFrame(index: number, centerIdx: number): Promise<void> {
    if (index < 0 || index >= this.tier.frameCount) return;
    if (this.decodedFrames.has(index) || this.decodingFlags[index]) return;

    let blob = this.frameBlobs[index];
    if (!blob) {
      blob = await this.fetchBlob(index);
    }
    if (!blob || this.decodedFrames.has(index)) return;

    this.decodingFlags[index] = true;
    try {
      let asset: FrameAsset;
      if (typeof createImageBitmap === 'function') {
        asset = await createImageBitmap(blob);
      } else {
        asset = await this.loadHtmlImage(URL.createObjectURL(blob));
      }
      this.decodedFrames.set(index, asset);
      this.evictFarthest(centerIdx);

      // If this frame is right where the user currently sits, repaint immediately
      if (index === this.lastTargetIdx) {
        this.lastDrawnKey = '';
        this.drawAssetNow(asset, this.lastFocalX, this.lastScale, this.lastDriftX, this.lastDriftY);
      }
    } catch {
      // Nearest loaded frame covers cleanly
    } finally {
      this.decodingFlags[index] = false;
    }
  }

  private evictFarthest(centerIdx: number): void {
    while (this.decodedFrames.size > this.maxDecodedCache) {
      let farthestKey = -1;
      let maxDist = -1;
      for (const k of this.decodedFrames.keys()) {
        const d = Math.abs(k - centerIdx);
        if (d > maxDist) {
          maxDist = d;
          farthestKey = k;
        }
      }
      if (farthestKey === -1) break;
      const old = this.decodedFrames.get(farthestKey);
      if (old && 'close' in old && typeof old.close === 'function') {
        old.close();
      }
      this.decodedFrames.delete(farthestKey);
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
   * Preloads initial chapters (Ch 0..2) so scrubbing unlocks smoothly before
   * streaming the rest progressively in the background.
   */
  async preloadBoot(onProgress: (pct: number) => void): Promise<void> {
    if (this.reducedMotion) {
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

    const initialEndSec = SITE_CONFIG.chapters[2]?.videoEnd ?? 3.0;
    const bootEndRatio = Math.min(1, initialEndSec / SITE_CONFIG.durationSec);
    const bootCount = Math.max(16, Math.ceil(this.tier.frameCount * bootEndRatio));
    let loaded = 0;

    const queue = Array.from({ length: bootCount }, (_, i) => i);
    const workers = Array.from({ length: 6 }, async () => {
      while (queue.length > 0) {
        const idx = queue.shift();
        if (idx === undefined) break;
        await this.fetchBlob(idx);
        if (idx < this.maxDecodedCache) {
          await this.decodeFrame(idx, 0);
        }
        loaded++;
        onProgress(Math.min(100, Math.round((loaded / bootCount) * 100)));
      }
    });

    await Promise.all(workers);
    this.startBackgroundPreload(bootCount);
  }

  private startBackgroundPreload(startIndex: number): void {
    let cursor = startIndex;
    const worker = async () => {
      while (true) {
        let nextIdx: number | null = null;
        if (this.priorityIndex > 0) {
          for (let offset = -8; offset < 36; offset++) {
            const probe = Math.max(0, Math.min(this.tier.frameCount - 1, this.priorityIndex + offset));
            if (!this.frameBlobs[probe] && !this.fetchingFlags[probe]) {
              nextIdx = probe;
              break;
            }
          }
        }
        if (nextIdx === null) {
          while (
            cursor < this.tier.frameCount &&
            (this.frameBlobs[cursor] || this.fetchingFlags[cursor])
          ) {
            cursor++;
          }
          if (cursor < this.tier.frameCount) {
            nextIdx = cursor++;
          }
        }
        if (nextIdx === null) break;
        await this.fetchBlob(nextIdx);
      }
    };

    for (let w = 0; w < 4; w++) {
      void worker();
    }
  }

  prioritizeTime(timeSec: number): void {
    const norm = Math.max(0, Math.min(1, timeSec / SITE_CONFIG.durationSec));
    const idx = Math.floor(norm * (this.tier.frameCount - 1));
    this.priorityIndex = idx;
    this.warmWindow(idx);
  }

  private warmWindow(centerIdx: number): void {
    if (!this.decodedFrames.has(centerIdx)) {
      void this.decodeFrame(centerIdx, centerIdx);
    }
    for (let offset = 1; offset <= this.decodeRadius; offset++) {
      const fwd = centerIdx + offset;
      const bwd = centerIdx - offset;
      if (fwd < this.tier.frameCount && this.frameBlobs[fwd] && !this.decodedFrames.has(fwd)) {
        void this.decodeFrame(fwd, centerIdx);
      }
      if (bwd >= 0 && this.frameBlobs[bwd] && !this.decodedFrames.has(bwd)) {
        void this.decodeFrame(bwd, centerIdx);
      }
    }
  }

  private async initVideoEngine(onProgress: (pct: number) => void): Promise<void> {
    const video = document.createElement('video');
    video.src = SITE_CONFIG.videoSources.conceptFilmMp4;
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

  render(
    timeSec: number,
    focalX: number,
    scaleMultiplier: number,
    activeChapterIdx: number,
    driftX = 0,
    driftY = 0
  ): void {
    const clampedScale = Math.min(1.05, Math.max(1.0, scaleMultiplier));

    if (this.reducedMotion) {
      const poster =
        this.posterImages.get(activeChapterIdx) ||
        this.posterImages.get(0);
      if (poster) {
        this.drawCover(poster, focalX, 1, 0, 0);
      }
      return;
    }

    if (this.useVideoMode && this.videoEl && this.videoEl.readyState >= 2) {
      const target = Math.max(0, Math.min(SITE_CONFIG.durationSec, timeSec));
      if (Math.abs(this.videoEl.currentTime - target) > 0.008) {
        this.videoEl.currentTime = target;
      }
      this.drawCover(this.videoEl, focalX, clampedScale, driftX, driftY);
      return;
    }

    const norm = Math.max(0, Math.min(1, timeSec / SITE_CONFIG.durationSec));
    const idx = Math.max(0, Math.min(this.tier.frameCount - 1, Math.round(norm * (this.tier.frameCount - 1))));

    this.lastTargetIdx = idx;
    this.lastFocalX = focalX;
    this.lastScale = clampedScale;
    this.lastDriftX = driftX;
    this.lastDriftY = driftY;

    this.warmWindow(idx);

    const frame = this.findNearestDecoded(idx);
    if (!frame) return;

    const drawKey = `${idx}:${focalX.toFixed(2)}:${clampedScale.toFixed(4)}:${driftX.toFixed(2)}:${driftY.toFixed(2)}:${this.width}x${this.height}`;
    if (drawKey === this.lastDrawnKey) return;
    this.lastDrawnKey = drawKey;

    this.drawAssetNow(frame, focalX, clampedScale, driftX, driftY);
  }

  private drawAssetNow(
    frame: FrameAsset,
    focalX: number,
    scaleMultiplier: number,
    driftX: number,
    driftY: number
  ): void {
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
    this.ctx.globalAlpha = 1;
    this.drawCover(frame, focalX, scaleMultiplier, driftX, driftY);
  }

  private findNearestDecoded(targetIdx: number): FrameAsset | null {
    const exact = this.decodedFrames.get(targetIdx);
    if (exact) return exact;
    for (let d = 1; d < this.tier.frameCount; d++) {
      const bwd = this.decodedFrames.get(targetIdx - d);
      if (bwd) return bwd;
      const fwd = this.decodedFrames.get(targetIdx + d);
      if (fwd) return fwd;
    }
    return null;
  }

  private drawCover(
    source: FrameAsset | HTMLVideoElement,
    focalX: number,
    scaleMultiplier: number,
    driftX: number,
    driftY: number
  ): void {
    const srcW =
      source instanceof HTMLVideoElement
        ? source.videoWidth || 1920
        : source.width;
    const srcH =
      source instanceof HTMLVideoElement
        ? source.videoHeight || 1080
        : source.height;
    if (!srcW || !srcH) return;

    const { ctx, width, height } = this;
    const isPortraitMobile = width < 768 && height > width;

    if (isPortraitMobile) {
      // Frame the upper-middle cinema band so the entire train stays visible above the bottom glass sheet
      const cinemaHeight = height * 0.56;
      const scale = Math.max(width / srcW, cinemaHeight / srcH) * scaleMultiplier;
      const drawW = srcW * scale;
      const drawH = srcH * scale;
      const overflowX = Math.max(0, drawW - width);
      const offsetX = Math.min(0, Math.max(-overflowX, -overflowX * focalX + driftX));
      const offsetY = height * 0.09 + (cinemaHeight - drawH) * 0.5;

      ctx.fillStyle = '#020a11';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(source, offsetX, offsetY, drawW, drawH);
      return;
    }

    const scale = Math.max(width / srcW, height / srcH) * scaleMultiplier;
    const drawW = srcW * scale;
    const drawH = srcH * scale;

    const overflowX = Math.max(0, drawW - width);
    const overflowY = Math.max(0, drawH - height);
    const offsetX = Math.min(0, Math.max(-overflowX, -overflowX * focalX + driftX));
    const offsetY = Math.min(0, Math.max(-overflowY, -overflowY * 0.5 + driftY));

    ctx.drawImage(source, offsetX, offsetY, drawW, drawH);
  }
}
