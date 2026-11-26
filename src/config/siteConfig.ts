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
    title: 'MÉTIER DU FUTUR',
    sector: 'CONDUCTEUR SOUS-MARIN',
    skipLink: 'Aller à la présentation du métier',
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
      stationCode: '01 · PRÉSENTATION DU MÉTIER',
      headline: 'Conducteur de train sous-marin : un métier du futur',
      subline: 'Aux commandes d’un train à grande vitesse dans un tunnel étanche au fond de l’océan.',
      body: "Autour de sa cabine, des tonnes d'eau. Derrière lui, des centaines de passagers traversent la mer en quelques minutes, sans bateau ni avion. À l'avant, le conducteur de train sous-marin conduit, surveille et protège chaque trajet entre îles, côtes et pays.",
      hint: 'Fais défiler pour découvrir ce métier étape par étape',
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
      label: 'Son rôle & 3 métiers',
      stationCode: '02 · RÔLE DU CONDUCTEUR',
      headline: 'Un métier qui combine trois professions',
      body: 'Sous la mer, le conducteur occupe un poste unique qui réunit trois savoir-faire complémentaires :',
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
              text: 'il gère le trajet sur rails, les horaires, les arrêts en gare et la sécurité des passagers.',
            },
            {
              lead: 'Équipage de sous-marin',
              text: "il travaille sous l'eau, en espace clos, avec des procédures de sécurité rigoureuses.",
            },
            {
              lead: 'Pilote de ligne',
              text: 'il lit écrans et capteurs haute technologie, prêt à reprendre les commandes manuelles à tout instant.',
            },
          ],
        },
      ],
      miniStats: [
        { label: 'Traversée', value: 'Quelques minutes' },
        { label: 'Allure', value: 'Centaines de km/h' },
        { label: 'Conduite', value: '100 % électrique' },
        { label: 'Cadre de travail', value: 'Fond marin · lien surface' },
      ],
    },
    {
      id: 'kelp-skyline',
      index: 2,
      label: 'Pourquoi ce métier ?',
      stationCode: '03 · POURQUOI CE MÉTIER',
      headline: 'Pourquoi aura-t-on besoin de ce conducteur ?',
      body: 'Demain, traverser la mer aussi vite qu’en train exigera des spécialistes qualifiés aux commandes :',
      fact: 'Son quotidien : garantir rapidité, transport propre et sécurité absolue au fond des océans.',
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
              lead: 'Gagner un temps précieux',
              text: 'il assure des liaisons maritimes en quelques minutes au lieu de plusieurs heures de traversée.',
            },
            {
              lead: 'Piloter un transport propre',
              text: 'aux commandes d’un train 100 % électrique, il remplace des trajets bien plus polluants.',
            },
            {
              lead: 'Conduire par tous les temps',
              text: 'tempêtes, vagues et brouillard ne l’arrêtent pas ; son environnement reste stable sous la mer.',
            },
            {
              lead: 'Un métier bien réel demain',
              text: 'des conducteurs opèrent déjà sous la Manche ; ceux du futur piloteront bien plus vite et plus loin.',
            },
          ],
        },
      ],
    },
    {
      id: 'cab',
      index: 3,
      label: 'Journée type & IA',
      stationCode: '04 · JOURNÉE TYPE',
      headline: 'Dans sa cabine : vérifier, surveiller, réagir',
      body: "L'IA l'assiste sur une grande partie de la conduite, mais le conducteur reste le décideur humain face à l'imprévu. Sa journée suit trois étapes précises :",
      fact: 'Travail en lien direct : il reste en contact permanent avec le centre de contrôle à la surface.',
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
              text: 'il contrôle les freins, les portes, les circuits électriques, le niveau d’énergie et l’état du tunnel.',
            },
            {
              lead: 'Briefing avec la surface',
              text: 'il valide l’itinéraire, la météo sous-marine du tunnel et l’état de tous les capteurs.',
            },
            {
              lead: 'Pendant le trajet',
              text: 'il surveille vitesse, pression de l’eau, étanchéité et énergie ; au moindre voyant anormal, il agit.',
            },
          ],
        },
      ],
    },
    {
      id: 'sunken-arch',
      index: 4,
      label: 'Urgences & qualités',
      stationCode: '05 · SÉCURITÉ & QUALITÉS',
      headline: 'Gestion d’urgence et 5 qualités clés',
      body: 'Sous des millions de litres d’eau, le conducteur garde la tête froide. S’il détecte un incident, chaque réflexe est maîtrisé :',
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
          title: 'Protocole du conducteur (en cas de fuite)',
          bullets: [
            {
              text: 'Rester calme, alerter le centre de contrôle, ralentir ou arrêter le train, appliquer le plan de secours et guider les passagers vers les zones sûres.',
            },
          ],
        },
        {
          title: 'Les 5 compétences du métier',
          bullets: [
            {
              lead: 'Technique',
              text: 'comprendre électronique, mécanique et automatisation pour diagnostiquer toute alerte.',
            },
            {
              lead: 'Sang-froid & décision',
              text: 'rester lucide sous pression et trancher en quelques secondes.',
            },
            {
              lead: 'Équipe & espace clos',
              text: 'communiquer clairement avec les ingénieurs et rester à l’aise sans vue sur le ciel.',
            },
          ],
        },
      ],
    },
    {
      id: 'glow-zone',
      index: 5,
      label: 'La formation',
      stationCode: '06 · FORMATION',
      headline: 'Comment devient-on conducteur sous-marin ?',
      body: 'Pour accéder à ce poste à haute responsabilité, le futur conducteur suit un parcours rigoureux en quatre étapes :',
      fact: 'Un cursus complet mêlant ingénierie, pratique intensive sur simulateur et secourisme.',
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
              text: 'spécialisation en électronique, mécanique, automatisation ou transports.',
            },
            {
              lead: 'Centaines d’heures sur simulateur',
              text: 'entraînement sur réplique exacte de la cabine face à toutes les pannes possibles.',
            },
            {
              lead: 'Secours et sauvetage',
              text: 'qualification d’urgence proche des pompiers et des sous-mariniers.',
            },
            {
              lead: 'Aptitude médicale et physique',
              text: 'visites régulières garantissant résistance au stress et pleine forme.',
            },
          ],
        },
      ],
    },
    {
      id: 'dome-approach',
      index: 6,
      label: 'Avantages & défis',
      stationCode: '07 · BILAN DU MÉTIER',
      headline: 'Avantages et contraintes du métier',
      body: 'Exercer comme conducteur de train sous-marin offre des conditions exceptionnelles mais implique de vrais défis :',
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
          title: 'Les avantages du poste',
          tone: 'pro',
          bullets: [
            { text: 'Rémunération élevée (métier rare et hautement qualifié).' },
            { text: 'Outils de pointe : IA, automatisation et capteurs avancés.' },
            { text: 'Poste hors du commun au fond de l’océan.' },
            { text: 'Métier d’avenir engagé dans la mobilité propre.' },
            { text: 'Forte utilité : conduire des centaines de voyageurs en sécurité.' },
          ],
        },
        {
          title: 'Les difficultés à assumer',
          tone: 'con',
          bullets: [
            { text: 'Travailler sous une énorme pression hydraulique.' },
            { text: 'Vigilance constante face aux risques de fuite ou de panne.' },
            { text: 'Environnement confiné sans lumière du jour ni horizon.' },
            { text: 'Lourde responsabilité envers la vie des passagers.' },
            { text: 'Parcours de formation long et contrôles médicaux stricts.' },
          ],
        },
      ],
    },
    {
      id: 'platform',
      index: 7,
      label: 'Fin de service & profil',
      stationCode: '08 · PROFIL RECHERCHÉ',
      headline: 'Fin de service et profil du candidat idéal',
      body: "À l'arrivée à quai, le conducteur débarque ses passagers, rédige un rapport précis sur le moindre incident technique, puis passe le relais à la relève.",
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
          title: 'Ce métier te correspond-il ?',
          bullets: [
            {
              lead: 'Fait pour toi si tu aimes',
              text: 'la technologie et les machines, les défis, garder ton calme, travailler en équipe et porter de vraies responsabilités.',
            },
            {
              lead: 'À éviter si',
              text: 'tu supportes difficilement les espaces clos ou la pression, ou préfères un métier sans responsabilité critique.',
            },
          ],
        },
      ],
    },
    {
      id: 'arrival',
      index: 8,
      label: 'Avenir du métier',
      stationCode: '09 · AVENIR DU MÉTIER',
      headline: 'Demain, un premier conducteur aux commandes',
      body: "Il y a un peu plus d'un siècle, être pilote d'avion semblait impossible. Demain, le conducteur de train sous-marin sera une profession à part entière, confiée à des personnes calmes, curieuses et rigoureusement formées — capables de collaborer avec l'IA sans jamais cesser de réfléchir.",
      fact: 'Un métier exigeant et rare, mais passionnant, bien rémunéré et indispensable à la mobilité de demain.',
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
    conceptButton: 'Voir la vidéo',
    dossierButton: 'Fiche métier',
    audioOff: 'Audio océan : Non',
    audioOn: 'Audio océan : Oui',
    depthLabel: 'PROFONDEUR',
    pressureLabel: 'PRESSION',
    throttleLabel: 'PROPULSION',
    throttleIdle: 'VEILLE',
    throttleCruise: 'CROISIÈRE',
    throttleFull: 'PLEIN RÉGIME',
    replayLabel: 'Revenir au début',
    ctaPrimary: 'Tester le quiz métier (3 questions)',
    quizButton: 'Ouvrir la fiche métier complète',
  },

  audio: {
    enabledByDefault: false,
    oceanTrackUrl: null,
    masterGain: 0.28,
  },

  recapFacts: [
    { label: 'Rôle', value: 'Piloter, contrôler, sécuriser' },
    { label: 'Qualités', value: 'Sang-froid, technique, équipe' },
    { label: 'Formation', value: 'Ingénierie, simulateur, secours' },
    { label: 'Bilan', value: 'Exigeant, utile, bien rémunéré' },
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
