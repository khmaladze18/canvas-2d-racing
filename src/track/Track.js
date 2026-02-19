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

        // ---- shorten track ----
        const TRACK_SCALE = 0.35;
        cfg.numPoints = Math.max(220, Math.floor(cfg.numPoints * TRACK_SCALE));
        cfg.finishDistancePointsPadding = Math.min(cfg.finishDistancePointsPadding, cfg.numPoints - 10);
        // -----------------------------

        this.roadHalfWidth = cfg.roadHalfWidth;
        this.curveStrength = cfg.curveStrength;
        this.segmentLen = cfg.segmentLen;
        this.numPoints = cfg.numPoints;

        // finish distance in world-units along centerline
        this.finishDistance =
            (this.numPoints - cfg.finishDistancePointsPadding) * this.segmentLen;

        this.points = generatePoints({
            w: this.w,
            h: this.h,
            numPoints: this.numPoints,
            segmentLen: this.segmentLen,
            curveStrength: this.curveStrength,
        });

        this.scenery = new Scenery({ track: this, level: this.level });
        this.startGridIndex = cfg.defaultStartGridIndex;

        // ---- Precompute tangents/normals (big perf win) ----
        // Store as flat arrays: [x0,y0,x1,y1,...]
        this._tan = new Float32Array(this.points.length * 2);
        this._nor = new Float32Array(this.points.length * 2);

        this._tmp = { x: 0, y: 0 }; // reusable temp out object (internal)

        this._rebuildVectors();
    }

    _rebuildVectors() {
        const n = this.points.length;
        for (let i = 0; i < n; i++) {
            const t = _tangentAtIndex(this.points, i);
            const nn = _normalAtIndex(this.points, i);

            const ti = i * 2;
            this._tan[ti] = t.x;
            this._tan[ti + 1] = t.y;

            this._nor[ti] = nn.x;
            this._nor[ti + 1] = nn.y;
        }
    }

    setStartGrid(idx) {
        this.startGridIndex = clamp(Math.floor(idx), 0, this.points.length - 3);
    }

    // ============= Geometry API (compatible) =============

    // Existing methods (may allocate depending on geometry.js implementation)
    pointAtIndex(i) {
        return _pointAtIndex(this.points, i);
    }

    closestIndex(px, py, hint = 0) {
        return _closestIndex(this.points, px, py, hint);
    }

    distanceAtIndex(i) {
        return clamp(i, 0, this.points.length - 1) * this.segmentLen;
    }

    indexAtDistance(dist) {
        return clamp(dist / this.segmentLen, 0, this.points.length - 1);
    }

    tangentAtIndex(i) {
        return _tangentAtIndex(this.points, i);
    }

    normalAtIndex(i) {
        return _normalAtIndex(this.points, i);
    }

    distanceToCenter(px, py, hintIdx = 0) {
        return _distanceToCenter(this.points, px, py, hintIdx);
    }

    // ============= Fast no-allocation helpers =============
    // These return the same data but avoid creating objects.

    clampIndex(i) {
        return i < 0 ? 0 : i > this.points.length - 1 ? this.points.length - 1 : i | 0;
    }

    pointAtIndexXY(i, out) {
        i = this.clampIndex(i);
        const p = this.points[i];
        out.x = p.x;
        out.y = p.y;
        return out;
    }

    normalAtIndexXY(i, out) {
        i = this.clampIndex(i);
        const k = i * 2;
        out.x = this._nor[k];
        out.y = this._nor[k + 1];
        return out;
    }

    tangentAtIndexXY(i, out) {
        i = this.clampIndex(i);
        const k = i * 2;
        out.x = this._tan[k];
        out.y = this._tan[k + 1];
        return out;
    }

    // ============= Drawing =============
    draw(ctx, cameraY, focusIndex = this.startGridIndex) {
        this.scenery.drawBackground(ctx, cameraY);

        const { from, to } = drawRoad(ctx, this, cameraY, focusIndex);

        this.scenery.draw(ctx, cameraY, from, to);

        drawStartGrid(ctx, this, cameraY, this.startGridIndex, 3);
    }

    /**
     * Clamp to road corridor (compatible, allocates return object).
     * Prefer clampToRoadInto for hot paths.
     */
    clampToRoad(x, y, hintIdx = 0, margin = 10) {
        const out = { x: 0, y: 0, idx: 0, clamped: false, nx: 0, ny: 0 };
        return this.clampToRoadInto(x, y, out, hintIdx, margin);
    }

    /**
     * Clamp to road corridor (NO allocations):
     * Writes into `out` and returns it.
     *
     * out: { x, y, idx, clamped, nx, ny }
     */
    clampToRoadInto(x, y, out, hintIdx = 0, margin = 10) {
        // closest centerline index + distance
        const res = this.distanceToCenter(x, y, hintIdx);
        const idx = res.idx | 0;
        const dist = res.dist;

        // center point
        const p = this.points[idx];

        // normal from cached array
        const k = idx * 2;
        const nx = this._nor[k];
        const ny = this._nor[k + 1];

        // signed side based on projection onto normal
        const dx = x - p.x;
        const dy = y - p.y;
        const side = (dx * nx + dy * ny) >= 0 ? 1 : -1;

        const maxR = Math.max(8, this.roadHalfWidth - margin);

        if (dist <= maxR) {
            out.x = x;
            out.y = y;
            out.idx = idx;
            out.clamped = false;
            out.nx = nx;
            out.ny = ny;
            return out;
        }

        out.x = p.x + nx * maxR * side;
        out.y = p.y + ny * maxR * side;
        out.idx = idx;
        out.clamped = true;
        out.nx = nx;
        out.ny = ny;
        return out;
    }
}
