export function drawTrackPath(mapCtx, bounds, track, lineWidth, strokeStyle) {
    mapCtx.beginPath();
    track.points.forEach((p, i) => {
        const x = bounds.offsetX + (p.x - bounds.minX) * bounds.scale;
        const y = bounds.offsetY + (p.y - bounds.minY) * bounds.scale;
        if (i === 0) mapCtx.moveTo(x, y);
        else mapCtx.lineTo(x, y);
    });
    if (track.closed) mapCtx.closePath();
    mapCtx.lineWidth = lineWidth;
    mapCtx.lineCap = "round";
    mapCtx.lineJoin = "round";
    mapCtx.strokeStyle = strokeStyle;
    mapCtx.stroke();
}
