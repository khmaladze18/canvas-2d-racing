export function getRadiusArray(r) {
    if (Array.isArray(r)) return r;
    if (typeof r === "number") return [r];
    const { tl = 0, tr = 0, br = 0, bl = 0 } = r || {};
    return [tl, tr, br, bl];
}

export function legacyRoundRectPath(ctx, x, y, w, h, radii) {
    let tl = 0, tr = 0, br = 0, bl = 0;
    if (radii.length === 1) tl = tr = br = bl = radii[0];
    else if (radii.length === 2) { tl = br = radii[0]; tr = bl = radii[1]; }
    else if (radii.length === 4) [tl, tr, br, bl] = radii;
    const factor = Math.min(1, w / (tl + tr), h / (tr + br), w / (br + bl), h / (bl + tl));
    if (factor < 1) { tl *= factor; tr *= factor; br *= factor; bl *= factor; }
    ctx.moveTo(x + tl, y); ctx.lineTo(x + w - tr, y); ctx.quadraticCurveTo(x + w, y, x + w, y + tr);
    ctx.lineTo(x + w, y + h - br); ctx.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
    ctx.lineTo(x + bl, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - bl); ctx.lineTo(x, y + tl);
    ctx.quadraticCurveTo(x, y, x + tl, y); ctx.closePath();
}
