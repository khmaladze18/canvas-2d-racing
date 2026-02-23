import { clamp, lerp } from "../utils/math.js";
import { resolveCarCollisions } from "../physics/collisions.js";

export function update(game, dt) {
    if (game.state !== "RACE") return;
    if (!game.track || !game.player) return;

    // 1) Robust Temporal Stepping
    // We target ~120Hz for physics to ensure high-speed collisions don't tunnel
    const targetTimeStep = 1 / 120;
    let accumulator = dt;

    while (accumulator > 0) {
        const h = Math.min(accumulator, targetTimeStep);

        // --- Move Entities ---
        game.player.updatePlayer(h, game.input, game.track);

        for (const b of game.bots) {
            // Only update bots within a reasonable range of the player/camera
            if (Math.abs(b.y - game.player.y) < 2500) {
                b.updateBot(h, game.track, game.level);
            }
        }

        // --- Traffic & Obstacles ---
        game.traffic?.update?.(h, game.track, game.player);
        const trafficCars = game.traffic?.cars || [];

        // --- Collision Pass ---
        const colliders = [game.player, ...game.bots, ...trafficCars];
        resolveCarCollisions(colliders, h, {
            iterations: 8, // Increased for better stack stability
            restitution: 0.12,
            slop: 0.05,
            roadClamp: (c) => c._applyRoadClamp?.(game.track, c.isPlayer ? 10 : 12, 0.98),
        });

        accumulator -= h;
    }

    // 2) Camera with "Look-Ahead"
    // Camera follows player but looks further ahead as speed increases
    const speedLead = game.player.speed * 0.15;
    const targetCam = game.player.y - (game.canvas.height * 0.65) - speedLead;

    // Smooth interpolation (6 * dt might feel sluggish at low FPS, adjusted to 8)
    game.cameraY = lerp(game.cameraY, targetCam, 8 * dt);

    // Clamp camera within track bounds
    const lastPoint = game.track.points[game.track.points.length - 1];
    const minCam = lastPoint.y - game.canvas.height;
    const maxCam = game.track.points[0].y - 40;
    game.cameraY = clamp(game.cameraY, minCam, maxCam);

    // 3) Ranking & HUD Logic
    const racers = [game.player, ...game.bots];
    // Progress calculation based on distance along track path
    racers.sort((a, b) => b.progressDist - a.progressDist);

    const place = racers.indexOf(game.player) + 1;
    const finish = game.track.finishDistance;
    const totalDist = Math.max(1, finish - game.startDist);
    const progPct = clamp(((game.player.progressDist - game.startDist) / totalDist) * 100, 0, 100);

    game.ui.updateHud({
        position: place,
        total: racers.length,
        speed: game.player.speed,
        progressPct: progPct,
        level: game.level,
    });

    // 4) Finish Condition
    if (game.player.progressDist >= finish && !game.isEnding) {
        game.isEnding = true; // Prevent multiple calls
        const finalPlace = racers.indexOf(game.player) + 1;
        game.endLevel(finalPlace);
    }
}