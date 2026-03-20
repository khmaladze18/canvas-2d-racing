const FX_BOUNDS_PAD = 80;

function isVisible(ctx, x, y) {
    return !(
        x < -FX_BOUNDS_PAD ||
        x > ctx.canvas.width + FX_BOUNDS_PAD ||
        y < -FX_BOUNDS_PAD ||
        y > ctx.canvas.height + FX_BOUNDS_PAD
    );
}

export function drawDriftEffects(ctx, cars, cameraX, cameraY) {
    ctx.save();

    for (const car of cars) {
        for (const mark of car.driftMarks || []) {
            const x = mark.x - cameraX;
            const y = mark.y - cameraY;
            if (!isVisible(ctx, x, y)) continue;

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(mark.angle - Math.PI / 2 + Math.PI);
            ctx.strokeStyle = `rgba(18, 18, 18, ${0.12 + mark.life * 0.22 * mark.strength})`;
            ctx.lineWidth = 2 + mark.strength * 2;
            ctx.beginPath();
            ctx.moveTo(-10, 12);
            ctx.lineTo(-10, 26);
            ctx.moveTo(10, 12);
            ctx.lineTo(10, 26);
            ctx.stroke();
            ctx.restore();
        }

        for (const puff of car.driftSmoke || []) {
            const x = puff.x - cameraX;
            const y = puff.y - cameraY;
            if (!isVisible(ctx, x, y)) continue;

            ctx.fillStyle = `rgba(225, 228, 232, ${puff.life * 0.22})`;
            ctx.beginPath();
            ctx.arc(x, y, puff.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    ctx.restore();
}

export function applyPostEffects(ctx, w, h, scanlineOpacity = 0.1, bloomAlpha = 0.15) {
    const horizonGlow = ctx.createLinearGradient(0, 0, 0, h * 0.4);
    horizonGlow.addColorStop(0, `rgba(147, 197, 253, ${bloomAlpha})`);
    horizonGlow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = horizonGlow;
    ctx.fillRect(0, 0, w, h * 0.4);

    const g = ctx.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, h * 0.9);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(0,0,0,0.4)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.globalCompositeOperation = "overlay";
    ctx.fillStyle = `rgba(18, 16, 16, ${scanlineOpacity})`;
    for (let i = 0; i < h; i += 4) {
        ctx.fillRect(0, i, w, 2);
    }
    ctx.restore();
}

export function drawDebugGrid(ctx, w, h) {
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
    }
    for (let y = 0; y < h; y += 60) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
    }
}
