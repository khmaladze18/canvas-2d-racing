const PLAYER_MANUAL_BOOST_FACTOR = 3;
const OPPONENT_MANUAL_BOOST_FACTOR = 2.5;

function getBaseMaxSpeed(car) {
    return Math.max(1, car.baseMaxSpeed || car.maxSpeed || 1);
}

function setEffectiveMaxSpeed(car) {
    const straightFactor = car.straightBoostActive ? (car.straightBoostFactor || 1) : 1;
    const manualFactor = car.manualBoostActive ? (car.manualBoostFactor || 1) : 1;
    car.maxSpeed = getBaseMaxSpeed(car) * Math.max(straightFactor, manualFactor);
}

export function updateManualBoost(car, dt, trigger = false) {
    if (trigger && (car.manualBoostTimer || 0) <= 0 && (car.boostInventory || 0) > 0) {
        car.manualBoostTimer = 5;
        car.boostInventory = Math.max(0, (car.boostInventory || 0) - 1);
    }

    car.manualBoostTimer = Math.max(0, (car.manualBoostTimer || 0) - dt);
    car.manualBoostActive = car.manualBoostTimer > 0;
    car.manualBoostFactor = car.manualBoostActive
        ? (car.isPlayer ? PLAYER_MANUAL_BOOST_FACTOR : OPPONENT_MANUAL_BOOST_FACTOR)
        : 1;
    setEffectiveMaxSpeed(car);
}

export function updateStraightBoost(car, dt, { throttle = 0, steerInput = 0, braking = false } = {}) {
    if (!car.isPlayer) return;

    const baseMax = getBaseMaxSpeed(car);
    const forwardSpeed = car.vx * car.fx + car.vy * car.fy;
    const latVx = car.vx - car.fx * forwardSpeed;
    const latVy = car.vy - car.fy * forwardSpeed;
    const lateralSpeed = Math.hypot(latVx, latVy);
    const straightEnough =
        throttle > 0 &&
        !braking &&
        Math.abs(steerInput) < 0.16 &&
        forwardSpeed > baseMax * 0.42 &&
        lateralSpeed < Math.max(28, forwardSpeed * 0.12);
    const veryBrokenLine =
        braking ||
        throttle <= 0 ||
        Math.abs(steerInput) > 0.5 ||
        forwardSpeed < baseMax * 0.18 ||
        lateralSpeed > Math.max(56, forwardSpeed * 0.32);

    if (straightEnough) {
        car.straightBoostTimer = Math.min(3.25, (car.straightBoostTimer || 0) + dt);
        car.straightBoostGrace = 0.45;
    } else if ((car.straightBoostGrace || 0) > 0 && !veryBrokenLine) {
        car.straightBoostGrace = Math.max(0, car.straightBoostGrace - dt);
        car.straightBoostTimer = Math.max(0, (car.straightBoostTimer || 0) - dt * 0.22);
    } else if (veryBrokenLine) {
        car.straightBoostGrace = 0;
        car.straightBoostTimer = Math.max(0, (car.straightBoostTimer || 0) - dt * 2.8);
    } else {
        car.straightBoostTimer = Math.max(0, (car.straightBoostTimer || 0) - dt * 0.95);
    }

    car.straightBoostActive = car.straightBoostActive
        ? car.straightBoostTimer >= 1.8
        : car.straightBoostTimer >= 2.15;
    car.straightBoostFactor = car.straightBoostActive ? 1.5 : 1;
    setEffectiveMaxSpeed(car);
}
