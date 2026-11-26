/**
 * SINGLE SOURCE OF TRUTH — ABYSSLINE 04 CONFIGURATION
 * ---------------------------------------------------------------------------
 * Edit anything here without touching timeline, rendering, or HUD code:
 *  - Video playback engine ('frames' progressive WebP vs 'video' all-keyframe)
 *  - Quality tiers (desktop / laptop / mobile)
 *  - Cab media slot (image OR video)
 *  - Chapter timestamps, dwell weights, text side, mobile focal crop, depth,
 *    pressure, color grading, copy, hotspots, HUD strings, audio & quiz.
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
  /** Exact source video timestamps (seconds, 0.00 - 9.94) */
  videoStart: number;
  videoEnd: number;
  /** Relative scroll height in vh (scaled by scrollMultiplier) */
  scrollVh: number;
  /** 0.0 (linear) to 0.75 (long calm dwell in the middle of the chapter) */
  dwell: number;
  /** Desktop placement so text never covers the train or focal subject */
  textSide: TextSide;
  /** Vertical nudge for desktop editorial panel ('top' | 'mid' | 'bottom') */
  textVertical: 'top' | 'mid' | 'bottom';
  /** Mobile portrait horizontal crop center (0.0 left .. 0.5 center .. 1.0 right) */
  focalX: number;
  depthRange: [number, number];
  pressureRange: [number, number];
  speedRange: [number, number];
  colorGrade: {
    tint: string;
    tintOpacity: number;
    vignette: number;
    causticOpacity: number;
    sparkleFactor: number;
    accent: string;
  };
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
  id: 'desktop' | 'laptop' | 'mobile';
  frameCount: number;
  fps: number;
  width: number;
  height: number;
  pattern: string;
}

export interface CabMediaConfig {
  /** Set true only if replacing the video's native cab shot with a custom still/clip */
  overrideVideo: boolean;
  type: 'image' | 'video';
  imageAvif?: string;
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
   * 'video'  = all-keyframe H.264 (-g 1) scrubbed via video.currentTime
   */
  playbackEngine: 'frames' | 'video';
  durationSec: number;
  /** Global multiplier applied to every chapter's scrollVh (default 1.0 -> ~1025vh) */
  scrollMultiplier: number;
  /** Smoothing factor for target time lerp (0.08 - 0.12 recommended) */
  scrubLerp: number;
  /** Particle count ceiling on desktop (scaled down automatically on mobile) */
  particleDensity: number;
  tiers: Record<'desktop' | 'laptop' | 'mobile', TierSpec>;
  videoSources: {
    scrub48fpsG1: string;
    conceptFilmMp4: string;
    conceptFilmPoster: string;
  };
  /** Cut timestamps (seconds) where soft light-bloom + cross-frame blend trigger */
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
  durationSec: 9.94,
  scrollMultiplier: 1.0,
  scrubLerp: 0.1,
  particleDensity: 220,

  tiers: {
    desktop: {
      id: 'desktop',
      frameCount: 240,
      fps: 24,
      width: 2560,
      height: 1440,
      pattern: 'assets/frames/desktop/f_{index}.webp',
    },
    laptop: {
      id: 'laptop',
      frameCount: 240,
      fps: 24,
      width: 1920,
      height: 1080,
      pattern: 'assets/frames/laptop/f_{index}.webp',
    },
    mobile: {
      id: 'mobile',
      frameCount: 160,
      fps: 16,
      width: 1280,
      height: 720,
      pattern: 'assets/frames/mobile/f_{index}.webp',
    },
  },

  videoSources: {
    scrub48fpsG1: 'assets/video/abyssline-48fps-g1.mp4',
    conceptFilmMp4: 'assets/video/abyssline-journey.mp4',
    conceptFilmPoster: 'assets/chapters/departure.webp',
  },

  // Real morph/cut boundaries verified from frame-by-frame inspection
  cutTimestamps: [0.95, 1.85, 2.95, 4.02, 5.35, 7.05, 8.5],

