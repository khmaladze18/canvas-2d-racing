// src/utils/math.js

export const TAU = Math.PI * 2;
export const EPS = 1e-6;

// Clamp value between a and b (handles a>b)
export function clamp(v, a, b) {
    if (a > b) { const t = a; a = b; b = t; }
    return v < a ? a : v > b ? b : v;
}

export function clamp01(v) {
    return v < 0 ? 0 : v > 1 ? 1 : v;
}

// Linear interpolation
export function lerp(a, b, t) {
    return a + (b - a) * t;
}

// Clamped lerp
export function lerpClamped(a, b, t) {
    return a + (b - a) * clamp01(t);
}

// Inverse lerp: returns t such that lerp(a,b,t)=v
export function invLerp(a, b, v) {
    const d = b - a;
    return d !== 0 ? (v - a) / d : 0;
}

// Remap v from [inA..inB] to [outA..outB]
export function remap(inA, inB, outA, outB, v) {
    return lerp(outA, outB, invLerp(inA, inB, v));
}

// Wrap value into [min, max)
export function wrap(v, min, max) {
    const range = max - min;
    if (range === 0) return min;
    return ((v - min) % range + range) % range + min;
}

// Normalize angle to [-PI, PI)
export function normalizeAngle(a) {
    // Wrapping avoids precision problems better than chained mod patterns
    return wrap(a + Math.PI, 0, TAU) - Math.PI;
}

// Smallest signed angle difference: from a -> b
export function angleDelta(a, b) {
    return normalizeAngle(b - a);
}

// Move angle toward target smoothly by maxStep radians
export function approachAngle(current, target, maxStep) {
    const d = angleDelta(current, target);
    if (Math.abs(d) <= maxStep) return target;
    return current + Math.sign(d) * maxStep;
}

// Exponential damping (frame-rate independent)
// Example: x = damp(x, target, 12, dt)
export function damp(current, target, lambda, dt) {
    // lambda ~ 8..20 feels good for camera/UI
    const t = 1 - Math.exp(-lambda * dt);
    return lerp(current, target, t);
}

// Distance squared (hot path)
export function dist2(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return dx * dx + dy * dy;
}

// True distance (hypot is usually optimized + stable)
export function dist(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1);
}

export function nearlyEqual(a, b, eps = EPS) {
    return Math.abs(a - b) <= eps;
}

// Smoothstep easing
export function smoothstep(t) {
    t = clamp01(t);
    return t * t * (3 - 2 * t);
}

// Smootherstep (even nicer)
export function smootherstep(t) {
    t = clamp01(t);
    return t * t * t * (t * (t * 6 - 15) + 10);
}

// Random helpers (useful for track + bots)
export function randRange(min, max) {
    return min + Math.random() * (max - min);
}
export function randInt(min, maxInclusive) {
    return (min + Math.floor(Math.random() * (maxInclusive - min + 1))) | 0;
}

// Hex shade (supports #RGB and #RRGGBB). amount in [-255..255]
export function shade(hex, amount) {
    if (typeof hex !== "string" || hex[0] !== "#") return "rgb(0,0,0)";
    amount = clamp(amount, -255, 255);

    let r = 0, g = 0, b = 0;

    if (hex.length === 4) {
        // #RGB
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
        // #RRGGBB
        r = parseInt(hex.slice(1, 3), 16);
        g = parseInt(hex.slice(3, 5), 16);
        b = parseInt(hex.slice(5, 7), 16);
    } else {
        return "rgb(0,0,0)";
    }

    r = clamp(r + amount, 0, 255) | 0;
    g = clamp(g + amount, 0, 255) | 0;
    b = clamp(b + amount, 0, 255) | 0;

    return `rgb(${r},${g},${b})`;
}
