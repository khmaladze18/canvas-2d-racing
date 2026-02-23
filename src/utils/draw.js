/**
 * Normalizes various radius formats into a standard 4-corner array.
 * This format matches the native CanvasRenderingContext2D.roundRect() spec.
 */
function getRadiusArray(r) {
    if (Array.isArray(r)) return r; // Already a list
    if (typeof r === "number") return [r]; // Single value (all corners)

    // Object format {tl, tr, br, bl}
    const { tl = 0, tr = 0, br = 0, bl = 0 } = r || {};
    return [tl, tr, br, bl];
}

/**
 * Draws a rounded rectangle with high-performance pathing and DPR snapping.
 */
export function roundRect(ctx, x, y, w, h, r = 0, opts = {}) {
    if (!ctx || w <= 0 || h <= 0) return;

    const {
        fill,
        stroke,
        lineWidth = 1,
        alpha = 1,
        dpr = ctx.dpr || 1,
        shadowColor,
        shadowBlur = 0,
        shadowOffsetX = 0,
        shadowOffsetY = 0
    } = opts;

    // 1. Calculate Inset & Snapping
    // Stroking on the exact integer pixel often looks blurry; 
    // we snap to the physical device pixel grid.
    const halfStroke = stroke ? lineWidth * 0.5 : 0;
    let rx = x + halfStroke;
    let ry = y + halfStroke;
    let rw = w - lineWidth;
    let rh = h - lineWidth;

    if (stroke) {
        rx = Math.round(rx * dpr) / dpr;
        ry = Math.round(ry * dpr) / dpr;
        rw = Math.round(rw * dpr) / dpr;
        rh = Math.round(rh * dpr) / dpr;
    }

    if (rw <= 0 || rh <= 0) return;

    ctx.save();

    // 2. Set Context State
    if (alpha !== 1) ctx.globalAlpha *= alpha;

    if (shadowColor && shadowBlur > 0) {
        ctx.shadowColor = shadowColor;
        ctx.shadowBlur = shadowBlur;
        ctx.shadowOffsetX = shadowOffsetX;
        ctx.shadowOffsetY = shadowOffsetY;
    }

    // 3. Generate Path
    const radii = getRadiusArray(r);
    ctx.beginPath();

    if (typeof ctx.roundRect === 'function') {
        // Native browser support (High Performance)
        ctx.roundRect(rx, ry, rw, rh, radii);
    } else {
        // Fallback for older environments
        legacyRoundRectPath(ctx, rx, ry, rw, rh, radii);
    }

    // 4. Paint
    if (fill) {
        ctx.fillStyle = fill;
        ctx.fill();
    }

    if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = lineWidth;
        ctx.lineJoin = opts.lineJoin || "round";
        ctx.lineCap = opts.lineCap || "round";

        if (opts.dash) {
            ctx.setLineDash(opts.dash);
            ctx.lineDashOffset = opts.dashOffset || 0;
        }

        ctx.stroke();
    }

    ctx.restore();
}

/**
 * Custom math for drawing rounded rects in environments without native support.
 */
function legacyRoundRectPath(ctx, x, y, w, h, radii) {
    // Normalize to 4 values: [tl, tr, br, bl]
    let tl = 0, tr = 0, br = 0, bl = 0;

    if (radii.length === 1) {
        tl = tr = br = bl = radii[0];
    } else if (radii.length === 2) {
        tl = br = radii[0];
        tr = bl = radii[1];
    } else if (radii.length === 4) {
        [tl, tr, br, bl] = radii;
    }

    // Proportional scaling if radii are too big for the box
    const factor = Math.min(1, w / (tl + tr), h / (tr + br), w / (br + bl), h / (bl + tl));
    if (factor < 1) {
        tl *= factor; tr *= factor; br *= factor; bl *= factor;
    }

    ctx.moveTo(x + tl, y);
    ctx.lineTo(x + w - tr, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + tr);
    ctx.lineTo(x + w, y + h - br);
    ctx.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
    ctx.lineTo(x + bl, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - bl);
    ctx.lineTo(x, y + tl);
    ctx.quadraticCurveTo(x, y, x + tl, y);
    ctx.closePath();
}