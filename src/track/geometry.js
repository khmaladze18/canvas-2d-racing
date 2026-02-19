import { clamp } from "./utils.js";

// Small helper: safe length check once
function isEmpty(points) {
    return !points || points.length === 0;
}

export function pointAtIndex(points, i) {
    if (isEmpty(points)) return null;
    const last = points.length - 1;
    const idx = clamp(i | 0, 0, last); // fast int
    return points[idx];
}

export function closestIndex(points, px, py, hint = 0) {
    if (isEmpty(points)) return -1;

    const n = points.length;
    const last = n - 1;

    let bestI = clamp(hint | 0, 0, last);

    // If the track is short, scanning all points is cheap + more reliable.
    // Otherwise scan a window around the hint (local search).
    const window = n < 240 ? last : 80; // tuneable
    const start = Math.max(0, bestI - window);
    const end = Math.min(last, bestI + window);

    let bestD2 = Infinity;

    for (let i = start; i <= end; i++) {
        const p = points[i];
        const dx = p.x - px;
        const dy = p.y - py;
        const d2 = dx * dx + dy * dy;
        if (d2 < bestD2) {
            bestD2 = d2;
            bestI = i;
        }
    }

    return bestI;
}

export function tangentAtIndex(points, i) {
    if (isEmpty(points)) return { x: 1, y: 0 };

    const n = points.length;
    const last = n - 1;
    const idx = clamp(i | 0, 0, last);

    // Central difference where possible; forward/backward at ends
    const i0 = idx > 0 ? idx - 1 : idx;
    const i1 = idx < last ? idx + 1 : idx;

    const a = points[i0];
    const b = points[i1];

    let dx = b.x - a.x;
    let dy = b.y - a.y;

    const len = Math.hypot(dx, dy);
    if (len > 1e-8) {
        dx /= len;
        dy /= len;
    } else {
        // Degenerate: choose a stable default
        dx = 1;
        dy = 0;
    }

    return { x: dx, y: dy };
}

export function normalAtIndex(points, i) {
    const t = tangentAtIndex(points, i);
    return { x: -t.y, y: t.x };
}

export function distanceToCenter(points, px, py, hintIdx = 0) {
    const idx = closestIndex(points, px, py, hintIdx);
    if (idx < 0) return { idx: -1, dist: Infinity };

    const p = points[idx];
    const dx = p.x - px;
    const dy = p.y - py;

    return { idx, dist: Math.hypot(dx, dy) };
}
