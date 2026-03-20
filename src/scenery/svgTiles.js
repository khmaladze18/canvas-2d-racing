// src/scenery/svgTiles.js

// ----------
// SVG → Image
// ----------
function minifySvg(svg) {
  return svg
    .replace(/\n+/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/>\s+</g, "><")
    .trim();
}

// safer for SVG data URLs
function svgToDataUri(svg) {
  const s = minifySvg(svg);
  // encodeURIComponent is fine but we must also escape a few extra characters
  const encoded = encodeURIComponent(s)
    .replace(/%0A/g, "")
    .replace(/%20/g, " ")
    .replace(/%3D/g, "=")
    .replace(/%3A/g, ":")
    .replace(/%2F/g, "/")
    .replace(/%22/g, "'"); // keep it small + safe
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}

function makeImgFromSvg(svg) {
  const img = new Image();
  img.decoding = "async";
  img.src = svgToDataUri(svg);
  return img;
}

// Image cache: key -> HTMLImageElement
const IMG_CACHE = new Map();
function cachedImg(key, svgFactory) {
  if (IMG_CACHE.has(key)) return IMG_CACHE.get(key);
  const img = makeImgFromSvg(svgFactory());
  IMG_CACHE.set(key, img);
  return img;
}

export function tilesReady(tilesObj) {
  const imgs = Object.values(tilesObj);
  return Promise.all(
    imgs.map(
      (img) =>
        img?.complete
          ? Promise.resolve()
          : new Promise((res) => {
            img.onload = () => res();
            img.onerror = () => res(); // don't block game if one fails
          })
    )
  );
}

// ----------
// Helpers for deterministic pseudo-random layout in SVG generation
// ----------
function hash01(i) {
  // tiny deterministic hash [0..1)
  const x = Math.sin(i * 999.123) * 10000;
  return x - Math.floor(x);
}

function rects(count, fn) {
  let out = "";
  for (let i = 0; i < count; i++) out += fn(i);
  return out;
}

// =========================
// ADVANCED BACKGROUNDS
// =========================

// subtle noise tile (repeat)
function NOISE_TILE() {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128">
    <filter id="n">
      <feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="matrix"
        values="1 0 0 0 0
                0 1 0 0 0
                0 0 1 0 0
                0 0 0 .22 0"/>
    </filter>
    <rect width="128" height="128" filter="url(#n)" opacity=".18"/>
  </svg>`;
}

// deep blue “glass” sky with aurora blobs + stars
function SKY_AURORA(c1 = "#60a5fa", c2 = "#93c5fd") {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#061a33"/>
        <stop offset=".55" stop-color="#041225"/>
        <stop offset="1" stop-color="#030a14"/>
      </linearGradient>

      <radialGradient id="a1" cx="25%" cy="20%" r="55%">
        <stop offset="0" stop-color="${c1}" stop-opacity=".22"/>
        <stop offset="1" stop-color="${c1}" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="a2" cx="78%" cy="18%" r="55%">
        <stop offset="0" stop-color="${c2}" stop-opacity=".18"/>
        <stop offset="1" stop-color="${c2}" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="a3" cx="40%" cy="85%" r="55%">
        <stop offset="0" stop-color="${c2}" stop-opacity=".12"/>
        <stop offset="1" stop-color="${c2}" stop-opacity="0"/>
      </radialGradient>

      <filter id="stars">
        <feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="2" />
        <feColorMatrix type="matrix"
          values="0 0 0 0 1
                  0 0 0 0 1
                  0 0 0 0 1
                  0 0 0 .12 0"/>
      </filter>
    </defs>

    <rect width="1920" height="1080" fill="url(#bg)"/>
    <rect width="1920" height="1080" fill="url(#a1)"/>
    <rect width="1920" height="1080" fill="url(#a2)"/>
    <rect width="1920" height="1080" fill="url(#a3)"/>

    <rect width="1920" height="1080" filter="url(#stars)" opacity=".45"/>

    <g opacity=".12">
      <path d="M-200 110 L 620 -50 L 840 -50 L 0 130 Z" fill="#93c5fd"/>
      <path d="M520 210 L 1400 -40 L 1600 -40 L 720 230 Z" fill="#60a5fa"/>
      <path d="M980 130 L 2100 -60 L 2300 -60 L 1180 150 Z" fill="#bfdbfe"/>
    </g>
  </svg>`;
}

