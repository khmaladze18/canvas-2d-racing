export function makeTrackConfig(level) {
    return {
        roadHalfWidth: Math.max(44, 120 - level * 6),
        curveStrength: 0.55 + level * 0.04,
        segmentLen: 16,
        numPoints: 1500,
        finishDistancePointsPadding: 120,
        defaultStartGridIndex: 80,
    };
}
