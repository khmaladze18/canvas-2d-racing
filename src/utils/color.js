import { clamp } from "./math.js";

const SHADE_CACHE = new Map();

export function shade(hex, amount) {
    const cacheKey = `${hex}_${amount}`;
    if (SHADE_CACHE.has(cacheKey)) return SHADE_CACHE.get(cacheKey);
    if (typeof hex !== "string" || hex[0] !== "#") return hex;

    let r; let g; let b;
    if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16); g = parseInt(hex[2] + hex[2], 16); b = parseInt(hex[3] + hex[3], 16);
    } else {
        r = parseInt(hex.slice(1, 3), 16); g = parseInt(hex.slice(3, 5), 16); b = parseInt(hex.slice(5, 7), 16);
    }
    const result = `rgb(${clamp(r + amount, 0, 255) | 0},${clamp(g + amount, 0, 255) | 0},${clamp(b + amount, 0, 255) | 0})`;
    if (SHADE_CACHE.size > 1000) SHADE_CACHE.clear();
    SHADE_CACHE.set(cacheKey, result);
    return result;
}
