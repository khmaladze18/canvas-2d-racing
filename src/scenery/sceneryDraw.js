import { TILES } from "./svgTiles.js";
import { clamp } from "./sceneryMath.js";

function fillPattern(ctx, img, x, y, w, h, offsetX = 0, offsetY = 0, alpha = 1) {
    if (!img?.complete) return;
    const pattern = ctx.createPattern(img, "repeat");
    if (!pattern) return;
    const m = new DOMMatrix();
    m.translateSelf(offsetX, offsetY);
    pattern.setTransform(m);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = pattern;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
}

export function drawBackgroundLayers(ctx, track, layers, cameraX, cameraY, parallaxCfg) {
    ctx.fillStyle = "#8da133";
    ctx.fillRect(0, 0, track.w, track.h);

    for (const layerName of layers) {
        if (layerName === "noise") continue;
        if (layerName === "grassPixel") {
            fillPattern(ctx, TILES.grassPixel, 0, 0, track.w, track.h, -cameraX * 0.18, -cameraY * 0.18, 0.95);
            continue;
        }
        if (layerName === "serviceRoad") {
            fillPattern(ctx, TILES.serviceRoad, 0, 0, track.w, track.h, -cameraX * 0.14, -cameraY * 0.14, 0.34);
            continue;
        }
        if (layerName === "paddock") {
            fillPattern(ctx, TILES.paddock, 0, 0, track.w, track.h, -cameraX * 0.08, -cameraY * 0.08, 0.4);
            continue;
        }
        if (layerName === "circuitBorder") {
            const img = TILES.circuitBorder;
            if (!img?.complete) continue;
            const ox = (-cameraX * 0.08) % img.width;
            ctx.save();
            ctx.globalAlpha = 0.88;
            ctx.drawImage(img, ox - img.width, -4, track.w + img.width * 2, 138);
            ctx.drawImage(img, ox - img.width, track.h - 146, track.w + img.width * 2, 150);
            ctx.restore();
            continue;
        }
        const img = TILES[layerName];
        if (!img?.complete) continue;
        const y = (-cameraY * (parallaxCfg[layerName] ?? parallaxCfg.default)) % track.h;
        ctx.save();
        ctx.globalAlpha = 0.92;
        ctx.drawImage(img, 0, y - track.h, track.w, track.h);
        ctx.drawImage(img, 0, y, track.w, track.h);
        ctx.restore();
    }
}

export function drawBackgroundOverlays(ctx, track) {
    const turf = ctx.createLinearGradient(0, 0, 0, track.h);
    turf.addColorStop(0, "rgba(232, 236, 176, 0.04)");
    turf.addColorStop(0.5, "rgba(132, 147, 50, 0.08)");
    turf.addColorStop(1, "rgba(84, 98, 28, 0.12)");
    ctx.fillStyle = turf;
    ctx.fillRect(0, 0, track.w, track.h);

    ctx.save();
    ctx.globalAlpha = 0.028;
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    for (let i = -track.h; i < track.h * 2; i += 72) ctx.fillRect(0, i, track.w, 2);
    ctx.restore();

    ctx.save();
    const v = ctx.createRadialGradient(track.w / 2, track.h * 0.55, track.h * 0.15, track.w / 2, track.h * 0.5, track.h * 0.95);
    v.addColorStop(0, "rgba(0,0,0,0)");
    v.addColorStop(1, "rgba(0,0,0,0.12)");
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, track.w, track.h);
    ctx.restore();
    const noise = TILES.noise;
    if (!noise?.complete) return;
    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = ctx.createPattern(noise, "repeat");
    ctx.fillRect(0, 0, track.w, track.h);
    ctx.restore();
}

export function drawProps(ctx, track, props, cameraX, cameraY, fromIdx, toIdx, propCullPadY, lowerBound, upperBound) {
    const start = lowerBound(props, fromIdx);
    const end = upperBound(props, toIdx);
    for (let i = start; i < end; i++) {
        const pr = props[i];
        const sx = pr.x - cameraX;
        const sy = pr.y - cameraY;
        if (sx < -propCullPadY || sx > track.w + propCullPadY || sy < -propCullPadY || sy > track.h + propCullPadY) continue;
        const img = TILES[pr.type];
        if (!img?.complete) continue;
        const iw = img.width * pr.s;
        const ih = img.height * pr.s;
        ctx.save();
        ctx.globalAlpha = 0.58 + 0.18 * clamp((sy + 150) / (track.h + 300), 0, 1);
        if (pr.flip === -1) {
            ctx.translate(sx, sy);
            ctx.scale(-1, 1);
            ctx.drawImage(img, -iw / 2, -ih, iw, ih);
        } else ctx.drawImage(img, sx - iw / 2, sy - ih, iw, ih);
        ctx.restore();
    }
}

export function drawEdgeRails(ctx, track, cameraX, cameraY, from, to) {
    ctx.save();
    const left = [];
    const right = [];
    for (let i = from; i <= to; i += 6) {
        const p = track.pointAtIndex(i);
        const n = track.normalAtIndex(i);
        const edge = track.roadHalfWidth + 64;
        left.push({ x: p.x - cameraX - n.x * edge, y: p.y - cameraY - n.y * edge });
        right.push({ x: p.x - cameraX + n.x * edge, y: p.y - cameraY + n.y * edge });
    }

    const drawLine = (pts, width, color) => {
        if (!pts.length) return;
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
        ctx.lineWidth = width;
        ctx.strokeStyle = color;
        ctx.stroke();
    };

    drawLine(left, 14, "rgba(185, 191, 205, 0.28)");
    drawLine(right, 14, "rgba(185, 191, 205, 0.28)");
    drawLine(left, 8, "rgba(247, 247, 250, 0.94)");
    drawLine(right, 8, "rgba(247, 247, 250, 0.94)");
    drawLine(left, 2.5, "rgba(159, 170, 185, 0.85)");
    drawLine(right, 2.5, "rgba(159, 170, 185, 0.85)");

    ctx.lineCap = "butt";
    ctx.lineWidth = 6;
    ctx.strokeStyle = "rgba(183, 58, 58, 0.92)";
    for (const pts of [left, right]) {
        for (let i = 6; i < pts.length - 1; i += 18) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[i + 1].x, pts[i + 1].y);
            ctx.stroke();
        }
    }
    ctx.restore();
}
