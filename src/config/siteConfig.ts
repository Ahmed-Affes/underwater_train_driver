/**
 * SINGLE SOURCE OF TRUTH — ABYSSLINE 04 CONFIGURATION
 * ---------------------------------------------------------------------------
 * Edit anything here without touching timeline, rendering, or HUD code:
 *  - Video playback engine ('frames' progressive WebP vs 'video' MP4)
 *  - Quality tiers (desktop / tablet / mobile)
 *  - Cab media slot (native video moment OR custom image/video override)
 *  - Chapter timestamps, scrollVh (~100vh/s -> 2000vh total), dwell weights,
 *    text placement, mobile focalX, depth, pressure, speed, copy, hotspots,
 *    HUD strings, audio & quiz.
 */

export type TextSide = 'left' | 'right' | 'top-left';

export interface HotspotConfig {
  id: string;
  x: number; // viewport percentage (0-100)
  y: number; // viewport percentage (0-100)
  label: string;
  description: string;
}

export interface ChapterConfig {
  id: string;
  index: number;
  label: string;
  stationCode: string;
  headline: string;
  subline?: string;
  body: string;
  fact?: string;
  hint?: string;
  /** Exact source video timestamps (seconds, 0.00 - 20.00) */
  videoStart: number;
  videoEnd: number;
  /** Relative scroll height in vh (scaled by scrollMultiplier) */
  scrollVh: number;
  /** 0.0 (linear) to 0.75 (long calm dwell in the middle of the chapter) */
  dwell: number;
  /** Desktop placement so text sits in left/right third and never covers the train */
  textSide: TextSide;
  /** Vertical alignment for desktop editorial panel ('top' | 'mid' | 'bottom') */
  textVertical: 'top' | 'mid' | 'bottom';
  /** Mobile portrait horizontal crop center (0.0 left .. 0.5 center .. 1.0 right) */
  focalX: number;
  depthRange: [number, number];
  pressureRange: [number, number];
  speedRange: [number, number];
  accent: string;
  sparkleFactor: number;
  posterFallback: string;
  hotspots: HotspotConfig[];
  trainingSteps?: string[];
  compensationCard?: {
    title: string;
    salary: string;
    schedule: string;
    perks: string;
  };
}

export interface TierSpec {
  id: 'desktop' | 'tablet' | 'mobile';
  frameCount: number;
  fps: number;
  width: number;
  height: number;
  pattern: string;
}

export interface CabMediaConfig {
  /** False = uses the video's native Command Cab shot directly (no duplicate interlude) */
  overrideVideo: boolean;
  type: 'image' | 'video';
  imageWebp: string;
  videoMp4?: string;
  alt: string;
  robotTip: string;
  hotspots: HotspotConfig[];
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: { value: string; label: string }[];
  correctValue: string;
}

export interface SiteConfig {
  brand: {
    title: string;
    sector: string;
    skipLink: string;
  };
  /**
   * 'frames' = progressive WebP canvas sequence (zero backward-scrub stutter)
   * 'video'  = single MP4 scrubbed via video.currentTime
   */
  playbackEngine: 'frames' | 'video';
  durationSec: number;
  /** Global multiplier applied to every chapter's scrollVh (1.0 -> 2000vh, ~100vh/s) */
  scrollMultiplier: number;
  /** Smoothing factor for target time lerp (0.08 - 0.12 recommended) */
  scrubLerp: number;
  /** Particle count ceiling on desktop (scaled down automatically on mobile) */
  particleDensity: number;
  tiers: Record<'desktop' | 'tablet' | 'mobile', TierSpec>;
  videoSources: {
    conceptFilmMp4: string;
    conceptFilmPoster: string;
  };
  /** Verified cut/transition timestamps (seconds) across the 20.00s route */
  cutTimestamps: number[];
  cabMedia: CabMediaConfig;
  chapters: ChapterConfig[];
  hud: {
    conceptButton: string;
    audioOff: string;
    audioOn: string;
    depthLabel: string;
    pressureLabel: string;
    throttleLabel: string;
    replayLabel: string;
    ctaPrimary: string;
    quizButton: string;
  };
  audio: {
    enabledByDefault: boolean;
    /** Optional external ambience loop URL; null uses built-in Web Audio synth */
    oceanTrackUrl: string | null;
    masterGain: number;
  };
  recapFacts: { label: string; value: string }[];
  quizQuestions: QuizQuestion[];
}