// City skyline silhouette with glow windows
function CITY_SKYLINE() {
  const windows = rects(180, (i) => {
    const x = (i * 37) % 1860;
    const y = 70 + ((i * 53) % 310);
    const w = 8 + ((i * 7) % 8);
    const h = 4 + ((i * 11) % 6);
    const on = (i % 5) !== 0;
    return `<rect x="${x + 30}" y="${y + 40}" width="${w}" height="${h}" rx="2"
      fill="${on ? "#93c5fd" : "#0b1020"}" opacity="${on ? 0.22 : 0}"/>`;
  });

  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="1920" height="420" viewBox="0 0 1920 420">
    <defs>
      <linearGradient id="fog" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#93c5fd" stop-opacity=".18"/>
        <stop offset="1" stop-color="#93c5fd" stop-opacity="0"/>
      </linearGradient>
      <filter id="blur" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="2.4"/>
      </filter>
    </defs>

    <g fill="#071a33" opacity=".95">
      <rect x="40"  y="140" width="140" height="260" rx="12"/>
      <rect x="210" y="90"  width="220" height="310" rx="14"/>
      <rect x="460" y="160" width="180" height="240" rx="12"/>
      <rect x="670" y="60"  width="260" height="340" rx="16"/>
      <rect x="960" y="130" width="160" height="270" rx="12"/>
      <rect x="1140" y="100" width="250" height="300" rx="14"/>
      <rect x="1420" y="150" width="210" height="250" rx="12"/>
      <rect x="1660" y="80"  width="220" height="320" rx="14"/>
    </g>

    <g filter="url(#blur)" opacity=".55">${windows}</g>
    <rect width="1920" height="420" fill="url(#fog)"/>
  </svg>`;
}

// Forest hills parallax band
function FOREST_HILLS() {
  const spikes = rects(120, (i) => {
    const x = i * 16;
    const h = 40 + (i * 19) % 80;
    return `<path d="M${x} 520 L${x + 10} ${520 - h} L${x + 20} 520 Z" />`;
  });

  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="1920" height="520" viewBox="0 0 1920 520">
    <defs>
      <linearGradient id="h1" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#062a2a" stop-opacity=".85"/>
        <stop offset="1" stop-color="#041219" stop-opacity=".95"/>
      </linearGradient>
      <linearGradient id="h2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#083b2a" stop-opacity=".65"/>
        <stop offset="1" stop-color="#041a12" stop-opacity=".85"/>
      </linearGradient>
      <linearGradient id="mist" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#93c5fd" stop-opacity=".14"/>
        <stop offset="1" stop-color="#93c5fd" stop-opacity="0"/>
      </linearGradient>
    </defs>

    <path d="M0 340 C 240 290, 420 380, 640 340 C 880 295, 1040 390, 1280 340 C 1520 295, 1720 380, 1920 330 L 1920 520 L 0 520 Z"
          fill="url(#h1)"/>
    <path d="M0 390 C 240 340, 440 440, 680 392 C 920 345, 1100 460, 1340 400 C 1560 350, 1760 460, 1920 410 L 1920 520 L 0 520 Z"
          fill="url(#h2)"/>

    <g opacity=".35" fill="#0b2c1c">${spikes}</g>
    <rect width="1920" height="520" fill="url(#mist)"/>
  </svg>`;
}

