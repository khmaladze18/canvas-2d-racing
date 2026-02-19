import { clamp, lerp } from "./utils.js";

/**
 * generatePoints
 * @param {object} opts
 * @param {number} opts.w
 * @param {number} opts.h
 * @param {number} opts.numPoints
 * @param {number} opts.segmentLen
 * @param {number} opts.curveStrength
 * @param {function} [opts.rng] - optional random fn returning [0,1). If not provided uses Math.random.
 * @param {number} [opts.marginLeft=0.18] - fraction of width
 * @param {number} [opts.marginRight=0.18] - fraction of width
 */
export function generatePoints({
    w,
    h,
    numPoints,
    segmentLen,
    curveStrength,
    rng = Math.random,
    marginLeft = 0.18,
    marginRight = 0.18,
}) {
    // --- Guards ---
    const n = Math.max(2, numPoints | 0);
    const seg = Math.max(1e-3, segmentLen || 0);
    const strength = Math.max(0, curveStrength || 0);

    const pts = new Array(n);

    let x = w * 0.5;
    let y = h * 0.75;

    // Forward direction (up)
    const base = -Math.PI / 2;
    let angle = base;

    // "drift" is angular velocity (smoothed)
    let drift = 0;

    const left = w * marginLeft;
    const right = w * (1 - marginRight);

    // Tuneables (kept close to your original feel)
    const driftKick = 0.12 * strength; // how much randomness pushes drift
    const driftDamp = 0.92;            // smoothing
    const turnGain = 0.06;             // converts drift -> angle change
    const maxTurn = 0.75;              // clamp around base direction

    // Soft boundary steering
    const edgeSoftness = w * 0.06;     // how early we start pushing back
    const edgeForce = 0.35;            // how hard we push back

    pts[0] = { x, y };

    for (let i = 1; i < n; i++) {
        // Random walk (smoothed)
        drift += (rng() - 0.5) * driftKick;
        drift *= driftDamp;

        // Add boundary steering as extra drift (prevents wall hugging)
        // Push right if too close to left edge, push left if too close to right edge
        const dl = (left + edgeSoftness) - x;     // positive when near/over left-soft zone
        const dr = x - (right - edgeSoftness);    // positive when near/over right-soft zone
        if (dl > 0) drift += (dl / edgeSoftness) * edgeForce * 0.1;
        if (dr > 0) drift -= (dr / edgeSoftness) * edgeForce * 0.1;

        angle += drift * turnGain;
        angle = clamp(angle, base - maxTurn, base + maxTurn);

        // Step forward
        x += Math.cos(angle) * seg;
        y += Math.sin(angle) * seg;

        // Keep inside hard bounds (but gently)
        if (x < left) x = lerp(x, left, 0.25);
        else if (x > right) x = lerp(x, right, 0.25);

        pts[i] = { x, y };
    }

    return pts;
}