export const SITE_CONFIG: SiteConfig = {
  brand: {
    title: 'ABYSSLINE',
    sector: 'SECTOR 04',
    skipLink: 'Skip to journey story',
  },

  playbackEngine: 'frames',
  durationSec: 20.0,
  scrollMultiplier: 1.0,
  scrubLerp: 0.1,
  particleDensity: 180,

  tiers: {
    desktop: {
      id: 'desktop',
      frameCount: 480,
      fps: 24,
      width: 1920,
      height: 1080,
      pattern: 'assets/frames/desktop/f_{index}.webp',
    },
    tablet: {
      id: 'tablet',
      frameCount: 400,
      fps: 20,
      width: 1280,
      height: 720,
      pattern: 'assets/frames/tablet/f_{index}.webp',
    },
    mobile: {
      id: 'mobile',
      frameCount: 320,
      fps: 16,
      width: 960,
      height: 540,
      pattern: 'assets/frames/mobile/f_{index}.webp',
    },
  },

  videoSources: {
    conceptFilmMp4: 'assets/video/abyssline-concept.mp4',
    conceptFilmPoster: 'assets/posters/ch0.webp',
  },

  // Measured scene-cut / morph timestamps from 480-frame diff inspection
  cutTimestamps: [1.0, 1.95, 3.0, 5.0, 7.0, 9.25, 12.0, 16.25],

  cabMedia: {
    overrideVideo: false,
    type: 'image',
    imageWebp: 'assets/posters/ch3.webp',
    videoMp4: undefined, // Set overrideVideo: true and drop a cab .mp4 path here if replacing the native cab shot
    alt: 'Panoramic underwater train command cab with co-pilot robot, sonar console, and throttle joystick',
    robotTip: "I'll keep an eye on the sensors. You keep an eye on the view.",
    hotspots: [
      {
        id: 'cab-hull',
        x: 20,
        y: 69,
        label: 'Co-Pilot & Hull',
        description:
          'Tracks micro-strain sensors across all pressurized cars so the titanium-glass seal stays 100% sound.',
      },
      {
        id: 'cab-pressure',
        x: 50,
        y: 72,
        label: 'Sonar Console',
        description:
          'Monitors exterior sea pressure and forward sonar sweep while keeping cabin air locked at 1.0 ATM.',
      },
      {
        id: 'cab-throttle',
        x: 78,
        y: 77,
        label: 'Throttle Joystick',
        description:
          'Balances smooth magnetic propulsion so acceleration feels weightless for every passenger.',
      },
      {
        id: 'cab-sonar',
        x: 66,
        y: 44,
        label: 'Windshield HUD',
        description:
          'Projects ocean currents, reef depth contours, and arch clearance directly onto the canopy.',
      },
    ],
  },

  chapters: [
    {
      id: 'departure',
      index: 0,
      label: 'Departure',
      stationCode: 'STN-00',
      headline: 'Underwater Train Driver',
      subline: 'Your office is the ocean floor.',
      body: 'Emerge from the illuminated departure tunnel in a silent, pressurized maglev built for wonder.',
      hint: 'Scroll to start the engine',
      videoStart: 0.0,
      videoEnd: 1.0,
      scrollVh: 155,
      dwell: 0.35,
      textSide: 'right',
      textVertical: 'top',
      focalX: 0.44,
      depthRange: [0, 18],
      pressureRange: [1.0, 2.8],
      speedRange: [0, 68],
      accent: '#22d3ee',
      sparkleFactor: 0.0,
      posterFallback: 'assets/posters/ch0.webp',
      hotspots: [],
    },
    {
      id: 'reef',
      index: 1,
      label: 'Coral Reef',
      stationCode: 'MRK-01',
      headline: 'Leave the surface behind',
      body: 'Carry travelers over sunlit coral reefs on a magnetic rail—smooth, silent, and right on schedule.',
      fact: 'Average route: 42 km · 38 minutes',
      videoStart: 1.0,
      videoEnd: 1.95,
      scrollVh: 145,
      dwell: 0.35,
      textSide: 'right',
      textVertical: 'top',
      focalX: 0.44,
      depthRange: [18, 46],
      pressureRange: [2.8, 5.6],
      speedRange: [68, 124],
      accent: '#2dd4bf',
      sparkleFactor: 0.06,
      posterFallback: 'assets/posters/ch1.webp',
      hotspots: [],
    },
    {
      id: 'kelp-skyline',
      index: 2,
      label: 'Kelp & Skyline',
      stationCode: 'MRK-02',
      headline: 'Calm is a skill',
      body: 'Thread between swaying golden kelp as the sunken city domes rise ahead. Steady hands keep every passenger relaxed.',
      fact: 'Core skills: composure, precision, care',
      videoStart: 1.95,
      videoEnd: 3.0,
      scrollVh: 165,
      dwell: 0.46,
      textSide: 'right',
      textVertical: 'top',
      focalX: 0.5,
      depthRange: [46, 84],
      pressureRange: [5.6, 9.4],
      speedRange: [124, 152],
      accent: '#34d399',
      sparkleFactor: 0.1,
      posterFallback: 'assets/posters/ch2.webp',
      hotspots: [],
    },
    {
      id: 'cab',
      index: 3,
      label: 'Command Cab',
      stationCode: 'POV-03',
      headline: 'Step inside your command cab',
      body: 'No weather forecasts. Just pressure readings, sonar sweeps, and a co-pilot bot beside your throttle.',
      fact: 'Telemetry: pressure, depth, sonar, hull & speed',
      videoStart: 3.0,
      videoEnd: 5.0,
      scrollVh: 260,
      dwell: 0.56,
      textSide: 'right',
      textVertical: 'top',
      focalX: 0.5,
      depthRange: [84, 136],
      pressureRange: [9.4, 14.6],
      speedRange: [152, 166],
      accent: '#38bdf8',
      sparkleFactor: 0.12,
      posterFallback: 'assets/posters/ch3.webp',
      hotspots: [],
    },
    {
      id: 'sunken-arch',
      index: 4,
      label: 'Sunken Arch',
      stationCode: 'STN-04',
      headline: 'Earn your arch crossing',
      body: 'Train in the simulator, pass hull-safety certification, then pilot straight through the sunken city arch.',
      fact: 'Path: 300 simulator hours + hull certification',
      videoStart: 5.0,
      videoEnd: 7.0,
      scrollVh: 250,
      dwell: 0.54,
      textSide: 'right',
      textVertical: 'top',
      focalX: 0.5,
      depthRange: [136, 232],
      pressureRange: [14.6, 24.2],
      speedRange: [166, 142],
      accent: '#fbbf24',
      sparkleFactor: 0.24,
      posterFallback: 'assets/posters/ch4.webp',
      hotspots: [],
      trainingSteps: ['Simulator', 'Certification', 'First solo run'],
    },
    {
      id: 'glow-zone',
      index: 5,
      label: 'Glow Zone',
      stationCode: 'TRN-05',
      headline: 'Deepest point, calmest hands',
      body: 'At 380 meters, glowing jellyfish drift beside the rail while a whale shark glides overhead.',
      fact: 'Challenges: pressure monitoring · Rewards: the best view in any career',
      videoStart: 7.0,
      videoEnd: 9.25,
      scrollVh: 270,
      dwell: 0.55,
      textSide: 'right',
      textVertical: 'top',
      focalX: 0.5,
      depthRange: [232, 380],
      pressureRange: [24.2, 38.0],
      speedRange: [142, 162],
      accent: '#f472b6',
      sparkleFactor: 1.0,
      posterFallback: 'assets/posters/ch5.webp',
      hotspots: [],
      compensationCard: {
        title: 'Career Snapshot (Concept Values)',
        salary: 'Salary range (concept): $62,000–$95,000 per year',
        schedule: 'Schedule: 4 days on, 3 off',
        perks: 'Perks: sea-view housing, free train pass',
      },
    },
    {
      id: 'dome-approach',
      index: 6,
      label: 'Dome Terminal',
      stationCode: 'STN-06',
      headline: 'Approach the Glass Dome',
      body: 'Ease off the magnetic throttle as the illuminated geodesic station rises from the ocean floor.',
      fact: 'Auto-align docking beacons: active at 400m',
      videoStart: 9.25,
      videoEnd: 12.0,
      scrollVh: 230,
      dwell: 0.45,
      textSide: 'right',
      textVertical: 'top',
      focalX: 0.42,
      depthRange: [380, 128],
      pressureRange: [38.0, 13.8],
      speedRange: [162, 62],
      accent: '#22d3ee',
      sparkleFactor: 0.28,
      posterFallback: 'assets/posters/ch6.webp',
      hotspots: [],
    },
    {
      id: 'platform',
      index: 7,
      label: 'Platform Stop',
      stationCode: 'STN-07',
      headline: 'Doors open beneath the sea',
      body: 'Hold zero drift at the yellow safety line as commuters board beneath the arched aquarium canopy.',
      fact: 'Docking speed: 0 km/h · Glass-Dome Terminal',
      videoStart: 12.0,
      videoEnd: 16.25,
      scrollVh: 265,
      dwell: 0.52,
      textSide: 'right',
      textVertical: 'top',
      focalX: 0.46,
      depthRange: [128, 48],
      pressureRange: [13.8, 5.8],
      speedRange: [62, 0],
      accent: '#38bdf8',
      sparkleFactor: 0.1,
      posterFallback: 'assets/posters/ch7.webp',
      hotspots: [],
    },
    {
      id: 'arrival',
      index: 8,
      label: 'Ready to Drive',
      stationCode: 'STN-08',
      headline: 'Ready to drive?',
      body: 'Glide out into sunlit waters beneath a soaring manta ray—your first train is waiting.',
      fact: 'Daily shift: 3–4 runs · Next stop: Horizon Spire',
      videoStart: 16.25,
      videoEnd: 20.0,
      scrollVh: 260,
      dwell: 0.44,
      textSide: 'right',
      textVertical: 'top',
      focalX: 0.5,
      depthRange: [48, 28],
      pressureRange: [5.8, 3.8],
      speedRange: [0, 148],
      accent: '#fbbf24',
      sparkleFactor: 0.16,
      posterFallback: 'assets/posters/ch8.webp',
      hotspots: [],
    },
  ],

  hud: {
    conceptButton: 'Concept Film',
    audioOff: 'Ocean Audio: Off',
    audioOn: 'Ocean Audio: On',
    depthLabel: 'DEPTH',
    pressureLabel: 'PRESSURE',
    throttleLabel: 'THROTTLE',
    replayLabel: 'Replay the journey',
    ctaPrimary: 'Start your training',
    quizButton: 'Pre-Run Driver Check',
  },

  audio: {
    enabledByDefault: false,
    oceanTrackUrl: null,
    masterGain: 0.28,
  },

  recapFacts: [
    { label: 'What you do', value: 'Pilot 42 km ocean rail runs' },
    { label: 'Skills', value: 'Calm, precision, care' },
    { label: 'Training', value: '300h sim + hull cert' },
    { label: 'Reward', value: '$62k–$95k concept + 4/3 shifts' },
  ],

  quizQuestions: [
    {
      id: 'q1',
      prompt: '1. Inside the command cab, what do drivers monitor instead of weather?',
      options: [
        { value: 'wind', label: 'Surface wind forecasts' },
        { value: 'pressure', label: 'Water pressure & sonar readings' },
      ],
      correctValue: 'pressure',
    },
    {
      id: 'q2',
      prompt: '2. What guides your composure at the 380m Glow Zone?',
      options: [
        { value: 'steady', label: 'Steady throttle watch beside bioluminescent sea life' },
        { value: 'blind', label: 'Shutting off sonar and running full speed' },
      ],
      correctValue: 'steady',
    },
    {
      id: 'q3',
      prompt: '3. What qualifies you for your first solo city arch crossing?',
      options: [
        { value: '40', label: '40 hours of surface rail practice' },
        { value: '300', label: '300 hours + hull certification' },
      ],
      correctValue: '300',
    },
  ],
};
