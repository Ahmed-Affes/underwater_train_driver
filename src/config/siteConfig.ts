/**
 * CONFIGURATION CENTRALE — ABYSSLINE 04 (FR)
 * ---------------------------------------------------------------------------
 * Tout le contenu des 3 sections est directement affiché au fil du scroll
 * dans les 9 chapitres, sans avoir besoin d'ouvrir de fenêtre modale.
 */

export type TextSide = 'left' | 'right' | 'top-left';

export interface HotspotConfig {
  id: string;
  x: number;
  y: number;
  label: string;
  description: string;
}

export interface ChapterBullet {
  lead?: string;
  text: string;
}

export interface ChapterGroup {
  title?: string;
  tone?: 'default' | 'pro' | 'con';
  bullets: ChapterBullet[];
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
  /** Blocs de contenu directement visibles dans la carte au fil du scroll */
  groups?: ChapterGroup[];
  /** Affichage côte à côte (ex: Avantages / Difficultés) */
  twoColGroups?: boolean;
  /** Grille compacte de chiffres clés */
  miniStats?: { label: string; value: string }[];
  trainingSteps?: string[];
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
  scrollMultiplier: 1.08,
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
        label: 'Inspection départ',
        description:
          "Vérification des freins, des portes, des systèmes électriques, de l'énergie et de l'état du tunnel avant de partir.",
      },
      {
        id: 'cab-pressure',
        x: 50,
        y: 72,
        label: 'Écrans & Capteurs',
        description:
          "Surveillance continue de la vitesse, de la pression d'eau, du niveau d'énergie et des fuites éventuelles.",
      },
      {
        id: 'cab-throttle',
        x: 78,
        y: 77,
        label: "Réaction d'urgence",
        description:
          'En cas de fuite : rester calme, prévenir la surface, ralentir ou arrêter le train et guider les passagers.',
      },
      {
        id: 'cab-sonar',
        x: 66,
        y: 44,
        label: 'Centre de contrôle',
        description:
          'Lien permanent avec le centre à la surface : confirmation de l’itinéraire, des capteurs et reprise manuelle prête.',
      },
    ],
  },

  chapters: [
    {
      id: 'departure',
      index: 0,
      label: 'Le métier',
      stationCode: 'SEC-01 · INTRO',
      headline: 'Conducteur de train sous-marin : un métier du futur',
      subline: 'Imagine un train à grande vitesse dans un tunnel étanche posé au fond de l’océan.',
      body: "Autour de lui, des tonnes d'eau. À l'intérieur, des passagers traversent la mer en quelques minutes, sans bateau et sans avion. À l'avant, une personne aux commandes : le conducteur de train sous-marin. Il conduit, surveille et protège un train qui relie îles, côtes et pays.",
      hint: 'Fais défiler pour prendre les commandes',
      videoStart: 0.0,
      videoEnd: 1.0,
      scrollVh: 170,
      dwell: 0.4,
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
      label: '3 professions & chiffres',
      stationCode: 'SEC-01 · MISSION',
      headline: 'Un métier qui combine trois professions',
      body: 'Un trajet qui prend plusieurs heures en bateau se fait ici en quelques minutes, sous la mer.',
      videoStart: 1.0,
      videoEnd: 1.95,
      scrollVh: 185,
      dwell: 0.48,
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
      groups: [
        {
          bullets: [
            {
              lead: 'Conducteur de train',
              text: 'gère un véhicule sur rails, avec ses horaires, ses arrêts et ses passagers.',
            },
            {
              lead: 'Équipage de sous-marin',
              text: "travaille sous l'eau, en espace fermé, avec des procédures de sécurité strictes.",
            },
            {
              lead: 'Pilote',
              text: 'surveille écrans, capteurs et systèmes très avancés, prêt à reprendre la main à tout moment.',
            },
          ],
        },
      ],
      miniStats: [
        { label: 'Durée', value: 'Quelques minutes' },
        { label: 'Vitesse', value: 'Centaines de km/h' },
        { label: 'Énergie', value: '100 % électrique' },
        { label: 'Lieu & équipe', value: 'Fond marin · lien surface' },
      ],
    },
    {
      id: 'kelp-skyline',
      index: 2,
      label: 'Pourquoi demain',
      stationCode: 'SEC-01 · ENJEUX',
      headline: 'Plus vite, plus propre, pas de science-fiction',
      body: 'Relier deux côtes séparées par la mer en quelques minutes répond aux besoins de transport de demain :',
      fact: "À retenir : rapidité, écologie et sécurité dans un décor que presque personne ne connaît.",
      videoStart: 1.95,
      videoEnd: 3.0,
      scrollVh: 195,
      dwell: 0.52,
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
      groups: [
        {
          bullets: [
            {
              lead: 'Aller plus vite',
              text: 'les villes grandissent et les voyageurs veulent traverser la mer rapidement.',
            },
            {
              lead: 'Transport plus propre',
              text: '100 % électrique, il réduit fortement la pollution face aux avions et bateaux.',
            },
            {
              lead: 'Hors météo',
              text: 'tempêtes, grosses vagues et brouillard ne bloquent pas un tunnel protégé.',
            },
            {
              lead: 'Déjà réel',
              text: 'le tunnel sous la Manche (France–Angleterre) existe déjà ; celui du futur sera plus long et plus rapide.',
            },
          ],
        },
      ],
    },
    {
      id: 'cab',
      index: 3,
      label: 'Quotidien & IA',
      stationCode: 'SEC-02 · PILOTAGE',
      headline: 'Humain et machine : vérifier et surveiller',
      body: "L'IA automatise une grande partie de la conduite, mais un humain formé reste indispensable face à l'imprévu. Sa journée repose sur trois mots : vérifier, surveiller, réagir.",
      fact: 'Lien permanent : avant et pendant le trajet, contact constant avec le centre de contrôle à la surface.',
      videoStart: 3.0,
      videoEnd: 5.0,
      scrollVh: 270,
      dwell: 0.58,
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
      groups: [
        {
          bullets: [
            {
              lead: 'Avant le départ (inspection)',
              text: 'vérifier les freins, les portes, les systèmes électriques, le niveau d’énergie et l’état du tunnel.',
            },
            {
              lead: 'Centre de contrôle',
              text: 'confirmer l’itinéraire, les conditions du tunnel et les capteurs avec la surface.',
            },
            {
              lead: 'Pendant le trajet',
              text: 'surveiller sur écrans la vitesse, la pression de l’eau, les fuites éventuelles et l’énergie ; si un voyant change, agir aussitôt.',
            },
          ],
        },
      ],
    },
    {
      id: 'sunken-arch',
      index: 4,
      label: 'Urgences & compétences',
      stationCode: 'SEC-02 · SÉCURITÉ',
      headline: "En cas d'urgence et compétences clés",
      body: "Chaque seconde compte : si un capteur détecte une fuite, chaque geste a été répété des centaines de fois à l'entraînement.",
      videoStart: 5.0,
      videoEnd: 7.0,
      scrollVh: 265,
      dwell: 0.56,
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
      groups: [
        {
          title: "Réflexes d'urgence (en cas de fuite)",
          bullets: [
            {
              text: 'Rester calme, prévenir le centre de contrôle, ralentir ou arrêter le train, suivre le plan de sécurité et guider les passagers vers les zones de protection.',
            },
          ],
        },
        {
          title: 'Les 5 compétences indispensables',
          bullets: [
            {
              lead: 'Technique',
              text: 'comprendre électronique, mécanique et automatisation.',
            },
            {
              lead: 'Sang-froid & rapidité',
              text: 'garder son calme sous des millions de litres d’eau et décider en quelques secondes.',
            },
            {
              lead: 'Équipe & espace clos',
              text: 'communication courte avec ingénieurs/surface, et aisance sans fenêtre sur le ciel ni grand air.',
            },
          ],
        },
      ],
    },
    {
      id: 'glow-zone',
      index: 5,
      label: 'La formation',
      stationCode: 'SEC-02 · FORMATION',
      headline: 'Comment devenir conducteur sous-marin ?',
      body: 'La formation est longue et exigeante, à la hauteur des responsabilités sous 380 mètres d’océan :',
      fact: 'À retenir : inspection, surveillance et réaction rapide exigent technique, calme et esprit d’équipe.',
      videoStart: 7.0,
      videoEnd: 9.25,
      scrollVh: 265,
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
      trainingSteps: ['Études tech', 'Simulateur', 'Secours', 'Bilan médical'],
      groups: [
        {
          bullets: [
            {
              lead: 'Études techniques ou d’ingénieur',
              text: 'électronique, mécanique, automatisation ou transport.',
            },
            {
              lead: 'Formation sur simulateur',
              text: 'des centaines d’heures sur une copie exacte du train avec toutes sortes de pannes simulées.',
            },
            {
              lead: 'Secours et sauvetage',
              text: 'formations proches de celles des pompiers ou des équipages de sous-marins.',
            },
            {
              lead: 'Contrôles médicaux et physiques réguliers',
              text: 'car la sécurité passe avant tout.',
            },
          ],
        },
      ],
    },
    {
      id: 'dome-approach',
      index: 6,
      label: 'Avantages & défis',
      stationCode: 'SEC-03 · BILAN',
      headline: 'Les avantages et les difficultés',
      body: 'Comme tout grand métier, celui de conducteur sous-marin réunit de forts atouts et de réelles exigences :',
      videoStart: 9.25,
      videoEnd: 12.0,
      scrollVh: 255,
      dwell: 0.52,
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
      twoColGroups: true,
      groups: [
        {
          title: 'Les avantages',
          tone: 'pro',
          bullets: [
            { text: 'Salaire élevé (métier rare et très spécialisé).' },
            { text: 'Technologie de pointe : IA, automatisation et capteurs.' },
            { text: 'Point de vue unique au fond de l’océan.' },
            { text: 'Impact positif : transport électrique propre.' },
            { text: 'Travail utile : mener des centaines de passagers à bon port.' },
          ],
        },
        {
          title: 'Les difficultés',
          tone: 'con',
          bullets: [
            { text: 'Pression énorme de l’eau sur le tunnel.' },
            { text: 'Risque de fuites et de pannes toujours possible.' },
            { text: 'Environnement fermé sans lumière du jour ni horizon.' },
            { text: 'Immense responsabilité envers la vie des passagers.' },
            { text: 'Formation longue et contrôles réguliers exigeants.' },
          ],
        },
      ],
    },
    {
      id: 'platform',
      index: 7,
      label: 'Arrivée & profil',
      stationCode: 'SEC-02 & 03 · PROFIL',
      headline: "À l'arrivée : rapport et profil idéal",
      body: "Une fois les passagers à quai, le conducteur rédige un rapport complet notant le moindre détail inhabituel, puis passe le train à l'équipe suivante.",
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
      groups: [
        {
          title: 'Ce métier est-il fait pour toi ?',
          bullets: [
            {
              lead: 'Idéal si tu aimes',
              text: 'la technologie et les machines, les défis, rester calme, le travail en équipe et les vraies responsabilités.',
            },
            {
              lead: 'Moins adapté si',
              text: 'tu supportes mal les espaces fermés ou le stress, ou préfères un poste sans responsabilité importante.',
            },
          ],
        },
      ],
    },
    {
      id: 'arrival',
      index: 8,
      label: 'Le futur & conclusion',
      stationCode: 'SEC-03 · CONCLUSION',
      headline: 'Demain, prendre les commandes ?',
      body: "Il y a un peu plus d'un siècle, voler en avion semblait impossible. Comme chaque grande invention, ce métier deviendra réel et aura besoin de personnes courageuses, calmes et bien formées — capables de faire confiance à la technologie sans jamais cesser de réfléchir. Qui sait ? Peut-être que l'un d'entre nous sera le premier à prendre les commandes.",
      fact: 'Un métier difficile et exigeant, mais au salaire élevé, utile et au décor unique.',
      videoStart: 16.25,
      videoEnd: 20.0,
      scrollVh: 270,
      dwell: 0.46,
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
    ctaPrimary: "Test d'aptitude (3 questions)",
    quizButton: 'Lire aussi en vue Dossier complet',
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
        {
          value: 'calm',
          label: 'Rester calme, prévenir le centre de contrôle, ralentir et guider les passagers',
        },
        { value: 'accel', label: 'Accélérer au maximum sans prévenir la surface' },
      ],
      correctValue: 'calm',
    },
    {
      id: 'q3',
      prompt: '3. Quel élément est indispensable pour accéder au poste ?',
      options: [
        {
          value: 'sim',
          label: 'Études techniques, centaines d’heures de simulateur, secours et bilans médicaux',
        },
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
