// src/entities/controllers/PlayerController.js
import {
    dtSafe,
    updateSpeed,
    steer,
    accelerateForward,
    applyDrag,
    applyRollingResistance,
    applyGrip,
    applyStability,
    updateManualBoost,
    updateStraightBoost,
    capSpeed,
    integrate,
    clampToRoad,
    updateProgress,
} from "../systems/carPhysics.js";
import { updateDriftEffects, updateDriftState } from "./playerDrift.js";

export function updatePlayerCar(car, dt, input, track) {
    dt = dtSafe(dt);

    const up = input.up ? 1 : 0;
    const down = input.down ? 1 : 0;
    const steerInput = (input.left ? -1 : 0) + (input.right ? 1 : 0);
    const drift = !!input.drift;
    const boostPressed = !!input.boostPressed;
    input.boostPressed = false;

    updateSpeed(car);
    steer(car, dt, steerInput);
    const drifting = updateDriftState(car, dt, drift, steerInput);
    if (drifting) updateSpeed(car);

    if (up) accelerateForward(car, dt, car.accel);
    if (down) accelerateForward(car, dt, -car.brake);
    if (car.manualBoostActive) accelerateForward(car, dt, car.accel * 0.9);

    applyDrag(car, dt);
    if (!up) applyRollingResistance(car, dt);

    const gripMul = drifting ? 0.24 : 1;
    const stabilityMul = drifting ? 0.3 : 1;
    const prevGrip = car.grip;
    const prevStability = car.stability;
    car.grip *= gripMul;
    car.stability *= stabilityMul;

    applyGrip(car, dt);
    applyStability(car, dt);

    car.grip = prevGrip;
    car.stability = prevStability;

    updateManualBoost(car, dt, boostPressed);
    updateStraightBoost(car, dt, {
        throttle: up,
        steerInput,
        braking: down > 0,
    });
    capSpeed(car);
    integrate(car, dt);
    clampToRoad(car, track, car.getRadius(), 0.985);
    updateProgress(car, track);
    updateDriftEffects(car, dt);
}
