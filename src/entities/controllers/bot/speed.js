// src/entities/controllers/bot/speed.js
import { clamp, lerp } from "../../../utils/math.js";
import { accelerateForward } from "../../systems/carPhysics.js";
import { getBotDifficulty } from "./difficulty.js";

/**
 * Senior Refinement:
 * - Adjusted 'personality' to lower the average bot speed.
 * - Increased curve-based slowing to make bots more realistic in turns.
 */
export function computeDesiredSpeed({
    car,
    ai,
    dt,
    level,
    speedMul,
    delta,     // Current turn delta
    lookAhead, // Delta further down the track
    maxTurn,
}) {
    const diff = car.botDifficulty || getBotDifficulty(level);

    // 1. Organic Noise
    ai.t += dt;
    const n = (Math.sin(ai.t * 0.5) * 0.7 + Math.sin(ai.t * 2.1) * 0.3);
    ai.speedNoise = lerp(ai.speedNoise, n, 1.5 * dt);

    // 2. Predictive Braking
    const turnSeverity = Math.abs(delta);
    const futureSeverity = Math.abs(lookAhead || 0);
    const combinedTurn = Math.max(turnSeverity, futureSeverity * 0.9); // Weighted future turns higher

    const turn01 = clamp(combinedTurn / (maxTurn || 0.5), 0, 1);

    const curveSlowFactor = clamp(diff.curveDiscipline, 0.24, 0.36);
    const curveSlow = 1 - curveSlowFactor * turn01;

    const personality = diff.targetPace + ai.speedNoise * 0.055;
    const levelCap = 0.94 + diff.curve * 0.12;
    const boostPace = car.manualBoostActive ? 1.22 : 1;

    return car.maxSpeed * speedMul * curveSlow * personality * levelCap * boostPace;
}

export function applySpeedControl(car, dt, desired) {
    const err = desired - car.speed;

    let force = 0;
    // Senior Tip: Add a "Deadzone" so bots aren't constantly alternating
    // between throttle and brake, which looks jittery.
    if (err > 15) {
        force = car.accel * 0.9; // Slightly weaker bot acceleration
    } else if (err < -30) {
        force = -car.brake;
    } else if (err < 0) {
        force = -car.roll * 1.5; // Stronger coasting deceleration
    }

    accelerateForward(car, dt, force);
}
