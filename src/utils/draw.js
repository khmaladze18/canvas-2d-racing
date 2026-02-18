/**
 * Draw a rounded rectangle with optional fill + stroke.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {number} r  border radius
 * @param {object} [opts]
 * @param {string} [opts.fill]
 * @param {string} [opts.stroke]
 * @param {number} [opts.lineWidth=1]
 * @param {string} [opts.shadowColor]
 * @param {number} [opts.shadowBlur=0]
 */
export function roundRect(
    ctx,
    x,
    y,
    w,
    h,
    r,
    opts = {}
) {
    if (w <= 0 || h <= 0) return;

    const {
        fill,
        stroke,
        lineWidth = 1,
        shadowColor,
        shadowBlur = 0,
    } = opts;

    // Clamp radius
    const rr = Math.min(Math.abs(r), Math.abs(w) / 2, Math.abs(h) / 2);

    // Pixel align for crisp edges (important with DPR scaling)
    const px = Math.round(x) + 0.5;
    const py = Math.round(y) + 0.5;
    const pw = Math.round(w);
    const ph = Math.round(h);

    ctx.save();

    ctx.beginPath();
    ctx.moveTo(px + rr, py);
    ctx.arcTo(px + pw, py, px + pw, py + ph, rr);
    ctx.arcTo(px + pw, py + ph, px, py + ph, rr);
    ctx.arcTo(px, py + ph, px, py, rr);
    ctx.arcTo(px, py, px + pw, py, rr);
    ctx.closePath();

    if (shadowColor && shadowBlur > 0) {
        ctx.shadowColor = shadowColor;
        ctx.shadowBlur = shadowBlur;
    }

    if (fill) {
        ctx.fillStyle = fill;
        ctx.fill();
    }

    if (stroke) {
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = stroke;
        ctx.stroke();
    }

    ctx.restore();
}
