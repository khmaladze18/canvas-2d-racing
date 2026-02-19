// src/entities/controllers/bot/updateBotCar.js
import { clamp } from "../../../utils/math.js";
import {
    dtSafe,
    updateSpeed,
    applyDrag,
    applyGrip,
    capSpeed,
    integrate,
    clampToRoad,
    updateProgress,
} from "../../systems/carPhysics.js";

import { getBotAI } from "./state.js";
import { computeLaneAim, refreshTrackIdxHint, steerTo } from "./navigation.js";
import { getTargetInfo, computeRecoveryAim, updateStuck, tryUnstick, computeLookahead } from "./recovery.js";
import { computeDesiredSpeed, applySpeedControl } from "./speed.js";

export function updateBotCar(car, dt, track, level) {
    dt = dtSafe(dt);
    const ai = getBotAI(car);

    updateSpeed(car);
    const max = car.maxSpeed || 1;
    const v01 = clamp(car.speed / max, 0, 1);

    // 1) refresh hint
    const idx = refreshTrackIdxHint(car, track, ai);

    // 2) lookahead + lane aim
    const lookAhead = computeLookahead(v01, level);
    const { lastIdx, p, p2, nx, ny } = getTargetInfo(track, idx, lookAhead);
    const { tx, ty } = computeLaneAim(p, nx, ny, car.laneOffset);

    // 3) recovery aim
    const { aimX, aimY, speedMul: recSpeedMul } = computeRecoveryAim({
        track,
        idx,
        lastIdx,
        tx,
        ty,
        centerDist: ai._centerDist ?? 0,
    });

    // 4) steer
    const { delta, maxTurn } = steerTo(car, dt, v01, aimX, aimY);

    // 5) stuck detect + unstick
    const prog = (car.progressIdx ?? car.trackIdxHint) | 0;
    updateStuck(ai, dt, prog);

    let speedMul = recSpeedMul;
    const unstick = tryUnstick({ car, ai, track, idx, p, p2, maxSpeed: max });
    if (unstick.didUnstick) speedMul = Math.min(speedMul, unstick.speedMulCap);

    // 6) speed
    const desired = computeDesiredSpeed({
        car,
        ai,
        dt,
        level,
        speedMul,
        delta,
        maxTurn,
    });
    applySpeedControl(car, dt, desired);

    // physics
    applyDrag(car, dt);
    applyGrip(car, dt);
    capSpeed(car);
    integrate(car, dt);

    // road + progress
    clampToRoad(car, track, car.getRadius(), 0.992);
    updateProgress(car, track);
}
