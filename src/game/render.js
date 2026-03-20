import { applyPostEffects, drawDebugGrid, drawDriftEffects } from "./renderEffects.js";
import { drawImpactFx } from "./impactFx.js";
import { drawPickups } from "./pickups.js";

const RENDER_CFG = {
    viewportPad: 200,
    scanlineOpacity: 0.04,
    bloomAlpha: 0.15,
};

function getVisibleCars(game) {
    const { canvas, cameraX, cameraY, player, bots, traffic } = game;
    const { width, height } = canvas;
    const allCars = [player, ...bots, ...(traffic?.cars || [])].filter(Boolean);

    return allCars
        .filter((car) => {
            const screenX = car.x - cameraX;
            const screenY = car.y - cameraY;
            return (
                screenX > -RENDER_CFG.viewportPad &&
                screenX < width + RENDER_CFG.viewportPad &&
                screenY > -RENDER_CFG.viewportPad &&
                screenY < height + RENDER_CFG.viewportPad
            );
        })
        .sort((a, b) => a.y - b.y);
}

export function render(game) {
    const { ctx, canvas, track, cameraX, cameraY, player } = game;
    const { width: w, height: h } = canvas;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#070a12";
    ctx.fillRect(0, 0, w, h);

    if (!track) {
        drawDebugGrid(ctx, w, h);
        return;
    }

    const focusIdx = player?.trackIdxHint ?? 80;
    track.draw(ctx, cameraX, cameraY, focusIdx);
    drawPickups(ctx, game.pickups, cameraX, cameraY, game.fxTime || 0);

    const visibleCars = getVisibleCars(game);
    drawDriftEffects(ctx, visibleCars, cameraX, cameraY);
    drawImpactFx(ctx, game.impactFx, cameraX, cameraY);

    ctx.save();
    visibleCars.forEach((car) => car.drawShadow?.(ctx, cameraX, cameraY));
    ctx.restore();

    visibleCars.forEach((car) => car.draw?.(ctx, cameraX, cameraY));

    applyPostEffects(ctx, w, h, RENDER_CFG.scanlineOpacity, RENDER_CFG.bloomAlpha);
}
