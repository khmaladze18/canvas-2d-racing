const SPARK_COUNT = 9;

export function emitCollisionImpact(game, { a, b, x, y, nx, ny, impulse = 0 }) {
    const intensity = Math.max(0.35, Math.min(1, impulse / 320));
    const fx = game.impactFx || (game.impactFx = []);
    game.audio?.playCollision?.(impulse);

    for (const car of [a, b]) {
        car.impactFlashTimer = Math.max(car.impactFlashTimer || 0, 0.14 + intensity * 0.08);
        car.bumpTimer = Math.max(car.bumpTimer || 0, 0.16 + intensity * 0.1);
        car.bumpDirX = car === a ? -nx : nx;
        car.bumpDirY = car === a ? -ny : ny;
        car.collisionFxCooldown = 0.08;
    }

    for (let i = 0; i < SPARK_COUNT; i++) {
        const spread = (Math.random() - 0.5) * 1.6;
        const speed = 80 + Math.random() * 220 + impulse * 0.22;
        const dirX = nx * Math.cos(spread) - ny * Math.sin(spread);
        const dirY = ny * Math.cos(spread) + nx * Math.sin(spread);
        fx.push({
            x: x + (Math.random() - 0.5) * 10,
            y: y + (Math.random() - 0.5) * 10,
            vx: dirX * speed,
            vy: dirY * speed,
            life: 0.22 + Math.random() * 0.18,
            age: 0,
            size: 1.8 + Math.random() * 2.8,
            heat: 0.65 + Math.random() * 0.35,
        });
    }
}

export function updateImpactFx(game, dt, cars = []) {
    for (const car of cars) {
        car.impactFlashTimer = Math.max(0, (car.impactFlashTimer || 0) - dt);
        car.bumpTimer = Math.max(0, (car.bumpTimer || 0) - dt);
        car.collisionFxCooldown = Math.max(0, (car.collisionFxCooldown || 0) - dt);
    }

    const next = [];
    for (const fx of game.impactFx || []) {
        fx.age += dt;
        if (fx.age >= fx.life) continue;
        fx.vx *= Math.exp(-dt * 7.5);
        fx.vy = fx.vy * Math.exp(-dt * 6.2) + 24 * dt;
        fx.x += fx.vx * dt;
        fx.y += fx.vy * dt;
        next.push(fx);
    }
    game.impactFx = next;
}

export function drawImpactFx(ctx, effects, cameraX, cameraY) {
    ctx.save();
    for (const fx of effects || []) {
        const t = fx.age / fx.life;
        const x = fx.x - cameraX;
        const y = fx.y - cameraY;
        const alpha = (1 - t) * 0.9;

        ctx.fillStyle = `rgba(255, ${180 - t * 70}, ${30 + t * 20}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, fx.size * (1 - t * 0.35), 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = `rgba(255, ${220 - t * 90}, 110, ${alpha * 0.75})`;
        ctx.lineWidth = Math.max(1, fx.size * 0.65);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - fx.vx * 0.015, y - fx.vy * 0.015);
        ctx.stroke();
    }
    ctx.restore();
}
