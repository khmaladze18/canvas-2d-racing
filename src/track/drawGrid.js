import { clamp } from "./utils.js";
import { pointAtIndex } from "./geometry.js";

export function drawStartGrid(ctx, { points, h }, cameraY, focusIndex, rows = 3) {
    const mid = clamp(Math.floor(focusIndex), 0, points.length - 3);

    const pA = pointAtIndex(points, mid);
    const pB = pointAtIndex(points, mid + 2);
    const dx = pB.x - pA.x;
    const dy = pB.y - pA.y;
    const len = Math.hypot(dx, dy) || 1;

    const nx = -dy / len;
    const ny = dx / len;

    const laneX = 22;
    const rowY = 34;

    const slotW = 26;
    const slotH = 40;

    const rot = Math.atan2(dy, dx) + Math.PI / 2;

    ctx.save();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(255,255,255,0.85)";
    ctx.globalAlpha = 0.95;

    for (let r = 0; r < rows; r++) {
        const baseX = pA.x;
        const baseY = pA.y + r * rowY;

        for (const lane of [-laneX, laneX]) {
            const cx = baseX + nx * lane;
            const cy = baseY + ny * lane;

            const sy = cy - cameraY;
            if (sy < -120 || sy > h + 120) continue;

            ctx.save();
            ctx.translate(cx, sy);
            ctx.rotate(rot);
            ctx.strokeRect(-slotW / 2, -slotH / 2, slotW, slotH);
            ctx.restore();
        }
    }

    ctx.restore();
}
