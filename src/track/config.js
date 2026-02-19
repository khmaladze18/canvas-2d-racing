export function makeTrackConfig(level) {
    const lvl = Math.max(1, level | 0);

    // --- Difficulty scaling curve (smooth, not linear)
    const t = Math.min(lvl / 20, 1); // normalize up to level 20
    const difficulty = 1 - Math.pow(1 - t, 2); // smooth ramp (easeOutQuad)

    return {
        // Road gradually narrows but never becomes impossible
        roadHalfWidth: Math.max(48, 120 - difficulty * 60),

        // Curves increase but cap at a safe limit
        curveStrength: 0.55 + difficulty * 0.8,

        // Slightly shorter segments at high levels = tighter curves
        segmentLen: 16 - difficulty * 4,

        // Track gets longer over time
        numPoints: 1500 + lvl * 40,

        // Finish slightly further on higher levels
        finishDistancePointsPadding: 120 + lvl * 10,

        // Start grid moves slightly further to give more space
        defaultStartGridIndex: 80 + lvl * 2,
    };
}
