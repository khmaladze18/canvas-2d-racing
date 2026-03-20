import { clamp } from "./utils.js";

export function pointAtIndex(points, i) {
    if (!points?.length) return null;
    if (points._closed) return points[((((i | 0) % points.length) + points.length) % points.length)];
    return points[clamp(i | 0, 0, points.length - 1)];
}

export function closestIndex(points, px, py, hint = 0) {
    const n = points?.length;
    if (!n) return -1;
    const last = n - 1;
    const startI = points._closed ? ((((hint | 0) % n) + n) % n) : clamp(hint | 0, 0, last);
    let bestI = startI;
    const window = n < 200 ? Math.min(last, 24) : 36;
    let bestD2 = Infinity;
    if (points._closed) {
        for (let step = -window; step <= window; step++) {
            const i = (startI + step + n) % n;
            const dx = points[i].x - px;
            const dy = points[i].y - py;
            const d2 = dx * dx + dy * dy;
            if (d2 < bestD2) { bestD2 = d2; bestI = i; }
        }
        return bestI;
    }
    for (let i = Math.max(0, bestI - window); i <= Math.min(last, bestI + window); i++) {
        const dx = points[i].x - px;
        const dy = points[i].y - py;
        const d2 = dx * dx + dy * dy;
        if (d2 < bestD2) { bestD2 = d2; bestI = i; }
    }
    return bestI;
}

export function tangentAtIndex(points, i) {
    const n = points?.length;
    if (!n) return { x: 0, y: -1 };
    const last = n - 1;
    const idx = clamp(i | 0, 0, last);
    const p0 = points._closed ? points[(idx - 1 + n) % n] : points[Math.max(0, idx - 1)];
    const p1 = points._closed ? points[(idx + 1) % n] : points[Math.min(last, idx + 1)];
    const dx = p1.x - p0.x;
    const dy = p1.y - p0.y;
    const mag = Math.hypot(dx, dy);
    return mag > 1e-6 ? { x: dx / mag, y: dy / mag } : { x: 0, y: -1 };
}

export function normalAtIndex(points, i) {
    const t = tangentAtIndex(points, i);
    return { x: -t.y, y: t.x };
}
