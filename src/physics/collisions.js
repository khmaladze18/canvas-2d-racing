import { clamp } from "../utils/math.js";

const DEFAULT_OPTS = {
    iterations: 6,
    restitution: 0.15, // Slightly higher for juice
    slop: 0.1,
    bias: 14.0,
    maxImpulse: 800,
    bounceThreshold: 0.5,
    friction: 0.4, // Reduced: too much friction makes cars "stick" unnaturally
    minDistEps: 1e-4
};

export function resolveCarCollisions(cars, dt, opts = {}) {
    const config = { ...DEFAULT_OPTS, ...opts };
    if (!cars || cars.length < 2) return;

    const dtClamped = Math.min(Math.max(dt, 1 / 240), 1 / 30);

    // Cache properties to avoid repeated function calls in tight loops
    const physicsData = cars.map(c => ({
        car: c,
        invMass: c.isPlayer ? 0.6 : 1.0, // Player is 1.6x "heavier"
        radius: c.getRadius ? c.getRadius() : 12
    }));

    for (let pass = 0; pass < config.iterations; pass++) {
        let any = false;

        // Optimization: Sort by Y once per pass to allow early exit
        // This makes the O(N^2) loop behave more like O(N)
        physicsData.sort((a, b) => a.car.y - b.car.y);

        for (let i = 0; i < physicsData.length; i++) {
            const A = physicsData[i];
            const a = A.car;

            for (let j = i + 1; j < physicsData.length; j++) {
                const B = physicsData[j];
                const b = B.car;

                // Early exit: if Y distance > sum of radii, they can't touch
                if (b.y - a.y > A.radius + B.radius) break;

                const dx = b.x - a.x;
                const dy = b.y - a.y;
                const rSum = A.radius + B.radius;
                const dist2 = dx * dx + dy * dy;

                if (dist2 >= rSum * rSum) continue;

                any = true;
                const dist = Math.sqrt(dist2 || config.minDistEps);
                const nx = dx / dist;
                const ny = dy / dist;

                // 1. Position Correction (Baumgarte)
                const penetration = rSum - dist;
                const pen = Math.max(penetration - config.slop, 0);
                if (pen > 0) {
                    const invSum = A.invMass + B.invMass;
                    const corr = (pen * config.bias * dtClamped) / invSum;

                    a.x -= nx * corr * A.invMass;
                    a.y -= ny * corr * A.invMass;
                    b.x += nx * corr * B.invMass;
                    b.y += ny * corr * B.invMass;
                }

                // 2. Velocity Impulse
                const rvx = b.vx - a.vx;
                const rvy = b.vy - a.vy;
                const velN = rvx * nx + rvy * ny;

                if (velN < 0) { // Only if moving toward each other
                    const e = velN < -config.bounceThreshold ? config.restitution : 0;
                    const invSum = A.invMass + B.invMass;

                    let jn = (-(1 + e) * velN) / invSum;
                    jn = Math.min(jn, config.maxImpulse);

                    const ix = jn * nx;
                    const iy = jn * ny;

                    a.vx -= ix * A.invMass;
                    a.vy -= iy * A.invMass;
                    b.vx += ix * B.invMass;
                    b.vy += iy * B.invMass;

                    // 3. Tangential Friction (Grip)
                    const tx = -ny; // Tangent vector
                    const ty = nx;
                    const velT = rvx * tx + rvy * ty;

                    let jt = (-velT * config.friction) / invSum;
                    // Limit friction by normal force (Coulomb)
                    const maxF = config.friction * jn;
                    jt = clamp(jt, -maxF, maxF);

                    a.vx -= tx * jt * A.invMass;
                    a.vy -= ty * jt * A.invMass;
                    b.vx += tx * jt * B.invMass;
                    b.vy += ty * jt * B.invMass;
                }
            }
        }

        if (opts.roadClamp) {
            for (let i = 0; i < cars.length; i++) opts.roadClamp(cars[i]);
        }

        if (!any) break;
    }

    // Final Post-step speed cap
    for (let i = 0; i < cars.length; i++) {
        cars[i]._capSpeed?.();
    }
}