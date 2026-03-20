export function makeTrackConfig(level) {
    const lvl = Math.max(1, level | 0);

    // --- Difficulty scaling curve (smooth, not linear)
    const t = Math.min(lvl / 20, 1); // normalize up to level 20
    const difficulty = 1 - Math.pow(1 - t, 2); // smooth ramp (easeOutQuad)

    return {
        // Keep GP tracks wide and readable.
        roadHalfWidth: Math.max(62, 132 - difficulty * 44),

        // Higher levels make corner sections more committed.
        curveStrength: 0.34 + difficulty * 0.38,

        // Keep pace high on straights while letting corners bite more at higher levels.
        segmentLen: 18 - difficulty * 2.5,

        // Track gets longer over time
        numPoints: 1500 + lvl * 40,

        // Finish slightly further on higher levels
        finishDistancePointsPadding: 120 + lvl * 10,

        // Start grid moves slightly further to give more space
        defaultStartGridIndex: 80 + lvl * 2,
    };
}
