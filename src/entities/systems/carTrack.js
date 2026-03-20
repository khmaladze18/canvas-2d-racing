const EPS = 1e-4;

export function clampToRoad(car, track, radius, speedPenalty) {
    const res = track.clampToRoad(car.x, car.y, car.trackIdxHint, radius);
    car.trackIdxHint = res.idx;
    if (!res.clamped) return;

    car.x = res.x;
    car.y = res.y;

    const sideV = car.vx * res.nx + car.vy * res.ny;
    if (Math.abs(sideV) > EPS) {
        car.vx -= res.nx * sideV * 0.95;
        car.vy -= res.ny * sideV * 0.95;
    }

    car.vx *= speedPenalty;
    car.vy *= speedPenalty;
}

export function updateProgress(car, track) {
    const idx = track.clampIndex ? track.clampIndex(car.trackIdxHint) : (car.trackIdxHint | 0);
    const count = track.points?.length || 0;
    const prevIdx = Number.isFinite(car._lastTrackIdx) ? car._lastTrackIdx : idx;
    const maxStep = 28;

    let idxDelta = idx - prevIdx;
    if (track.closed && count > 1) {
        const half = count * 0.5;
        if (idxDelta < -half) idxDelta += count;
        else if (idxDelta > half) idxDelta -= count;
    }

    if (idxDelta > maxStep) idxDelta = maxStep;
    else if (idxDelta < -maxStep) idxDelta = -maxStep;

    const base = Number.isFinite(car.progressDist) ? car.progressDist : track.distanceAtIndex(idx);
    car.progressDist = base + idxDelta * track.segmentLen;
    car._lastTrackIdx = track.closed
        ? track.clampIndex(prevIdx + idxDelta)
        : prevIdx + idxDelta;
}
