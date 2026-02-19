// src/entities/controllers/bot/navigation.js
import { clamp, normalizeAngle } from "../../../utils/math.js";
import { syncForward } from "../../systems/carPhysics.js";

export function steerTo(car, dt, v01, aimX, aimY) {
    const angToTarget = Math.atan2(aimY - car.y, aimX - car.x);
    let delta = normalizeAngle(angToTarget - car.angle);

    const steerMul = 1 - 0.55 * v01;
    const maxTurn = car.turnRate * steerMul * dt;

    delta = clamp(delta, -maxTurn, maxTurn);

    if (delta !== 0) {
        car.angle += delta;
        syncForward(car);
    }

    return { delta, maxTurn };
}

export function computeLaneAim(p, nx, ny, laneOffset) {
    return {
        tx: p.x + nx * laneOffset,
        ty: p.y + ny * laneOffset,
    };
}

export function refreshTrackIdxHint(car, track, ai) {
    if (track.closestIndex) {
        car.trackIdxHint = track.closestIndex(car.x, car.y, car.trackIdxHint);
    } else if (track.distanceToCenter) {
        const res = track.distanceToCenter(car.x, car.y, car.trackIdxHint);
        car.trackIdxHint = res.idx;
        ai._centerDist = res.dist;
    }

    const lastIdx = track.points.length - 1;
    return clamp(car.trackIdxHint | 0, 0, lastIdx);
}
