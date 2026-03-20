export function applyCarTuning(car, { isPlayer, level, model }) {
    const baseMax = isPlayer ? 420 : 380;
    car.baseMaxSpeed = baseMax + level * (isPlayer ? 10 : 18);
    car.maxSpeed = car.baseMaxSpeed;
    car.accel = isPlayer ? 680 : 620;
    car.brake = isPlayer ? 840 : 700;
    car.turnRate = isPlayer ? 3.2 : 2.7;
    car.drag = isPlayer ? 2.6 : 2.3;
    car.roll = isPlayer ? 110 : 95;
    car.grip = isPlayer ? 10.5 : 9.0;
    car.stability = isPlayer ? 7.2 : 6.0;
    car.collisionFriction = isPlayer ? 0.42 : 0.36;
    car.mass = model === "suv" ? 1.25 : model === "sedan" ? 1.1 : 1.0;
    if (isPlayer) car.mass += 0.12;
}

export function applyCarStateDefaults(car) {
    car.straightBoostTimer = 0;
    car.straightBoostActive = false;
    car.straightBoostFactor = 1;
    car.straightBoostGrace = 0;
    car.boostInventory = 0;
    car.boostPickupFlash = 0;
    car.manualBoostTimer = 0;
    car.manualBoostActive = false;
    car.manualBoostFactor = 1;
    car.isDrifting = false;
    car.driftHoldTimer = 0;
    car.driftMarks = [];
    car.driftSmoke = [];
    car.laneOffset = 0;
    car.impactFlashTimer = 0;
    car.bumpTimer = 0;
    car.bumpDirX = 0;
    car.bumpDirY = -1;
    car.collisionFxCooldown = 0;
    car._ai = { speedNoise: 0, t: Math.random() * 1000 };
}

export function getCarRadius(model) {
    if (model === "f1") return 10;
    if (model === "sedan") return 12;
    if (model === "suv") return 13;
    return 12;
}

export function getCollisionRadius(model) {
    if (model === "f1") return 12;
    if (model === "sedan") return 14;
    if (model === "suv") return 15;
    return 13;
}

export function getCollisionProfile(model) {
    if (model === "f1") return { radius: 8.5, offsets: [-10.5, 10.5], boundRadius: 19 };
    if (model === "sedan") return { radius: 9.5, offsets: [-8.5, 8.5], boundRadius: 18 };
    if (model === "suv") return { radius: 10.5, offsets: [-9, 9], boundRadius: 19.5 };
    return { radius: 9.5, offsets: [-8, 8], boundRadius: 17.5 };
}

export function getCollisionBox(model) {
    if (model === "f1") return { halfLength: 30, halfWidth: 16, boundRadius: 36 };
    if (model === "sedan") return { halfLength: 26, halfWidth: 16, boundRadius: 34 };
    if (model === "suv") return { halfLength: 28, halfWidth: 17.5, boundRadius: 37 };
    return { halfLength: 25, halfWidth: 15.5, boundRadius: 33 };
}
