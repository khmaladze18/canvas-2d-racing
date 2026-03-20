import { roundRect } from "../utils/draw.js";
import { shade } from "../utils/math.js";

export function fillRounded(ctx, x, y, w, h, r, fill) {
    roundRect(ctx, x, y, w, h, r);
    ctx.fillStyle = fill;
    ctx.fill();
}

export function fillWheels(ctx, wheelSpec) {
    for (const [x, y, w, h, r] of wheelSpec) fillRounded(ctx, x, y, w, h, r, "#101418");
}

export function applyPaint(ctx, base, x, y, w, h, radius) {
    const paint = ctx.createLinearGradient(x, y, x + w, y);
    paint.addColorStop(0, shade(base, 20));
    paint.addColorStop(0.45, base);
    paint.addColorStop(1, shade(base, -28));
    fillRounded(ctx, x, y, w, h, radius, paint);
}

export function applyGlass(ctx, x, y, w, h, radius = 4) {
    const glass = ctx.createLinearGradient(x, y, x, y + h);
    glass.addColorStop(0, "rgba(170, 220, 255, 0.85)");
    glass.addColorStop(0.4, "rgba(53, 91, 128, 0.95)");
    glass.addColorStop(1, "rgba(9, 18, 33, 0.95)");
    fillRounded(ctx, x, y, w, h, radius, glass);
    ctx.fillStyle = "rgba(255,255,255,0.20)";
    ctx.beginPath();
    ctx.moveTo(x + 2, y + 2);
    ctx.lineTo(x + w * 0.55, y + 2);
    ctx.lineTo(x + w * 0.35, y + h - 2);
    ctx.lineTo(x + 1, y + h - 3);
    ctx.closePath();
    ctx.fill();
}

export function addCenterStripe(ctx, color, width = 5, y = -18, h = 34) { fillRounded(ctx, -width / 2, y, width, h, 2, color); }
export function addSideAccent(ctx, x, y, w, h, color) { fillRounded(ctx, x, y, w, h, 2, color); }
export function addHoodCut(ctx, x, y, w, h) { fillRounded(ctx, x, y, w, h, 2, "rgba(0,0,0,0.18)"); }
