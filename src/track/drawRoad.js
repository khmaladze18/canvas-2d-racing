import { clamp } from "./utils.js";
import { normalAtIndex } from "./geometry.js";
import { renderFinishLine, renderRoadLayers } from "./roadLayers.js";

export function drawRoad(ctx, track, cameraX, cameraY, focusIndex) {
    const { points, roadHalfWidth } = track;
    if (!points?.length) return { from: 0, to: 0 };

    const mid = track.clampIndex ? track.clampIndex(focusIndex | 0) : clamp(focusIndex | 0, 0, points.length - 1);
    const from = track.closed ? 0 : Math.max(0, mid - 260);
    const to = track.closed ? points.length - 1 : Math.min(points.length - 1, mid + 520);
    const count = to - from + 1;
    const xs = new Float32Array(count);
    const ys = new Float32Array(count);
    const nx = new Float32Array(count);
    const ny = new Float32Array(count);

    for (let j = 0, i = from; i <= to; i++, j++) {
        const point = track.pointAtIndex ? track.pointAtIndex(i) : points[i];
        const normal = track.normalAtIndex ? track.normalAtIndex(i) : normalAtIndex(points, i);
        xs[j] = point.x - cameraX;
        ys[j] = point.y - cameraY;
        nx[j] = normal.x;
        ny[j] = normal.y;
    }

    ctx.save();
    renderRoadLayers(ctx, xs, ys, nx, ny, roadHalfWidth, track.closed);

    const finIdx = track.finishIndex | 0;
    if (finIdx >= from && finIdx < to - 1) {
        const j = finIdx - from;
        const p1 = track.pointAtIndex ? track.pointAtIndex(finIdx) : points[finIdx];
        const p2 = track.pointAtIndex ? track.pointAtIndex(finIdx + 1) : points[finIdx + 1];
        renderFinishLine(ctx, xs[j], ys[j], Math.atan2(p2.y - p1.y, p2.x - p1.x), roadHalfWidth);
    }
    ctx.restore();
    return { from, to };
}
