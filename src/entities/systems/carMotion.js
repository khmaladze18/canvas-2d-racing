const DT_MAX = 1 / 30;
const EPS = 1e-4;

export const dtSafe = (dt) => (dt <= 0 ? 0 : dt > DT_MAX ? DT_MAX : dt);

export function syncForward(car) {
    car.fx = Math.cos(car.angle);
    car.fy = Math.sin(car.angle);
}

export function updateSpeed(car) {
    const vx = car.vx;
    const vy = car.vy;
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
    const steerScale = 0.35 + 0.75 * Math.sqrt(v01);

    car.angle += steerInput * (car.turnRate * steerScale) * dt;
    syncForward(car);
}

export function applyGrip(car, dt) {
    const fwd = car.vx * car.fx + car.vy * car.fy;
    const latVx = car.vx - car.fx * fwd;
    const latVy = car.vy - car.fy * fwd;
    const speed01 = Math.min(1, Math.abs(fwd) / Math.max(1, car.maxSpeed || 1));
    const effectiveGrip = (car.grip ?? 0) * (0.82 + speed01 * 0.55);
    const latKill = 1 - Math.exp(-effectiveGrip * dt);

    car.vx -= latVx * latKill;
    car.vy -= latVy * latKill;
}

export function applyStability(car, dt) {
    const speed = updateSpeed(car);
    if (speed <= EPS) return;

    const forwardSpeed = car.vx * car.fx + car.vy * car.fy;
    const targetVx = car.fx * forwardSpeed;
    const targetVy = car.fy * forwardSpeed;
    const speed01 = Math.min(1, speed / Math.max(1, car.maxSpeed || 1));
    const align = 1 - Math.exp(-((car.stability ?? 0) * (0.3 + speed01 * 1.1)) * dt);

    car.vx += (targetVx - car.vx) * align;
    car.vy += (targetVy - car.vy) * align;
}

export function applyDrag(car, dt) {
    scaleVel(car, Math.exp(-(car.drag ?? 0) * dt));
}

export function applyRollingResistance(car, dt) {
    const speed = updateSpeed(car);
    if (speed <= EPS) return;

    const next = Math.max(0, speed - (car.roll ?? 0) * dt);
    scaleVel(car, next / speed);
    car.speed = next;
}

export function capSpeed(car) {
    const speed = updateSpeed(car);
    const max = car.maxSpeed || 0;
    if (speed <= max) return;

    scaleVel(car, max / (speed || 1));
    car.speed = max;
}

export function integrate(car, dt) {
    car.x += car.vx * dt;
    car.y += car.vy * dt;
}
