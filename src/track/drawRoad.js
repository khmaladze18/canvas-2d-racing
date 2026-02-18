import { clamp } from "./utils.js";
import { normalAtIndex, pointAtIndex } from "./geometry.js";

export function drawRoad(ctx, track, cameraY, focusIndex) {
    const { points, roadHalfWidth, h } = track;
    const mid = clamp(Math.floor(focusIndex), 0, points.length - 1);

    const from = Math.max(0, mid - 260);
    const to = Math.min(points.length - 1, mid + 520);

    // Asphalt
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#1b2235";
    ctx.lineWidth = roadHalfWidth * 2;
    ctx.beginPath();
    for (let i = from; i <= to; i++) {
        const p = points[i];
        const sy = p.y - cameraY;
        if (i === from) ctx.moveTo(p.x, sy);
        else ctx.lineTo(p.x, sy);
    }
    ctx.stroke();

    // Edge lines
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 2;

    ctx.beginPath();
    for (let i = from; i <= to; i++) {
        const p = points[i];
        const n = normalAtIndex(points, i);
        const sy = p.y - cameraY;
        if (i === from) ctx.moveTo(p.x - n.x * roadHalfWidth, sy - n.y * roadHalfWidth);
        else ctx.lineTo(p.x - n.x * roadHalfWidth, sy - n.y * roadHalfWidth);
    }
    ctx.stroke();

    ctx.beginPath();
    for (let i = from; i <= to; i++) {
        const p = points[i];
        const n = normalAtIndex(points, i);
        const sy = p.y - cameraY;
        if (i === from) ctx.moveTo(p.x + n.x * roadHalfWidth, sy + n.y * roadHalfWidth);
        else ctx.lineTo(p.x + n.x * roadHalfWidth, sy + n.y * roadHalfWidth);
    }
    ctx.stroke();

    // Center dashed line
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 2;
    ctx.setLineDash([14, 14]);
    ctx.beginPath();
    for (let i = from; i <= to; i++) {
        const p = points[i];
        const sy = p.y - cameraY;
        if (i === from) ctx.moveTo(p.x, sy);
        else ctx.lineTo(p.x, sy);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Finish line marker
    const finIdx = Math.floor(track.indexAtDistance(track.finishDistance));
    const fp = pointAtIndex(points, finIdx);
    const fy = fp.y - cameraY;

    if (fy > -60 && fy < h + 60) {
        ctx.save();
        ctx.translate(fp.x, fy);
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.fillRect(-roadHalfWidth, -6, roadHalfWidth * 2, 12);
        ctx.fillStyle = "rgba(0,0,0,0.65)";
        for (let k = -roadHalfWidth; k < roadHalfWidth; k += 18) ctx.fillRect(k, -6, 9, 12);
        ctx.restore();
    }

    return { from, to };
}
