import { Track } from "../track/Track.js";
import { Car } from "../entities/index.js";
import { GRID, RACE_CONFIG, BOT_CONFIG } from "./constants.js";

// Small deterministic PRNG so level starts are consistent (no jittery randomness)
function mulberry32(seed) {
    let t = seed >>> 0;
    return function () {
        t += 0x6D2B79F5;
        let r = Math.imul(t ^ (t >>> 15), 1 | t);
        r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
        return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
}

function pickModel(rng) {
    const list = ["kart", "f1", "rally"];
    return list[Math.floor(rng() * list.length)];
}

function getTrackBasis(track, idx) {
    const pA = track.pointAtIndex(idx);
    const pB = track.pointAtIndex(Math.min(idx + 2, track.points.length - 1));

    const dx = pB.x - pA.x;
    const dy = pB.y - pA.y;
    const len = Math.hypot(dx, dy) || 1;

    // tangent (forward)
    const tx = dx / len;
    const ty = dy / len;

    // normal (left/right)
    const nx = -ty;
    const ny = tx;

    const angle = Math.atan2(ty, tx);

    return { pA, tx, ty, nx, ny, angle };
}

function buildGridSlots(botCount, laneX, rowY) {
    // 2 lanes: left (-laneX), right (+laneX)
    // slots: player at front-left by design, bots fill remaining
    const lanes = [-laneX, laneX];

    const slots = [];
    for (let i = 0; i < botCount + 1; i++) {
        // i=0 reserved for player
        const row = Math.floor(i / 2);
        const lane = i % 2;
        slots.push({ row, laneOff: lanes[lane], zOff: row * rowY });
    }
    return slots;
}

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

    // deterministic RNG per (level + bestLevel-ish + name length)
    // keeps starts stable across refreshes while still changing each level
    const seed =
        (level * 10007) ^
        ((game.playerName?.length || 1) * 2654435761) ^
        0x9E3779B9;
    const rng = mulberry32(seed);

    const { pA, nx, ny, angle } = getTrackBasis(game.track, spawnIndex);

    const slots = buildGridSlots(RACE_CONFIG.BOT_COUNT, GRID.laneX, GRID.rowY);

    // --- Player (slot 0) ---
    const playerSlot = slots[0];

    // If you want player model to persist, prefer game.playerModel
    const playerModel = game.playerModel || pickModel(rng);

    game.player = new Car({
        name: game.playerName,
        color: game.playerColor,
        model: playerModel,
        x: pA.x + nx * playerSlot.laneOff,
        y: pA.y + ny * playerSlot.laneOff + playerSlot.zOff,
        isPlayer: true,
        level: game.level,
    });

    // face along track direction at spawn
    game.player.angle = angle;

    game.player.trackIdxHint = spawnIndex;
    game.player.progressDist = game.track.distanceAtIndex(spawnIndex);
    game.startDist = game.player.progressDist;

    // --- Bots ---
    game.bots = [];

    for (let i = 0; i < RACE_CONFIG.BOT_COUNT; i++) {
        const slot = slots[i + 1];
        const color = BOT_CONFIG.COLORS[i % BOT_CONFIG.COLORS.length];

        const bot = new Car({
            name: `Bot ${i + 1}`,
            color,
            model: pickModel(rng),
            x: pA.x + nx * slot.laneOff,
            y: pA.y + ny * slot.laneOff + slot.zOff,
            isPlayer: false,
            level: game.level,
        });

        bot.angle = angle;

        // AI tries to stay roughly in its lane
        bot.laneOffset = slot.laneOff * 0.85;

        bot.trackIdxHint = spawnIndex;

        // slightly stagger bot progress so they don't overlap perfectly
        bot.progressDist =
            game.track.distanceAtIndex(spawnIndex) - (slot.zOff * 0.35 + i * 2);

        // Difficulty scaling: small predictable bump only (avoid double-scaling chaos)
        // Car constructor already scales maxSpeed by level; we add a tiny per-bot personality
        bot.maxSpeed *= 1 + (level * 0.01 + i * 0.006);

        game.bots.push(bot);
    }

    game.all = [game.player, ...game.bots];

    // camera start
    game.cameraY = game.player.y - game.canvas.height / 2;

    // UI + state
    game.ui.hideOverlay();
    game.ui.showHud(game.playerName, game.level);
    game.state = "RACE";
}
