import { roundRect } from "../utils/draw.js";

export function drawPlayerMarker(ctx) {
    ctx.save();
    ctx.translate(0, -42);

    ctx.fillStyle = "rgba(9, 20, 15, 0.92)";
    ctx.strokeStyle = "rgba(74, 222, 128, 0.95)";
    ctx.lineWidth = 2;
    roundRect(ctx, -18, -11, 36, 18, 8);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, 16);
    ctx.lineTo(8, 3);
    ctx.lineTo(-8, 3);
    ctx.closePath();
    ctx.fillStyle = "rgba(74, 222, 128, 0.95)";
    ctx.fill();

    ctx.fillStyle = "#dcfce7";
    ctx.font = "900 10px Outfit, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("YOU", 0, -1);
    ctx.restore();
}

export function drawStraightBoostEffect(ctx, strength) {
    const alpha = 0.12 + strength * 0.16;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = `rgba(225, 245, 255, ${alpha})`;
    ctx.lineWidth = 2;

    for (let i = 0; i < 3; i++) {
        const x = (i - 1) * (4 + strength * 3);
        const len = 14 + strength * 12 + i * 4;
        ctx.beginPath();
        ctx.moveTo(x, 16 + i * 2);
        ctx.lineTo(x * 0.55, 16 + len);
        ctx.stroke();
    }

    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.85})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-7, 18);
    ctx.quadraticCurveTo(0, 28 + strength * 5, 7, 18);
    ctx.stroke();
    ctx.restore();
}

export function drawManualBoostFlame(ctx, strength) {
    const outerLen = 16 + strength * 12;
    const coreLen = 10 + strength * 8;

    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    for (const side of [-1, 1]) {
        const x = side * 5.4;

        const outer = ctx.createLinearGradient(x, 16, x, 16 + outerLen);
        outer.addColorStop(0, "rgba(255,255,255,0.9)");
        outer.addColorStop(0.28, "rgba(125, 211, 252, 0.9)");
        outer.addColorStop(0.72, "rgba(37, 99, 235, 0.75)");
        outer.addColorStop(1, "rgba(37, 99, 235, 0)");
        ctx.fillStyle = outer;
        ctx.beginPath();
        ctx.moveTo(x - 2.8, 16);
        ctx.quadraticCurveTo(x - 6, 20 + outerLen * 0.38, x, 16 + outerLen);
        ctx.quadraticCurveTo(x + 6, 20 + outerLen * 0.38, x + 2.8, 16);
        ctx.closePath();
        ctx.fill();

        const core = ctx.createLinearGradient(x, 16, x, 16 + coreLen);
        core.addColorStop(0, "rgba(255,255,255,0.96)");
        core.addColorStop(0.45, "rgba(191, 219, 254, 0.92)");
        core.addColorStop(1, "rgba(59, 130, 246, 0)");
        ctx.fillStyle = core;
        ctx.beginPath();
        ctx.moveTo(x - 1.4, 16);
        ctx.quadraticCurveTo(x - 3, 19 + coreLen * 0.34, x, 16 + coreLen);
        ctx.quadraticCurveTo(x + 3, 19 + coreLen * 0.34, x + 1.4, 16);
        ctx.closePath();
        ctx.fill();
    }

    ctx.restore();
}
