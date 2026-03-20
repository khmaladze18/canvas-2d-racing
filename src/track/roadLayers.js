import { strokeOffsetSpline, strokeSpline } from "./roadStroke.js";

export function renderRoadLayers(ctx, xs, ys, nx, ny, roadHalfWidth, closed) {
    ctx.lineCap = "butt";
    ctx.lineJoin = "round";

    // 1. Asphalt (slightly wider to give curbs something to sit against)
    strokeSpline(ctx, xs, ys, roadHalfWidth * 2 + 4, "#1b2235", [], closed);

    // 2. Curbs — four dashed offset strokes (red pair then white pair)
    const curbWidth = 6;
    const offset = roadHalfWidth + curbWidth / 2;
    const curbLayers = [
        { off: -offset, dashOffset: 0,  color: "#e11d48" },
        { off:  offset, dashOffset: 0,  color: "#e11d48" },
        { off: -offset, dashOffset: 20, color: "#f8fafc" },
        { off:  offset, dashOffset: 20, color: "#f8fafc" },
    ];
    for (const layer of curbLayers) {
        strokeOffsetSpline(ctx, xs, ys, nx, ny, layer.off, curbWidth, layer.color, [20, 20], layer.dashOffset, closed);
    }

    // Re-stamp road surface to erase any curb intrusion at tight curves.
    // At curves, the offset polyline can shortcut inward; this covers that.
    strokeSpline(ctx, xs, ys, roadHalfWidth * 2, "#1b2235", [], closed);

    // 3. Center dashed line
    strokeSpline(ctx, xs, ys, 3, "rgba(255,255,255,0.2)", [15, 30], closed);
}

export function renderFinishLine(ctx, x, y, angle, halfWidth) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle + Math.PI / 2);
    const rowH = 10;
    const cols = 12;
    const squareSize = (halfWidth * 2) / cols;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-halfWidth, -rowH, halfWidth * 2, rowH * 2);
    ctx.fillStyle = "#000000";
    for (let row = 0; row < 2; row++) {
        for (let col = 0; col < cols; col++) {
            if ((row + col) % 2 === 0) {
                ctx.fillRect(-halfWidth + col * squareSize, -rowH + row * rowH, squareSize, rowH);
            }
        }
    }
    ctx.restore();
}
