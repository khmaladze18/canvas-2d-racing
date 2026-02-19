// src/entities/controllers/bot/botSpeed.js
import { clamp, lerp } from "../../../utils/math.js";
import { accelerateForward } from "../../systems/carPhysics.js";

export function computeDesiredSpeed({
    car,
    ai,
    dt,
    level,
    speedMul,
    delta,
    maxTurn,
}) {
    ai.t += dt * (0.8 + level * 0.08);

    const rawNoise = Math.sin(ai.t) * 0.5 + 0.5;
    ai.speedNoise = lerp(ai.speedNoise, rawNoise, 2.5 * dt);

    const turn01 = clamp(Math.abs(delta) / (maxTurn || 1e-6), 0, 1);
    const curveSlow = 1 - 0.22 * turn01;

    return (
        car.maxSpeed *
        speedMul *
        curveSlow *
        (0.82 + ai.speedNoise * 0.06)
    );
}

export function applySpeedControl(car, dt, desired) {
    const err = desired - car.speed;
    accelerateForward(car, dt, clamp(err * 3.0, -car.brake, car.accel));
}
