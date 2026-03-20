const TAU = Math.PI * 2;

export function clamp1(x, a, b) {
    return x < a ? a : x > b ? b : x;
}

export function normAngle(a) {
    a = (a + Math.PI) % TAU;
    if (a < 0) a += TAU;
    return a - Math.PI;
}

export function applyTrafficDefaults(car) {
    if (!Number.isFinite(car.vx)) car.vx = 0;
    if (!Number.isFinite(car.vy)) car.vy = 0;
    if (!Number.isFinite(car.angle)) car.angle = -Math.PI / 2;
    if (!Number.isFinite(car.maxSpeed)) car.maxSpeed = 280;
    if (!Number.isFinite(car.accel)) car.accel = 420;
    if (!Number.isFinite(car.turnRate)) car.turnRate = 2.0;
    if (!Number.isFinite(car.drag)) car.drag = 2.6;
    if (!Number.isFinite(car.grip)) car.grip = 9.5;
}

export function getTrafficState(car, signedOffset) {
    car._traffic = car._traffic || {
        lastProg: car.progressDist || 0,
        clampHits: 0,
        stuckT: 0,
        recT: 0,
        laneFrac: car._laneFrac ?? 0.45 * (signedOffset >= 0 ? 1 : -1),
    };
    return car._traffic;
}

export function updateTrafficStuckState(state, dt, dProg, nearEdge) {
    if (nearEdge && dProg < 10) state.stuckT += dt;
    else state.stuckT = Math.max(0, state.stuckT - dt * 1.5);
}

export function updateClampHits(state, clampedThisFrame) {
    if (clampedThisFrame) state.clampHits++;
    else state.clampHits = Math.max(0, state.clampHits - 1);
}

export function shouldRecover(state) {
    return state.stuckT > 0.35 || state.clampHits > 7;
}
