import { getRadiusArray, legacyRoundRectPath } from "./roundRectPath.js";

export function roundRect(ctx, x, y, w, h, r = 0, opts = {}) {
    if (!ctx || w <= 0 || h <= 0) return;
    const { fill, stroke, lineWidth = 1, alpha = 1, dpr = ctx.dpr || 1, shadowColor, shadowBlur = 0, shadowOffsetX = 0, shadowOffsetY = 0 } = opts;
    const halfStroke = stroke ? lineWidth * 0.5 : 0;
    let rx = x + halfStroke, ry = y + halfStroke, rw = w - lineWidth, rh = h - lineWidth;
    if (stroke) {
        rx = Math.round(rx * dpr) / dpr; ry = Math.round(ry * dpr) / dpr; rw = Math.round(rw * dpr) / dpr; rh = Math.round(rh * dpr) / dpr;
    }
    if (rw <= 0 || rh <= 0) return;
    ctx.save();
    if (alpha !== 1) ctx.globalAlpha *= alpha;
    if (shadowColor && shadowBlur > 0) { ctx.shadowColor = shadowColor; ctx.shadowBlur = shadowBlur; ctx.shadowOffsetX = shadowOffsetX; ctx.shadowOffsetY = shadowOffsetY; }
    const radii = getRadiusArray(r);
    ctx.beginPath();
    if (typeof ctx.roundRect === "function") ctx.roundRect(rx, ry, rw, rh, radii);
    else legacyRoundRectPath(ctx, rx, ry, rw, rh, radii);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) {
        ctx.strokeStyle = stroke; ctx.lineWidth = lineWidth; ctx.lineJoin = opts.lineJoin || "round"; ctx.lineCap = opts.lineCap || "round";
        if (opts.dash) { ctx.setLineDash(opts.dash); ctx.lineDashOffset = opts.dashOffset || 0; }
        ctx.stroke();
    }
    ctx.restore();
}
