/**
 * BESPOKE VECTOR ARTWORK GENERATORS
 * ---------------------------------------------------------------------------
 * Builds the layered SVG illustrations for:
 *  - The 5-car pearl-white aerodynamic maglev bullet train (`layer-train`)
 *  - The holographic cab HUD overlay (`layer-cab`)
 *  - Midground landmarks & marine creatures (`layer-mid`)
 *  - Foreground silhouettes & pass-through arch pillars (`layer-fg`)
 *
 * Every element uses GPU-friendly transforms and semantic `data-*` hooks so
 * GSAP timelines can animate turbines, headlights, fish schools, kelp, and
 * holographic gauges smoothly at 60fps.
 */

export function buildTrainSVG() {
  // 5-car streamlined train facing RIGHT (nose on the right, turbines on the left)
  const wagonOffsets = [56, 224, 392, 560]; // 4 trailing passenger wagons
  const wagonsMarkup = wagonOffsets
    .map(
      (x, idx) => `
      <g class="train-wagon" transform="translate(${x}, 0)">
        <!-- Flexible articulated coupling -->
        <rect x="150" y="34" width="22" height="44" rx="6" fill="#0f293a" stroke="#22d3ee" stroke-opacity="0.35" stroke-width="1"/>
        <!-- Main pearl-white wagon shell -->
        <rect x="0" y="22" width="156" height="68" rx="16" fill="url(#hullGrad)" />
        <rect x="4" y="24" width="148" height="14" rx="7" fill="url(#hullShine)" opacity="0.72" />
        <!-- Underbelly shadow -->
        <path d="M8,76 Q78,90 148,76 L148,86 Q78,94 8,86 Z" fill="#89a8ba" opacity="0.45"/>
        <!-- Glowing aqua + pink continuous accent strips -->
        <rect x="2" y="66" width="152" height="3.2" rx="1.6" fill="#22d3ee" filter="url(#neonGlow)"/>
        <rect x="14" y="71.5" width="128" height="1.6" rx="0.8" fill="#f472b6" opacity="0.85"/>
        <!-- Oval warm-amber lit windows with soft passenger silhouettes -->
        ${[18, 62, 106]
          .map(
            (wx, wIdx) => `
          <g transform="translate(${wx}, 36)">
            <rect x="0" y="0" width="32" height="19" rx="9.5" fill="url(#amberWindow)" stroke="#b6d2e2" stroke-width="1.4"/>
            <circle cx="${13 + ((idx + wIdx) % 2) * 5}" cy="11" r="4" fill="#7c4a12" opacity="0.32"/>
            <path d="M7,18 Q16,12 25,18" fill="#7c4a12" opacity="0.28"/>
            <rect x="4" y="2.5" width="12" height="3" rx="1.5" fill="#ffffff" opacity="0.55"/>
          </g>
        `
          )
          .join('')}
        <!-- Maglev hover skids -->
        <rect x="22" y="90" width="34" height="6" rx="3" fill="#1b3a4b"/>
        <rect x="25" y="94" width="28" height="2.6" rx="1.3" fill="#22d3ee" filter="url(#neonGlow)"/>
        <rect x="100" y="90" width="34" height="6" rx="3" fill="#1b3a4b"/>
        <rect x="103" y="94" width="28" height="2.6" rx="1.3" fill="#22d3ee" filter="url(#neonGlow)"/>
      </g>
    `
    )
    .join('');

  return `
    <svg id="hero-train-svg" viewBox="0 0 1120 170" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Pearl-white aerodynamic underwater maglev bullet train with five connected wagons">
      <defs>
        <linearGradient id="hullGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="52%" stop-color="#e8f3f9"/>
          <stop offset="100%" stop-color="#b8d0df"/>
        </linearGradient>
        <linearGradient id="hullShine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.1"/>
          <stop offset="50%" stop-color="#ffffff" stop-opacity="0.95"/>
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0.2"/>
        </linearGradient>
        <linearGradient id="amberWindow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fef3c7"/>
          <stop offset="55%" stop-color="#fbbf24"/>
          <stop offset="100%" stop-color="#d97706"/>
        </linearGradient>
        <linearGradient id="cockpitGlass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#bae6fd" stop-opacity="0.9"/>
          <stop offset="45%" stop-color="#0e7490" stop-opacity="0.88"/>
          <stop offset="100%" stop-color="#082f49" stop-opacity="0.95"/>
        </linearGradient>
        <linearGradient id="headlightCone" x1="0" y1="0.5" x2="1" y2="0.5">
          <stop offset="0%" stop-color="#a5f3fc" stop-opacity="0.72"/>
          <stop offset="40%" stop-color="#22d3ee" stop-opacity="0.26"/>
          <stop offset="100%" stop-color="#22d3ee" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="thrusterGrad" x1="1" y1="0.5" x2="0" y2="0.5">
          <stop offset="0%" stop-color="#22d3ee" stop-opacity="0.9"/>
          <stop offset="55%" stop-color="#f472b6" stop-opacity="0.45"/>
          <stop offset="100%" stop-color="#22d3ee" stop-opacity="0"/>
        </linearGradient>
        <filter id="neonGlow" x="-20%" y="-80%" width="140%" height="260%">
          <feGaussianBlur stdDeviation="2.5" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <!-- Twin Volumetric Headlight Cones (animated opacity/scale) -->
      <g id="train-headlights" opacity="0.85">
        <polygon points="942,68 1120,24 1120,114" fill="url(#headlightCone)"/>
        <polygon points="946,74 1120,52 1120,104" fill="url(#headlightCone)" opacity="0.65"/>
      </g>

      <!-- Rear Jet-Turbine Motor Pod + Velocity Thruster Plume -->
      <g id="train-turbine-group" transform="translate(0, 0)">
        <ellipse id="thruster-plume" cx="24" cy="60" rx="34" ry="12" fill="url(#thrusterGrad)" opacity="0.55"/>
        <path d="M56,30 L28,36 C18,38 14,48 14,60 C14,72 18,82 28,84 L56,88 Z" fill="#17384c" stroke="#22d3ee" stroke-opacity="0.45" stroke-width="1.2"/>
        <!-- Spinning turbine rotor ring -->
        <g id="turbine-rotor" transform="translate(26, 60)">
          <circle cx="0" cy="0" r="13" fill="#0b2230" stroke="#22d3ee" stroke-width="1.5"/>
          <g class="rotor-blades">
            <line x1="-10" y1="0" x2="10" y2="0" stroke="#67e8f9" stroke-width="2" stroke-linecap="round"/>
            <line x1="0" y1="-10" x2="0" y2="10" stroke="#67e8f9" stroke-width="2" stroke-linecap="round"/>
            <line x1="-7" y1="-7" x2="7" y2="7" stroke="#f472b6" stroke-width="1.5" stroke-linecap="round" opacity="0.8"/>
            <line x1="-7" y1="7" x2="7" y2="-7" stroke="#f472b6" stroke-width="1.5" stroke-linecap="round" opacity="0.8"/>
          </g>
          <circle cx="0" cy="0" r="4" fill="#a5f3fc"/>
        </g>
      </g>

      <!-- 4 Connected Passenger Wagons -->
      ${wagonsMarkup}

      <!-- Lead Locomotive with Teardrop Nose & Panoramic Cockpit -->
      <g class="train-lead" transform="translate(728, 0)">
        <rect x="-12" y="34" width="22" height="44" rx="6" fill="#0f293a" stroke="#22d3ee" stroke-opacity="0.35" stroke-width="1"/>
        <!-- Aerodynamic teardrop body -->
        <path d="M0,22 L106,22 C164,22 214,48 222,74 C224,83 216,90 198,90 L0,90 Z" fill="url(#hullGrad)"/>
        <!-- Top specular sheen -->
        <path d="M8,25 L104,25 C144,25 178,38 196,52 C164,38 134,34 8,34 Z" fill="url(#hullShine)" opacity="0.85"/>
        <!-- Panoramic cockpit glass -->
        <path d="M114,29 C156,30 192,46 206,66 C188,69 144,67 118,58 C108,54 106,36 114,29 Z" fill="url(#cockpitGlass)" stroke="#e0f2fe" stroke-width="1.5"/>
        <!-- Warm driver console glow inside cab -->
        <ellipse cx="148" cy="52" rx="18" ry="6" fill="#fbbf24" opacity="0.38"/>
        <path d="M126,53 Q154,48 184,56" stroke="#22d3ee" stroke-width="1.8" stroke-linecap="round" opacity="0.9"/>
        <!-- Lead cabin side window -->
        <rect x="26" y="36" width="48" height="19" rx="9.5" fill="url(#amberWindow)" stroke="#b6d2e2" stroke-width="1.4"/>
        <circle cx="46" cy="47" r="4" fill="#7c4a12" opacity="0.3"/>
        <!-- Glowing aqua & pink strips wrapping the nose -->
        <path d="M2,66 L184,66 C202,66 212,70 218,75" stroke="#22d3ee" stroke-width="3.2" stroke-linecap="round" filter="url(#neonGlow)"/>
        <path d="M12,72 L176,72 C194,72 204,75 210,78" stroke="#f472b6" stroke-width="1.6" stroke-linecap="round" opacity="0.88"/>
        <!-- Headlight lens emitter -->
        <ellipse cx="215" cy="74" rx="5.5" ry="3.5" fill="#ffffff" filter="url(#neonGlow)"/>
        <!-- Lead hover skids -->
        <rect x="24" y="90" width="42" height="6" rx="3" fill="#1b3a4b"/>
        <rect x="27" y="94" width="36" height="2.6" rx="1.3" fill="#22d3ee" filter="url(#neonGlow)"/>
        <rect x="134" y="90" width="44" height="6" rx="3" fill="#1b3a4b"/>
        <rect x="137" y="94" width="38" height="2.6" rx="1.3" fill="#22d3ee" filter="url(#neonGlow)"/>
      </g>
    </svg>
  `;
}

