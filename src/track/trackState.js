export function applyTrackConfig(track, cfg) {
    track.roadHalfWidth = cfg.roadHalfWidth;
    track.trackWidth = track.roadHalfWidth * 2;
    track.curveStrength = cfg.curveStrength;
    track.segmentLen = cfg.segmentLen;
    track.numPoints = cfg.numPoints;
    track.startGridIndex = cfg.defaultStartGridIndex;
    track.finishIndex = track.startGridIndex;
}

export function computeTrackBounds(points) {
    let minY = Infinity;
    let maxY = -Infinity;
    for (const p of points) {
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
    }
    return { minY, maxY };
}

export function rebuildTrackVectors(track, tangentAtIndex, normalAtIndex) {
    for (let i = 0; i < track.points.length; i++) {
        const t = tangentAtIndex(track.points, i);
        const n = normalAtIndex(track.points, i);
        const k = i * 2;
        track._tan[k] = t.x;
        track._tan[k + 1] = t.y;
        track._nor[k] = n.x;
        track._nor[k + 1] = n.y;
    }
}
