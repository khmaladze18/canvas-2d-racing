const PICKUP_RESPAWN = 12;
const PICKUP_RADIUS = 26;
const PICKUP_START_OFFSET = 32;
const PICKUP_LANES = [-0.34, 0, 0.34];
const PICKUP_MIN_SPACING = 54;

function makePickup(track, idx, laneFrac) {
    const point = track.pointAtIndex(idx);
    const normal = track.normalAtIndex(idx);
    const laneOffset = laneFrac * track.roadHalfWidth * 0.7;
    return {
        idx,
        x: point.x + normal.x * laneOffset,
        y: point.y + normal.y * laneOffset,
        active: true,
        respawnAt: 0,
    };
}

export function createPickups(track) {
    const pickups = [];
    const maxIdx = Math.max(PICKUP_START_OFFSET + 20, track.points.length - 16);
    const count = Math.max(4, Math.min(7, Math.round(track.points.length / 95)));
    let cursor = PICKUP_START_OFFSET + Math.floor(Math.random() * 10);

    for (let i = 0; i < count && cursor < maxIdx; i++) {
        const laneFrac = PICKUP_LANES[Math.floor(Math.random() * PICKUP_LANES.length)];
        pickups.push(makePickup(track, cursor, laneFrac));
        cursor += PICKUP_MIN_SPACING + Math.floor(Math.random() * 28);
    }
    return pickups;
}

export function updatePickups(game, dt, racers) {
    const now = game.fxTime || 0;
    for (const pickup of game.pickups || []) {
        if (!pickup.active && now >= pickup.respawnAt) pickup.active = true;
        if (!pickup.active) continue;

        for (const car of racers) {
            const dx = car.x - pickup.x;
            const dy = car.y - pickup.y;
            const reach = PICKUP_RADIUS + (car.getRadius?.() || 12);
            if (dx * dx + dy * dy > reach * reach) continue;

            pickup.active = false;
            pickup.respawnAt = now + PICKUP_RESPAWN;
            car.boostInventory = Math.min(3, (car.boostInventory || 0) + 1);
            car.boostPickupFlash = 0.28;
            game.audio?.playPickup?.(car.isPlayer ? 1 : 0.75);
            break;
        }
    }

    for (const car of racers) car.boostPickupFlash = Math.max(0, (car.boostPickupFlash || 0) - dt);
}

export function drawPickups(ctx, pickups, cameraX, cameraY, time = 0) {
    if (!pickups?.length) return;
    for (const pickup of pickups) {
        if (!pickup.active) continue;
        const sx = pickup.x - cameraX;
        const sy = pickup.y - cameraY;
        if (sx < -80 || sx > ctx.canvas.width + 80 || sy < -80 || sy > ctx.canvas.height + 80) continue;

        const bob = Math.sin(time * 3.6 + pickup.idx * 0.17) * 4;
        const pulse = 0.72 + 0.28 * Math.sin(time * 5.5 + pickup.idx * 0.11);

        ctx.save();
        ctx.translate(sx, sy + bob);
        ctx.globalCompositeOperation = "lighter";

        const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, 26);
        glow.addColorStop(0, `rgba(96, 165, 250, ${0.35 * pulse})`);
        glow.addColorStop(0.45, `rgba(56, 189, 248, ${0.18 * pulse})`);
        glow.addColorStop(1, "rgba(56, 189, 248, 0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, 0, 26, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = `rgba(191, 219, 254, ${0.55 + pulse * 0.35})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(0, 0, 18 + pulse * 3, 9 + pulse * 2, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = "rgba(59, 130, 246, 0.95)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-6, 8);
        ctx.lineTo(0, -10);
        ctx.lineTo(6, 8);
        ctx.stroke();
        ctx.restore();
    }
}
