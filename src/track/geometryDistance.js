import { closestIndex, normalAtIndex, pointAtIndex } from "./geometryCore.js";

function projectToSegment(px, py, ax, ay, bx, by) {
    const abx = bx - ax;
    const aby = by - ay;
    const abLen2 = abx * abx + aby * aby || 1;
    const t = Math.max(0, Math.min(1, ((px - ax) * abx + (py - ay) * aby) / abLen2));
    const cx = ax + abx * t;
    const cy = ay + aby * t;
    const dx = px - cx;
    const dy = py - cy;
    const len = Math.hypot(abx, aby) || 1;
    const nx = -aby / len;
    const ny = abx / len;
    const signed = dx * nx + dy * ny;

    return {
        x: cx,
        y: cy,
        nx,
        ny,
        distance: Math.abs(signed),
        side: Math.sign(signed) || 1,
    };
}

export function getTrackSignedDistance(points, px, py, hintIdx = 0) {
    const idx = closestIndex(points, px, py, hintIdx);
    if (idx < 0) return { idx: -1, distance: 0, side: 0, x: px, y: py, nx: 0, ny: -1 };

    const prev = pointAtIndex(points, idx - 1) || pointAtIndex(points, idx);
    const curr = pointAtIndex(points, idx);
    const next = pointAtIndex(points, idx + 1) || curr;

    const candidates = [
        projectToSegment(px, py, prev.x, prev.y, curr.x, curr.y),
        projectToSegment(px, py, curr.x, curr.y, next.x, next.y),
    ];

    let best = candidates[0];
    if (candidates[1].distance < best.distance) best = candidates[1];

    return {
        idx,
        distance: best.distance,
        side: best.side,
        x: best.x,
        y: best.y,
        nx: best.nx,
        ny: best.ny,
    };
}

export function distanceToCenter(points, px, py, hintIdx = 0) {
    const res = getTrackSignedDistance(points, px, py, hintIdx);
    return {
        idx: res.idx,
        dist: res.distance,
        x: res.x,
        y: res.y,
        nx: res.nx,
        ny: res.ny,
    };
}
