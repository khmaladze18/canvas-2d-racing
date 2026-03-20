import { resampleClosed } from "./generatorResample.js";
import { generateSmoothPath } from "./generatorSpline.js";

function buildWaypoints(curveStrength, rng) {
    const waypointCount = 10;
    const centerX = 1200;
    const centerY = 1200;
    const baseRadius = 900 * (0.92 + curveStrength * 0.18);
    const waypoints = [];

    for (let i = 0; i < waypointCount; i++) {
        const angle = (i / waypointCount) * Math.PI * 2 - Math.PI / 2;
        const randomRadius = baseRadius * (0.7 + rng() * 0.8);
        waypoints.push({ x: centerX + Math.cos(angle) * randomRadius, y: centerY + Math.sin(angle) * randomRadius });
    }

    waypoints.push({ ...waypoints[0] });
    return waypoints;
}

export function generatePoints({ numPoints, curveStrength, rng = Math.random }) {
    const smooth = generateSmoothPath(buildWaypoints(curveStrength, rng), 40);
    const pts = resampleClosed(smooth, Math.max(220, numPoints | 0));
    pts._closed = true;
    return pts;
}
