export function updateDriftState(car, dt, driftHeld, steerInput) {
    const driftSpeedMin = 60;
    const steerMag = Math.abs(steerInput);
    const canStartDrift = driftHeld && car.speed > driftSpeedMin && steerMag > 0.16;

    if (canStartDrift) car.driftHoldTimer = 0.24;
    else car.driftHoldTimer = Math.max(0, (car.driftHoldTimer || 0) - dt);

    const drifting = driftHeld && car.speed > driftSpeedMin && (steerMag > 0.08 || (car.driftHoldTimer || 0) > 0);
    car.isDrifting = drifting;
    if (!drifting) return drifting;

    const driftYaw = 1.55 + Math.min(0.75, car.speed / Math.max(1, car.baseMaxSpeed || 1));
    const signedSteer = steerMag > 0.02 ? steerInput : Math.sign(car.vx * -car.fy + car.vy * car.fx) || 0;
    car.angle += signedSteer * driftYaw * dt;
    car.vx += car.fx * car.accel * dt * 0.12;
    car.vy += car.fy * car.accel * dt * 0.12;
    return drifting;
}

export function updateDriftEffects(car, dt) {
    if (car.isDrifting) {
        const fwd = car.vx * car.fx + car.vy * car.fy;
        const latVx = car.vx - car.fx * fwd;
        const latVy = car.vy - car.fy * fwd;
        const lateralSpeed = Math.hypot(latVx, latVy);

        if (lateralSpeed > 10) {
            car.driftMarks.push({
                x: car.x,
                y: car.y,
                angle: car.angle,
                life: 1.05,
                strength: Math.min(1, lateralSpeed / 72),
            });
            car.driftSmoke.push({
                x: car.x,
                y: car.y,
                vx: -car.fx * (18 + lateralSpeed * 0.1),
                vy: -car.fy * (18 + lateralSpeed * 0.1),
                life: 0.5,
                size: 9 + lateralSpeed * 0.06,
            });
        }
    }

    if (car.driftMarks.length > 140) car.driftMarks.splice(0, car.driftMarks.length - 140);
    for (let i = car.driftMarks.length - 1; i >= 0; i--) {
        car.driftMarks[i].life -= dt;
        if (car.driftMarks[i].life <= 0) car.driftMarks.splice(i, 1);
    }

    if (car.driftSmoke.length > 75) car.driftSmoke.splice(0, car.driftSmoke.length - 75);
    for (let i = car.driftSmoke.length - 1; i >= 0; i--) {
        const puff = car.driftSmoke[i];
        puff.x += puff.vx * dt;
        puff.y += puff.vy * dt;
        puff.life -= dt;
        puff.size += dt * 14;
        if (puff.life <= 0) car.driftSmoke.splice(i, 1);
    }
}
