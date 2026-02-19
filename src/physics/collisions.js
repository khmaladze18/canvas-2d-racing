import { clamp } from "../utils/math.js";

/**
 * Stable iterative circle-vs-circle collision solver.
 * - Positional correction with bias (Baumgarte-ish)
 * - Impulse resolution with restitution + friction
 * - Better pileup stability, less jitter
 */
export function resolveCarCollisions(cars, dt, opts = {}) {
    const {
        iterations = 6,

        // restitution: 0..0.3 for arcade racers
        restitution = 0.12,

        // Position correction:
        // slop: allowed overlap (in px)
        // bias: how fast we correct per second (bigger = faster separation)
        slop = 0.08,
        bias = 12.0, // px/sec correction strength

        // Velocity feel & stability
        maxImpulse = 700,
        bounceThreshold = 0.6, // ignore tiny bounces (px/s along normal)

        // Friction to reduce sideways slide/jitter in stacks
        friction = 0.75, // 0..1 (higher = more grip between cars)

        minDistEps = 1e-6,
        roadClamp = null,
    } = opts;

    if (!cars || cars.length < 2) return;

    // Avoid crazy correction on huge dt spikes
    const dtClamped = Math.min(Math.max(dt, 1 / 240), 1 / 20);

    // Helper to get radius + inverse mass (pseudo-mass)
    const radiusOf = (c) => (c.getRadius ? c.getRadius() : 10);
    const invMassOf = (c) => {
        // heavier players feel less bullied, adjust as you like
        const m = c.isPlayer ? 1.25 : 1.0;
        return 1 / m;
    };

    for (let pass = 0; pass < iterations; pass++) {
        let any = false;

        for (let i = 0; i < cars.length; i++) {
            const a = cars[i];
            if (!a) continue;

            for (let j = i + 1; j < cars.length; j++) {
                const b = cars[j];
                if (!b) continue;

                const ra = radiusOf(a);
                const rb = radiusOf(b);
                const r = ra + rb;

                let dx = b.x - a.x;
                let dy = b.y - a.y;

                const dist2 = dx * dx + dy * dy;
                if (dist2 >= r * r) continue;

                any = true;

                const dist = Math.sqrt(Math.max(dist2, minDistEps));
                const nx = dx / dist;
                const ny = dy / dist;

                const penetration = r - dist;

                // Pseudo inverse masses
                const invA = invMassOf(a);
                const invB = invMassOf(b);
                const invSum = invA + invB;
                if (invSum <= 0) continue;

                // -------- A) Positional correction (stable, dt-aware) --------
                // Only correct beyond slop. Bias scales with dt.
                // This avoids “teleporty” corrections while still fixing deep pileups quickly.
                const pen = Math.max(penetration - slop, 0);
                if (pen > 0) {
                    // amount we try to remove THIS pass
                    const corrMag = (bias * dtClamped) * pen; // proportional correction
                    const corr = corrMag / invSum;

                    a.x -= nx * corr * invA;
                    a.y -= ny * corr * invA;
                    b.x += nx * corr * invB;
                    b.y += ny * corr * invB;
                }

                // -------- B) Velocity impulses (restitution only if closing) --------
                const rvx = b.vx - a.vx;
                const rvy = b.vy - a.vy;

                const velN = rvx * nx + rvy * ny;

                // Restitution only when clearly closing (prevents jitter bounces)
                const e = velN < -bounceThreshold ? restitution : 0;

                // Normal impulse to stop interpenetration velocity
                // j = -(1+e) * velN / invSum
                let jn = (-(1 + e) * velN) / invSum;

                // Don’t “push” if separating already (velN > 0)
                if (jn < 0) jn = 0;

                // Clamp impulse
                jn = clamp(jn, 0, maxImpulse);

                if (jn > 0) {
                    const ix = jn * nx;
                    const iy = jn * ny;

                    a.vx -= ix * invA;
                    a.vy -= iy * invA;
                    b.vx += ix * invB;
                    b.vy += iy * invB;
                }

                // -------- C) Tangential (friction) impulse --------
                // Remove sideways relative motion along the contact tangent.
                // This dramatically reduces pileup jitter and “ice skating”.
                const tvx = rvx - velN * nx;
                const tvy = rvy - velN * ny;
                const tLen = Math.sqrt(tvx * tvx + tvy * tvy);

                if (tLen > 1e-6) {
                    const tx = tvx / tLen;
                    const ty = tvy / tLen;

                    const velT = rvx * tx + rvy * ty;

                    // Coulomb friction: jt limited by mu * jn
                    let jt = (-velT) / invSum;
                    const maxF = friction * jn;

                    jt = clamp(jt, -maxF, maxF);

                    if (jt !== 0) {
                        const fx = jt * tx;
                        const fy = jt * ty;

                        a.vx -= fx * invA;
                        a.vy -= fy * invA;
                        b.vx += fx * invB;
                        b.vy += fy * invB;
                    }
                }

                a._capSpeed?.();
                b._capSpeed?.();
            }
        }

        // Apply road clamp once per pass (reduces solver fighting)
        if (roadClamp) for (const c of cars) roadClamp(c);

        if (!any) break;
    }
}
