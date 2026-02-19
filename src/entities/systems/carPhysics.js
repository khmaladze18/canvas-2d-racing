// src/entities/systems/carPhysics.js
const DT_MAX = 1 / 30;
const EPS = 1e-4;

export const dtSafe = (dt) => (dt <= 0 ? 0 : dt > DT_MAX ? DT_MAX : dt);

export function syncForward(car) {
    car.fx = Math.cos(car.angle);
    car.fy = Math.sin(car.angle);
}

export function updateSpeed(car) {
    const vx = car.vx, vy = car.vy;
    car.speed = Math.sqrt(vx * vx + vy * vy);
    return car.speed;
}

export function scaleVel(car, s) {
    car.vx *= s;
    car.vy *= s;
}

export function accelerateForward(car, dt, accel) {
    car.vx += car.fx * accel * dt;
    car.vy += car.fy * accel * dt;
}

export function steer(car, dt, steerInput) {
    if (!steerInput) return;

    const max = car.maxSpeed || 1;
    const v01 = car.speed <= 0 ? 0 : Math.min(1, car.speed / max);

    const steerScale = 0.25 + 0.85 * Math.sqrt(v01);
    car.angle += steerInput * (car.turnRate * steerScale) * dt;
    syncForward(car);
}

export function applyGrip(car, dt) {
    const fx = car.fx, fy = car.fy;
    const vx = car.vx, vy = car.vy;

    const fwd = vx * fx + vy * fy;
    const latVx = vx - fx * fwd;
    const latVy = vy - fy * fwd;

    const grip = car.grip ?? 0;
    const latKill = 1 - Math.exp(-grip * dt);

    car.vx = vx - latVx * latKill;
    car.vy = vy - latVy * latKill;
}

export function applyDrag(car, dt) {
    const drag = car.drag ?? 0;
    const damp = Math.exp(-drag * dt);
    scaleVel(car, damp);
}

export function applyRollingResistance(car, dt) {
    const s = updateSpeed(car);
    if (s <= EPS) return;

    const roll = car.roll ?? 0;
    const next = Math.max(0, s - roll * dt);
    scaleVel(car, next / s);
    car.speed = next;
}

export function capSpeed(car) {
    const s = updateSpeed(car);
    const max = car.maxSpeed || 0;
    if (s <= max) return;

    scaleVel(car, max / (s || 1));
    car.speed = max;
}

export function integrate(car, dt) {
    car.x += car.vx * dt;
    car.y += car.vy * dt;
}

export function clampToRoad(car, track, radius, speedPenalty) {
    const res = track.clampToRoad(car.x, car.y, car.trackIdxHint, radius);
    car.trackIdxHint = res.idx;

    if (!res.clamped) return;

    car.x = res.x;
    car.y = res.y;

    const sideV = car.vx * res.nx + car.vy * res.ny;
    if (sideV > 0) {
        car.vx -= res.nx * sideV;
        car.vy -= res.ny * sideV;
    }

    scaleVel(car, speedPenalty);
}

export function updateProgress(car, track) {
    car.progressDist = track.distanceAtIndex(car.trackIdxHint);
}
