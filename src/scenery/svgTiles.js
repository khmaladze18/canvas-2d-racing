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

// ----------
// Export tiles (cached)
// ----------
export const TILES = {
  // background
  sky: cachedImg("sky:aurora:default", () => SKY_AURORA()),
  noise: cachedImg("noise:tile", NOISE_TILE),
  skyline: cachedImg("skyline:city:v1", CITY_SKYLINE),
  hills: cachedImg("hills:forest:v1", FOREST_HILLS),

  // OPTIONAL water band (no bridge)
  water: cachedImg("water:band:v1", WATER_BAND),

  // props
  tree: cachedImg("prop:tree:default", () => TREE()),
  lamp: cachedImg("prop:lamp:default", () => LAMP()),
  building: cachedImg("prop:building:default", () => BUILDING()),
};
