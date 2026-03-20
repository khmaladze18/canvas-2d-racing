export function strokeSpline(ctx, xs, ys, width, color, dash = [], closed = false) {
    ctx.beginPath();
    ctx.moveTo(xs[0], ys[0]);
    for (let j = 1; j < xs.length; j++) ctx.lineTo(xs[j], ys[j]);
    if (closed) ctx.closePath();
    ctx.lineWidth = width;
    ctx.strokeStyle = color;
    ctx.setLineDash(dash);
    ctx.stroke();
    ctx.setLineDash([]);
}

export function strokeOffsetSpline(ctx, xs, ys, nx, ny, offset, width, color, dash = [], dashOffset = 0, closed = false) {
    ctx.beginPath();
    ctx.moveTo(xs[0] + nx[0] * offset, ys[0] + ny[0] * offset);
    for (let j = 1; j < xs.length; j++) ctx.lineTo(xs[j] + nx[j] * offset, ys[j] + ny[j] * offset);
    if (closed) ctx.closePath();
    ctx.lineWidth = width;
    ctx.strokeStyle = color;
    ctx.setLineDash(dash);
    ctx.lineDashOffset = dashOffset;
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineDashOffset = 0;
}
