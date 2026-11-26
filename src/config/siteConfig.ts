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
      subline: 'Piloter un train très rapide dans un tunnel étanche au fond de l’océan.',
      body: "Imagine un train à grande vitesse qui roule sous la mer, à des centaines de mètres de profondeur. Tout autour du tunnel, il y a des tonnes d'eau et une pression énorme. À l'intérieur, des centaines de passagers voyagent au sec et en sécurité pour traverser la mer en quelques minutes, sans avion et sans bateau.",
      hint: 'Fais défiler pour explorer chaque aspect du métier',
      videoStart: 0.0,
      videoEnd: 1.0,
      scrollVh: 170,
      dwell: 0.18,
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
      groups: [
        {
          title: 'En bref',
          bullets: [
            {
              lead: 'Qui est-ce ?',
              text: "la personne assise tout à l'avant du train, dans la cabine de pilotage.",
            },
            {
              lead: 'Sa mission',
              text: 'conduire le train, surveiller les écrans de sécurité et protéger les voyageurs.',
            },
            {
              lead: 'Son terrain',
              text: 'des tunnels sous-marins qui relient des îles, des côtes ou des pays entiers.',
            },
          ],
        },
      ],
    },
    {
      id: 'reef',
      index: 1,
      label: 'Son rôle',
      stationCode: '02 · SON RÔLE',
      headline: 'Trois métiers réunis en une seule personne',
      body: "Même si ce poste est encore futuriste, on peut facilement le comprendre : il combine le travail de trois métiers qui existent déjà aujourd'hui :",
      videoStart: 1.0,
      videoEnd: 1.95,
      scrollVh: 185,
      dwell: 0.18,
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
              lead: '1. Conducteur de train',
              text: "comme sur un TGV, il maîtrise la vitesse sur les rails, respecte l'horaire, gère les arrêts en gare et veille au confort des passagers.",
            },
            {
              lead: '2. Marin de sous-marin',
              text: "il travaille sous l'océan, dans un espace fermé loin de l'air libre, en suivant des règles de sécurité très strictes.",
            },
            {
              lead: '3. Pilote d’avion',
              text: "sa cabine est pleine d'écrans, de capteurs et d'ordinateurs ; l'automatisme aide beaucoup, mais l'humain reste prêt à reprendre la main à tout moment.",
            },
          ],
        },
      ],
      miniStats: [
        { label: 'Temps de trajet', value: "Minutes au lieu d'heures" },
        { label: 'Vitesse', value: 'Plusieurs centaines de km/h' },
        { label: 'Énergie', value: '100 % électrique' },
        { label: 'Lien équipe', value: 'Radio 24h/24 avec la surface' },
      ],
    },
    {
      id: 'kelp-skyline',
      index: 2,
      label: 'Pourquoi ce métier ?',
      stationCode: '03 · POURQUOI ?',
      headline: 'Pourquoi ce métier va devenir indispensable',
      body: "Les grandes villes près de la mer grandissent et les gens voyagent de plus en plus. Pour traverser les mers vite et proprement, on aura besoin de ces conducteurs :",
      fact: "Idée clé : voyager vite, sans polluer et sans jamais dépendre de la météo, même en pleine tempête.",
      videoStart: 1.95,
      videoEnd: 3.0,
      scrollVh: 195,
      dwell: 0.18,
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
          title: 'Les 4 raisons principales',
          bullets: [
            {
              lead: 'Gagner beaucoup de temps',
              text: "là où un bateau met plusieurs heures avec de l'attente au port, le train sous-marin relie deux côtes en quelques minutes.",
            },
            {
              lead: 'Protéger la planète',
              text: "100 % électrique, il pollue beaucoup moins que l'avion ou les gros bateaux à carburant.",
            },
            {
              lead: 'Ignorer la météo',
              text: 'les tempêtes, les grosses vagues et le brouillard ne bloquent jamais la circulation dans un tunnel protégé.',
            },
            {
              lead: 'Déjà crédible',
              text: "le tunnel sous la Manche (France–Angleterre) existe déjà depuis 1994 ; ceux de demain seront juste plus longs et plus rapides.",
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
      headline: 'Une journée type : vérifier, surveiller, réagir',
      body: "Beaucoup pensent que l'ordinateur conduira tout seul. En vrai, l'intelligence artificielle aide pour la vitesse, mais un conducteur humain reste toujours obligatoire face à l'imprévu.",
      fact: "Le robot ou l'IA aide pour les calculs, mais la décision finale appartient toujours au conducteur.",
      videoStart: 3.0,
      videoEnd: 5.0,
      scrollVh: 270,
      dwell: 0.18,
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
          title: 'Avant le départ (contrôle complet)',
          bullets: [
            {
              lead: 'Vérifier le train',
              text: "contrôler les freins, les portes étanches, les circuits électriques, l'énergie et l'état du tunnel.",
            },
            {
              lead: 'Appeler la surface',
              text: 'confirmer le trajet, la position des autres trains et tous les capteurs avec le centre de contrôle.',
            },
          ],
        },
        {
          title: 'Pendant le voyage (surveillance)',
          bullets: [
            {
              lead: 'Lire les écrans',
              text: "surveiller en direct la vitesse, la pression de l'eau, l'énergie et détecter la moindre trace d'humidité.",
            },
            {
              lead: 'Réagir vite',
              text: "si un voyant change ou passe à l'orange, chercher la cause tout de suite.",
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
      headline: 'Gérer les urgences et les 5 qualités clés',
      body: "Sous des millions de litres d'eau, une petite erreur peut coûter cher. Chaque situation grave suit donc un plan précis, répété des centaines de fois à l'entraînement.",
      videoStart: 5.0,
      videoEnd: 7.0,
      scrollVh: 265,
      dwell: 0.18,
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
          title: 'Scénario : si un capteur détecte une fuite',
          bullets: [
            {
              lead: '1. Rester calme',
              text: "ne jamais paniquer malgré les alarmes et garder l'esprit clair.",
            },
            {
              lead: '2. Alerter et freiner',
              text: 'prévenir aussitôt la surface, puis ralentir ou arrêter le train en douceur.',
            },
            {
              lead: '3. Protéger les gens',
              text: 'appliquer le plan de secours et guider calmement les voyageurs vers les zones sûres.',
            },
          ],
        },
        {
          title: 'Les 5 qualités obligatoires',
          bullets: [
            {
              lead: 'Technique',
              text: "comprendre les machines, l'électricité et les logiciels.",
            },
            {
              lead: 'Sang-froid & rapidité',
              text: 'garder son calme sous pression et décider en quelques secondes.',
            },
            {
              lead: 'Équipe & espace fermé',
              text: "parler clairement avec l'équipe et être à l'aise sans voir le ciel.",
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
      headline: 'Quel parcours pour devenir conducteur ?',
      body: "On ne devient pas conducteur de train sous-marin du jour au lendemain. Comme il protège des centaines de vies sous la mer, sa formation ressemble à celle d'un pilote d'avion :",
      fact: 'Même en poste, il retourne sur simulateur chaque année pour garder ses réflexes au top.',
      videoStart: 7.0,
      videoEnd: 9.25,
      scrollVh: 265,
      dwell: 0.18,
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
          title: 'Les 4 grandes étapes',
          bullets: [
            {
              lead: '1. Études techniques (3 à 5 ans)',
              text: 'diplôme en mécanique, électricité, automatisation ou transports.',
            },
            {
              lead: '2. Entraînement sur simulateur',
              text: "des centaines d'heures dans une fausse cabine avec de fausses pannes électriques ou de pression.",
            },
            {
              lead: '3. Secours et sauvetage',
              text: 'apprendre à éteindre un feu, soigner et évacuer les gens comme les pompiers ou les sous-mariniers.',
            },
            {
              lead: '4. Visites médicales régulières',
              text: 'contrôler souvent la vue, le cœur et la résistance au stress.',
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
      headline: 'Les grands avantages et les vraies difficultés',
      body: "Comme tout métier exceptionnel, conduire sous l'océan offre de belles récompenses mais impose aussi des conditions très particulières :",
      videoStart: 9.25,
      videoEnd: 12.0,
      scrollVh: 255,
      dwell: 0.18,
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
            { text: 'Un très bon salaire : métier rare, spécialisé et très recherché.' },
            { text: 'Haute technologie : utiliser l’IA, des écrans 3D et des capteurs modernes.' },
            { text: "Décor incroyable : travailler au fond de l'océan, là où presque personne ne va." },
            { text: 'Aider la planète : piloter un transport 100 % propre.' },
            { text: 'Métier utile : mener des centaines de personnes en sécurité.' },
          ],
        },
        {
          title: 'Les difficultés',
          tone: 'con',
          bullets: [
            { text: "Pression extrême : des millions de litres d'eau appuient sur le tunnel." },
            { text: 'Vigilance constante : surveiller sans relâche les fuites ou les pannes.' },
            { text: 'Lieu fermé : pas de soleil ni d’air frais pendant le trajet.' },
            { text: 'Forte pression morale : la vie des voyageurs dépend de toi.' },
            { text: 'Exigence continue : longues études et tests médicaux toute la carrière.' },
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
      body: "Quand le train arrive en gare, le travail n'est pas encore fini : le conducteur fait sortir les voyageurs, puis rédige un rapport complet où il note le moindre bruit bizarre ou voyant inhabituel avant de passer le train à l'équipe suivante.",
      videoStart: 12.0,
      videoEnd: 16.25,
      scrollVh: 255,
      dwell: 0.18,
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
              text: "comprendre les machines et la technologie, relever des défis, garder ton calme quand les autres s'inquiètent, travailler en équipe et avoir de vraies responsabilités.",
            },
            {
              lead: 'À éviter si',
              text: 'tu supportes mal les endroits fermés (claustrophobie), si le stress te bloque vite, ou si tu préfères travailler dehors au grand air sans grande responsabilité.',
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
      headline: 'Conclusion : impossible aujourd’hui, réel demain',
      body: "Il y a un peu plus de cent ans, conduire un avion au-dessus de l'océan semblait totalement impossible. Pourtant, c'est devenu un vrai métier. Demain, avec les progrès de la technologie et des transports propres, le conducteur de train sous-marin deviendra lui aussi une profession bien réelle. On aura besoin de personnes calmes, curieuses et courageuses, capables d'utiliser l'intelligence artificielle tout en gardant leur propre jugement.",
      fact: 'En résumé : un métier difficile et exigeant, mais passionnant, utile pour la planète et très bien payé.',
      videoStart: 16.25,
      videoEnd: 20.0,
      scrollVh: 270,
      dwell: 0.18,
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
