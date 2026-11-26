# Underwater Train Driver — Abyssline 04

A single-page, scroll-driven cinematic website introducing a future career: **Underwater Train Driver**. Scrolling acts as the train's throttle along one continuous camera shot—from the dark calm boarding tunnel, through sunlit reefs, inside the holographic driver's cab, past emerald kelp forests, through a sunken city arch, into the 380m bioluminescent glow zone, and up to the glass-dome arrival terminal.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. (Optional) Re-slice storyboard grid into WebP & AVIF chapter plates
npm run prepare:assets

# 3. Start development server
npm run dev

# 4. Build production bundle
npm run build
```

> **Note on Windows PowerShell:** If `npm` is blocked by execution policy, use `npm.cmd run dev`.

---

## Architecture Overview

### Continuous 6-Layer Stage (`index.html` & `src/styles/main.css`)
- `layer-bg` — Interpolated water-depth gradient + lazy-loaded `.avif`/`.webp` chapter plates (only `current + 1` chapter is preloaded).
- `layer-rays` — Volumetric light beams and water caustic shimmer.
- `layer-mid` — Midground parallax landmarks, coral terraces, fish school (scatters & regathers), kelp, sunken city back-arch, whale shark, lantern jellyfish, and glass-dome terminal (`0.55x` scroll speed).
- `layer-track` — Continuous glowing aqua magnetic guideway with velocity-reactive energy pulses.
- `layer-train` — Pearl-white 5-car aerodynamic bullet train (teardrop nose, panoramic cockpit, aqua/pink light strips, amber oval windows, hover skids, spinning rear turbine rotor & bubble plume) + `layer-cab` signature iris-zoom driver POV.
- `layer-fg` — Foreground kelp blades and Sunken City pass-through pillar (`1.38x` scroll speed) + 60fps HTML5 Canvas particle, bubble, and speed-streak engine (`src/canvas/particleEngine.js`).

### Libraries
- **GSAP + ScrollTrigger** — Scrubbed master timeline, chapter color/depth interpolation, split-text mask reveals, and signature Cab POV iris transition (`src/scene/timeline.js`).
- **Lenis** — Inertial smooth scrolling synced to `gsap.ticker`, driving velocity-reactive bubbles, thruster plumes, light streaks, and optional procedural Web Audio (`src/audio/oceanAudio.js`).
- **Vite** — Lightweight ES module bundler.

---

## Swapping Assets & Editing Copy

### 1. Swap Images, Train Sprites, or Video
Open [`src/config/assets.js`](src/config/assets.js):
- **Per-chapter backdrops:** Update `ASSETS.chapters.<chapterId>.avif` / `.webp` (or point to your own generated assets in `public/assets/chapters/`).
- **Custom train sprite:** Set `ASSETS.train.sideImage` from `null` to e.g. `'/assets/my-train.webp'` to replace the built-in vector bullet train.
- **Cab backdrop:** Update `ASSETS.train.cabBackdrop.avif` / `.webp` (the animated SVG holographic gauges stay layered cleanly on top).
- **Concept film:** Update `ASSETS.conceptVideo.mp4` (lazy-loaded only when the user opens **Concept Film**).

### 2. Edit Headlines, Copy & Hotspots
Open [`src/config/chapters.js`](src/config/chapters.js):
- Change `headline`, `body`, `highlightQuote`, or `recapStats` for any chapter (`0`–`7`).
- Add, remove, or reposition interactive creature/landmark tooltips in `hotspots: [{ id, x, y, title, fact }]` (`x`/`y` are viewport percentages).

---

## What to Tune

| Setting | Where to Find It | Effect |
| --- | --- | --- |
| **Chapter scroll length** | `scrollVh` in `src/config/chapters.js` | Controls how long (`115vh`–`150vh`) each chapter lasts while scrolling. |
| **Depth & pressure curves** | `depthStart` / `depthEnd` & `pressureStart` / `pressureEnd` in `src/config/chapters.js` | Adjusts side depth meter & cab ATM gauge interpolation. |
| **Chapter water colors** | `palette` (`top`, `mid`, `bottom`, `rayOpacity`, `vignette`, `accent`) in `src/config/chapters.js` | Tunes water gradient, volumetric ray intensity, and accent hue per zone. |
| **World parallax speed** | `worldWidth`, `midX`, `fgX` in `src/scene/timeline.js` | Changes horizontal travel distance and foreground `1.38x` depth separation. |
| **Scroll inertia & velocity** | `duration` / `wheelMultiplier` in `Lenis` (`src/scene/timeline.js`) | Adjusts how weighty or snappy the throttle feels. |
| **Bubble & star density** | `ParticleEngine` in `src/canvas/particleEngine.js` | Tunes mote count, turbine bubble rate, and velocity streak threshold. |
