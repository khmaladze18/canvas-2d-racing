import { drawTrackPath } from "./hudMinimapTrack.js";

function computeMapBounds(track, width, height) {
    const pts = track?.points || [];
    if (!pts.length) return null;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const p of pts) {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
    }
    const pad = 12;
    const spanX = Math.max(1, maxX - minX);
    const spanY = Math.max(1, maxY - minY);
    const scale = Math.min((width - pad * 2) / spanX, (height - pad * 2) / spanY);
    return { minX, minY, scale, offsetX: (width - spanX * scale) * 0.5, offsetY: (height - spanY * scale) * 0.5 };
}

function mapPoint(bounds, p) {
    return { x: bounds.offsetX + (p.x - bounds.minX) * bounds.scale, y: bounds.offsetY + (p.y - bounds.minY) * bounds.scale };
}

function drawMarker(ctx, x, y, r, fill, stroke = "rgba(255,255,255,0.9)") {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = stroke;
    ctx.stroke();
}

function ensureMapResolution(mapCanvas, mapCtx) {
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const nextW = Math.round((mapCanvas.clientWidth || mapCanvas.width || 220) * dpr);
    const nextH = Math.round((mapCanvas.clientHeight || mapCanvas.height || 160) * dpr);
    if (mapCanvas.width !== nextW || mapCanvas.height !== nextH) {
        mapCanvas.width = nextW;
        mapCanvas.height = nextH;
    }
    mapCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

export function drawMiniMap(mapCanvas, mapCtx, cache, track, racers, player) {
    if (!mapCanvas || !mapCtx || !track?.points?.length) return;
    ensureMapResolution(mapCanvas, mapCtx);
    const width = mapCanvas.width / (window.devicePixelRatio || 1);
    const height = mapCanvas.height / (window.devicePixelRatio || 1);
    if (cache.mapTrack !== track || !cache.mapBounds) {
        cache.mapTrack = track;
        cache.mapBounds = computeMapBounds(track, width, height);
    }
    const bounds = cache.mapBounds;
    if (!bounds) return;

    mapCtx.clearRect(0, 0, width, height);
    const bg = mapCtx.createLinearGradient(0, 0, 0, height);
    bg.addColorStop(0, "rgba(5, 14, 28, 0.96)");
    bg.addColorStop(1, "rgba(3, 7, 14, 0.98)");
    mapCtx.fillStyle = bg;
    mapCtx.fillRect(0, 0, width, height);
    drawTrackPath(mapCtx, bounds, track, 10, "rgba(76, 96, 130, 0.55)");
    drawTrackPath(mapCtx, bounds, track, 4, "rgba(230, 237, 255, 0.92)");

    const start = mapPoint(bounds, track.points[track.startGridIndex || 0]);
    mapCtx.fillStyle = "#f8fafc";
    mapCtx.fillRect(start.x - 4, start.y - 4, 8, 8);
    for (const car of racers || []) if (car && car !== player) drawMarker(mapCtx, mapPoint(bounds, car).x, mapPoint(bounds, car).y, 3.6, "#fb7185");
    if (!player) return;
    const p = mapPoint(bounds, player);
    drawMarker(mapCtx, p.x, p.y, 5, "#22d3ee");
    mapCtx.save();
    mapCtx.translate(p.x, p.y);
    mapCtx.rotate(player.angle - Math.PI / 2);
    mapCtx.beginPath();
    mapCtx.moveTo(0, -8);
    mapCtx.lineTo(5, 5);
    mapCtx.lineTo(-5, 5);
    mapCtx.closePath();
    mapCtx.fillStyle = "rgba(34, 211, 238, 0.32)";
    mapCtx.fill();
    mapCtx.restore();
}
