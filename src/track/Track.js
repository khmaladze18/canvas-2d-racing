import { Scenery } from "../scenery/scenery.js";
import { makeTrackConfig } from "./config.js";
import { generatePoints } from "./generators.js";
import { clamp } from "./utils.js";
import {
    pointAtIndex as _pointAtIndex,
    closestIndex as _closestIndex,
    distanceToCenter as _distanceToCenter,
    tangentAtIndex as _tangentAtIndex,
    normalAtIndex as _normalAtIndex,
} from "./geometry.js";
import { drawRoad } from "./drawRoad.js";
import { drawStartGrid } from "./drawGrid.js";

export class Track {
    constructor({ width, height, level }) {
        this.w = width;
        this.h = height;
        this.level = level;

        const cfg = makeTrackConfig(level);

        this.roadHalfWidth = cfg.roadHalfWidth;
        this.curveStrength = cfg.curveStrength;
        this.segmentLen = cfg.segmentLen;
        this.numPoints = cfg.numPoints;
        this.finishDistance = (this.numPoints - cfg.finishDistancePointsPadding) * this.segmentLen;

        this.points = generatePoints({
            w: this.w,
            h: this.h,
            numPoints: this.numPoints,
            segmentLen: this.segmentLen,
            curveStrength: this.curveStrength,
        });

        this.scenery = new Scenery({ track: this, level: this.level });

        this.startGridIndex = cfg.defaultStartGridIndex;
    }

    setStartGrid(idx) {
        this.startGridIndex = clamp(Math.floor(idx), 0, this.points.length - 3);
    }

    // ===== geometry API (same names you already use) =====
    pointAtIndex(i) { return _pointAtIndex(this.points, i); }
    closestIndex(px, py, hint = 0) { return _closestIndex(this.points, px, py, hint); }
    distanceAtIndex(i) { return clamp(i, 0, this.points.length - 1) * this.segmentLen; }
    indexAtDistance(dist) { return clamp(dist / this.segmentLen, 0, this.points.length - 1); }
    tangentAtIndex(i) { return _tangentAtIndex(this.points, i); }
    normalAtIndex(i) { return _normalAtIndex(this.points, i); }
    distanceToCenter(px, py, hintIdx = 0) { return _distanceToCenter(this.points, px, py, hintIdx); }

    // ===== drawing =====
    draw(ctx, cameraY, focusIndex = this.startGridIndex) {
        // background
        this.scenery.drawBackground(ctx, cameraY);

        // road + finish; get visible range
        const { from, to } = drawRoad(ctx, this, cameraY, focusIndex);

        // props outside road
        this.scenery.draw(ctx, cameraY, from, to);

        // start grid
        drawStartGrid(ctx, this, cameraY, this.startGridIndex, 3);
    }

    /**
     * Keep a point inside the road corridor.
     * Returns: { x, y, idx, clamped, nx, ny }
     * - nx,ny is the track normal at idx (unit vector)
     * - clamped=true only if we had to push the point back inside
     */
    clampToRoad(x, y, hintIdx = 0, margin = 10) {
        // closest centerline index + point
        const { idx, dist } = this.distanceToCenter(x, y, hintIdx);
        const p = this.pointAtIndex(idx);

        // road normal at that index
        const n = this.normalAtIndex(idx);
        const nx = n.x;
        const ny = n.y;

        // signed side: +1 or -1 (which side of centerline)
        const dx = x - p.x;
        const dy = y - p.y;
        const side = (dx * nx + dy * ny) >= 0 ? 1 : -1;

        // max allowed radius from centerline (with margin)
        const maxR = Math.max(8, this.roadHalfWidth - margin);

        // already inside
        if (dist <= maxR) {
            return { x, y, idx, clamped: false, nx, ny };
        }

        // push back to the road edge along normal
        const cx = p.x + nx * maxR * side;
        const cy = p.y + ny * maxR * side;

        return { x: cx, y: cy, idx, clamped: true, nx, ny };
    }
}
