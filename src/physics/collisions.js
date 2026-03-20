import { tryResolve } from "./collisionResolve.js";

const DEFAULT_OPTS = { iterations: 8, restitution: 0.06, slop: 0.002, percent: 1.0, maxImpulse: 760, bounceThreshold: 28, friction: 0.24, overlapBoost: 0.28, xPad: 28 };

function buildCollisionData(cars, config) {
    return cars.map((car) => {
        const mass = Math.max(0.35, car.mass ?? 1);
        const box = car.getCollisionBox ? car.getCollisionBox() : { halfLength: 18, halfWidth: 10, boundRadius: 21 };
        return { car, invMass: 1 / mass, box, boundRadius: box.boundRadius, friction: car.collisionFriction ?? config.friction };
    });
}

export function resolveCarCollisions(cars, dt, opts = {}) {
    const config = { ...DEFAULT_OPTS, ...opts };
    if (!cars || cars.length < 2) return;
    const data = buildCollisionData(cars, config);

    for (let pass = 0; pass < config.iterations; pass++) {
        let any = false;
        data.sort((a, b) => a.car.y - b.car.y);
        for (let i = 0; i < data.length; i++) for (let j = i + 1; j < data.length; j++) {
            const A = data[i];
            const B = data[j];
            const rSum = A.boundRadius + B.boundRadius;
            if (B.car.y - A.car.y > rSum + config.xPad) break;
            if (Math.abs(B.car.x - A.car.x) > rSum + config.xPad) continue;
            if (tryResolve(A, B, config)) any = true;
        }
        if (opts.roadClamp) for (const car of cars) opts.roadClamp(car);
        if (!any) break;
    }
    for (const car of cars) car._capSpeed?.();
}
