import { clamp, lerp } from "../utils/math.js";
import { resolveCarCollisions } from "../physics/collisions.js";

export function update(game, dt) {
    if (game.state !== "RACE") return;
    if (!game.track || !game.player) return;

    // --- Substeps to prevent tunneling / overlap at speed ---
    const steps = dt > 0.02 ? 2 : 1;
    const h = dt / steps;

    for (let s = 0; s < steps; s++) {
        // 1) Move cars
        game.player.updatePlayer(h, game.input, game.track);
        for (const b of game.bots) b.updateBot(h, game.track, game.level);

        // 1.5) Traffic obstacles
        game.traffic?.update?.(h, game.track, game.player);

        const trafficCars = game.traffic?.cars || [];

        // ✅ collisions include traffic
        const colliders = [game.player, ...game.bots, ...trafficCars];
        game.all = colliders; // keep if other parts rely on it

        // 2) Collisions
        resolveCarCollisions(colliders, h, {
            iterations: 6,
            restitution: 0.10,
            pushStrength: 28,
            slop: 0.02,
            percent: 1.0,
            roadClamp: (c) => c._applyRoadClamp?.(game.track, c.isPlayer ? 10 : 12, 0.99),
        });
    }

    // 3) Camera
    const targetCam = game.player.y - game.canvas.height * 0.62;
    game.cameraY = lerp(game.cameraY, targetCam, 6 * dt);

    const minCam = game.track.points[game.track.points.length - 1].y - game.canvas.height;
    const maxCam = game.track.points[0].y - 40;
    game.cameraY = clamp(game.cameraY, minCam, maxCam);

    // ✅ 4) Ranking + HUD (ONLY racers)
    const racers = [game.player, ...game.bots];
    racers.sort((a, b) => b.progressDist - a.progressDist);

    const place = racers.findIndex((c) => c === game.player) + 1;

    const finish = game.track.finishDistance;
    const denom = Math.max(1, finish - game.startDist);
    const progPct = clamp(((game.player.progressDist - game.startDist) / denom) * 100, 0, 100);

    game.ui.updateHud({
        position: place,
        total: racers.length, // ✅ no traffic in total
        speed: game.player.speed,
        progressPct: progPct,
        level: game.level,
    });

    // ✅ 5) Finish (ONLY racers)
    if (game.player.progressDist >= finish) {
        racers.sort((a, b) => b.progressDist - a.progressDist);
        const finalPlace = racers.findIndex((c) => c === game.player) + 1;
        game.endLevel(finalPlace);
    }
}
