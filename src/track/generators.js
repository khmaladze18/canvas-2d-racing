import { clamp, lerp } from "./utils.js";

export function generatePoints({ w, h, numPoints, segmentLen, curveStrength }) {
    const pts = [];
    let x = w * 0.5;
    let y = h * 0.75;

    let angle = -Math.PI / 2;
    let drift = 0;

    const boundsLeft = w * 0.18;
    const boundsRight = w * 0.82;

    pts.push({ x, y });

    for (let i = 1; i < numPoints; i++) {
        drift += (Math.random() - 0.5) * 0.12 * curveStrength;
        drift *= 0.92;

        angle += drift * 0.06;

        const maxTurn = 0.75;
        angle = clamp(angle, -Math.PI / 2 - maxTurn, -Math.PI / 2 + maxTurn);

        x += Math.cos(angle) * segmentLen;
        y += Math.sin(angle) * segmentLen;

        if (x < boundsLeft) x = lerp(x, boundsLeft, 0.18);
        if (x > boundsRight) x = lerp(x, boundsRight, 0.18);

        pts.push({ x, y });
    }

    return pts;
}
