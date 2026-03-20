import { Track } from "../track/Track.js";
import { Car } from "../entities/index.js";
import { syncForward } from "../entities/systems/carPhysics.js";
import { applyBotDifficulty } from "../entities/controllers/bot/difficulty.js";
import { GRID, RACE_CONFIG, BOT_CONFIG } from "./constants.js";
import { buildGridSlots, getSpawnPosition, getTrackBasis } from "./levelSpawns.js";

export function startLevel(game, level) {
    game.level = level;
    game.bestLevel = Math.max(game.bestLevel, level);

    game.track = new Track({
        width: game.canvas.width,
        height: game.canvas.height,
        level: game.level,
    });

    if (typeof game.track.setStartGrid === "function") {
        game.track.setStartGrid(RACE_CONFIG.SPAWN_INDEX);
    }

    const spawnIndex = RACE_CONFIG.SPAWN_INDEX;
    const basis = getTrackBasis(game.track, spawnIndex);
    const slots = buildGridSlots(RACE_CONFIG.BOT_COUNT, GRID.laneX, GRID.rowY);
    const playerSpawn = getSpawnPosition(basis, slots[0]);

    game.player = new Car({
        name: game.playerName,
        color: game.playerColor,
        model: "f1",
        x: playerSpawn.x,
        y: playerSpawn.y,
        isPlayer: true,
        level: game.level,
    });

    game.player.angle = basis.angle;
    syncForward(game.player);
    game.player.trackIdxHint = spawnIndex;
    game.player.progressDist = game.track.distanceAtIndex(spawnIndex);
    game.player._lastTrackIdx = spawnIndex;
    game.startDist = game.player.progressDist;
    game.bots = [];

    for (let i = 0; i < RACE_CONFIG.BOT_COUNT; i++) {
        const slot = slots[i + 1];
        const color = BOT_CONFIG.COLORS[i % BOT_CONFIG.COLORS.length];
        const rowDepthBias = Math.floor((i + 1) / 2) * 3;
        const botSpawn = getSpawnPosition(basis, slot);

        const bot = new Car({
            name: `Bot ${i + 1}`,
            color,
            model: "f1",
            x: botSpawn.x,
            y: botSpawn.y,
            isPlayer: false,
            level: game.level,
        });

        bot.angle = basis.angle;
        syncForward(bot);
        bot.laneOffset = slot.laneOff * 0.85;
        bot.trackIdxHint = spawnIndex;
        bot.progressDist = game.track.distanceAtIndex(spawnIndex) - (slot.zOff + rowDepthBias);
        bot._lastTrackIdx = spawnIndex;
        applyBotDifficulty(bot, level, i, RACE_CONFIG.BOT_COUNT);
        game.bots.push(bot);
    }

    game.all = [game.player, ...game.bots];
    game.cameraX = game.player.x - game.canvas.width / 2;
    game.cameraY = game.player.y - game.canvas.height / 2;
    game.ui.hideOverlay();
    game.ui.showHud(game.playerName, game.level);
    game.state = "RACE";
}
