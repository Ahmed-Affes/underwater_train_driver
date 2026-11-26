/**
 * CONFIGURATION CENTRALE — ABYSSLINE 04 (FR)
 * ---------------------------------------------------------------------------
 * Source unique pour :
 *  - Le moteur vidéo ('frames' WebP progressif ou 'video' MP4 direct)
 *  - Les 3 paliers de qualité (desktop 1080p supersamplé 4K, tablette 720p, mobile 540p)
 *  - Les 9 chapitres calés sur toute la vidéo (0.00s -> 20.00s sans coupure)
 *  - Les onglets interactifs, le poste de pilotage, le dossier complet & le quiz
 */

export type TextSide = 'left' | 'right' | 'top-left';

export interface HotspotConfig {
  id: string;
  x: number;
  y: number;
  label: string;
  description: string;
}

export interface ChapterTab {
  id: string;
  label: string;
  text: string;
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
  videoStart: number;
  videoEnd: number;
  scrollVh: number;
  dwell: number;
  textSide: TextSide;
  textVertical: 'top' | 'mid' | 'bottom';
  focalX: number;
  depthRange: [number, number];
  pressureRange: [number, number];
  speedRange: [number, number];
  accent: string;
  sparkleFactor: number;
  posterFallback: string;
  hotspots: HotspotConfig[];
  tabs?: ChapterTab[];
  trainingSteps?: string[];
  compensationCard?: {
    title: string;
    items: string[];
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

export interface DossierBlock {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
}

export interface DossierSection {
  id: string;
  tabLabel: string;
  title: string;
  blocks: DossierBlock[];
}

export interface SiteConfig {
  brand: {
    title: string;
    sector: string;
    skipLink: string;
  };
  playbackEngine: 'frames' | 'video';
  durationSec: number;
  scrollMultiplier: number;
  scrubLerp: number;
  particleDensity: number;
  tiers: Record<'desktop' | 'tablet' | 'mobile', TierSpec>;
  videoSources: {
    conceptFilmMp4: string;
    conceptFilmPoster: string;
  };
  cutTimestamps: number[];
  cabMedia: CabMediaConfig;
  chapters: ChapterConfig[];
  hud: {
    conceptButton: string;
    dossierButton: string;
    audioOff: string;
    audioOn: string;
    depthLabel: string;
    pressureLabel: string;
    throttleLabel: string;
    throttleIdle: string;
    throttleCruise: string;
    throttleFull: string;
    replayLabel: string;
    ctaPrimary: string;
    quizButton: string;
  };
  audio: {
    enabledByDefault: boolean;
    oceanTrackUrl: string | null;
    masterGain: number;
  };
  recapFacts: { label: string; value: string }[];
  quizQuestions: QuizQuestion[];
  dossierSections: DossierSection[];
}

export const SITE_CONFIG: SiteConfig = {
  brand: {
    title: 'ABYSSLINE',
    sector: 'SECTEUR 04',
    skipLink: 'Aller au récit du voyage',
  },

  playbackEngine: 'frames',
  durationSec: 20.0,
  scrollMultiplier: 1.0,
  scrubLerp: 0.14,
  particleDensity: 90,

  tiers: {
    desktop: {
      id: 'desktop',
      frameCount: 480,
      fps: 24,
      width: 1920,
      height: 1080,
      pattern: 'assets/frames/desktop/f_{index}.webp?v=4k-fr-1',
    },
    tablet: {
      id: 'tablet',
      frameCount: 400,
      fps: 20,
      width: 1280,
      height: 720,
      pattern: 'assets/frames/tablet/f_{index}.webp?v=4k-fr-1',
    },
    mobile: {
      id: 'mobile',
      frameCount: 320,
      fps: 16,
      width: 960,
      height: 540,
      pattern: 'assets/frames/mobile/f_{index}.webp?v=4k-fr-1',
    },
  },

  videoSources: {
    conceptFilmMp4: 'assets/video/abyssline-concept.mp4?v=4k-fr-1',
    conceptFilmPoster: 'assets/posters/ch0.webp?v=4k-fr-1',
  },

  cutTimestamps: [1.0, 1.95, 3.0, 5.0, 7.0, 9.25, 12.0, 16.25],

  cabMedia: {
    overrideVideo: false,
    type: 'image',
    imageWebp: 'assets/posters/ch3.webp?v=4k-fr-1',
    videoMp4: undefined,
    alt: 'Poste de pilotage panoramique du train sous-marin avec robot assistant, sonar et manette de poussée',
    robotTip: "Je garde un œil sur les capteurs. Toi, garde un œil sur l'imprévu.",
    hotspots: [
      {
        id: 'cab-hull',
        x: 20,
        y: 69,
        label: 'Avant le départ',
        description:
          "Inspection complète : vérification des freins, des portes, des systèmes électriques, de l'énergie et de l'état du tunnel.",
      },
      {
        id: 'cab-pressure',
        x: 50,
        y: 72,
        label: 'Surveillance & Pression',
        description:
          "Contrôle permanent de la vitesse, de la pression d'eau autour du tunnel, du niveau d'énergie et des fuites éventuelles.",
      },
      {
        id: 'cab-throttle',
        x: 78,
        y: 77,
        label: "En cas d'urgence",
        description:
          'Si un capteur signale une fuite : rester calme, prévenir le centre de contrôle, ralentir ou arrêter le train et guider les passagers.',
      },
      {
        id: 'cab-sonar',
        x: 66,
        y: 44,
        label: 'Centre de contrôle',
        description:
          'Liaison permanente avec la surface : confirmation de l’itinéraire, des conditions du tunnel et reprise manuelle possible à tout moment.',
      },
    ],
  },

  chapters: [
    {
      id: 'departure',
      index: 0,
      label: 'Le métier',
      stationCode: 'STN-00',
      headline: 'Conducteur de train sous-marin',
      subline: 'Un métier du futur au fond de l’océan.',
      body: "Imagine un train à grande vitesse dans un tunnel étanche sous la mer : des tonnes d'eau autour, des voyageurs à bord, et toi aux commandes.",
      hint: 'Fais défiler pour prendre les commandes',
      videoStart: 0.0,
      videoEnd: 1.0,
      scrollVh: 160,
      dwell: 0.35,
      textSide: 'right',
      textVertical: 'top',
      focalX: 0.44,
      depthRange: [0, 18],
      pressureRange: [1.0, 2.8],
      speedRange: [0, 72],
      accent: '#22d3ee',
      sparkleFactor: 0.0,
      posterFallback: 'assets/posters/ch0.webp?v=4k-fr-1',
      hotspots: [],
    },
    {
      id: 'reef',
      index: 1,
      label: '3 professions',
      stationCode: 'MRK-01',
      headline: 'Trois métiers réunis en un',
      body: 'Tu relies îles, côtes et pays en quelques minutes au lieu de plusieurs heures en bateau, en lien constant avec la surface.',
      fact: 'Trajet : quelques minutes · 100 % électrique · Fond de l’océan',
      videoStart: 1.0,
      videoEnd: 1.95,
      scrollVh: 165,
      dwell: 0.42,
      textSide: 'right',
      textVertical: 'top',
      focalX: 0.44,
      depthRange: [18, 46],
      pressureRange: [2.8, 5.6],
      speedRange: [72, 145],
      accent: '#2dd4bf',
      sparkleFactor: 0.06,
      posterFallback: 'assets/posters/ch1.webp?v=4k-fr-1',
      hotspots: [],
      tabs: [
        {
          id: 'train',
          label: 'Train',
          text: 'Conducteur de train : gère le convoi sur rails, les horaires, les arrêts et le confort des passagers.',
        },
        {
          id: 'sub',
          label: 'Sous-marin',
          text: 'Équipage de sous-marin : travaille sous la mer en espace fermé avec des procédures de sécurité strictes.',
        },
        {
          id: 'pilot',
          label: 'Pilote',
          text: 'Pilote : surveille écrans, capteurs et systèmes avancés, prêt à reprendre les commandes à tout instant.',
        },
      ],
    },
    {
      id: 'kelp-skyline',
      index: 2,
      label: 'Pourquoi demain',
      stationCode: 'MRK-02',
      headline: 'Plus vite, propre, hors météo',
      body: 'Tempêtes, vagues et brouillard bloquent bateaux et avions, pas le tunnel. Propre et électrique, il prolonge déjà le tunnel sous la Manche.',
      fact: 'Inspiration réelle : le tunnel sous la Manche existe déjà',
      videoStart: 1.95,
      videoEnd: 3.0,
      scrollVh: 175,
      dwell: 0.48,
      textSide: 'right',
      textVertical: 'top',
      focalX: 0.5,
      depthRange: [46, 84],
      pressureRange: [5.6, 9.4],
      speedRange: [145, 220],
      accent: '#34d399',
      sparkleFactor: 0.1,
      posterFallback: 'assets/posters/ch2.webp?v=4k-fr-1',
      hotspots: [],
      tabs: [
        {
          id: 'speed',
          label: 'Rapidité',
          text: 'Relier deux côtes séparées par la mer en quelques minutes à plusieurs centaines de km/h.',
        },
        {
          id: 'eco',
          label: 'Écologie',
          text: '100 % électrique : une alternative bien moins polluante que les traversées en avion ou en bateau.',
        },
        {
          id: 'weather',
          label: 'Météo',
          text: 'Dans un tunnel protégé au fond de l’eau, le train circule en toute saison malgré les tempêtes.',
        },
      ],
    },
    {
      id: 'cab',
      index: 3,
      label: 'Le poste de pilotage',
      stationCode: 'POV-03',
      headline: 'Humain et machine aux commandes',
      body: "L'IA assure une grande partie de la conduite, mais seul un humain sait décider quand survient l'imprévu.",
      fact: 'Journée type : vérifier, surveiller, réagir (touche les points)',
      videoStart: 3.0,
      videoEnd: 5.0,
      scrollVh: 265,
      dwell: 0.56,
      textSide: 'right',
      textVertical: 'top',
      focalX: 0.5,
      depthRange: [84, 136],
      pressureRange: [9.4, 14.6],
      speedRange: [220, 260],
      accent: '#38bdf8',
      sparkleFactor: 0.12,
      posterFallback: 'assets/posters/ch3.webp?v=4k-fr-1',
      hotspots: [],
    },
    {
      id: 'sunken-arch',
      index: 4,
      label: 'Compétences & formation',
      stationCode: 'STN-04',
      headline: 'Compétences et parcours exigeant',
      body: "Études techniques, centaines d'heures sur simulateur de pannes, secours sous-marins et contrôles médicaux réguliers.",
      fact: '5 atouts clés : technique, sang-froid, décision, équipe, espace clos',
      videoStart: 5.0,
      videoEnd: 7.0,
      scrollVh: 255,
      dwell: 0.54,
      textSide: 'right',
      textVertical: 'top',
      focalX: 0.5,
      depthRange: [136, 232],
      pressureRange: [14.6, 24.2],
      speedRange: [260, 210],
      accent: '#fbbf24',
      sparkleFactor: 0.24,
      posterFallback: 'assets/posters/ch4.webp?v=4k-fr-1',
      hotspots: [],
      trainingSteps: ['Études tech', 'Simulateur', 'Secours', 'Bilan médical'],
    },
    {
      id: 'glow-zone',
      index: 5,
      label: 'Avantages & défis',
      stationCode: 'TRN-05',
      headline: 'Avantages et difficultés des abysses',
      body: 'À 380 m, la pression est colossale et chaque décision engage la vie des passagers. En retour : un métier rare, utile et fascinant.',
      fact: 'À retenir : rapidité, écologie, sécurité et maîtrise sous pression',
      videoStart: 7.0,
      videoEnd: 9.25,
      scrollVh: 275,
      dwell: 0.55,
      textSide: 'right',
      textVertical: 'top',
      focalX: 0.5,
      depthRange: [232, 380],
      pressureRange: [24.2, 38.0],
      speedRange: [210, 240],
      accent: '#f472b6',
      sparkleFactor: 1.0,
      posterFallback: 'assets/posters/ch5.webp?v=4k-fr-1',
      hotspots: [],
      tabs: [
        {
          id: 'pros',
          label: 'Avantages',
          text: 'Salaire élevé · Technologie IA & capteurs · Décor océanique unique · Transport propre · Travail utile et fier.',
        },
        {
          id: 'cons',
          label: 'Difficultés',
          text: 'Pression énorme · Risque de fuites/pannes · Espace fermé sans lumière du jour · Lourde responsabilité · Longue formation.',
        },
      ],
    },
    {
      id: 'dome-approach',
      index: 6,
      label: 'Pour toi ?',
      stationCode: 'STN-06',
      headline: 'Ce métier est-il fait pour toi ?',
      body: 'Idéal si tu aimes la technologie, le travail en équipe, les défis et garder ton calme. Plus dur si les espaces clos te pèsent.',
      fact: 'Sang-froid : garder son calme même quand une alarme sonne',
      videoStart: 9.25,
      videoEnd: 12.0,
      scrollVh: 225,
      dwell: 0.45,
      textSide: 'right',
      textVertical: 'top',
      focalX: 0.42,
      depthRange: [380, 128],
      pressureRange: [38.0, 13.8],
      speedRange: [240, 82],
      accent: '#22d3ee',
      sparkleFactor: 0.28,
      posterFallback: 'assets/posters/ch6.webp?v=4k-fr-1',
      hotspots: [],
    },
    {
      id: 'platform',
      index: 7,
      label: 'Quai & rapport',
      stationCode: 'STN-07',
      headline: 'À l’arrivée : le rapport technique',
      body: "Une fois les passagers descendus en sécurité, tu notes le moindre détail inhabituel puis tu passes le train à l'équipe suivante.",
      fact: 'Vitesse à quai : 0 km/h · Contrôle complet avant chaque relève',
      videoStart: 12.0,
      videoEnd: 16.25,
      scrollVh: 255,
      dwell: 0.52,
      textSide: 'right',
      textVertical: 'top',
      focalX: 0.46,
      depthRange: [128, 48],
      pressureRange: [13.8, 5.8],
      speedRange: [82, 0],
      accent: '#38bdf8',
      sparkleFactor: 0.1,
      posterFallback: 'assets/posters/ch7.webp?v=4k-fr-1',
      hotspots: [],
    },
    {
      id: 'arrival',
      index: 8,
      label: 'Le futur',
      stationCode: 'STN-08',
      headline: 'Prêt à prendre les commandes ?',
      body: "Il y a un siècle, voler en avion semblait fou. Demain, l'un d'entre nous sera peut-être le premier conducteur sous l'océan.",
      fact: "Un métier d'avenir entre intelligence artificielle et sang-froid humain",
      videoStart: 16.25,
      videoEnd: 20.0,
      scrollVh: 265,
      dwell: 0.44,
      textSide: 'right',
      textVertical: 'top',
      focalX: 0.5,
      depthRange: [48, 28],
      pressureRange: [5.8, 3.8],
      speedRange: [0, 220],
      accent: '#fbbf24',
      sparkleFactor: 0.16,
      posterFallback: 'assets/posters/ch8.webp?v=4k-fr-1',
      hotspots: [],
    },
  ],

  hud: {
    conceptButton: 'Vidéo 4K complète',
    dossierButton: 'Dossier complet',
    audioOff: 'Audio océan : Non',
    audioOn: 'Audio océan : Oui',
    depthLabel: 'PROFONDEUR',
    pressureLabel: 'PRESSION',
    throttleLabel: 'PROPULSION',
    throttleIdle: 'VEILLE',
    throttleCruise: 'CROISIÈRE',
    throttleFull: 'PLEIN RÉGIME',
    replayLabel: 'Rejouer le voyage',
    ctaPrimary: 'Lire le dossier complet',
    quizButton: "Test d'aptitude (3 questions)",
  },

  audio: {
    enabledByDefault: false,
    oceanTrackUrl: null,
    masterGain: 0.28,
  },

  recapFacts: [
    { label: 'Mission', value: 'Relier les côtes en minutes' },
    { label: 'Énergie', value: '100 % électrique · hors météo' },
    { label: 'Formation', value: 'Ingénierie + simulateur + secours' },
    { label: 'Profil', value: 'Sang-froid, technique, équipe' },
  ],

  quizQuestions: [
    {
      id: 'q1',
      prompt: '1. Quelles trois professions le conducteur sous-marin combine-t-il ?',
      options: [
        { value: 'meteo', label: 'Météorologue, marin-pêcheur et guide' },
        { value: 'trio', label: 'Conducteur de train, équipage de sous-marin et pilote' },
      ],
      correctValue: 'trio',
    },
    {
      id: 'q2',
      prompt: '2. Que faire en priorité si un capteur détecte une fuite ?',
      options: [
        { value: 'calm', label: 'Rester calme, prévenir le centre de contrôle, ralentir et guider les passagers' },
        { value: 'accel', label: 'Accélérer au maximum sans prévenir la surface' },
      ],
      correctValue: 'calm',
    },
    {
      id: 'q3',
      prompt: '3. Quel élément est indispensable pour accéder au poste ?',
      options: [
        { value: 'sim', label: 'Études techniques, centaines d’heures de simulateur, secours et bilans médicaux' },
        { value: 'permis', label: 'Un simple permis de conduire classique' },
      ],
      correctValue: 'sim',
    },
  ],

  dossierSections: [
    {
      id: 'sec-1',
      tabLabel: '1. Le métier',
      title: 'Conducteur de train sous-marin : un métier du futur',
      blocks: [
        {
          heading: 'En quoi consiste ce métier ?',
          paragraphs: [
            "Imagine un train à grande vitesse qui roule dans un tunnel étanche posé au fond de l'océan. Autour de lui, des tonnes d'eau. À l'intérieur, des passagers qui traversent la mer en quelques minutes, sans bateau et sans avion. À l'avant : le conducteur de train sous-marin.",
            "Il conduit, surveille et protège un train qui relie des îles, des côtes et même des pays entre eux.",
          ],
          bullets: [
            'Conducteur de train : gère un véhicule sur rails, ses horaires, ses arrêts et ses passagers.',
            "Membre d'équipage de sous-marin : travaille sous l'eau, en espace fermé, avec des procédures de sécurité strictes.",
            'Pilote : surveille des écrans, capteurs et systèmes avancés, prêt à reprendre les commandes à tout moment.',
          ],
        },
        {
          heading: 'Pourquoi ce métier existera-t-il ?',
          bullets: [
            'Aller plus vite : relier deux côtes séparées par la mer en quelques minutes au lieu de plusieurs heures.',
            "Transport plus propre : un train 100 % électrique réduit fortement la pollution face aux avions et bateaux.",
            'Météo maîtrisée : tempêtes, grosses vagues et brouillard n’arrêtent pas un train en tunnel protégé.',
            "Pas de la pure science-fiction : le tunnel sous la Manche existe déjà et préfigure ce réseau plus rapide.",
            "Humain et machine : l'IA automatise une grande partie de la marche, mais un humain formé reste indispensable face à l'imprévu.",
          ],
        },
        {
          heading: 'En chiffres et idées clés',
          bullets: [
            'Durée : quelques minutes au lieu de plusieurs heures · Vitesse : plusieurs centaines de km/h',
            "Énergie : 100 % électrique · Lieu : le fond de l'océan · Lien permanent avec le centre de contrôle",
            "À retenir : rapidité, écologie et sécurité dans un décor que presque personne ne connaît.",
          ],
        },
      ],
    },
    {
      id: 'sec-2',
      tabLabel: '2. Quotidien & Formation',
      title: 'Le quotidien, les compétences et la formation',
      blocks: [
        {
          heading: 'Trois mots : vérifier, surveiller, réagir',
          bullets: [
            "Avant le départ (inspection) : freins, portes, systèmes électriques, niveau d'énergie et état du tunnel.",
            "Centre de contrôle : confirmation constante de l'itinéraire, des conditions du tunnel et des capteurs avec la surface.",
            "Pendant le trajet : surveillance des écrans — vitesse, pression de l'eau, fuites éventuelles et énergie.",
            "En cas d'urgence : rester calme, prévenir le centre de contrôle, ralentir ou arrêter le train, suivre le plan et guider les passagers.",
            "À l'arrivée : rédiger le rapport complet et signaler le moindre détail avant de passer le relais à l'équipe suivante.",
          ],
        },
        {
          heading: 'Les 5 compétences nécessaires',
          bullets: [
            'Connaissances techniques (électronique, mécanique, automatisation) pour comprendre toute alerte.',
            'Sang-froid absolu sous des millions de litres d’eau, même quand une alarme sonne.',
            'Rapidité de décision pour analyser un problème et agir en quelques secondes.',
            'Travail d’équipe : communication claire et courte avec ingénieurs, techniciens et surface.',
            'Aisance dans les espaces fermés : sans fenêtre sur le ciel ni grand air.',
          ],
        },
        {
          heading: 'Comment devenir conducteur ?',
          bullets: [
            'Études techniques ou d’ingénieur : électronique, mécanique, automatisation ou transport.',
            'Formation sur simulateur : des centaines d’heures sur une réplique exacte avec pannes simulées.',
            'Formations de secours et sauvetage (type pompiers ou équipages de sous-marins).',
            'Contrôles médicaux et physiques réguliers, car la sécurité passe avant tout.',
          ],
        },
      ],
    },
    {
      id: 'sec-3',
      tabLabel: '3. Bilan & Futur',
      title: 'Avantages, difficultés et conclusion',
      blocks: [
        {
          heading: 'Les avantages',
          bullets: [
            'Salaire élevé grâce à la rareté, la spécialisation et le niveau de responsabilité.',
            "Technologie de pointe : IA, automatisation et capteurs ultra-modernes au quotidien.",
            "Point de vue unique au fond de l'océan, impact écologique positif et fierté de mener des centaines de passagers à bon port.",
          ],
        },
        {
          heading: 'Les difficultés',
          bullets: [
            "Pression énorme de l'eau sur le tunnel et risque permanent de fuites ou de pannes.",
            'Environnement fermé sans lumière du jour ni horizon, exigeant physiquement et mentalement.',
            'Immense responsabilité envers les passagers et formation longue et exigeante.',
          ],
        },
        {
          heading: 'Ce métier est-il fait pour toi ?',
          paragraphs: [
            'Il convient à ceux qui aiment la technologie, les défis, le travail en équipe et les responsabilités ; moins à ceux qui supportent mal les espaces clos ou le stress.',
            "Il y a un peu plus d'un siècle, voler en avion paraissait tout aussi impossible. Qui sait ? Peut-être que l'un d'entre nous sera le premier à prendre les commandes.",
          ],
        },
      ],
    },
  ],
};
