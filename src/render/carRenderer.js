import { drawCarLights, drawCarModel, paintBodyGloss } from "./carModels.js";
import { drawManualBoostFlame, drawPlayerMarker, drawStraightBoostEffect } from "./carEffects.js";

function carColor(c) {
    const palette = {
        blue: "#2563eb",
        red: "#dc2626",
        yellow: "#fbbf24",
        green: "#16a34a",
        grey: "#4b5563",
        black: "#111827",
        white: "#f8fafc",
    };
    if (typeof c === "string" && (c.startsWith("#") || c.startsWith("rgb"))) return c;
    return palette[c] || palette.grey;
}

function isOnScreen(ctx, x, y, pad = 100) {
    return !(
        x < -pad ||
        x > ctx.canvas.width + pad ||
        y < -pad ||
        y > ctx.canvas.height + pad
    );
}

export function drawCar(ctx, car, cameraX, cameraY) {
    const sx = car.x - cameraX;
    const sy = car.y - cameraY;
    if (!isOnScreen(ctx, sx, sy)) return;

    const scale = car.renderScale || 1;
    const speedRatio = Math.max(0, Math.min(1, car.speed / Math.max(1, car.maxSpeed || 1)));

    ctx.save();
    ctx.translate(sx, sy);
    if ((car.bumpTimer || 0) > 0) {
        const bump01 = Math.min(1, (car.bumpTimer || 0) / 0.24);
        ctx.translate((car.bumpDirX || 0) * 5 * bump01, (car.bumpDirY || 0) * 5 * bump01);
        ctx.rotate(((car.bumpDirX || 0) * 0.04 + (Math.random() - 0.5) * 0.02) * bump01);
    }
    ctx.rotate(car.angle - Math.PI / 2 + Math.PI);
    ctx.scale(scale, scale);

    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.beginPath();
    ctx.ellipse(0, 8, 16, 22, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowColor = "rgba(0,0,0,0.38)";
    ctx.shadowBlur = 7 * scale;
    ctx.shadowOffsetY = 5;
    ctx.shadowOffsetX = 2;

    drawCarModel(ctx, car.model, carColor(car.color));

    if ((car.impactFlashTimer || 0) > 0) {
        const flash = Math.min(1, (car.impactFlashTimer || 0) / 0.22);
        ctx.fillStyle = `rgba(255, 190, 70, ${flash * 0.28})`;
        ctx.beginPath();
        ctx.ellipse(0, 0, 17 + flash * 6, 24 + flash * 8, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    paintBodyGloss(ctx);

    if (car.manualBoostActive) {
        const boostStrength = Math.max(0.45, Math.min(1, (car.manualBoostTimer || 0) / 5));
        drawManualBoostFlame(ctx, boostStrength);
    }

    if (car.isPlayer && car.straightBoostActive) {
        const boostStrength = Math.min(1, ((car.straightBoostTimer || 0) - 2.35) / 0.45 + 0.55);
        drawStraightBoostEffect(ctx, boostStrength);
    }

    if (speedRatio > 0.65) {
        const alpha = (speedRatio - 0.65) * 0.24;
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fillRect(-1, 22, 2, 10 + speedRatio * 6);
    }

    drawCarLights(ctx, car.model, car.speed < (car.maxSpeed * 0.4));

    if (car.isPlayer) drawPlayerMarker(ctx);

    ctx.restore();
}
