/**
 * ASSETS CONFIGURATION
 * ---------------------------------------------------------------------------
 * Swap any generated image, WebP/AVIF asset, SVG sprite, or concept video
 * by changing a single path below.
 *
 * Layer naming convention across the app:
 *   bg    -> Far ocean backdrop (lazy-loaded per chapter + preloaded N+1)
 *   mid   -> Midground landmarks, reefs, city arches, marine life
 *   track -> Magnetic glowing guideway & hover pylons
 *   train -> Pearl-white aerodynamic bullet train & cab POV interior
 *   fg    -> Foreground silhouettes, kelp blades, particle/bubble canvas
 */

export const ASSETS = {
  // Optional concept reel (lazy-loaded ONLY if user opens "Watch Film")
  conceptVideo: {
    mp4: 'assets/video/abyssline-journey.mp4',
    poster: 'assets/chapters/departure.webp',
    alt: 'Concept reel of the sealed underwater maglev train gliding through ocean habitats',
  },

  // Hero train & cab POV assets (SVG/CSS built-in by default; optional image override)
  train: {
    // Set `sideImage` to e.g. 'assets/train-side.webp' to swap the vector train for a rendered sprite
    sideImage: null,
    sideAlt: 'Pearl-white aerodynamic underwater maglev bullet train on a glowing magnetic track',
    // Set `cabImage` to e.g. 'assets/chapters/cab.webp' or null to use the interactive holographic SVG cab
    cabBackdrop: {
      avif: 'assets/chapters/cab.avif',
      webp: 'assets/chapters/cab.webp',
      alt: 'Panoramic underwater train driver cab interior with holographic sonar and pressure consoles',
    },
  },

  // Per-chapter far-background artwork (WebP + AVIF with SVG/CSS underwater fallback)
  // Chapters are lazy-loaded as you approach them; only chapter N+1 is preloaded.
  chapters: {
    boarding: {
      avif: 'assets/chapters/boarding.avif',
      webp: 'assets/chapters/boarding.webp',
      alt: 'Sleek pearl-white submarine train powered up at the glowing boarding tunnel',
      opacity: 0.24,
    },
    departure: {
      avif: 'assets/chapters/departure.avif',
      webp: 'assets/chapters/departure.webp',
      alt: 'Underwater maglev train departing a glowing station into bright turquoise shallows',
      opacity: 0.42,
    },
    reef: {
      avif: 'assets/chapters/reef.avif',
      webp: 'assets/chapters/reef.webp',
      alt: 'Bullet train gliding past coral terraces and schooling reef fish',
      opacity: 0.46,
    },
    cab: {
      avif: 'assets/chapters/cab.avif',
      webp: 'assets/chapters/cab.webp',
      alt: 'Inside the futuristic submarine train driver cab overlooking coral reefs',
      opacity: 0.55,
    },
    kelp: {
      avif: 'assets/chapters/kelp.avif',
      webp: 'assets/chapters/kelp.webp',
      alt: 'Sunlit emerald kelp forest with silver fish stream and curious sea otter',
      opacity: 0.52,
    },
    'sunken-city': {
      avif: 'assets/chapters/sunken-city.avif',
      webp: 'assets/chapters/sunken-city.webp',
      alt: 'Futuristic sunken city with coral-crowned domes and a grand magnetic arch',
      opacity: 0.58,
    },
    'glow-zone': {
      avif: 'assets/chapters/glow-zone.avif',
      webp: 'assets/chapters/glow-zone.webp',
      alt: 'Deep indigo bioluminescent trench with glowing jellyfish and a whale shark overhead',
      opacity: 0.62,
    },
    arrival: {
      avif: 'assets/chapters/arrival.avif',
      webp: 'assets/chapters/arrival.webp',
      alt: 'Glowing glass-dome underwater station welcoming travelers back to surface-lit platforms',
      opacity: 0.54,
    },
  },

  // Creature & landmark cut-out slot overrides (optional PNG/WebP paths; null uses bespoke vector art)
  creatures: {
    turtle: null,
    fishSchool: null,
    otter: null,
    jellyfish: null,
    whaleShark: null,
    anglerfish: null,
  },
};
