import { Scenery } from "../scenery/scenery.js";
import { makeTrackConfig } from "./config.js";
import { generatePoints } from "./generators.js";
import { clamp } from "./utils.js";
import { closestIndex, distanceToCenter as _distanceToCenter, normalAtIndex as _normalAtIndex, pointAtIndex as _pointAtIndex, tangentAtIndex as _tangentAtIndex } from "./geometry.js";
import { drawRoad } from "./drawRoad.js";
import { drawStartGrid } from "./drawGrid.js";
import { clampToRoadInto, clampTrackIndex, normalAtIndexXY, pointAtIndexXY, tangentAtIndexXY } from "./trackClamp.js";
import { applyTrackConfig, computeTrackBounds, rebuildTrackVectors } from "./trackState.js";

export class Track {
    constructor({ width, height, level }) {
        this.w = width;
        this.h = height;
        this.level = level;
        const cfg = makeTrackConfig(level);
        cfg.numPoints = Math.max(220, Math.floor(cfg.numPoints * 0.35));
        cfg.finishDistancePointsPadding = Math.min(cfg.finishDistancePointsPadding, cfg.numPoints - 10);
        applyTrackConfig(this, cfg);
        this.points = generatePoints({ w: this.w, h: this.h, numPoints: this.numPoints, segmentLen: this.segmentLen, curveStrength: this.curveStrength });
        this.closed = !!this.points._closed;
        this.totalDistance = this.points.length * this.segmentLen;
        Object.assign(this, computeTrackBounds(this.points));
        this.scenery = new Scenery({ track: this, level: this.level });
        this.finishDistance = this.distanceAtIndex(this.finishIndex) + this.totalDistance;
        this._tan = new Float32Array(this.points.length * 2);
        this._nor = new Float32Array(this.points.length * 2);
        this._tmp = { x: 0, y: 0 };
        rebuildTrackVectors(this, _tangentAtIndex, _normalAtIndex);
    }

    setStartGrid(idx) { this.startGridIndex = clamp(Math.floor(idx), 0, this.points.length - 3); this.finishIndex = this.startGridIndex; this.finishDistance = this.distanceAtIndex(this.finishIndex) + this.totalDistance; }
    pointAtIndex(i) { return _pointAtIndex(this.points, i); }
    closestIndex(px, py, hint = 0) { return closestIndex(this.points, px, py, hint); }
    distanceAtIndex(i) { return clamp(i, 0, this.points.length - 1) * this.segmentLen; }
    indexAtDistance(dist) { return clamp(dist / this.segmentLen, 0, this.points.length - 1); }
    tangentAtIndex(i) { return _tangentAtIndex(this.points, i); }
    normalAtIndex(i) { return _normalAtIndex(this.points, i); }
    distanceToCenter(px, py, hintIdx = 0) { return _distanceToCenter(this.points, px, py, hintIdx); }
    clampIndex(i) { return clampTrackIndex(this, i); }
    pointAtIndexXY(i, out) { return pointAtIndexXY(this, i, out); }
    normalAtIndexXY(i, out) { return normalAtIndexXY(this, i, out); }
    tangentAtIndexXY(i, out) { return tangentAtIndexXY(this, i, out); }

    draw(ctx, cameraX, cameraY, focusIndex = this.startGridIndex) {
        this.scenery.drawBackground(ctx, cameraX, cameraY);
        const { from, to } = drawRoad(ctx, this, cameraX, cameraY, focusIndex);
        this.scenery.draw(ctx, cameraX, cameraY, from, to);
        drawStartGrid(ctx, this, cameraX, cameraY, this.startGridIndex, 3);
    }

    clampToRoad(x, y, hintIdx = 0, margin = 10) {
        return this.clampToRoadInto(x, y, { x: 0, y: 0, idx: 0, clamped: false, nx: 0, ny: 0 }, hintIdx, margin);
    }

    clampToRoadInto(x, y, out, hintIdx = 0, margin = 10) {
        return clampToRoadInto(this, x, y, out, hintIdx, margin);
    }
}
