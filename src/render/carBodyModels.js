import { addCenterStripe, addHoodCut, addSideAccent, applyGlass, applyPaint, fillRounded, fillWheels } from "./carModelShared.js";
import { shade } from "../utils/math.js";

export function drawSedan(ctx, base) {
    fillWheels(ctx, [[-18, -14, 8, 12, 3], [10, -14, 8, 12, 3], [-18, 12, 8, 12, 3], [10, 12, 8, 12, 3]]);
    fillRounded(ctx, -16, -23, 32, 50, 10, shade(base, -44));
    applyPaint(ctx, base, -13.5, -22, 27, 46, 9);
    fillRounded(ctx, -12, -23, 24, 10, { tl: 8, tr: 8, br: 3, bl: 3 }, shade(base, 34));
    addHoodCut(ctx, -8, -16.5, 16, 3); addSideAccent(ctx, -13.5, -9, 3.5, 26, "rgba(255,255,255,0.14)");
    addSideAccent(ctx, 10, -9, 3.5, 26, "rgba(0,0,0,0.14)"); applyGlass(ctx, -10.5, -7.5, 21, 18, 5);
    fillRounded(ctx, -8.5, -9.5, 17, 2.5, 1, "rgba(255,255,255,0.16)"); fillRounded(ctx, -11, 11, 22, 9, 4, shade(base, 8));
    fillRounded(ctx, -9, 13, 18, 3, 2, "rgba(255,255,255,0.18)"); fillRounded(ctx, -11, 21, 22, 3, 2, "rgba(0,0,0,0.22)");
}

export function drawSUV(ctx, base) {
    fillWheels(ctx, [[-19, -16, 9, 14, 3], [10, -16, 9, 14, 3], [-19, 13, 9, 14, 3], [10, 13, 9, 14, 3]]);
    fillRounded(ctx, -19, -24, 38, 54, 8, shade(base, -48)); fillRounded(ctx, -19.5, -14, 39, 14, 6, shade(base, -28));
    fillRounded(ctx, -19.5, 14, 39, 14, 6, shade(base, -28)); applyPaint(ctx, base, -15, -23, 30, 49, 5);
    fillRounded(ctx, -14, -24, 28, 10, { tl: 5, tr: 5, br: 2, bl: 2 }, shade(base, 30)); addHoodCut(ctx, -8.5, -17, 17, 3.5);
    addSideAccent(ctx, -15, -8, 4.5, 28, "rgba(255,255,255,0.15)"); addSideAccent(ctx, 10.5, -8, 4.5, 28, "rgba(0,0,0,0.14)");
    applyGlass(ctx, -11.5, -8, 23, 20, 3); fillRounded(ctx, -9.5, -10.5, 19, 2.5, 1, "rgba(255,255,255,0.16)");
    fillRounded(ctx, -11.5, 12.5, 23, 10.5, 3, shade(base, 8)); fillRounded(ctx, -8.5, 15.5, 17, 3, 2, "rgba(255,255,255,0.12)");
    fillRounded(ctx, -7.5, -13.5, 15, 4, 1, "rgba(0,0,0,0.24)"); fillRounded(ctx, -16, -4, 3, 12, 1, shade(base, -10)); fillRounded(ctx, 13, -4, 3, 12, 1, shade(base, -10));
}

export function drawF1(ctx, base) {
    fillWheels(ctx, [[-20, -19, 7, 11, 2], [13, -19, 7, 11, 2], [-21, 8, 10, 16, 3], [11, 8, 10, 16, 3]]);
    fillRounded(ctx, -16, 18, 32, 5, 1, "#14181d"); fillRounded(ctx, -13, 12, 26, 6, 2, shade(base, -35));
    ctx.fillStyle = base; ctx.beginPath(); ctx.moveTo(-3.5, -31); ctx.lineTo(3.5, -31); ctx.lineTo(7, -16); ctx.lineTo(12, -7); ctx.lineTo(12, 18); ctx.quadraticCurveTo(0, 26, -12, 18); ctx.lineTo(-12, -7); ctx.lineTo(-7, -16); ctx.closePath(); ctx.fill();
    fillRounded(ctx, -10, -10, 20, 7, 3, shade(base, 18)); fillRounded(ctx, -4.5, -28, 9, 18, 3, shade(base, 28)); fillRounded(ctx, -6, -10, 12, 16, 5, "#111827");
    fillRounded(ctx, -8, 6, 16, 5, 2, shade(base, 10)); addCenterStripe(ctx, "rgba(255,255,255,0.85)", 3, -29, 40); fillRounded(ctx, -15, -6, 5, 16, 2, shade(base, -18)); fillRounded(ctx, 10, -6, 5, 16, 2, shade(base, -18));
}
