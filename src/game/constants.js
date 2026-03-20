// -----------------------------
// Game States
// -----------------------------

export const STATES = Object.freeze({
    LOGIN: "LOGIN",
    CAR_SELECT: "CAR_SELECT",
    RACE: "RACE",
    RESULT: "RESULT",
    GAME_OVER: "GAME_OVER",
});

// -----------------------------
// Race Setup
// -----------------------------

export const RACE_CONFIG = Object.freeze({
    SPAWN_INDEX: 80,
    BOT_COUNT: 5,
});

// -----------------------------
// Track Grid (must match Track drawing logic)
// -----------------------------

export const GRID = Object.freeze({
    laneX: 30,
    rowY: 52,
    slotW: 28,
    slotH: 48,
});

// -----------------------------
// Bot Visual Configuration
// -----------------------------

export const BOT_CONFIG = Object.freeze({
    COLORS: ["#ff3b3b", "#2d7dff", "#ffd400", "#00d47a", "#f97316"],
});
