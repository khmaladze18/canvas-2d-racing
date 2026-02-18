export function render(game) {
    const ctx = game.ctx;
    const w = game.canvas.width;
    const h = game.canvas.height;

    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = "#070a12";
    ctx.fillRect(0, 0, w, h);

    if (!game.track) {
        ctx.strokeStyle = "rgba(255,255,255,0.03)";
        ctx.lineWidth = 1;
        for (let x = 0; x < w; x += 60) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
        }
        for (let y = 0; y < h; y += 60) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
        }
        return;
    }

    const focusIdx = game.player?.trackIdxHint ?? 80;
    game.track.draw(ctx, game.cameraY, focusIdx);

    const drawList = [...game.all].sort((a, b) => a.y - b.y);
    for (const c of drawList) c.draw(ctx, game.cameraY);

    const g = ctx.createRadialGradient(w / 2, h / 2, h * 0.2, w / 2, h / 2, h * 0.85);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(0,0,0,0.35)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
}