  cabMedia: {
    overrideVideo: false,
    type: 'image',
    imageAvif: 'assets/chapters/cab.avif',
    imageWebp: 'assets/chapters/cab.webp',
    videoMp4: undefined, // Set overrideVideo: true and drop a cab .mp4 path here to swap!
    alt: 'Panoramic underwater train driver cab overlooking sunlit coral reefs',
    robotTip: "I'll keep an eye on the sensors. You keep an eye on the view.",
    hotspots: [
      {
        id: 'cab-hull',
        x: 18,
        y: 48,
        label: 'Hull Panel',
        description:
          'Tracks micro-strain sensors across all five titanium-glass cars so the seal stays 100% sound.',
      },
      {
        id: 'cab-pressure',
        x: 28,
        y: 59,
        label: 'Pressure Screen',
        description:
          'Monitors exterior sea pressure in real time while keeping cabin air locked at a comfortable 1.0 ATM.',
      },
      {
        id: 'cab-throttle',
        x: 50,
        y: 77,
        label: 'Throttle Lever',
        description:
          'Balances smooth magnetic propulsion so acceleration feels weightless for every passenger.',
      },
      {
        id: 'cab-sonar',
        x: 75,
        y: 57,
        label: 'Sonar',
        description:
          'Sweeps four kilometers ahead to spot currents, reef life, and approaching station locks early.',
      },
    ],
  },

