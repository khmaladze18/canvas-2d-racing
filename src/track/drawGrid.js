import { GRID } from "../game/constants.js";
import { clamp } from "./utils.js";
import { pointAtIndex } from "./geometry.js";

export function drawStartGrid(ctx, { points, h }, cameraX, cameraY, focusIndex, rows = 3) {
    const mid = clamp(Math.floor(focusIndex), 0, points.length - 3);

    const pA = pointAtIndex(points, mid);
    const pB = pointAtIndex(points, mid + 2);
    const dx = pB.x - pA.x;
    const dy = pB.y - pA.y;
    const len = Math.hypot(dx, dy) || 1;

    const nx = -dy / len;
    const ny = dx / len;
    const tx = dx / len;
    const ty = dy / len;

    const laneX = GRID.laneX;
    const rowY = GRID.rowY;
    const slotW = GRID.slotW;
    const slotH = GRID.slotH;
    const rot = Math.atan2(dy, dx) + Math.PI / 2;

    ctx.save();
    ctx.globalAlpha = 0.96;

    for (let r = 0; r < rows; r++) {
        const baseX = pA.x;
        const baseY = pA.y;

        for (const lane of [-laneX, laneX]) {
            const cx = baseX + nx * lane - tx * rowY * r;
            const cy = baseY + ny * lane - ty * rowY * r;
            const sx = cx - cameraX;
            const sy = cy - cameraY;
            if (sx < -120 || sx > ctx.canvas.width + 120 || sy < -120 || sy > h + 120) continue;

            ctx.save();
            ctx.translate(sx, sy);
            ctx.rotate(rot);

            ctx.lineWidth = 2.6;
            ctx.strokeStyle = "rgba(255,255,255,0.94)";
            ctx.strokeRect(-slotW / 2, -slotH / 2, slotW, slotH);

            ctx.lineWidth = 1.2;
            ctx.strokeStyle = "rgba(255,255,255,0.38)";
            ctx.strokeRect(-slotW / 2 + 3, -slotH / 2 + 3, slotW - 6, slotH - 6);

            ctx.fillStyle = "rgba(255,255,255,0.11)";
            ctx.fillRect(-slotW / 2 + 2, -slotH / 2 + 2, slotW - 4, 8);

            ctx.restore();
        }
    }

    ctx.restore();
}
