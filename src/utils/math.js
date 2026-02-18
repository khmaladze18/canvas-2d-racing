// Clamp value between a and b
export function clamp(v, a, b) {
    return v < a ? a : v > b ? b : v;
}

// Linear interpolation
export function lerp(a, b, t) {
    return a + (b - a) * t;
}

// Clamped lerp (safer for UI animations / easing)
export function lerpClamped(a, b, t) {
    return a + (b - a) * clamp(t, 0, 1);
}

// Normalize angle to [-PI, PI]
export function normalizeAngle(a) {
    const twoPI = Math.PI * 2;
    return ((a + Math.PI) % twoPI + twoPI) % twoPI - Math.PI;
}

// Smallest signed angle difference (CRUCIAL for steering smoothness)
export function angleDelta(a, b) {
    return normalizeAngle(b - a);
}

// Move angle toward target smoothly
export function approachAngle(current, target, maxStep) {
    const delta = angleDelta(current, target);
    if (Math.abs(delta) <= maxStep) return target;
    return current + Math.sign(delta) * maxStep;
}

// Distance squared (faster than sqrt when comparing)
export function dist2(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return dx * dx + dy * dy;
}

// True distance
export function dist(x1, y1, x2, y2) {
    return Math.sqrt(dist2(x1, y1, x2, y2));
}

// Smoothstep easing (nice for UI + camera smoothing)
export function smoothstep(t) {
    t = clamp(t, 0, 1);
    return t * t * (3 - 2 * t);
}

// Hex shade (supports #RGB and #RRGGBB)
export function shade(hex, amount) {
    let r, g, b;

    if (hex.length === 4) {
        // #RGB
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    } else {
        // #RRGGBB
        r = parseInt(hex.slice(1, 3), 16);
        g = parseInt(hex.slice(3, 5), 16);
        b = parseInt(hex.slice(5, 7), 16);
    }

    r = clamp(r + amount, 0, 255);
    g = clamp(g + amount, 0, 255);
    b = clamp(b + amount, 0, 255);

    return `rgb(${r},${g},${b})`;
}
