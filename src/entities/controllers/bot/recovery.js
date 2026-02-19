import { lerp, clamp } from "../../../utils/math.js";
import { syncForward } from "../../systems/carPhysics.js";

export function computeRecoveryAim({
    track,
    idx,
    lastIdx,
    tx,
    ty,
    centerDist,
}) {
    const roadHW = track.roadHalfWidth || 60;
    const offRoad = centerDist > roadHW * 0.92;

    let aimX = tx;
    let aimY = ty;
    let speedMul = 1.0;

    if (offRoad) {
        const recIdx = clamp(idx + 12, 0, lastIdx);
        const c = track.pointAtIndex(recIdx);
        aimX = c.x;
        aimY = c.y;
        speedMul = 0.75;
    }

    return { aimX, aimY, speedMul, offRoad };
}

export function updateStuck(ai, dt, progIdx) {
    if (progIdx > (ai.lastProgressIdx | 0) + 1) {
        ai.lastProgressIdx = progIdx;
        ai.stuckTime = 0;
    } else {
        ai.stuckTime += dt;
    }
}

export function tryUnstick({
    car,
    ai,
    track,
    idx,
    p,
    p2,
    maxSpeed,
}) {
    if (ai.stuckTime <= 1.1) return { didUnstick: false, speedMulCap: 1.0 };

    const c = track.pointAtIndex(idx);
    car.x = lerp(car.x, c.x, 0.35);
    car.y = lerp(car.y, c.y, 0.35);

    const tdx = p2.x - p.x;
    const tdy = p2.y - p.y;
    car.angle = Math.atan2(tdy, tdx);
    syncForward(car);

    car.speed = Math.max(car.speed, maxSpeed * 0.25);

    ai.stuckTime = 0;
    return { didUnstick: true, speedMulCap: 0.8 };
}

export function computeLookahead(v01, level) {
    return 18 + 22 * v01 + level * 1.2;
}

export function getTargetInfo(track, idx, lookAhead) {
    const lastIdx = track.points.length - 1;
    const targetIdx = clamp((idx + lookAhead) | 0, 0, lastIdx);

    const p = track.pointAtIndex(targetIdx);
    const p2 = track.pointAtIndex(Math.min(lastIdx, targetIdx + 2));

    const dx = p2.x - p.x;
    const dy = p2.y - p.y;
    const invLen = 1 / (Math.hypot(dx, dy) || 1);

    const nx = -dy * invLen;
    const ny = dx * invLen;

    const tx = p.x + nx * (track.laneOffsetScale ? track.laneOffsetScale * 0 : 0) + nx * (0); // placeholder if you add scaling
    return { lastIdx, targetIdx, p, p2, nx, ny };
}