// (You said remove bridge vibes before — keep it optional, not default)
function WATER_BAND() {
  const ripples = rects(60, (i) => {
    const y = 180 + i * 5;
    const w = 120 + (i * 37) % 520;
    const x = (i * 71) % 1920;
    return `<rect x="${x}" y="${y}" width="${w}" height="2" rx="1" />`;
  });

  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="1920" height="520" viewBox="0 0 1920 520">
    <defs>
      <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#0b2a55" stop-opacity=".85"/>
        <stop offset="1" stop-color="#061427" stop-opacity=".95"/>
      </linearGradient>
    </defs>

    <rect width="1920" height="520" fill="url(#water)"/>
    <g opacity=".18" fill="#93c5fd">${ripples}</g>
  </svg>`;
}

// =========================
// PROPS
// =========================
function TREE(c1 = "#0a7a3c", c2 = "#0b5f31") {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="96" viewBox="0 0 64 96">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/>
    </linearGradient></defs>
    <rect x="28" y="58" width="8" height="22" rx="2" fill="#4b2e1a" opacity="0.9"/>
    <circle cx="32" cy="42" r="20" fill="url(#g)"/>
    <circle cx="18" cy="48" r="12" fill="url(#g)" opacity="0.95"/>
    <circle cx="46" cy="48" r="12" fill="url(#g)" opacity="0.95"/>
    <circle cx="32" cy="26" r="14" fill="url(#g)" opacity="0.95"/>
  </svg>`;
}

function LAMP(glow = "#7dd3fc") {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="96" viewBox="0 0 64 96">
    <defs>
      <radialGradient id="rg" cx="50%" cy="45%" r="60%">
        <stop offset="0" stop-color="${glow}" stop-opacity="0.95"/>
        <stop offset="1" stop-color="${glow}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect x="30" y="18" width="4" height="62" rx="2" fill="#9aa5b1" opacity="0.95"/>
    <rect x="22" y="18" width="20" height="6" rx="3" fill="#9aa5b1" opacity="0.95"/>
    <circle cx="32" cy="30" r="12" fill="url(#rg)"/>
    <circle cx="32" cy="30" r="4" fill="${glow}" opacity="0.95"/>
  </svg>`;
}

function BUILDING(w = 90, h = 140, tint = "#0b1f3a") {
  const windows = rects(32, (i) => {
    const x = 18 + (i % 4) * 16;
    const y = 24 + ((i / 4) | 0) * 13;
    const on = ((i * 37) % 6) !== 0;
    return `<rect x="${x}" y="${y}" width="9" height="7" rx="2"
      fill="${on ? "#93c5fd" : "#0b1020"}" opacity="${on ? 0.85 : 0.55}"/>`;
  });

  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <rect x="8" y="10" width="${w - 16}" height="${h - 14}" rx="12" fill="${tint}" opacity="0.92"/>
    ${windows}
  </svg>`;
}

function GRANDSTAND() {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="220" height="132" viewBox="0 0 220 132">
    <defs>
      <linearGradient id="roof" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#cfd8e3"/>
        <stop offset="1" stop-color="#7d8794"/>
      </linearGradient>
      <linearGradient id="seat" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#2563eb"/>
        <stop offset="1" stop-color="#0f3d8f"/>
      </linearGradient>
    </defs>
    <path d="M18 48 L198 26 L208 36 L32 58 Z" fill="url(#roof)" opacity=".95"/>
    <path d="M24 60 L176 42 L196 112 L42 120 Z" fill="#334155" opacity=".96"/>
    <path d="M48 70 L162 56 L176 102 L62 108 Z" fill="url(#seat)" opacity=".9"/>
    <g fill="#dbeafe" opacity=".75">
      <rect x="58" y="74" width="92" height="5" rx="2"/>
      <rect x="62" y="84" width="95" height="5" rx="2"/>
      <rect x="66" y="94" width="96" height="5" rx="2"/>
    </g>
    <g stroke="#94a3b8" stroke-width="4" opacity=".85">
      <line x1="42" y1="60" x2="42" y2="120"/>
      <line x1="108" y1="52" x2="108" y2="120"/>
      <line x1="182" y1="44" x2="182" y2="114"/>
    </g>
  </svg>`;
}

