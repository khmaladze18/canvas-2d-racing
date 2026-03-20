import { clamp, lerp } from "../utils/math.js";
import { resolveCarCollisions } from "../physics/collisions.js";
import { emitCollisionImpact, updateImpactFx } from "./impactFx.js";
import { updatePickups } from "./pickups.js";

export function update(game, dt) {
    game.audio?.update?.(game, dt);
    if (game.state !== "RACE") return;
    if (!game.track || !game.player) return;
    if (!game.raceStarted) return;
    game.fxTime = (game.fxTime || 0) + dt;
    updateImpactFx(game, dt, [game.player, ...game.bots]);

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

        // collisions include traffic
        const colliders = [game.player, ...game.bots, ...trafficCars];
        game.all = colliders;

        // 2) Collisions
        resolveCarCollisions(colliders, h, {
            iterations: 6,
            restitution: 0.10,
            pushStrength: 28,
            slop: 0.02,
            percent: 1.0,
            roadClamp: (c) => c._applyRoadClamp?.(game.track, c.getCollisionRadius?.() ?? c.getRadius?.() ?? 12, 0.99),
            onImpact: (impact) => emitCollisionImpact(game, impact),
        });
        updatePickups(game, h, [game.player, ...game.bots]);
    }

    // 3) Camera
    const targetCamX = game.player.x - game.canvas.width * 0.5;
    const targetCamY = game.player.y - game.canvas.height * 0.62;
    game.cameraX = lerp(game.cameraX, targetCamX, 6 * dt);
    game.cameraY = lerp(game.cameraY, targetCamY, 6 * dt);

    if (!game.track.closed) {
        const minCam = game.track.maxY - game.canvas.height;
        const maxCam = game.track.minY - 40;
        game.cameraY = clamp(game.cameraY, minCam, maxCam);
    }

    // 4) Ranking + HUD (only racers)
    const racers = [game.player, ...game.bots];
    racers.sort((a, b) => b.progressDist - a.progressDist);

    const place = racers.findIndex((c) => c === game.player) + 1;

    const finish = game.startDist + game.track.totalDistance;
    const denom = Math.max(1, game.track.totalDistance);
    const progPct = clamp(((game.player.progressDist - game.startDist) / denom) * 100, 0, 100);

    game.ui.updateHud({
        position: place,
        total: racers.length,
        speed: game.player.speed,
        progressPct: progPct,
        level: game.level,
        track: game.track,
        racers,
        player: game.player,
        manualBoostPct: Math.max(0, Math.min(1, (game.player.manualBoostTimer || 0) / 5)),
        manualBoostTime: Math.max(0, game.player.manualBoostTimer || 0),
        boostInventory: Math.max(0, game.player.boostInventory || 0),
    });

    // 5) Finish (only racers)
    if (game.player.progressDist >= finish) {
        racers.sort((a, b) => b.progressDist - a.progressDist);
        const finalPlace = racers.findIndex((c) => c === game.player) + 1;
        game.endLevel(finalPlace);
    }
}
