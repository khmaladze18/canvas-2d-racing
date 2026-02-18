import { Track } from "../track/Track.js";
import { Car } from "../entities/index.js";
import { BOT_COLORS, BOT_COUNT, GRID, SPAWN_INDEX } from "./constants.js";

function randomModel() {
    const list = ["kart", "f1", "rally"];
    return list[Math.floor(Math.random() * list.length)];
}

export function startLevel(game, level) {
    game.level = level;
    game.bestLevel = Math.max(game.bestLevel, level);

    game.track = new Track({
        width: game.canvas.width,
        height: game.canvas.height,
        level: game.level
    });

    // If you added setStartGrid in Track, keep it (safe even if missing)
    if (typeof game.track.setStartGrid === "function") {
        game.track.setStartGrid(SPAWN_INDEX);
    }

    const spawnIndex = SPAWN_INDEX;
    const pA = game.track.pointAtIndex(spawnIndex);
    const pB = game.track.pointAtIndex(spawnIndex + 2);

    const dx = pB.x - pA.x;
    const dy = pB.y - pA.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;

    const laneOffsets = [-GRID.laneX, GRID.laneX];

    // Player: front-left
    game.player = new Car({
        name: game.playerName,
        color: game.playerColor,
        model: randomModel(),          // ✅ ADD THIS
        x: pA.x + nx * laneOffsets[0],
        y: pA.y + ny * laneOffsets[0] + 0 * GRID.rowY,
        isPlayer: true,
        level: game.level
    });

    game.player.trackIdxHint = spawnIndex;
    game.player.progressDist = game.track.distanceAtIndex(spawnIndex);
    game.startDist = game.player.progressDist;

    // Bots
    game.bots = [];
    for (let i = 0; i < BOT_COUNT; i++) {
        const slot = i + 1;
        const row = Math.floor(slot / 2);
        const lane = slot % 2;
        const laneOff = laneOffsets[lane];

        const bot = new Car({
            name: `Bot ${i + 1}`,
            color: BOT_COLORS[i % BOT_COLORS.length],
            model: randomModel(),          // ✅ ADD THIS
            x: pA.x + nx * laneOff,
            y: pA.y + ny * laneOff + row * GRID.rowY,
            isPlayer: false,
            level: game.level
        });

        bot.laneOffset = laneOff * 0.85;
        bot.trackIdxHint = spawnIndex;
        bot.progressDist = game.track.distanceAtIndex(spawnIndex) - (row * 8 + 2);
        bot.maxSpeed += game.level * 24 + i * 4;

        game.bots.push(bot);
    }

    game.all = [game.player, ...game.bots];

    game.cameraY = game.player.y - game.canvas.height / 2;

    game.ui.hideOverlay();
    game.ui.showHud(game.playerName, game.level);
    game.state = "RACE";
}