function HOSPITALITY() {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="164" height="116" viewBox="0 0 164 116">
    <defs>
      <linearGradient id="body" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#f8fafc"/>
        <stop offset="1" stop-color="#d6dee8"/>
      </linearGradient>
      <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#93c5fd"/>
        <stop offset="1" stop-color="#1d4ed8"/>
      </linearGradient>
    </defs>
    <rect x="16" y="28" width="132" height="74" rx="12" fill="url(#body)" opacity=".98"/>
    <rect x="28" y="40" width="108" height="22" rx="7" fill="url(#glass)" opacity=".84"/>
    <rect x="28" y="72" width="30" height="20" rx="5" fill="#cbd5e1"/>
    <rect x="66" y="72" width="30" height="20" rx="5" fill="#cbd5e1"/>
    <rect x="104" y="72" width="30" height="20" rx="5" fill="#cbd5e1"/>
    <path d="M10 34 L82 10 L154 34" fill="none" stroke="#ef4444" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

function TREE_CLUSTER() {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="116" height="96" viewBox="0 0 116 96">
    <g fill="#0a6a39">
      <circle cx="30" cy="44" r="20"/>
      <circle cx="54" cy="36" r="22"/>
      <circle cx="80" cy="46" r="20"/>
      <circle cx="60" cy="56" r="24"/>
    </g>
    <g fill="#08562f" opacity=".9">
      <circle cx="44" cy="54" r="18"/>
      <circle cx="76" cy="56" r="18"/>
    </g>
    <g fill="#4b2e1a" opacity=".9">
      <rect x="26" y="58" width="7" height="18" rx="2"/>
      <rect x="54" y="60" width="7" height="20" rx="2"/>
      <rect x="78" y="60" width="7" height="18" rx="2"/>
    </g>
  </svg>`;
}

function GRASS_PIXEL() {
  const dots = rects(180, (i) => {
    const x = ((i * 23) % 256);
    const y = ((i * 47) % 256);
    const shade = i % 3 === 0 ? "#7c9130" : i % 3 === 1 ? "#9eb449" : "#889f39";
    return `<rect x="${x}" y="${y}" width="2" height="2" fill="${shade}" opacity=".55"/>`;
  });
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
    <rect width="256" height="256" fill="#91a63d"/>
    <g opacity=".9">${dots}</g>
  </svg>`;
}

function GRASS_SHADE() {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
    <g fill="none" stroke="#53884a" stroke-opacity=".28" stroke-width="10">
      <path d="M-20 36 C 60 12, 120 20, 280 48"/>
      <path d="M-20 116 C 70 94, 136 102, 280 128"/>
      <path d="M-20 196 C 90 170, 170 176, 280 206"/>
    </g>
  </svg>`;
}

function SERVICE_ROAD() {
  const lines = rects(14, (i) => {
    const y = 16 + i * 18;
    const w = 170 + (i % 4) * 20;
    const x = (i % 2) * 60 - 20;
    return `<rect x="${x}" y="${y}" width="${w}" height="8" rx="4" fill="#c8c0a1" opacity=".28"/>`;
  });
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
    <rect width="256" height="256" fill="transparent"/>
    <g>${lines}</g>
    <g fill="none" stroke="#f4ead0" stroke-opacity=".26" stroke-width="2">
      <path d="M16 20 H200"/>
      <path d="M56 56 H236"/>
      <path d="M10 128 H176"/>
      <path d="M34 196 H228"/>
    </g>
  </svg>`;
}

function PADDOCK() {
  const slabs = rects(10, (i) => {
    const x = 18 + (i % 3) * 78;
    const y = 16 + ((i / 3) | 0) * 58;
    const w = 52 + (i % 2) * 10;
    return `<rect x="${x}" y="${y}" width="${w}" height="28" rx="4" fill="#c6bfab" opacity=".28"/>`;
  });
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
    <rect width="256" height="256" fill="transparent"/>
    <rect x="10" y="10" width="236" height="236" rx="20" fill="#c7c0aa" opacity=".07"/>
    <g>${slabs}</g>
    <g fill="none" stroke="#f3f4f6" stroke-opacity=".2" stroke-width="3">
      <path d="M16 90 H240"/>
      <path d="M16 150 H240"/>
    </g>
  </svg>`;
}

function CIRCUIT_BORDER() {
  const blocks = rects(24, (i) => {
    const x = i * 82;
    const h = 54 + (i % 4) * 8;
    const body = i % 3 === 0 ? "#67717a" : i % 3 === 1 ? "#4d5761" : "#7a848e";
    return `
      <g transform="translate(${x},0)">
        <rect x="10" y="${102 - h}" width="58" height="${h}" rx="8" fill="${body}" opacity=".18"/>
        <rect x="16" y="${110 - h}" width="46" height="10" rx="4" fill="#f0e8cf" opacity=".18"/>
      </g>`;
  });
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="1920" height="160" viewBox="0 0 1920 160">
    <rect width="1920" height="160" fill="transparent"/>
    <rect y="124" width="1920" height="36" fill="#b3c45a" opacity=".28"/>
    <g>${blocks}</g>
  </svg>`;
}

function SHRUB() {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="56" height="44" viewBox="0 0 56 44">
    <g fill="#657427">
      <circle cx="16" cy="24" r="10"/>
      <circle cx="28" cy="18" r="12"/>
      <circle cx="40" cy="24" r="10"/>
      <circle cx="28" cy="28" r="11"/>
    </g>
    <g fill="#4f5d1f" opacity=".85">
      <circle cx="21" cy="22" r="6"/>
      <circle cx="34" cy="24" r="7"/>
    </g>
  </svg>`;
}

function BOX_BUILDING() {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="118" height="86" viewBox="0 0 118 86">
    <rect x="10" y="18" width="98" height="54" rx="6" fill="#bf3f35"/>
    <rect x="16" y="12" width="86" height="12" rx="4" fill="#92251f"/>
    <rect x="20" y="30" width="22" height="14" rx="3" fill="#e8d9c0" opacity=".85"/>
    <rect x="48" y="30" width="22" height="14" rx="3" fill="#e8d9c0" opacity=".85"/>
    <rect x="76" y="30" width="22" height="14" rx="3" fill="#e8d9c0" opacity=".85"/>
  </svg>`;
}

// ----------
// Export tiles (cached)
// ----------
export const TILES = {
  // background
  sky: cachedImg("sky:aurora:default", () => SKY_AURORA()),
  grassPixel: cachedImg("ground:grasspixel:v1", () => GRASS_PIXEL()),
  grassShade: cachedImg("ground:grassshade:v1", () => GRASS_SHADE()),
  serviceRoad: cachedImg("ground:serviceroad:v1", () => SERVICE_ROAD()),
  paddock: cachedImg("ground:paddock:v1", () => PADDOCK()),
  circuitBorder: cachedImg("ground:circuitborder:v1", () => CIRCUIT_BORDER()),
  noise: cachedImg("noise:tile", NOISE_TILE),
  skyline: cachedImg("skyline:city:v1", CITY_SKYLINE),
  hills: cachedImg("hills:forest:v1", FOREST_HILLS),

  // OPTIONAL water band (no bridge)
  water: cachedImg("water:band:v1", WATER_BAND),

  // props
  tree: cachedImg("prop:tree:default", () => TREE()),
  treeCluster: cachedImg("prop:treecluster:default", () => TREE_CLUSTER()),
  shrub: cachedImg("prop:shrub:default", () => SHRUB()),
  boxBuilding: cachedImg("prop:boxbuilding:default", () => BOX_BUILDING()),
  lamp: cachedImg("prop:lamp:default", () => LAMP()),
  building: cachedImg("prop:building:default", () => BUILDING()),
  grandstand: cachedImg("prop:grandstand:default", () => GRANDSTAND()),
  hospitality: cachedImg("prop:hospitality:default", () => HOSPITALITY()),
};
