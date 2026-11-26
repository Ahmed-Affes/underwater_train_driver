# Abyssline 04 — Underwater Train Driver

A single-page, scroll-driven cinematic website introducing a future career: **Underwater Train Driver**. The provided cinematic video is the visual backbone of the site—code renders only typography, glass HUD, interactive overlays, particles, transitions, and optional audio.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start local dev server
npm run dev

# 3. Typecheck + build production bundle
npm run build

# 4. Preview production build
npm run preview
```

> **Windows PowerShell note:** If `npm` script execution is restricted, use `npm.cmd run dev` / `npm.cmd run build`.

---

## Deploying to Vercel

This repository is ready for zero-config Vercel deployment (`vercel.json` sets `npm run build`, `dist` output, and immutable caching headers for `/assets/frames/*`, `/assets/video/*`, and `/assets/chapters/*`).

1. Push to GitHub (`main`).
2. Import the repository at [vercel.com/new](https://vercel.com/new) (Framework Preset: **Vite**).
3. Deploy — `tsc --noEmit && vite build` outputs `dist/`.

---

## Architecture & Scrubbing Strategy

- **Stack:** Vite + TypeScript, **GSAP + ScrollTrigger**, **Lenis**, Web Audio API, and an overlay-only 2D `<canvas>` (`src/canvas/fxCanvas.ts`).
- **Two Scrubbing Engines (`SITE_CONFIG.playbackEngine` in `src/config/siteConfig.ts`):**
  1. **`frames` (Default — Chosen):** Sharpened (`lanczos + cas + unsharp`) progressive WebP frame sequences (`desktop`: 2560×1440 QHD @ 240 frames, `laptop`: 1920×1080 FHD @ 240 frames, `mobile`: 1280×720 HD @ 160 frames). Decoded via `createImageBitmap` so **both forward and backward scrubbing run cleanly** with zero sub-frame ghosting, soft cut light-blooms, and per-chapter mobile `focalX` framing. The headlight preloader unlocks as soon as Chapters 0 + 1 are decoded while Chapters 2–7 stream progressively in the background.
  2. **`video` (Optional):** All-keyframe H.264 (`-g 1`, 48fps) MP4 (`public/assets/video/abyssline-48fps-g1.mp4`) scrubbed via `video.currentTime` inside `requestAnimationFrame`.
- **Signature Cab Interlude (Chapter 3):** Seamless camera push through the video's own cockpit dome into the live interior view, fading in aligned holographic telemetry UI (Water Pressure bar, Depth, rotating Sonar sweep, Hull Integrity segments, tilting Throttle indicator, robot tip bubble, and 4 interactive hotspots). Set `SITE_CONFIG.cabMedia.overrideVideo = true` if you want to swap in a separate still or video clip.

---

## Single Config File: `src/config/siteConfig.ts`

Everything is configurable in one typed file ([src/config/siteConfig.ts](src/config/siteConfig.ts)):

| What to Change | Config Path | Notes |
| --- | --- | --- |
| **Swap frame tiers / playback mode** | `SITE_CONFIG.playbackEngine`, `SITE_CONFIG.tiers` | Switch between `'frames'` and `'video'`, or point `tiers` to new frame folders. |
| **Swap main video / Concept Film** | `SITE_CONFIG.videoSources` | Set `scrub48fpsG1` and `conceptFilmMp4`. |
| **Swap Cab Interior (image or video)** | `SITE_CONFIG.cabMedia` | Set `type: 'image'` (`imageAvif`/`imageWebp`) or `type: 'video'` (`videoMp4`). |
| **Edit chapter copy & timestamps** | `SITE_CONFIG.chapters` | Edit `headline`, `body`, `fact`, `videoStart`, `videoEnd`, `textSide`, `focalX`, `depthRange`, `pressureRange`, and `colorGrade`. |
| **Tune scroll length & feel** | `SITE_CONFIG.scrollMultiplier`, `SITE_CONFIG.scrubLerp`, `chapter.dwell` | `scrollMultiplier` scales total `~1035vh` length; `scrubLerp` (`0.08–0.12`) tunes throttle inertia; `dwell` slows mid-chapter reading. |
| **Tune particles & audio** | `SITE_CONFIG.particleDensity`, `SITE_CONFIG.audio` | Adjust bubble/dust count or plug in an external `oceanTrackUrl`. |
| **Edit Cadet Quiz** | `SITE_CONFIG.quizQuestions`, `SITE_CONFIG.recapFacts` | Update questions, answers, and arrival recap items. |

---

## QA Screenshots

Verified desktop (`1440×900`) and mobile (`390×844`) chapter captures are archived in [`docs/qa/`](docs/qa/).
