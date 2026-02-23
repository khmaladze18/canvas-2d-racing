// src/renderer.js

const RENDER_CFG = {
    viewportPad: 200, // Cull objects this far outside the screen
    scanlineOpacity: 0.04,
    bloomAlpha: 0.15
};

export function render(game) {
    const { ctx, canvas, track, cameraY, player, bots, traffic } = game;
    const { width: w, height: h } = canvas;

    // 1. Fast Clear & Base
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#070a12";
    ctx.fillRect(0, 0, w, h);

    // 2. Grid (Fallback if track loading or for Debug)
    if (!track) {
        drawDebugGrid(ctx, w, h);
        return;
    }

    // 3. Track Drawing (Pass cameraY to handle parallax/offset internally)
    const focusIdx = player?.trackIdxHint ?? 80;
    track.draw(ctx, cameraY, focusIdx);

    // 4. Object Rendering (Sorted for Z-depth)
    const allCars = [player, ...bots, ...(traffic?.cars || [])].filter(Boolean);

    // Cull and Sort
    const visibleColliders = allCars.filter(c => {
        const screenY = c.y - cameraY;
        return screenY > -RENDER_CFG.viewportPad && screenY < h + RENDER_CFG.viewportPad;
    });

    visibleColliders.sort((a, b) => a.y - b.y);

    // Draw Shadows first (Contact Pass)
    ctx.save();
    visibleColliders.forEach(c => c.drawShadow?.(ctx, cameraY));
    ctx.restore();

    // Draw Car Bodies (Body Pass)
    visibleColliders.forEach(c => c.draw?.(ctx, cameraY));

    // 5. Post-Processing Effects
    applyPostEffects(ctx, w, h);
}

function applyPostEffects(ctx, w, h) {
    // A. The Horizon Bloom (adds "heat" to the distance)
    const horizonGlow = ctx.createLinearGradient(0, 0, 0, h * 0.4);
    horizonGlow.addColorStop(0, `rgba(147, 197, 253, ${RENDER_CFG.bloomAlpha})`);
    horizonGlow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = horizonGlow;
    ctx.fillRect(0, 0, w, h * 0.4);

    // B. Vignette (Dynamic focus)
    const g = ctx.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, h * 0.9);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(0,0,0,0.4)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // C. Retro Scanlines (The "Senior" touch)
    ctx.save();
    ctx.globalCompositeOperation = "overlay";
    ctx.fillStyle = "rgba(18, 16, 16, 0.1)";
    for (let i = 0; i < h; i += 4) {
        ctx.fillRect(0, i, w, 2);
    }
    ctx.restore();
}

function drawDebugGrid(ctx, w, h) {
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 60) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += 60) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
}