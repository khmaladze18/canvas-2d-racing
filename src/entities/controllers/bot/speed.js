// src/entities/controllers/bot/speed.js
import { clamp, lerp } from "../../../utils/math.js";
import { accelerateForward } from "../../systems/carPhysics.js";

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
    // 1. Organic Noise
    ai.t += dt;
    const n = (Math.sin(ai.t * 0.5) * 0.7 + Math.sin(ai.t * 2.1) * 0.3);
    ai.speedNoise = lerp(ai.speedNoise, n, 1.5 * dt);

    // 2. Predictive Braking
    const turnSeverity = Math.abs(delta);
    const futureSeverity = Math.abs(lookAhead || 0);
    const combinedTurn = Math.max(turnSeverity, futureSeverity * 0.9); // Weighted future turns higher

    const turn01 = clamp(combinedTurn / (maxTurn || 0.5), 0, 1);

    // INCREASED: Bots slow down more for curves (was 0.25)
    const curveSlowFactor = 0.35 - (level * 0.005);
    const curveSlow = 1 - curveSlowFactor * turn01;

    // 3. Final Calculation
    // LOWERED: Personality base changed from 0.85 to 0.78
    // This gives the player more room to overtake on straights.
    const personality = 0.78 + (ai.speedNoise * 0.1);

    // Optional: Add a level-based cap to prevent bots from scaling too fast
    const levelCap = 0.9 + (level * 0.002);

    return car.maxSpeed * speedMul * curveSlow * personality * levelCap;
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