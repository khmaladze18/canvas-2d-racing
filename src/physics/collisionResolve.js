import { clamp } from "../utils/math.js";
import { buildBox, overlapOnAxis } from "./collisionMath.js";

export function tryResolve(A, B, config) {
    const a = A.car;
    const b = B.car;
    const boxA = buildBox(a, A.box);
    const boxB = buildBox(b, B.box);
    const axes = [[boxA.fx, boxA.fy], [boxA.rx, boxA.ry], [boxB.fx, boxB.fy], [boxB.rx, boxB.ry]];
    let minOverlap = Infinity;
    let mtvX = 0;
    let mtvY = 0;

    for (const [ax, ay] of axes) {
        const overlap = overlapOnAxis(boxA, boxB, ax, ay);
        if (overlap <= 0) return false;
        if (overlap < minOverlap) {
            minOverlap = overlap;
            const dir = ((b.x - a.x) * ax + (b.y - a.y) * ay) >= 0 ? 1 : -1;
            mtvX = ax * dir;
            mtvY = ay * dir;
        }
    }

    const invSum = A.invMass + B.invMass;
    if (invSum <= 0) return false;
    const correction = Math.max(minOverlap - config.slop, 0) * config.percent;
    if (correction > 0) {
        const push = correction / invSum;
        a.x -= mtvX * push * A.invMass;
        a.y -= mtvY * push * A.invMass;
        b.x += mtvX * push * B.invMass;
        b.y += mtvY * push * B.invMass;
    }

    const velN = (b.vx - a.vx) * mtvX + (b.vy - a.vy) * mtvY;
    const extraSeparation = minOverlap * config.overlapBoost;
    if (extraSeparation > 0) {
        a.vx -= mtvX * extraSeparation * A.invMass;
        a.vy -= mtvY * extraSeparation * A.invMass;
        b.vx += mtvX * extraSeparation * B.invMass;
        b.vy += mtvY * extraSeparation * B.invMass;
    }
    if (velN >= 0) return true;

    const jn = Math.min((-(1 + (Math.abs(velN) > config.bounceThreshold ? config.restitution : 0)) * velN) / invSum, config.maxImpulse);
    a.vx -= jn * mtvX * A.invMass;
    a.vy -= jn * mtvY * A.invMass;
    b.vx += jn * mtvX * B.invMass;
    b.vy += jn * mtvY * B.invMass;

    const tx = -mtvY;
    const ty = mtvX;
    const velT = (b.vx - a.vx) * tx + (b.vy - a.vy) * ty;
    const maxFriction = jn * ((A.friction + B.friction) * 0.5);
    const jt = clamp(-velT / invSum, -maxFriction, maxFriction);
    a.vx -= tx * jt * A.invMass;
    a.vy -= ty * jt * A.invMass;
    b.vx += tx * jt * B.invMass;
    b.vy += ty * jt * B.invMass;

    const cooldownA = a.collisionFxCooldown || 0;
    const cooldownB = b.collisionFxCooldown || 0;
    if (config.onImpact && jn > 80 && cooldownA <= 0 && cooldownB <= 0) {
        config.onImpact({
            a,
            b,
            x: (a.x + b.x) * 0.5,
            y: (a.y + b.y) * 0.5,
            nx: mtvX,
            ny: mtvY,
            impulse: jn,
        });
    }
    return true;
}
