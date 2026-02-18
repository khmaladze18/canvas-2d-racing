import { clamp } from "./utils.js";

export function pointAtIndex(points, i) {
    const idx = clamp(Math.floor(i), 0, points.length - 1);
    return points[idx];
}

export function closestIndex(points, px, py, hint = 0) {
    let bestI = clamp(hint, 0, points.length - 1);
    let bestD = Infinity;

    const start = Math.max(0, bestI - 60);
    const end = Math.min(points.length - 1, bestI + 60);

    for (let i = start; i <= end; i++) {
        const p = points[i];
        const dx = p.x - px;
        const dy = p.y - py;
        const d = dx * dx + dy * dy;
        if (d < bestD) { bestD = d; bestI = i; }
    }
    return bestI;
}

export function tangentAtIndex(points, i) {
    const a = pointAtIndex(points, i - 1);
    const b = pointAtIndex(points, i + 1);
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    return { x: dx / len, y: dy / len };
}

export function normalAtIndex(points, i) {
    const t = tangentAtIndex(points, i);
    return { x: -t.y, y: t.x };
}

export function distanceToCenter(points, px, py, hintIdx = 0) {
    const i = closestIndex(points, px, py, hintIdx);
    const p = points[i];
    const dx = p.x - px;
    const dy = p.y - py;
    return { idx: i, dist: Math.hypot(dx, dy) };
}