export function buildCabHudSVG() {
  return `
    <svg id="cab-hud-svg" viewBox="0 0 1440 810" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="hudGlass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#22d3ee" stop-opacity="0.22"/>
          <stop offset="100%" stop-color="#083344" stop-opacity="0.14"/>
        </linearGradient>
        <linearGradient id="hudPink" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#f472b6" stop-opacity="0.22"/>
          <stop offset="100%" stop-color="#22d3ee" stop-opacity="0.12"/>
        </linearGradient>
      </defs>

      <!-- Left Holographic Panel: Depth & Hull Integrity -->
      <g transform="translate(260, 352)">
        <rect x="0" y="0" width="235" height="146" rx="14" fill="url(#hudGlass)" stroke="#22d3ee" stroke-opacity="0.65" stroke-width="1.5"/>
        <text x="18" y="28" fill="#a5f3fc" font-family="JetBrains Mono, monospace" font-size="11" letter-spacing="2">HULL INTEGRITY</text>
        <text id="cab-hull-val" x="18" y="60" fill="#ffffff" font-family="Syne, sans-serif" font-size="28" font-weight="700">99.8%</text>
        <!-- Live sine integrity wave -->
        <path id="cab-hull-wave" d="M18,92 Q48,74 78,92 T138,92 T198,92" stroke="#22d3ee" stroke-width="2.2" fill="none"/>
        <text x="18" y="128" fill="#67e8f9" font-family="JetBrains Mono, monospace" font-size="11">CABIN PRESS: 1.00 ATM</text>
      </g>

      <!-- Center Holographic Console: Pressure & Depth -->
      <g transform="translate(592, 466)">
        <rect x="0" y="0" width="256" height="92" rx="12" fill="url(#hudGlass)" stroke="#38bdf8" stroke-opacity="0.7" stroke-width="1.4"/>
        <text x="20" y="24" fill="#bae6fd" font-family="JetBrains Mono, monospace" font-size="10" letter-spacing="1.8">WATER PRESSURE</text>
        <text id="cab-pressure-val" x="20" y="54" fill="#fde68a" font-family="JetBrains Mono, monospace" font-size="24" font-weight="600">8.2 ATM</text>
        <rect x="20" y="68" width="216" height="6" rx="3" fill="#082f49"/>
        <rect id="cab-pressure-bar" x="20" y="68" width="110" height="6" rx="3" fill="#22d3ee"/>
      </g>

      <!-- Right Holographic Panel: Live Sonar Sweep -->
      <g transform="translate(945, 344)">
        <rect x="0" y="0" width="240" height="152" rx="14" fill="url(#hudPink)" stroke="#f472b6" stroke-opacity="0.65" stroke-width="1.5"/>
        <text x="18" y="28" fill="#fbcfe8" font-family="JetBrains Mono, monospace" font-size="11" letter-spacing="2">SONAR SWEEP // 4KM</text>
        <g transform="translate(76, 88)">
          <circle cx="0" cy="0" r="42" stroke="#22d3ee" stroke-opacity="0.4" stroke-width="1"/>
          <circle cx="0" cy="0" r="26" stroke="#22d3ee" stroke-opacity="0.3" stroke-width="1"/>
          <circle cx="0" cy="0" r="10" stroke="#22d3ee" stroke-opacity="0.5" stroke-width="1"/>
          <line x1="-42" y1="0" x2="42" y2="0" stroke="#22d3ee" stroke-opacity="0.25"/>
          <line x1="0" y1="-42" x2="0" y2="42" stroke="#22d3ee" stroke-opacity="0.25"/>
          <g id="cab-sonar-needle">
            <path d="M0,0 L38,-16 A42,42 0 0,1 42,0 Z" fill="#22d3ee" opacity="0.32"/>
            <line x1="0" y1="0" x2="40" y2="-12" stroke="#67e8f9" stroke-width="2"/>
          </g>
          <circle cx="18" cy="-16" r="3.5" fill="#fbbf24"/>
          <circle cx="-22" cy="14" r="3" fill="#f472b6"/>
        </g>
        <text id="cab-speed-val" x="136" y="84" fill="#ffffff" font-family="JetBrains Mono, monospace" font-size="20" font-weight="600">146</text>
        <text x="136" y="102" fill="#a5f3fc" font-family="JetBrains Mono, monospace" font-size="10">KM/H CRUISE</text>
        <text x="136" y="126" fill="#fbcfe8" font-family="JetBrains Mono, monospace" font-size="10">CLEAR TRACK</text>
      </g>

      <!-- Cute Interactive Throttle Indicator -->
      <g id="cab-throttle-indicator" transform="translate(720, 650)">
        <circle cx="0" cy="0" r="26" stroke="#22d3ee" stroke-opacity="0.45" stroke-width="1.5" stroke-dasharray="4 4"/>
        <circle id="cab-throttle-dot" cx="0" cy="-6" r="6" fill="#22d3ee"/>
      </g>
    </svg>
  `;
}

