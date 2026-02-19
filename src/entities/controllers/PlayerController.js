// src/entities/controllers/PlayerController.js
import {
    dtSafe,
    updateSpeed,
    steer,
    accelerateForward,
    applyDrag,
    applyRollingResistance,
    applyGrip,
    capSpeed,
    integrate,
    clampToRoad,
    updateProgress,
} from "../systems/carPhysics.js";

export function updatePlayerCar(car, dt, input, track) {
    dt = dtSafe(dt);

    const up = input.up ? 1 : 0;
    const down = input.down ? 1 : 0;
    const steerInput = (input.left ? -1 : 0) + (input.right ? 1 : 0);

    // steering needs speed
    updateSpeed(car);
    steer(car, dt, steerInput);

    // engine / brake
    if (up) accelerateForward(car, dt, car.accel);
    if (down) accelerateForward(car, dt, -car.brake);

    // physics
    applyDrag(car, dt);
    if (!up) applyRollingResistance(car, dt);

    applyGrip(car, dt);
    capSpeed(car);
    integrate(car, dt);

    // road + progress
    clampToRoad(car, track, car.getRadius(), 0.985);
    updateProgress(car, track);
}
