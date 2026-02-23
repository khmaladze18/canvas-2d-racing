// src/utils/math.js

export const TAU = Math.PI * 2;
export const EPS = 1e-6;

/** * MEMOIZATION CACHE
 * Prevents re-calculating hex colors every frame.
 */
const SHADE_CACHE = new Map();

// --- Basic Math ---

export const clamp = (v, min, max) => v < min ? min : v > max ? max : v;
export const clamp01 = (v) => v < 0 ? 0 : v > 1 ? 1 : v;

export const lerp = (a, b, t) => a + (b - a) * t;
export const lerpClamped = (a, b, t) => a + (b - a) * clamp01(t);

export const invLerp = (a, b, v) => (b - a !== 0) ? (v - a) / (b - a) : 0;

export const remap = (inA, inB, outA, outB, v) => lerp(outA, outB, invLerp(inA, inB, v));

// --- Trigonometry & Rotation ---

export const wrap = (v, min, max) => {
    const range = max - min;
    return ((((v - min) % range) + range) % range) + min;
};

export const normalizeAngle = (a) => wrap(a + Math.PI, 0, TAU) - Math.PI;

export const angleDelta = (a, b) => normalizeAngle(b - a);

/**
 * Smoothly move angle toward target. 
 * Optimized to avoid jumps at the -PI/PI boundary.
 */
export function approachAngle(current, target, maxStep) {
    const d = angleDelta(current, target);
    return Math.abs(d) <= maxStep ? target : current + Math.sign(d) * maxStep;
}

// --- Smoothing & Animation ---

/**
 * Frame-rate independent damping (Spring-like)
 * @param {number} lambda - Higher = faster (8-20 is standard)
 */
export const damp = (current, target, lambda, dt) =>
    lerp(current, target, 1 - Math.exp(-lambda * dt));



export const smoothstep = (t) => {
    t = clamp01(t);
    return t * t * (3 - 2 * t);
};

export const smootherstep = (t) => {
    t = clamp01(t);
    return t * t * t * (t * (t * 6 - 15) + 10);
};

// --- Geometry ---

export const dist2 = (x1, y1, x2, y2) => {
    const dx = x2 - x1, dy = y2 - y1;
    return dx * dx + dy * dy;
};

// Faster than Math.hypot in most V8 scenarios for 2D
export const dist = (x1, y1, x2, y2) => Math.sqrt(dist2(x1, y1, x2, y2));

// --- Randomization ---

export const randRange = (min, max) => min + Math.random() * (max - min);
export const randInt = (min, max) => Math.floor(min + Math.random() * (max - min + 1));

// --- Graphics & Color ---

/**
 * High-performance color shading with caching.
 * Reduces GC pressure by reusing color strings.
 */
export function shade(hex, amount) {
    const cacheKey = `${hex}_${amount}`;
    if (SHADE_CACHE.has(cacheKey)) return SHADE_CACHE.get(cacheKey);

    if (typeof hex !== "string" || hex[0] !== "#") return hex;

    let r, g, b;
    if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    } else {
        r = parseInt(hex.slice(1, 3), 16);
        g = parseInt(hex.slice(3, 5), 16);
        b = parseInt(hex.slice(5, 7), 16);
    }

    r = clamp(r + amount, 0, 255) | 0;
    g = clamp(g + amount, 0, 255) | 0;
    b = clamp(b + amount, 0, 255) | 0;

    const result = `rgb(${r},${g},${b})`;

    // Simple cache eviction (prevents memory leak if used with dynamic colors)
    if (SHADE_CACHE.size > 1000) SHADE_CACHE.clear();
    SHADE_CACHE.set(cacheKey, result);

    return result;
}