/**
 * Generates midground SVG sculptures positioned along the continuous horizontal
 * scroll track (mapped across 0%..100% of the panoramic world).
 */
export function buildWorldMidSVG() {
  // Fish school coordinates for chapter 2 (The Reef) — each has a base position
  // and scatter direction so GSAP/scroll can smoothly part them around the train!
  const fishPositions = [
    [1820, 320, 1],
    [1860, 290, 0.85],
    [1905, 340, 1.05],
    [1940, 305, 0.9],
    [1985, 355, 0.8],
    [2020, 315, 1.1],
    [2065, 295, 0.95],
    [2110, 345, 0.85],
    [2150, 325, 1],
    [1890, 385, 0.78],
    [1960, 400, 0.92],
    [2040, 390, 0.88],
    [2125, 380, 0.75],
  ];

  const fishMarkup = fishPositions
    .map(
      ([x, y, s], i) => `
      <g class="reef-fish" data-fish-index="${i}" data-base-x="${x}" data-base-y="${y}" transform="translate(${x}, ${y}) scale(${s})">
        <path d="M-14,0 C-6,-8 8,-8 15,0 C8,8 -6,8 -14,0 Z" fill="${i % 3 === 0 ? '#fde68a' : i % 3 === 1 ? '#67e8f9' : '#fda4af'}"/>
        <polygon points="-13,0 -21,-6 -21,6" fill="${i % 2 === 0 ? '#38bdf8' : '#fb7185'}"/>
        <circle cx="8" cy="-2" r="1.6" fill="#082f49"/>
      </g>
    `
    )
    .join('');

  return `
    <svg id="world-mid-svg" viewBox="0 0 8000 900" preserveAspectRatio="xMinYMid slice" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="domeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#fde68a" stop-opacity="0.9"/>
          <stop offset="55%" stop-color="#22d3ee" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="#22d3ee" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="jellyGlow" cx="50%" cy="35%" r="60%">
          <stop offset="0%" stop-color="#fbcfe8" stop-opacity="0.95"/>
          <stop offset="55%" stop-color="#a855f7" stop-opacity="0.65"/>
          <stop offset="100%" stop-color="#22d3ee" stop-opacity="0.1"/>
        </radialGradient>
      </defs>

      <!-- CH 1: Departure Airlock Portal -->
      <g transform="translate(880, 260)" opacity="0.92">
        <circle cx="180" cy="210" r="190" fill="url(#domeGlow)"/>
        <path d="M30,410 A150,150 0 0,1 330,410" stroke="#e0f2fe" stroke-width="12" fill="#0c4a6e" fill-opacity="0.45"/>
        <path d="M62,410 A118,118 0 0,1 298,410" stroke="#22d3ee" stroke-width="4" fill="#fde68a" fill-opacity="0.22"/>
      </g>

      <!-- Sea Turtle (Departure / Reef border) -->
      <g class="ambient-bob" transform="translate(1480, 210)">
        <ellipse cx="0" cy="0" rx="44" ry="26" fill="#2dd4bf" opacity="0.88"/>
        <ellipse cx="0" cy="-2" rx="34" ry="18" fill="#0f766e"/>
        <circle cx="48" cy="-4" r="13" fill="#5eead4"/>
        <circle cx="52" cy="-7" r="2.2" fill="#042f2e"/>
        <path d="M12,18 Q28,44 2,38 Z" fill="#5eead4"/>
        <path d="M-24,14 Q-36,34 -44,20 Z" fill="#2dd4bf"/>
      </g>

      <!-- CH 2: Reef Coral & Scattering Fish School -->
      <g transform="translate(1740, 560)">
        <path d="M0,180 C20,110 70,110 86,180 C110,95 170,95 190,180 C220,120 275,125 295,180 Z" fill="#fb7185" opacity="0.72"/>
        <path d="M310,180 C330,105 390,100 415,180 C440,125 495,130 515,180 Z" fill="#fdba74" opacity="0.75"/>
        <circle cx="140" cy="115" r="26" fill="#f472b6" opacity="0.65"/>
        <circle cx="385" cy="118" r="22" fill="#2dd4bf" opacity="0.65"/>
      </g>
      <g id="reef-fish-school">${fishMarkup}</g>

      <!-- CH 4: Kelp Forest Mid Layer + Otter -->
      <g transform="translate(3620, 0)" opacity="0.82">
        ${[80, 210, 390, 520, 690, 840]
          .map(
            (kx, idx) => `
          <path class="kelp-sway" style="animation-delay: ${idx * 0.4}s" d="M${kx},900 Q${kx - 36},680 ${kx + 24},460 T${kx - 14},90" stroke="${idx % 2 === 0 ? '#10b981' : '#34d399'}" stroke-width="${18 + (idx % 3) * 6}" stroke-linecap="round" fill="none" opacity="0.58"/>
        `
          )
          .join('')}
        <!-- Friendly Otter silhouette -->
        <g class="ambient-bob" transform="translate(610, 495)">
          <ellipse cx="0" cy="0" rx="34" ry="15" transform="rotate(-12)" fill="#b47b56"/>
          <circle cx="32" cy="-8" r="12" fill="#c8926d"/>
          <circle cx="36" cy="-11" r="2" fill="#1c1917"/>
          <path d="M-30,6 Q-56,16 -64,4" stroke="#9a6443" stroke-width="8" stroke-linecap="round"/>
        </g>
      </g>

      <!-- CH 5: Sunken City Grand Arch (Back Half behind the train) -->
      <g transform="translate(4760, 120)">
        <!-- Distant city domes -->
        <path d="M40,560 L40,380 A80,80 0 0,1 200,380 L200,560 Z" fill="#1e4d6b" stroke="#67e8f9" stroke-opacity="0.35"/>
        <path d="M620,560 L620,350 A95,95 0 0,1 810,350 L810,560 Z" fill="#1e4d6b" stroke="#fbbf24" stroke-opacity="0.35"/>
        <circle cx="120" cy="300" r="16" fill="#fbbf24" opacity="0.55"/>
        <circle cx="715" cy="255" r="18" fill="#fbbf24" opacity="0.55"/>
        <!-- Main Arch Back Span -->
        <path d="M230,580 L230,260 A190,190 0 0,1 610,260 L610,580" stroke="#93c5fd" stroke-width="28" stroke-opacity="0.45" fill="none"/>
        <path d="M250,580 L250,260 A170,170 0 0,1 590,260 L590,580" stroke="#fbbf24" stroke-width="4" stroke-opacity="0.7" fill="none"/>
        <circle cx="420" cy="70" r="22" fill="#fde68a" opacity="0.85"/>
      </g>

      <!-- CH 6: Glow Zone (Whale Shark, Bioluminescent Jellyfish, Cute Anglerfish) -->
      <g transform="translate(5760, 40)">
        <!-- Majestic Whale Shark cruising overhead -->
        <g class="ambient-bob" transform="translate(360, 140)">
          <path d="M-190,10 C-110,-38 70,-42 180,-4 C210,6 225,22 195,30 C110,48 -60,42 -165,24 L-230,48 L-205,12 L-235,-24 Z" fill="#1e3a8a" stroke="#60a5fa" stroke-opacity="0.5"/>
          <!-- Starry whale-shark spots -->
          <circle cx="-40" cy="-10" r="3" fill="#bae6fd" opacity="0.8"/>
          <circle cx="0" cy="-14" r="3.5" fill="#bae6fd" opacity="0.85"/>
          <circle cx="44" cy="-8" r="3" fill="#bae6fd" opacity="0.8"/>
          <circle cx="85" cy="-4" r="2.8" fill="#bae6fd" opacity="0.75"/>
          <circle cx="20" cy="2" r="2.5" fill="#bae6fd" opacity="0.75"/>
          <circle cx="-80" cy="-4" r="2.5" fill="#bae6fd" opacity="0.7"/>
        </g>

        <!-- Glowing Jellyfish trio -->
        ${[
          [160, 290, 1.0],
          [720, 260, 0.85],
          [920, 350, 0.7],
        ]
          .map(
            ([jx, jy, js], idx) => `
          <g class="jelly-pulse" style="animation-delay:${idx * 0.7}s" transform="translate(${jx}, ${jy}) scale(${js})">
            <path d="M-42,0 C-42,-46 42,-46 42,0 C22,8 -22,8 -42,0 Z" fill="url(#jellyGlow)" stroke="#f9a8d4" stroke-width="1.5"/>
            <path d="M-24,4 Q-30,45 -18,86" stroke="#67e8f9" stroke-width="2" opacity="0.75" fill="none"/>
            <path d="M0,6 Q8,52 -4,98" stroke="#f472b6" stroke-width="2" opacity="0.8" fill="none"/>
            <path d="M24,4 Q30,45 18,82" stroke="#67e8f9" stroke-width="2" opacity="0.75" fill="none"/>
          </g>
        `
          )
          .join('')}

        <!-- Cute Friendly Lantern Anglerfish -->
        <g class="ambient-bob" transform="translate(820, 565)">
          <path d="M-38,0 C-38,-28 24,-30 34,0 C24,28 -38,28 -38,0 Z" fill="#312e81" stroke="#818cf8" stroke-width="1.5"/>
          <path d="M-35,0 L-52,-14 L-52,14 Z" fill="#4338ca"/>
          <circle cx="14" cy="-7" r="6" fill="#ffffff"/>
          <circle cx="16" cy="-7" r="3" fill="#0f172a"/>
          <path d="M8,10 Q20,16 28,8" stroke="#f9a8d4" stroke-width="2" stroke-linecap="round" fill="none"/>
          <!-- Glowing lantern lure -->
          <path d="M18,-22 Q38,-48 52,-26" stroke="#a5f3fc" stroke-width="2" fill="none"/>
          <circle cx="54" cy="-24" r="9" fill="#fde68a" opacity="0.95"/>
          <circle cx="54" cy="-24" r="18" fill="#fbbf24" opacity="0.3"/>
        </g>
      </g>

      <!-- CH 7: Arrival Glass-Dome Station -->
      <g transform="translate(6840, 140)">
        <circle cx="420" cy="360" r="310" fill="url(#domeGlow)"/>
        <path d="M120,560 A300,300 0 0,1 720,560 Z" fill="#0c4a6e" fill-opacity="0.35" stroke="#e0f2fe" stroke-width="6"/>
        <path d="M210,560 A210,210 0 0,1 630,560" stroke="#fde68a" stroke-width="4" stroke-opacity="0.8" fill="none"/>
        <path d="M280,560 A140,140 0 0,1 560,560" stroke="#22d3ee" stroke-width="3" stroke-opacity="0.85" fill="none"/>
        <rect x="80" y="556" width="680" height="28" rx="14" fill="#164e63" stroke="#67e8f9" stroke-opacity="0.6"/>
      </g>
    </svg>
  `;
}