  chapters: [
    {
      id: 'boarding',
      index: 0,
      label: 'Boarding',
      stationCode: 'STN-00',
      headline: 'Underwater Train Driver',
      subline: 'Your office is the ocean floor.',
      body: 'Step into the pilot seat of a silent, pressurized maglev line built for wonder.',
      hint: 'Scroll to start the engine',
      videoStart: 0.0,
      videoEnd: 0.95,
      scrollVh: 115,
      dwell: 0.35,
      textSide: 'left',
      textVertical: 'mid',
      focalX: 0.56,
      depthRange: [0, 8],
      pressureRange: [1.0, 1.8],
      speedRange: [0, 42],
      colorGrade: {
        tint: 'rgba(6, 28, 44, 0.22)',
        tintOpacity: 0.45,
        vignette: 0.62,
        causticOpacity: 0.14,
        sparkleFactor: 0.0,
        accent: '#22d3ee',
      },
      posterFallback: 'assets/chapters/boarding.webp',
      hotspots: [],
    },
    {
      id: 'departure',
      index: 1,
      label: 'Departure',
      stationCode: 'STN-01',
      headline: 'Leave the surface behind',
      body: 'You carry travelers between underwater stations on a magnetic rail, smooth, silent and on schedule.',
      fact: 'Average route: 42 km - 38 minutes',
      videoStart: 0.95,
      videoEnd: 1.85,
      scrollVh: 115,
      dwell: 0.35,
      textSide: 'left',
      textVertical: 'bottom',
      focalX: 0.52,
      depthRange: [8, 24],
      pressureRange: [1.8, 3.4],
      speedRange: [42, 128],
      colorGrade: {
        tint: 'rgba(14, 116, 144, 0.12)',
        tintOpacity: 0.25,
        vignette: 0.28,
        causticOpacity: 0.32,
        sparkleFactor: 0.05,
        accent: '#22d3ee',
      },
      posterFallback: 'assets/chapters/departure.webp',
      hotspots: [],
    },
    {
      id: 'reef',
      index: 2,
      label: 'The Reef',
      stationCode: 'MRK-02',
      headline: 'A normal day, extraordinary view',
      body: 'Check the route, welcome passengers, run your pre-departure checks, then roll out through the reef.',
      fact: 'Daily shift: 3-4 runs',
      videoStart: 1.85,
      videoEnd: 2.85,
      scrollVh: 125,
      dwell: 0.45,
      textSide: 'right',
      textVertical: 'top',
      focalX: 0.5,
      depthRange: [24, 58],
      pressureRange: [3.4, 6.8],
      speedRange: [128, 152],
      colorGrade: {
        tint: 'rgba(13, 148, 136, 0.1)',
        tintOpacity: 0.22,
        vignette: 0.22,
        causticOpacity: 0.38,
        sparkleFactor: 0.08,
        accent: '#2dd4bf',
      },
      posterFallback: 'assets/chapters/reef.webp',
      hotspots: [
        {
          id: 'reef-turtle',
          x: 61,
          y: 23,
          label: 'Sea Turtle',
          description: "Sea turtles use the rail's glow to navigate at night.",
        },
      ],
    },
    {
      id: 'cab',
      index: 3,
      label: 'The Cab',
      stationCode: 'POV-03',
      headline: 'Step inside your command cab',
      body: 'No weather forecasts. Just pressure readings.',
      fact: 'Telemetry: pressure, depth, sonar, hull & speed',
      videoStart: 2.85,
      videoEnd: 3.95,
      scrollVh: 155,
      dwell: 0.58,
      textSide: 'top-left',
      textVertical: 'top',
      focalX: 0.5,
      depthRange: [58, 92],
      pressureRange: [6.8, 10.2],
      speedRange: [152, 168],
      colorGrade: {
        tint: 'rgba(8, 51, 68, 0.14)',
        tintOpacity: 0.32,
        vignette: 0.32,
        causticOpacity: 0.22,
        sparkleFactor: 0.1,
        accent: '#38bdf8',
      },
      posterFallback: 'assets/chapters/cab.webp',
      hotspots: [],
    },
    {
      id: 'kelp',
      index: 4,
      label: 'Kelp Forest',
      stationCode: 'MRK-04',
      headline: 'Calm is a skill',
      body: 'Slow, steady and observant. The best drivers stay relaxed, communicate clearly and look after every passenger.',
      fact: 'Core skills: composure, precision, communication, care',
      videoStart: 4.1,
      videoEnd: 5.25,
      scrollVh: 120,
      dwell: 0.48,
      textSide: 'left',
      textVertical: 'top',
      focalX: 0.52,
      depthRange: [92, 155],
      pressureRange: [10.2, 16.5],
      speedRange: [168, 108],
      colorGrade: {
        tint: 'rgba(6, 95, 70, 0.18)',
        tintOpacity: 0.38,
        vignette: 0.34,
        causticOpacity: 0.28,
        sparkleFactor: 0.12,
        accent: '#34d399',
      },
      posterFallback: 'assets/chapters/kelp.webp',
      hotspots: [],
    },
    {
      id: 'sunken-city',
      index: 5,
      label: 'Sunken City',
      stationCode: 'STN-05',
      headline: 'Earn your arch crossing',
      body: 'Train in the simulator, pass the hull-safety certification, then cross the city arch with an instructor beside you.',
      fact: 'Path: 300 simulator hours + hull certification',
      videoStart: 5.4,
      videoEnd: 6.85,
      scrollVh: 135,
      dwell: 0.52,
      textSide: 'right',
      textVertical: 'top',
      focalX: 0.5,
      depthRange: [155, 248],
      pressureRange: [16.5, 25.8],
      speedRange: [108, 146],
      colorGrade: {
        tint: 'rgba(30, 58, 138, 0.16)',
        tintOpacity: 0.32,
        vignette: 0.32,
        causticOpacity: 0.2,
        sparkleFactor: 0.22,
        accent: '#fbbf24',
      },
      posterFallback: 'assets/chapters/sunken-city.webp',
      hotspots: [],
      trainingSteps: ['Simulator', 'Certification', 'First solo run'],
    },
    {
      id: 'glow-zone',
      index: 6,
      label: 'Glow Zone',
      stationCode: 'TRN-06',
      headline: 'Deepest point, calmest hands',
      body: 'The pressure climbs, the sea lights up, and you stay steady. This is what the job is for.',
      fact: 'Challenges: pressure monitoring, rare emergencies drills. Rewards: the best view in any career.',
      videoStart: 7.1,
      videoEnd: 8.35,
      scrollVh: 140,
      dwell: 0.44,
      textSide: 'right',
      textVertical: 'top',
      focalX: 0.5,
      depthRange: [248, 380],
      pressureRange: [25.8, 38.0],
      speedRange: [146, 160],
      colorGrade: {
        tint: 'rgba(30, 27, 75, 0.28)',
        tintOpacity: 0.5,
        vignette: 0.42,
        causticOpacity: 0.1,
        sparkleFactor: 1.0,
        accent: '#f472b6',
      },
      posterFallback: 'assets/chapters/glow-zone.webp',
      hotspots: [],
      compensationCard: {
        title: 'Career Snapshot (Concept Values)',
        salary: 'Salary range (concept): $62,000–$95,000 per year',
        schedule: 'Schedule: 4 days on, 3 off',
        perks: 'Perks: sea-view housing, free train pass',
      },
    },
    {
      id: 'arrival',
      index: 7,
      label: 'Arrival',
      stationCode: 'STN-07',
      headline: 'Ready to drive?',
      body: 'Your first train is waiting at the platform.',
      fact: 'Docking speed: 0 km/h · Glass-Dome Terminal',
      videoStart: 8.6,
      videoEnd: 9.94,
      scrollVh: 130,
      dwell: 0.45,
      textSide: 'right',
      textVertical: 'mid',
      focalX: 0.5,
      depthRange: [380, 22],
      pressureRange: [38.0, 3.2],
      speedRange: [160, 0],
      colorGrade: {
        tint: 'rgba(12, 74, 110, 0.14)',
        tintOpacity: 0.26,
        vignette: 0.24,
        causticOpacity: 0.34,
        sparkleFactor: 0.15,
        accent: '#fbbf24',
      },
      posterFallback: 'assets/chapters/arrival.webp',
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
      prompt: '2. How should you pilot through the emerald kelp forest?',
      options: [
        { value: 'slow', label: 'Ease throttle for calm, steady passage' },
        { value: 'full', label: 'Hold full speed through the fronds' },
      ],
      correctValue: 'slow',
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
