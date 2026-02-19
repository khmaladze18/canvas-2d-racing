// src/scenery/scenery.js
import { TILES } from "./svgTiles.js";
import { themeForLevel } from "./themes.js";

/**
 * Fast deterministic PRNG (Mulberry32)
 * - stable across platforms
 * - cheap
 */
function mulberry32(seed) {
    let t = seed >>> 0;
    return function () {
        t += 0x6d2b79f5;
        let x = Math.imul(t ^ (t >>> 15), 1 | t);
        x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
        return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
}

function clamp(v, a, b) {
    return v < a ? a : v > b ? b : v;
}

// binary search helpers for props range query
function lowerBound(arr, idx) {
    let lo = 0,
        hi = arr.length;
    while (lo < hi) {
        const mid = (lo + hi) >>> 1;
        if (arr[mid].idx < idx) lo = mid + 1;
        else hi = mid;
    }
    return lo;
}
function upperBound(arr, idx) {
    let lo = 0,
        hi = arr.length;
    while (lo < hi) {
        const mid = (lo + hi) >>> 1;
        if (arr[mid].idx <= idx) lo = mid + 1;
        else hi = mid;
    }
    return lo;
}

const CFG = {
    propsEvery: 18,
    propsPadding: 40,

    // roadside placement
    edgePad: 26,
    extraMin: 28,
    extraMax: 148, // 28 + 120

    // size range
    scaleMin: 0.65,
    scaleMax: 1.5, // 0.65 + 0.85

    // culling
    propCullPadY: 240,

    // bg
    parallax: {
        skyline: 0.08,
        default: 0.12,
    },
};

export class Scenery {
    constructor({ track, level }) {
        this.track = track;
        this.level = level;
        this.theme = themeForLevel(level);

        // pre-resolve arrays for speed
        this._themeProps = this.theme?.props || [];
        this._layers = this.theme?.layers || [];

        this.props = this._buildProps();
        // ensure sorted by idx for fast range query
        this.props.sort((a, b) => a.idx - b.idx);
    }

    _buildProps() {
        const props = [];
        const track = this.track;
        const list = this._themeProps;
        if (!list.length) return props;

        const every = CFG.propsEvery;
        const start = CFG.propsPadding;
        const end = track.points.length - CFG.propsPadding;

        // one RNG stream per scenery build (stable)
        // seed includes level + track shape-ish
        const baseSeed = (this.level * 2654435761) ^ (track.points.length * 1013904223);
        const rnd = mulberry32(baseSeed);

        for (let i = start; i < end; i += every) {
            const p = track.pointAtIndex(i);
            const n = track.normalAtIndex(i);

            // pick prop type
            const pick = list[(rnd() * list.length) | 0];

            // side + distance from road
            const side = rnd() > 0.5 ? 1 : -1;

            const edge = track.roadHalfWidth + CFG.edgePad;
            const extra = CFG.extraMin + rnd() * (CFG.extraMax - CFG.extraMin);

            const x = p.x + n.x * (edge + extra) * side;
            const y = p.y + n.y * (edge + extra) * side;

            // scale with slight bias (more medium than huge)
            const r = rnd();
            const s = CFG.scaleMin + (r * r) * (CFG.scaleMax - CFG.scaleMin);

            // optional flip (nice variety for asymmetric SVGs)
            const flip = rnd() > 0.7 ? -1 : 1;

            props.push({ type: pick, x, y, s, idx: i, flip });
        }

        return props;
    }

    drawBackground(ctx, cameraY) {
        const { w, h } = this.track;

        // --- base sky ---
        const sky = TILES.sky;
        if (sky?.complete) ctx.drawImage(sky, 0, 0, w, h);
        else {
            ctx.fillStyle = "#061427";
            ctx.fillRect(0, 0, w, h);
        }

        // --- parallax layers ---
        // (skip sky/noise; those handled separately)
        for (const layerName of this._layers) {
            if (layerName === "sky" || layerName === "noise") continue;

            const img = TILES[layerName];
            if (!img?.complete) continue;

            const par = CFG.parallax[layerName] ?? CFG.parallax.default;
            const y = (-cameraY * par) % h;

            ctx.save();
            ctx.globalAlpha = 0.92;
            ctx.drawImage(img, 0, y - h, w, h);
            ctx.drawImage(img, 0, y, w, h);
            ctx.restore();
        }

        // --- vignette ---
        ctx.save();
        const v = ctx.createRadialGradient(w / 2, h * 0.8, h * 0.2, w / 2, h * 0.7, h * 1.1);
        v.addColorStop(0, "rgba(0,0,0,0)");
        v.addColorStop(1, "rgba(0,0,0,0.38)");
        ctx.fillStyle = v;
        ctx.fillRect(0, 0, w, h);
        ctx.restore();

        // --- subtle noise ---
        const noise = TILES.noise;
        if (noise?.complete) {
            ctx.save();
            ctx.globalAlpha = 0.08;
            ctx.fillStyle = ctx.createPattern(noise, "repeat");
            ctx.fillRect(0, 0, w, h);
            ctx.restore();
        }
    }

    draw(ctx, cameraY, fromIdx, toIdx) {
        // edge vibe (optional)
        this._drawEdgeRails(ctx, cameraY, fromIdx, toIdx);

        // fast range query (props sorted by idx)
        const a = lowerBound(this.props, fromIdx);
        const b = upperBound(this.props, toIdx);

        const h = this.track.h;
        const pad = CFG.propCullPadY;

        for (let i = a; i < b; i++) {
            const pr = this.props[i];

            const sy = pr.y - cameraY;
            if (sy < -pad || sy > h + pad) continue;

            const img = TILES[pr.type];
            if (!img?.complete) continue;

            const iw = img.width * pr.s;
            const ih = img.height * pr.s;

            // distance-based fade (feels deeper / less “sticker”)
            // nearer center: slightly stronger, far: softer
            const depth = clamp((sy + 150) / (h + 300), 0, 1);
            const alpha = 0.55 + 0.4 * depth;

            ctx.save();
            ctx.globalAlpha = alpha;

            if (pr.flip === -1) {
                ctx.translate(pr.x, sy);
                ctx.scale(-1, 1);
                ctx.drawImage(img, -iw / 2, -ih, iw, ih);
            } else {
                ctx.drawImage(img, pr.x - iw / 2, sy - ih, iw, ih);
            }

            ctx.restore();
        }
    }

    _drawEdgeRails(ctx, cameraY, from, to) {
        // kept as “hook”, but avoid doing heavy work when unused
        // You can later enable guard tile and draw it here.
        // const guard = TILES.guard;
        // if (!guard?.complete) return;

        // If you want some subtle edge marks without images:
        // (cheap + looks premium)
        const track = this.track;

        ctx.save();
        ctx.globalAlpha = 0.08;
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#ffffff";

        for (let i = from; i <= to; i += 34) {
            const p = track.pointAtIndex(i);
            const n = track.normalAtIndex(i);
            const sy = p.y - cameraY;
            if (sy < -140 || sy > track.h + 140) continue;

            const edge = track.roadHalfWidth + 14;

            const lx = p.x - n.x * edge;
            const ly = sy - n.y * edge;
            const rx = p.x + n.x * edge;
            const ry = sy + n.y * edge;

            ctx.beginPath();
            ctx.moveTo(lx - n.y * 10, ly + n.x * 10);
            ctx.lineTo(lx + n.y * 10, ly - n.x * 10);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(rx - n.y * 10, ry + n.x * 10);
            ctx.lineTo(rx + n.y * 10, ry - n.x * 10);
            ctx.stroke();
        }

        ctx.restore();
    }
}
