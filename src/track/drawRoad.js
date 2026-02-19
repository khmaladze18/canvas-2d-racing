import { clamp } from "./utils.js";
import { normalAtIndex, pointAtIndex } from "./geometry.js";

export function drawRoad(ctx, track, cameraY, focusIndex) {
    const { points, roadHalfWidth, h } = track;
    const nPts = points?.length ?? 0;
    if (!nPts) return { from: 0, to: 0 };

    const mid = clamp(focusIndex | 0, 0, nPts - 1);

    // View window around player (tuneable)
    const from = Math.max(0, mid - 260);
    const to = Math.min(nPts - 1, mid + 520);

    // Precompute screen-space Y once + normals once.
    // This avoids calling normalAtIndex twice per i (left & right edges).
    const count = to - from + 1;
    const xs = new Float32Array(count);
    const ys = new Float32Array(count);
    const nx = new Float32Array(count);
    const ny = new Float32Array(count);

    // (Optional) quick vertical culling: if your points are monotonic in y (they usually are),
    // you can skip points far outside the screen. We'll keep it simple: still compute all in window.
    for (let j = 0, i = from; i <= to; i++, j++) {
        const p = points[i];
        xs[j] = p.x;
        ys[j] = p.y - cameraY;

        const n = normalAtIndex(points, i);
        nx[j] = n.x;
        ny[j] = n.y;
    }

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // --- Asphalt ---
    ctx.strokeStyle = "#1b2235";
    ctx.lineWidth = roadHalfWidth * 2;
    ctx.beginPath();
    ctx.moveTo(xs[0], ys[0]);
    for (let j = 1; j < count; j++) ctx.lineTo(xs[j], ys[j]);
    ctx.stroke();

    // --- Edge lines ---
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 2;

    // Left edge
    ctx.beginPath();
    ctx.moveTo(xs[0] - nx[0] * roadHalfWidth, ys[0] - ny[0] * roadHalfWidth);
    for (let j = 1; j < count; j++) {
        ctx.lineTo(xs[j] - nx[j] * roadHalfWidth, ys[j] - ny[j] * roadHalfWidth);
    }
    ctx.stroke();

    // Right edge
    ctx.beginPath();
    ctx.moveTo(xs[0] + nx[0] * roadHalfWidth, ys[0] + ny[0] * roadHalfWidth);
    for (let j = 1; j < count; j++) {
        ctx.lineTo(xs[j] + nx[j] * roadHalfWidth, ys[j] + ny[j] * roadHalfWidth);
    }
    ctx.stroke();

    // --- Center dashed line ---
    // Safer: always reset dash even if something throws.
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 2;
    ctx.setLineDash([14, 14]);
    ctx.beginPath();
    ctx.moveTo(xs[0], ys[0]);
    for (let j = 1; j < count; j++) ctx.lineTo(xs[j], ys[j]);
    ctx.stroke();
    ctx.setLineDash([]);

    // --- Finish line marker ---
    const finIdx = clamp((track.indexAtDistance(track.finishDistance) | 0), 0, nPts - 1);
    const fp = pointAtIndex(points, finIdx);
    if (fp) {
        const fy = fp.y - cameraY;
        if (fy > -60 && fy < h + 60) {
            ctx.translate(fp.x, fy);

            ctx.fillStyle = "rgba(255,255,255,0.9)";
            ctx.fillRect(-roadHalfWidth, -6, roadHalfWidth * 2, 12);

            ctx.fillStyle = "rgba(0,0,0,0.65)";
            // align to checker width for cleaner look
            const step = 18;
            const block = 9;
            const startX = -roadHalfWidth;
            const endX = roadHalfWidth;
            for (let k = startX; k < endX; k += step) ctx.fillRect(k, -6, block, 12);
        }
    }

    ctx.restore();
    return { from, to };
}
