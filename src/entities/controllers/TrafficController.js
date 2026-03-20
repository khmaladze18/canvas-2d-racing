import {
    dtSafe,
    syncForward,
    updateSpeed,
    accelerateForward,
    applyDrag,
    applyGrip,
    applyStability,
    capSpeed,
    integrate,
    clampToRoad,
    updateProgress,
} from "../systems/carPhysics.js";
import {
    applyTrafficDefaults,
    clamp1,
    getTrafficState,
    normAngle,
    shouldRecover,
    updateClampHits,
    updateTrafficStuckState,
} from "./trafficHelpers.js";
import { applyTrafficRecovery } from "./trafficRecovery.js";

export function updateTrafficCar(car, dt, track) {
    dt = dtSafe(dt);
    applyTrafficDefaults(car);

    const idx = car.trackIdxHint | 0;
    const point = track.pointAtIndex(idx);
    const normal = track.normalAtIndex(idx);
    const tangent = track.tangentAtIndex(idx);
    const signed = (car.x - point.x) * normal.x + (car.y - point.y) * normal.y;
    const halfRoadWidth = track.roadHalfWidth;
    const state = getTrafficState(car, signed);
    const dProg = (car.progressDist || 0) - state.lastProg;
    state.lastProg = car.progressDist || 0;
    updateTrafficStuckState(state, dt, dProg, Math.abs(signed) > halfRoadWidth * 0.8);

    let steerInput = clamp1(normAngle(Math.atan2(tangent.y, tangent.x) - car.angle) / 0.9, -1, 1);
    if (state.recT > 0) {
        state.recT = Math.max(0, state.recT - dt);
        const toCenter = clamp1((-signed) / (halfRoadWidth * 0.9), -1, 1);
        steerInput = clamp1(steerInput * 0.35 + toCenter * 1.45, -1, 1);
    }

    car.angle += steerInput * car.turnRate * dt;
    syncForward(car);

    updateSpeed(car);
    accelerateForward(car, dt, car.accel);
    applyDrag(car, dt);
    applyGrip(car, dt);
    applyStability(car, dt);
    capSpeed(car);
    integrate(car, dt);

    const beforeX = car.x;
    const beforeY = car.y;
    clampToRoad(car, track, state.recT > 0 ? 18 : 14, state.recT > 0 ? 0.985 : 0.995);
    updateClampHits(state, car.x !== beforeX || car.y !== beforeY);
    updateProgress(car, track);

    if (shouldRecover(state)) applyTrafficRecovery(car, track, state, halfRoadWidth);
}
