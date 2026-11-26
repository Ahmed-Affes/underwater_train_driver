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
  };
  audio: {
    enabledByDefault: boolean;
    oceanTrackUrl: string | null;
    masterGain: number;
  };
  recapFacts: { label: string; value: string }[];
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
    alt: 'Cabine du conducteur de train sous-marin avec robot assistant et écrans',
    robotTip: "Je surveille les écrans avec toi. Reste prêt s'il y a un imprévu !",
    hotspots: [
      {
        id: 'cab-hull',
        x: 20,
        y: 69,
        label: 'Avant le départ',
        description:
          "Vérifier les freins, les portes, l'électricité, la batterie et l'état du tunnel.",
      },
      {
        id: 'cab-pressure',
        x: 50,
        y: 72,
        label: 'Écrans de contrôle',
        description:
          "Surveiller la vitesse, la pression de l'eau, l'énergie et vérifier qu'il n'y a aucune fuite.",
      },
      {
        id: 'cab-throttle',
        x: 78,
        y: 77,
        label: "En cas de danger",
        description:
          "Rester calme, appeler la surface, ralentir ou arrêter le train et aider les voyageurs.",
      },
      {
        id: 'cab-sonar',
        x: 66,
        y: 44,
        label: 'Centre de contrôle',
        description:
          'Parler par radio avec l’équipe à la surface pour confirmer le trajet et la sécurité.',
      },
    ],
  },

  chapters: [
    {
      id: 'departure',
      index: 0,
      label: 'Le métier',
      stationCode: '01 · LE MÉTIER',
      headline: 'Conducteur de train sous-marin : un métier du futur',
      subline: 'Conduire un train très rapide dans un tunnel sous la mer.',
      body: "Tout autour du train, il y a des tonnes d'eau. À l'intérieur, les voyageurs traversent la mer en quelques minutes, sans bateau et sans avion. Devant, le conducteur pilote le train, surveille les écrans et protège tout le monde.",
      hint: 'Fais défiler pour découvrir ce métier',
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
      label: 'Son rôle',
      stationCode: '02 · SON RÔLE',
      headline: 'Un métier qui mélange 3 travaux',
      body: "Sous l'océan, le conducteur fait un travail unique qui réunit trois rôles :",
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
              text: "il conduit sur les rails, respecte l'horaire et s'occupe des voyageurs.",
            },
            {
              lead: 'Marin de sous-marin',
              text: "il travaille sous la mer, dans un espace fermé, avec des règles de sécurité très strictes.",
            },
            {
              lead: 'Pilote',
              text: 'il surveille des écrans modernes et peut reprendre le contrôle à la main à tout moment.',
            },
          ],
        },
      ],
      miniStats: [
        { label: 'Durée', value: 'Quelques minutes' },
        { label: 'Vitesse', value: 'Très rapide' },
        { label: 'Énergie', value: '100 % électrique' },
        { label: 'Lieu', value: 'Sous la mer' },
      ],
    },
    {
      id: 'kelp-skyline',
      index: 2,
      label: 'Pourquoi ce métier ?',
      stationCode: '03 · POURQUOI ?',
      headline: 'Pourquoi aura-t-on besoin de ce conducteur ?',
      body: 'Demain, on voudra traverser la mer plus vite et sans polluer. Il faudra donc des pros pour conduire ces trains :',
      fact: "En résumé : un métier pour voyager vite, proprement et en sécurité sous l'océan.",
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
              text: 'faire en quelques minutes un trajet qui prend des heures en bateau.',
            },
            {
              lead: 'Moins polluer',
              text: "conduire un train 100 % électrique, bien plus propre que l'avion ou le bateau.",
            },
            {
              lead: 'Zéro météo',
              text: 'la pluie, le brouillard et les grosses vagues ne bloquent jamais le tunnel.',
            },
            {
              lead: 'C’est possible',
              text: "un train passe déjà sous la mer entre la France et l'Angleterre ; ceux de demain seront juste plus rapides.",
            },
          ],
        },
      ],
    },
    {
      id: 'cab',
      index: 3,
      label: 'Sa journée',
      stationCode: '04 · SA JOURNÉE',
      headline: 'Dans sa cabine : vérifier, surveiller, réagir',
      body: "Un ordinateur aide beaucoup à conduire, mais un humain reste toujours obligatoire en cas de problème. Sa journée a trois étapes :",
      fact: "Il reste en contact radio tout le long du trajet avec l'équipe à la surface.",
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
              lead: 'Avant le départ',
              text: "il vérifie les freins, les portes, l'électricité, la batterie et l'état du tunnel.",
            },
            {
              lead: 'Avec la surface',
              text: 'il appelle le centre de contrôle pour confirmer le trajet et vérifier les capteurs.',
            },
            {
              lead: 'Pendant le trajet',
              text: "il regarde sur les écrans la vitesse, la pression de l'eau, l'énergie et les fuites possibles.",
            },
          ],
        },
      ],
    },
    {
      id: 'sunken-arch',
      index: 4,
      label: 'Sécurité & qualités',
      stationCode: '05 · SÉCURITÉ',
      headline: 'En cas de danger et qualités nécessaires',
      body: "Sous des millions de litres d'eau, le conducteur ne doit jamais paniquer. Si une alarme sonne, il sait quoi faire :",
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
          title: 'Si un capteur détecte une fuite',
          bullets: [
            {
              text: 'Rester calme, prévenir le centre de contrôle, ralentir ou arrêter le train et guider les voyageurs vers un endroit sûr.',
            },
          ],
        },
        {
          title: 'Les 5 qualités pour ce métier',
          bullets: [
            {
              lead: 'Technique',
              text: "comprendre les machines, l'électricité et les ordinateurs.",
            },
            {
              lead: 'Calme et rapide',
              text: 'garder son sang-froid et décider vite en cas de problème.',
            },
            {
              lead: 'Équipe & espace fermé',
              text: "bien communiquer avec l'équipe et être à l'aise sans voir le ciel.",
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
      headline: 'Comment devenir conducteur sous-marin ?',
      body: 'Comme la sécurité des voyageurs est très importante, il faut suivre une vraie formation en 4 étapes :',
      fact: 'Une formation sérieuse pour être prêt face à toutes les situations.',
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
      trainingSteps: ['Études', 'Simulateur', 'Secours', 'Santé'],
      groups: [
        {
          bullets: [
            {
              lead: 'Études techniques',
              text: "apprendre la mécanique, l'électricité ou le fonctionnement des trains.",
            },
            {
              lead: 'Simulateur',
              text: "s'entraîner des centaines d'heures dans une fausse cabine avec de fausses pannes.",
            },
            {
              lead: 'Secours',
              text: 'apprendre à aider et sauver les gens, comme les pompiers.',
            },
            {
              lead: 'Visites médicales',
              text: 'vérifier souvent que la santé physique et morale est bonne.',
            },
          ],
        },
      ],
    },
    {
      id: 'dome-approach',
      index: 6,
      label: 'Avantages & défis',
      stationCode: '07 · LE BILAN',
      headline: 'Les bons côtés et les côtés difficiles',
      body: 'Comme tous les métiers, celui-ci a de grands avantages mais aussi des difficultés :',
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
            { text: 'Un très bon salaire, car le métier est rare.' },
            { text: 'Utiliser des écrans et outils très modernes.' },
            { text: "Travailler dans un décor unique, sous l'océan." },
            { text: 'Aider la planète grâce à un train propre.' },
            { text: 'Un métier utile pour des centaines de voyageurs.' },
          ],
        },
        {
          title: 'Les difficultés',
          tone: 'con',
          bullets: [
            { text: "L'énorme poids de l'eau autour du tunnel." },
            { text: 'Le risque de panne ou de fuite à surveiller.' },
            { text: 'Rester dans un lieu fermé, sans soleil ni air.' },
            { text: 'Une grande responsabilité pour les passagers.' },
            { text: 'Des études longues et des tests de santé réguliers.' },
          ],
        },
      ],
    },
    {
      id: 'platform',
      index: 7,
      label: 'Pour qui ?',
      stationCode: '08 · POUR QUI ?',
      headline: 'Fin du trajet et à qui convient ce métier',
      body: "Quand le train arrive en gare, le conducteur fait sortir les voyageurs, écrit un rapport sur le trajet et laisse sa place à l'équipe suivante.",
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
              lead: 'Oui, si tu aimes',
              text: 'la technologie et les machines, les défis, rester calme, travailler en équipe et avoir des responsabilités.',
            },
            {
              lead: "Non, si tu n'aimes pas",
              text: 'les endroits fermés, le stress, ou si tu préfères un travail plus calme.',
            },
          ],
        },
      ],
    },
    {
      id: 'arrival',
      index: 8,
      label: "L'avenir",
      stationCode: '09 · CONCLUSION',
      headline: 'Et demain ?',
      body: "Il y a cent ans, conduire un avion semblait impossible. Demain, le conducteur de train sous-marin sera un vrai métier. On aura besoin de personnes calmes, courageuses et bien formées, capables d'utiliser l'ordinateur tout en gardant leur propre jugement.",
      fact: 'Un métier difficile, mais passionnant, utile et très bien payé.',
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
    ctaPrimary: 'Lire la fiche complète',
  },

  audio: {
    enabledByDefault: false,
    oceanTrackUrl: null,
    masterGain: 0.28,
  },

  recapFacts: [
    { label: 'Rôle', value: 'Conduire et protéger le train' },
    { label: 'Qualités', value: 'Calme, technique, équipe' },
    { label: 'Formation', value: 'Études, simulateur, secours' },
    { label: 'Bilan', value: 'Utile, moderne et bien payé' },
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
            "Imagine un train très rapide dans un tunnel fermé au fond de l'océan. Tout autour, il y a des tonnes d'eau. À l'intérieur, des voyageurs traversent la mer en quelques minutes, sans bateau et sans avion.",
            "Devant, c'est le conducteur de train sous-marin. Il conduit, surveille et protège le train qui relie des îles, des côtes ou des pays.",
          ],
          bullets: [
            "Conducteur de train : conduit sur les rails, respecte l'horaire et s'occupe des voyageurs.",
            "Marin de sous-marin : travaille sous l'eau, dans un lieu fermé, avec des règles de sécurité strictes.",
            'Pilote : surveille des écrans modernes et reprend la main à tout moment si besoin.',
          ],
        },
        {
          heading: 'Pourquoi aura-t-on besoin de ce métier ?',
          bullets: [
            'Aller plus vite : traverser la mer en quelques minutes au lieu de plusieurs heures.',
            "Moins polluer : un train 100 % électrique pollue beaucoup moins que l'avion ou le bateau.",
            'Pas bloqué par la météo : les tempêtes, les vagues et le brouillard ne gênent pas le tunnel.',
            "Pas que de la science-fiction : le tunnel sous la Manche existe déjà ; ceux de demain seront juste plus rapides.",
          ],
        },
      ],
    },
    {
      id: 'sec-2',
      tabLabel: '2. Journée & Formation',
      title: 'Sa journée, ses qualités et sa formation',
      blocks: [
        {
          heading: 'Trois actions : vérifier, surveiller, réagir',
          bullets: [
            "Avant le départ : vérifier les freins, les portes, l'électricité, la batterie et le tunnel.",
            'Avec la surface : appeler le centre de contrôle pour confirmer le trajet et les capteurs.',
            "Pendant le trajet : regarder la vitesse, la pression de l'eau, l'énergie et les fuites possibles.",
            'En cas de fuite : rester calme, prévenir la surface, ralentir ou arrêter le train et aider les voyageurs.',
            "À l'arrivée : écrire un rapport complet et laisser sa place à l'équipe suivante.",
          ],
        },
        {
          heading: 'Les 5 qualités nécessaires',
          bullets: [
            "Comprendre la technique (machines, électricité, informatique).",
            "Garder son calme sous des millions de litres d'eau.",
            'Décider vite si une alarme sonne.',
            "Savoir travailler et parler clairement avec l'équipe.",
            'Être à l’aise dans un lieu fermé, sans voir le ciel.',
          ],
        },
        {
          heading: 'Comment faire ce métier ?',
          bullets: [
            "Études techniques (mécanique, électricité, transports).",
            "Centaines d'heures sur simulateur avec de fausses pannes.",
            'Formation de secours et sauvetage (comme les pompiers).',
            'Visites médicales régulières pour vérifier la bonne santé.',
          ],
        },
      ],
    },
    {
      id: 'sec-3',
      tabLabel: '3. Bilan & Avenir',
      title: 'Avantages, difficultés et avenir',
      blocks: [
        {
          heading: 'Les bons côtés',
          bullets: [
            'Très bon salaire (métier rare et spécialisé).',
            'Technologies modernes (écrans, capteurs, aide par ordinateur).',
            "Lieu de travail unique sous l'océan et transport utile et propre.",
          ],
        },
        {
          heading: 'Les côtés difficiles',
          bullets: [
            "Énorme pression de l'eau et risque de panne à surveiller.",
            'Travail dans un espace fermé, sans soleil ni air libre.',
            'Grande responsabilité pour les passagers et longue formation.',
          ],
        },
        {
          heading: 'Et demain ?',
          paragraphs: [
            'Ce métier convient à ceux qui aiment la technologie, les défis, rester calmes et travailler en équipe.',
            "Il y a cent ans, conduire un avion semblait impossible. Demain, ce métier existera et aura besoin de personnes calmes et bien formées.",
          ],
        },
      ],
    },
  ],
};
