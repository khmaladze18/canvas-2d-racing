/**
 * Draw a rounded rectangle with optional fill + stroke.
 *
 * - Handles DPR canvases properly
 * - Only pixel-snaps when stroking (so fills stay aligned)
 * - Supports radius as number OR { tl, tr, br, bl }
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {number|{tl?:number,tr?:number,br?:number,bl?:number}} r
 * @param {object} [opts]
 * @param {string} [opts.fill]
 * @param {string} [opts.stroke]
 * @param {number} [opts.lineWidth=1]
 * @param {number} [opts.alpha=1]
 * @param {string} [opts.lineJoin="round"]
 * @param {string} [opts.lineCap="round"]
 * @param {number[]} [opts.dash]
 * @param {number} [opts.dashOffset=0]
 * @param {string} [opts.shadowColor]
 * @param {number} [opts.shadowBlur=0]
 * @param {number} [opts.shadowOffsetX=0]
 * @param {number} [opts.shadowOffsetY=0]
 * @param {number} [opts.dpr=1] If you scaled canvas by DPR, pass it (or set ctx.dpr on init)
 */
export function roundRect(ctx, x, y, w, h, r, opts = {}) {
    if (!ctx || w <= 0 || h <= 0) return;

    const {
        fill,
        stroke,
        lineWidth = 1,
        alpha = 1,
        lineJoin = "round",
        lineCap = "round",
        dash,
        dashOffset = 0,
        shadowColor,
        shadowBlur = 0,
        shadowOffsetX = 0,
        shadowOffsetY = 0,
        dpr = ctx.dpr || 1,
    } = opts;

    // Normalize radius to per-corner
    const rr = normalizeRadius(r);

    // Clamp each corner radius to fit box
    const maxR = Math.min(Math.abs(w) / 2, Math.abs(h) / 2);
    const rtl = clampAbs(rr.tl, maxR);
    const rtr = clampAbs(rr.tr, maxR);
    const rbr = clampAbs(rr.br, maxR);
    const rbl = clampAbs(rr.bl, maxR);

    // If stroking, inset by half lineWidth to keep stroke inside bounds
    const inset = stroke ? (lineWidth * 0.5) : 0;
    let ix = x + inset;
    let iy = y + inset;
    let iw = w - inset * 2;
    let ih = h - inset * 2;

    if (iw <= 0 || ih <= 0) return;

    // Pixel snap ONLY for strokes (crisp borders), and snap to device pixel grid
    if (stroke) {
        const snap = 1 / dpr; // 0.5 at dpr=2? actually device pixel = 0.5 CSS px
        ix = Math.round(ix * dpr) / dpr + snap * 0; // keep aligned, no forced +0.5
        iy = Math.round(iy * dpr) / dpr + snap * 0;
        iw = Math.round(iw * dpr) / dpr;
        ih = Math.round(ih * dpr) / dpr;
    }

    ctx.save();
    if (alpha !== 1) ctx.globalAlpha *= alpha;

    if (shadowColor && shadowBlur > 0) {
        ctx.shadowColor = shadowColor;
        ctx.shadowBlur = shadowBlur;
        ctx.shadowOffsetX = shadowOffsetX;
        ctx.shadowOffsetY = shadowOffsetY;
    }

    if (stroke) {
        ctx.lineWidth = lineWidth;
        ctx.lineJoin = lineJoin;
        ctx.lineCap = lineCap;
        if (dash?.length) ctx.setLineDash(dash);
        if (dashOffset) ctx.lineDashOffset = dashOffset;
    }

    // Build path
    ctx.beginPath();

    // Start top-left corner
    ctx.moveTo(ix + rtl, iy);

    // Top edge + top-right corner
    ctx.lineTo(ix + iw - rtr, iy);
    ctx.quadraticCurveTo(ix + iw, iy, ix + iw, iy + rtr);

    // Right edge + bottom-right corner
    ctx.lineTo(ix + iw, iy + ih - rbr);
    ctx.quadraticCurveTo(ix + iw, iy + ih, ix + iw - rbr, iy + ih);

    // Bottom edge + bottom-left corner
    ctx.lineTo(ix + rbl, iy + ih);
    ctx.quadraticCurveTo(ix, iy + ih, ix, iy + ih - rbl);

    // Left edge + top-left corner
    ctx.lineTo(ix, iy + rtl);
    ctx.quadraticCurveTo(ix, iy, ix + rtl, iy);

    ctx.closePath();

    if (fill) {
        ctx.fillStyle = fill;
        ctx.fill();
    }

    if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.stroke();
    }

    ctx.restore();
}

function normalizeRadius(r) {
    if (typeof r === "number") return { tl: r, tr: r, br: r, bl: r };
    if (r && typeof r === "object") {
        return {
            tl: r.tl ?? 0,
            tr: r.tr ?? 0,
            br: r.br ?? 0,
            bl: r.bl ?? 0,
        };
    }
    return { tl: 0, tr: 0, br: 0, bl: 0 };
}

function clampAbs(v, max) {
    const n = Number.isFinite(v) ? v : 0;
    const a = Math.abs(n);
    return Math.sign(n) * Math.min(a, max);
}
