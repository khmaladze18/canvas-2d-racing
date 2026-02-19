// src/entities/controllers/TrafficController.js
import {
    dtSafe,
    syncForward,
    updateSpeed,
    accelerateForward,
    applyDrag,
    applyGrip,
    capSpeed,
    integrate,
    clampToRoad,
    updateProgress,
} from "../systems/carPhysics.js";

const TAU = Math.PI * 2;

function clamp1(x, a, b) {
    return x < a ? a : x > b ? b : x;
}
function normAngle(a) {
    a = (a + Math.PI) % TAU;
    if (a < 0) a += TAU;
    return a - Math.PI;
}

export function updateTrafficCar(car, dt, track) {
    dt = dtSafe(dt);

    // ---- safety defaults ----
    if (!Number.isFinite(car.vx)) car.vx = 0;
    if (!Number.isFinite(car.vy)) car.vy = 0;
    if (!Number.isFinite(car.angle)) car.angle = -Math.PI / 2;

    if (!Number.isFinite(car.maxSpeed)) car.maxSpeed = 280;
    if (!Number.isFinite(car.accel)) car.accel = 420;
    if (!Number.isFinite(car.turnRate)) car.turnRate = 2.0;
    if (!Number.isFinite(car.drag)) car.drag = 2.6;
    if (!Number.isFinite(car.grip)) car.grip = 9.5;

    // ---- road frame ----
    const idx = car.trackIdxHint | 0;
    const p = track.pointAtIndex(idx);
    const n = track.normalAtIndex(idx);
    const t = track.tangentAtIndex(idx);

    const targetAngle = Math.atan2(t.y, t.x);

    // signed offset from centerline
    const dx = car.x - p.x;
    const dy = car.y - p.y;
    const signed = dx * n.x + dy * n.y;

    const half = track.roadHalfWidth;

    // ---- stuck state ----
    car._traffic = car._traffic || {
        lastProg: car.progressDist || 0,
        clampHits: 0,
        stuckT: 0,
        recT: 0,
        // lane target: keep traffic away from rails (set at spawn, fallback if missing)
        laneFrac: car._laneFrac ?? 0.45 * (signed >= 0 ? 1 : -1),
    };

    const st = car._traffic;

    // progress delta
    const prog = car.progressDist || 0;
    const dProg = prog - st.lastProg;
    st.lastProg = prog;

    // near edge?
    const nearEdge = Math.abs(signed) > half * 0.80;
    const slowAdvance = dProg < 10; // not moving forward enough

    if (nearEdge && slowAdvance) st.stuckT += dt;
    else st.stuckT = Math.max(0, st.stuckT - dt * 1.5);

    // ---- steering ----
    // always follow tangent
    let diff = normAngle(targetAngle - car.angle);
    let steerInput = clamp1(diff / 0.9, -1, 1);

    // recovery mode: steer toward center harder
    const recovering = st.recT > 0;
    if (recovering) {
        st.recT = Math.max(0, st.recT - dt);

        const toCenter = clamp1((-signed) / (half * 0.9), -1, 1);
        steerInput = clamp1(steerInput * 0.35 + toCenter * 1.45, -1, 1);
    }

    car.angle += steerInput * car.turnRate * dt;
    syncForward(car);

    // ---- drive ----
    updateSpeed(car);
    accelerateForward(car, dt, car.accel);
    applyDrag(car, dt);
    applyGrip(car, dt);
    capSpeed(car);

    integrate(car, dt);

    // ---- clamp + clamp-hit detection ----
    const beforeX = car.x, beforeY = car.y;
    clampToRoad(car, track, recovering ? 18 : 14, recovering ? 0.985 : 0.995);

    const clampedThisFrame = (car.x !== beforeX) || (car.y !== beforeY);
    if (clampedThisFrame) st.clampHits++;
    else st.clampHits = Math.max(0, st.clampHits - 1);

    updateProgress(car, track);

    // ---- HARD UNSTICK (this fixes clumps) ----
    // Trigger when: stuck for a while OR too many clamp hits
    if (st.stuckT > 0.35 || st.clampHits > 7) {
        // enter recovery for a short burst
        st.recT = 0.75;
        st.stuckT = 0;
        st.clampHits = 0;

        // recompute road frame at current hint after clamp/progress update
        const ii = car.trackIdxHint | 0;
        const cp = track.pointAtIndex(ii);
        const cn = track.normalAtIndex(ii);
        const ct = track.tangentAtIndex(ii);
        const a = Math.atan2(ct.y, ct.x);

        // snap INSIDE lane target (never near rails)
        const laneFrac = clamp1(st.laneFrac, -0.55, 0.55);
        const laneOff = laneFrac * half * 0.72; // keep inside the road safely

        car.x = cp.x + cn.x * laneOff;
        car.y = cp.y + cn.y * laneOff;

        // reset orientation to tangent
        car.angle = a;
        syncForward(car);

        // reset velocity along tangent so it immediately drives again
        const v = (car.maxSpeed || 260) * 0.70;
        car.vx = car.fx * v;
        car.vy = car.fy * v;

        // slight extra grip to stop sideways sliding after snap
        car.grip = Math.max(car.grip, 10.5);

        // refresh progress
        updateProgress(car, track);
    }
}
