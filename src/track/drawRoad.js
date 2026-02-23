import { clamp } from "./utils.js";
import { normalAtIndex } from "./geometry.js";

export function drawRoad(ctx, track, cameraY, focusIndex) {
    const { points, roadHalfWidth } = track;
    const nPts = points?.length ?? 0;
    if (!nPts) return { from: 0, to: 0 };

    const mid = clamp(focusIndex | 0, 0, nPts - 1);
    const from = Math.max(0, mid - 260);
    const to = Math.min(nPts - 1, mid + 520);
    const count = to - from + 1;

    const xs = new Float32Array(count);
    const ys = new Float32Array(count);
    const nx = new Float32Array(count);
    const ny = new Float32Array(count);

    for (let j = 0, i = from; i <= to; i++, j++) {
        const p = points[i];
        const n = normalAtIndex(points, i);
        xs[j] = p.x;
        ys[j] = p.y - cameraY;
        nx[j] = n.x;
        ny[j] = n.y;
    }

    ctx.save();

    // 1. Asphalt Base
    ctx.lineCap = "butt";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#1b2235";
    ctx.lineWidth = roadHalfWidth * 2 + 4;
    ctx.beginPath();
    ctx.moveTo(xs[0], ys[0]);
    for (let j = 1; j < count; j++) ctx.lineTo(xs[j], ys[j]);
    ctx.stroke();

    // 2. Rumble Strips (Left & Right)
    renderCurbs(ctx, xs, ys, nx, ny, roadHalfWidth);

    // 3. Finish Line (Moved here so it's under the center lines but above asphalt)
    const finIdx = track.indexAtDistance(track.finishDistance) | 0;
    if (finIdx >= from && finIdx < to - 1) { // Ensure there is a next point for tangent
        const j = finIdx - from;
        const p1 = points[finIdx];
        const p2 = points[finIdx + 1]; // Look ahead for angle

        // Correct Tangent Angle:
        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        renderFinishLine(ctx, xs[j], ys[j], angle, roadHalfWidth);
    }

    // 4. Center Dashed Line
    ctx.setLineDash([15, 30]);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(xs[0], ys[0]);
    for (let j = 1; j < count; j++) ctx.lineTo(xs[j], ys[j]);
    ctx.stroke();

    ctx.restore();
    return { from, to };
}

/**
 * Encapsulated Curb Rendering
 */
function renderCurbs(ctx, xs, ys, nx, ny, roadHalfWidth) {
    const curbWidth = 6;
    ctx.lineWidth = curbWidth;
    const offset = roadHalfWidth + curbWidth / 2;

    [[-offset, 0], [offset, 0], [-offset, 20], [offset, 20]].forEach(([off, dashOff], i) => {
        ctx.setLineDash([20, 20]);
        ctx.lineDashOffset = dashOff;
        ctx.strokeStyle = i < 2 ? "#e11d48" : "#f8fafc"; // Alternate Red/White

        ctx.beginPath();
        ctx.moveTo(xs[0] + nx[0] * off, ys[0] + ny[0] * off);
        for (let j = 1; j < xs.length; j++) {
            ctx.lineTo(xs[j] + nx[j] * off, ys[j] + ny[j] * off);
        }
        ctx.stroke();
    });
}

/**
 * Perfectly Aligned Finish Line
 */
function renderFinishLine(ctx, x, y, angle, halfWidth) {
    ctx.save();
    ctx.translate(x, y);
    // Rotating by tangent angle + 90 degrees to face across the track
    ctx.rotate(angle + Math.PI / 2);

    const rowH = 10;
    const squares = 12; // How many squares across the track
    const squareSize = (halfWidth * 2) / squares;

    // Draw White Base
    ctx.fillStyle = "#fff";
    ctx.fillRect(-halfWidth, -rowH, halfWidth * 2, rowH * 2);

    // Draw Black Checkers
    ctx.fillStyle = "#000";
    for (let row = 0; row < 2; row++) {
        for (let col = 0; col < squares; col++) {
            if ((row + col) % 2 === 0) {
                ctx.fillRect(
                    -halfWidth + col * squareSize,
                    -rowH + (row * rowH),
                    squareSize,
                    rowH
                );
            }
        }
    }
    ctx.restore();
}