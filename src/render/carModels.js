import { fillRounded } from "./carModelShared.js";
import { drawF1, drawSUV, drawSedan } from "./carBodyModels.js";

export function drawCarModel(ctx, model, base) {
    if (model === "f1") drawF1(ctx, base);
    else if (model === "suv") drawSUV(ctx, base);
    else drawSedan(ctx, base);
}

export function paintBodyGloss(ctx) {
    fillRounded(ctx, -13.5, -21.5, 27, 44, 6, "rgba(255,255,255,0.05)");
}

export function drawCarLights(ctx, model, isBraking) {
    const frontY = model === "f1" ? -30 : model === "suv" ? -22 : -21;
    const rearY = model === "f1" ? 20 : model === "suv" ? 24 : 22;
    const headX = model === "f1" ? 5.5 : model === "suv" ? 9.5 : 8;
    const tailX = model === "f1" ? 4.5 : model === "suv" ? 8.5 : 7;
    const headW = model === "f1" ? 2.5 : model === "suv" ? 5 : 4;
    const tailW = model === "f1" ? 3 : model === "suv" ? 4.5 : 4;
    ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0; ctx.shadowBlur = 10; ctx.shadowColor = "rgba(255, 248, 200, 0.85)";
    fillRounded(ctx, -headX, frontY, headW, 2.5, 1, "#fff6bf"); fillRounded(ctx, headX - headW, frontY, headW, 2.5, 1, "#fff6bf");
    const rear = isBraking ? "#ff4d4d" : "#7f1d1d";
    ctx.shadowBlur = isBraking ? 14 : 5; ctx.shadowColor = "rgba(255, 40, 40, 0.75)";
    fillRounded(ctx, -tailX, rearY, tailW, 3, 1, rear); fillRounded(ctx, tailX - tailW, rearY, tailW, 3, 1, rear);
}
