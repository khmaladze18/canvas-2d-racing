import { lerp, clamp } from "../../../utils/math.js";
import { syncForward } from "../../systems/carPhysics.js";
import { getBotDifficulty } from "./difficulty.js";

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
    level,
    maxSpeed,
}) {
    const diff = car.botDifficulty || getBotDifficulty(level);
    if (ai.stuckTime <= diff.recoveryThreshold) return { didUnstick: false, speedMulCap: 1.0 };

    const c = track.pointAtIndex(idx);
    const n = track.normalAtIndex(idx);
    const t = track.tangentAtIndex(idx);
    const laneOffset = (car.laneOffset || 0) * 0.5;
    const targetX = c.x + n.x * laneOffset;
    const targetY = c.y + n.y * laneOffset;
    const dx = targetX - car.x;
    const dy = targetY - car.y;
    const move = Math.min(16, Math.hypot(dx, dy));
    const inv = move > 0 ? 1 / Math.hypot(dx, dy) : 0;
    car.x += dx * inv * move;
    car.y += dy * inv * move;

    const targetAngle = Math.atan2(t.y, t.x);
    car.angle = lerp(car.angle, targetAngle, 0.28);
    syncForward(car);

    const forwardSpeed = car.vx * car.fx + car.vy * car.fy;
    const lateralSpeed = car.vx * n.x + car.vy * n.y;
    const relaunchSpeed = Math.max(28, Math.min(Math.max(car.speed, forwardSpeed), maxSpeed * 0.18));
    car.vx = car.fx * relaunchSpeed + n.x * (lateralSpeed * 0.18);
    car.vy = car.fy * relaunchSpeed + n.y * (lateralSpeed * 0.18);
    car.speed = relaunchSpeed;
    car.trackIdxHint = idx;
    ai.lastProgressIdx = idx;

    ai.stuckTime = 0;
    return { didUnstick: true, speedMulCap: diff.recoverySpeed };
}

export function computeLookahead(v01, level) {
    const diff = getBotDifficulty(level);
    return 18 + 20 * v01 + diff.lookAheadBonus;
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
