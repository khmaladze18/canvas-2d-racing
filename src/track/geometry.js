import { clamp } from "./utils.js";

/**
 * Returns the point at index i, clamped to track bounds.
 */
export function pointAtIndex(points, i) {
    if (!points?.length) return null;
    return points[clamp(i | 0, 0, points.length - 1)];
}

/**
 * Finds the index of the closest point to (px, py).
 * Optimized with distance squared and search windowing.
 */
export function closestIndex(points, px, py, hint = 0) {
    const n = points?.length;
    if (!n) return -1;

    const last = n - 1;
    let bestI = clamp(hint | 0, 0, last);

    const window = n < 200 ? last : 100;
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

/**
 * Calculates smooth tangent using central difference.
 */
export function tangentAtIndex(points, i) {
    const n = points?.length;
    if (!n) return { x: 0, y: -1 };

    const last = n - 1;
    const idx = clamp(i | 0, 0, last);

    const p0 = points[Math.max(0, idx - 1)];
    const p1 = points[Math.min(last, idx + 1)];

    const dx = p1.x - p0.x;
    const dy = p1.y - p0.y;
    const mag = Math.sqrt(dx * dx + dy * dy);

    return mag > 1e-6 ? { x: dx / mag, y: dy / mag } : { x: 0, y: -1 };
}

/**
 * Returns the normal vector (perpendicular to track).
 */
export function normalAtIndex(points, i) {
    const t = tangentAtIndex(points, i);
    return { x: -t.y, y: t.x };
}

/**
 * Core distance logic: Returns signed distance and side.
 * Negative = Left, Positive = Right.
 */
export function getTrackSignedDistance(points, px, py, hintIdx = 0) {
    const i = closestIndex(points, px, py, hintIdx);
    if (i < 0) return { idx: -1, distance: 0, side: 0 };

    const p = points[i];
    const n = normalAtIndex(points, i);

    const dx = px - p.x;
    const dy = py - p.y;

    // Dot product projects the vector onto the normal
    const signedDist = dx * n.x + dy * n.y;

    return {
        idx: i,
        distance: Math.abs(signedDist),
        side: Math.sign(signedDist) || 1 // Default to Right if exactly on center
    };
}

/**
 * Legacy/Simple API: Returns absolute distance to center.
 */
export function distanceToCenter(points, px, py, hintIdx = 0) {
    const res = getTrackSignedDistance(points, px, py, hintIdx);
    return {
        idx: res.idx,
        dist: res.distance
    };
}