export function buildWorldFgSVG() {
  return `
    <svg id="world-fg-svg" viewBox="0 0 8000 900" preserveAspectRatio="xMinYMid slice" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Foreground Coral Silhouettes (Reef) -->
      <g transform="translate(1850, 700)" opacity="0.72">
        <path d="M0,200 C30,110 90,115 110,200 C145,95 215,95 245,200 Z" fill="#062834"/>
        <path d="M460,200 C490,130 550,130 570,200 Z" fill="#062834"/>
      </g>

      <!-- Foreground Swaying Kelp Blades (Kelp Forest - passes IN FRONT of train!) -->
      <g transform="translate(3680, 0)" opacity="0.88">
        <path class="kelp-sway" d="M150,900 Q95,620 165,360 T115,40" stroke="#064e3b" stroke-width="32" stroke-linecap="round" fill="none"/>
        <path class="kelp-sway" style="animation-delay:0.8s" d="M740,900 Q795,600 725,340 T775,30" stroke="#047857" stroke-width="26" stroke-linecap="round" fill="none"/>
      </g>

      <!-- Sunken City Foreground Arch Pillar (creates true 3D pass-through!) -->
      <g transform="translate(5280, 120)" opacity="0.92">
        <rect x="0" y="250" width="44" height="440" rx="8" fill="#0d2a42" stroke="#22d3ee" stroke-opacity="0.45" stroke-width="2"/>
        <circle cx="22" cy="242" r="14" fill="#fbbf24" opacity="0.9"/>
      </g>
    </svg>
  `;
}
