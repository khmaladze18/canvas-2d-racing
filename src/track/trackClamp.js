export function clampTrackIndex(track, i) {
    if (track.closed) return ((((i | 0) % track.points.length) + track.points.length) % track.points.length);
    return i < 0 ? 0 : i > track.points.length - 1 ? track.points.length - 1 : i | 0;
}

export function pointAtIndexXY(track, i, out) {
    const p = track.points[clampTrackIndex(track, i)];
    out.x = p.x;
    out.y = p.y;
    return out;
}

export function normalAtIndexXY(track, i, out) {
    const k = clampTrackIndex(track, i) * 2;
    out.x = track._nor[k];
    out.y = track._nor[k + 1];
    return out;
}

export function tangentAtIndexXY(track, i, out) {
    const k = clampTrackIndex(track, i) * 2;
    out.x = track._tan[k];
    out.y = track._tan[k + 1];
    return out;
}

export function clampToRoadInto(track, x, y, out, hintIdx = 0, margin = 10) {
    const res = track.distanceToCenter(x, y, hintIdx);
    const idx = res.idx | 0;
    const p = { x: res.x ?? track.points[idx].x, y: res.y ?? track.points[idx].y };
    const k = idx * 2;
    const nx = res.nx ?? track._nor[k];
    const ny = res.ny ?? track._nor[k + 1];
    const side = ((x - p.x) * nx + (y - p.y) * ny) >= 0 ? 1 : -1;
    const maxR = Math.max(8, track.roadHalfWidth - margin);
    if (res.dist <= maxR) return Object.assign(out, { x, y, idx, clamped: false, nx, ny });
    return Object.assign(out, { x: p.x + nx * maxR * side, y: p.y + ny * maxR * side, idx, clamped: true, nx, ny });
}
