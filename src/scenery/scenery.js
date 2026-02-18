import { TILES } from "./svgTiles.js";
import { themeForLevel } from "./themes.js";

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

function rand01(seed) {
    let x = Math.sin(seed * 999.123) * 10000;
    return x - Math.floor(x);
}

export class Scenery {
    constructor({ track, level }) {
        this.track = track;
        this.level = level;
        this.theme = themeForLevel(level);

        this.props = this._buildProps();
    }

    _buildProps() {
        const props = [];
        const { track } = this;

        const every = 18;
        const start = 40;
        const end = track.points.length - 40;

        for (let i = start; i < end; i += every) {
            const p = track.pointAtIndex(i);
            const n = track.normalAtIndex(i);

            const tSeed = i + this.level * 1000;
            const list = this.theme.props;
            const pick = list[Math.floor(rand01(tSeed) * list.length)];

            const edge = track.roadHalfWidth + 26;
            const extra = 28 + rand01(tSeed + 3) * 120;
            const side = rand01(tSeed + 9) > 0.5 ? 1 : -1;

            const x = p.x + n.x * (edge + extra) * side;
            const y = p.y + n.y * (edge + extra) * side;
            const s = 0.65 + rand01(tSeed + 7) * 0.85;

            props.push({ type: pick, x, y, s, idx: i });
        }

        return props;
    }

    drawBackground(ctx, cameraY) {
        const { w, h } = this.track;

        // base sky (big image stretched)
        const sky = TILES.sky;
        if (sky?.complete) ctx.drawImage(sky, 0, 0, w, h);
        else {
            ctx.fillStyle = "#061427";
            ctx.fillRect(0, 0, w, h);
        }

        // parallax layers (slow scroll)
        for (const layerName of this.theme.layers) {
            if (layerName === "sky" || layerName === "noise") continue;

            const img = TILES[layerName];
            if (!img?.complete) continue;

            // Parallax: distant layers move slower than road
            const par = layerName === "skyline" ? 0.08 : 0.12;
            const y = (-cameraY * par) % h;

            // draw twice to avoid seams
            ctx.globalAlpha = 0.92;
            ctx.drawImage(img, 0, y - h, w, h);
            ctx.drawImage(img, 0, y, w, h);
            ctx.globalAlpha = 1;
        }

        // soft vignette
        const v = ctx.createRadialGradient(w / 2, h * 0.8, h * 0.2, w / 2, h * 0.7, h * 1.1);
        v.addColorStop(0, "rgba(0,0,0,0)");
        v.addColorStop(1, "rgba(0,0,0,0.38)");
        ctx.fillStyle = v;
        ctx.fillRect(0, 0, w, h);

        // subtle noise overlay
        const noise = TILES.noise;
        if (noise?.complete) {
            ctx.save();
            ctx.globalAlpha = 0.08;
            const pat = ctx.createPattern(noise, "repeat");
            ctx.fillStyle = pat;
            ctx.fillRect(0, 0, w, h);
            ctx.restore();
        }
    }

    draw(ctx, cameraY, fromIdx, toIdx) {
        // Road-edge vibes + guard rails (optional)
        this._drawEdgeRails(ctx, cameraY, fromIdx, toIdx);

        // draw props (trees/buildings/lamps)
        for (const pr of this.props) {
            if (pr.idx < fromIdx || pr.idx > toIdx) continue;

            const sy = pr.y - cameraY;
            if (sy < -220 || sy > this.track.h + 220) continue;

            const img = TILES[pr.type];
            if (!img?.complete) continue;

            const w = img.width * pr.s;
            const h = img.height * pr.s;

            ctx.save();
            ctx.globalAlpha = 0.95;
            ctx.drawImage(img, pr.x - w / 2, sy - h, w, h);
            ctx.restore();
        }
    }

    _drawEdgeRails(ctx, cameraY, from, to) {
        const track = this.track;
        // const guard = TILES.guard;

        // if (!guard?.complete) return;

        ctx.save();
        ctx.globalAlpha = 0.55;

        for (let i = from; i <= to; i += 26) {
            const p = track.pointAtIndex(i);
            const n = track.normalAtIndex(i);

            const sy = p.y - cameraY;
            if (sy < -140 || sy > track.h + 140) continue;

            const edge = track.roadHalfWidth + 18;
            const gxL = p.x - n.x * edge - 80;
            const gyL = sy - n.y * edge - 24;
            const gxR = p.x + n.x * edge - 80;
            const gyR = sy + n.y * edge - 24;

            // ctx.drawImage(guard, gxL, gyL, 160, 48);
            // ctx.drawImage(guard, gxR, gyR, 160, 48);
        }

        ctx.restore();
    }
}
