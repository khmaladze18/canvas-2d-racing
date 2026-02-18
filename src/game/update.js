import { clamp, lerp } from "../utils/math.js";

export function update(game, dt) {
    if (game.state !== "RACE") return;
    if (!game.track || !game.player) return;

    game.player.updatePlayer(dt, game.input, game.track);
    for (const b of game.bots) b.updateBot(dt, game.track, game.level);

    const targetCam = game.player.y - game.canvas.height * 0.62;
    game.cameraY = lerp(game.cameraY, targetCam, 6 * dt);

    const minCam = game.track.points[game.track.points.length - 1].y - game.canvas.height;
    const maxCam = game.track.points[0].y - 40;
    game.cameraY = clamp(game.cameraY, minCam, maxCam);

    game.all.sort((a, b) => b.progressDist - a.progressDist);
    const place = game.all.findIndex(c => c === game.player) + 1;

    const finish = game.track.finishDistance;
    const denom = Math.max(1, finish - game.startDist);
    const progPct = clamp(((game.player.progressDist - game.startDist) / denom) * 100, 0, 100);

    game.ui.updateHud({
        position: place,
        total: game.all.length,
        speed: game.player.speed,
        progressPct: progPct,
        level: game.level
    });

    if (game.player.progressDist >= finish) {
        game.all.sort((a, b) => b.progressDist - a.progressDist);
        const finalPlace = game.all.findIndex(c => c === game.player) + 1;
        game.endLevel(finalPlace);
    }
}
