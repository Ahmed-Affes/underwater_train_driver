# Abyssline 04 — Underwater Train Driver

A single-page, scroll-driven cinematic website introducing a future career: **Underwater Train Driver**. The continuous 20-second 4K underwater maglev film is the visual backbone of the site—code renders only crisp typography, glass HUD telemetry, interactive overlays, particles, and optional Web Audio ambience.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. (Optional) Regenerate watermark-free frames, posters & Concept Film MP4
node scripts/prepare-assets.mjs

# 3. Start local dev server
npm run dev

# 4. Typecheck + build production bundle
npm run build

# 5. Preview production build
npm run preview
```

> **Windows PowerShell note:** If `npm` script execution is restricted, use `npm.cmd run dev` / `npm.cmd run build`.

---

## Deploying to Vercel

This repository is ready for zero-config Vercel deployment (`vercel.json` sets `npm run build`, `dist` output, and immutable caching headers for `/assets/frames/*`, `/assets/video/*`, and `/assets/posters/*`).

1. Push to GitHub (`main`).
2. Import the repository at [vercel.com/new](https://vercel.com/new) (Framework Preset: **Vite**).
3. Deploy — `tsc --noEmit && vite build` outputs `dist/`.

---

## Architecture & Scrubbing Strategy

- **Stack:** Vite + TypeScript, **GSAP + ScrollTrigger**, **Lenis**, Web Audio API, and an overlay-only 2D `<canvas>` (`src/canvas/fxCanvas.ts`).
- **Source Pipeline (`scripts/prepare-assets.mjs`):** Processes `assets/WhatsApp Video 2026-11-26 at 21.41.18.mp4` (3840×2160, 20.00s, 24 fps) using `ffmpeg-static` (`delogo` watermark removal + `lanczos` supersampling + `cas` sharpening) into:
  - **`desktop` (`1920×1080` @ 24 fps):** 480 progressive WebP frames (`70.13 MB`)
  - **`tablet` (`1280×720` @ 20 fps):** 400 progressive WebP frames (`28.66 MB`)
  - **`mobile` (`960×540` @ 16 fps):** 320 progressive WebP frames (`14.19 MB`)
  - **`Concept Film` MP4 (`public/assets/video/abyssline-concept.mp4`):** 1920×1080 H.264 CRF 15 with AAC audio (`45.13 MB`)
  - **Chapter Posters (`public/assets/posters/ch0.webp`–`ch8.webp`):** 9 clean 1080p frames for `prefers-reduced-motion` and modal poster (`1.10 MB`)
- **Canvas Scrubber (`src/media/videoScrubber.ts`):**
  - Renders at full `devicePixelRatio` with zero blur/filter/wash layers over the video and scale strictly clamped (`<= 1.05x`).
  - Uses a compact Blob store + bounded sliding-window `ImageBitmap` cache (`72` frames desktop/tablet, `48` frames mobile) so both forward and backward scrolling scrub smoothly without blowing GPU memory.
  - Headlight preloader unlocks once Chapters 0–2 (`0.00s–3.00s`) are ready while Chapters 3–8 stream progressively in the background (prioritizing route-map jumps).
- **9-Chapter Route & Native Command Cab (`src/scene/timeline.ts`):**
  - Maps `~2000vh` (`100vh/s`) across all 9 scenes: `Departure` (`0.00–1.00s`), `Coral Reef` (`1.00–1.95s`), `Kelp & Skyline` (`1.95–3.00s`), `Command Cab` (`3.00–5.00s`), `Sunken Arch` (`5.00–7.00s`), `Glow Zone` (`7.00–9.25s`), `Dome Terminal` (`9.25–12.00s`), `Platform Stop` (`12.00–16.25s`), and `Ready to Drive` (`16.25–20.00s`).
  - Strictly one text card is visible at a time with a clean exit gap before the next enters, aligned in the right third so the train and focal subjects remain unobstructed.
  - The Command Cab chapter (`3.00–5.00s`) uses the video's native cockpit view directly—overlaying live holographic gauges, robot co-pilot tip, and 4 interactive hotspots without a duplicate interlude.

---

## Single Config File: `src/config/siteConfig.ts`

Everything is configurable in one typed file ([src/config/siteConfig.ts](src/config/siteConfig.ts)):

| What to Change | Config Path | Notes |
| --- | --- | --- |
| **Swap playback mode / frame tiers** | `SITE_CONFIG.playbackEngine`, `SITE_CONFIG.tiers` | Switch between `'frames'` and `'video'`, or point `tiers` to new frame folders. |
| **Swap Concept Film MP4 / poster** | `SITE_CONFIG.videoSources` | Set `conceptFilmMp4` and `conceptFilmPoster`. |
| **Swap Cab Interior (image or video)** | `SITE_CONFIG.cabMedia` | Keep `overrideVideo: false` for the video's native cab shot, or set `true` with `imageWebp` / `videoMp4`. |
| **Edit chapter copy & timestamps** | `SITE_CONFIG.chapters` | Edit `headline`, `body`, `fact`, `videoStart`, `videoEnd`, `textSide`, `focalX`, `depthRange`, `pressureRange`, and `accent`. |
| **Tune scroll length & feel** | `SITE_CONFIG.scrollMultiplier`, `SITE_CONFIG.scrubLerp`, `chapter.dwell` | `scrollMultiplier` scales total `2000vh` length; `scrubLerp` (`0.08–0.12`) tunes throttle smoothing; `dwell` slows mid-chapter reading. |
| **Tune particles & audio** | `SITE_CONFIG.particleDensity`, `SITE_CONFIG.audio` | Adjust bubble/dust count or plug in an external `oceanTrackUrl`. |
| **Edit Cadet Quiz** | `SITE_CONFIG.quizQuestions`, `SITE_CONFIG.recapFacts` | Update questions, answers, and arrival recap items. |

---

## QA Screenshots

Verified desktop (`1440×900`) and mobile (`390×844`) chapter captures are archived in [`docs/qa/`](docs/qa/).
