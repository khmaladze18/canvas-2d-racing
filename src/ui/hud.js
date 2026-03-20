import { clamp } from "../utils/math.js";
import { drawMiniMap } from "./hudMinimap.js";
import { getStatusText, setText, updateBoost, updateSpeedDisplay } from "./hudDisplay.js";

export function createHud(refs, opts = {}) {
    const hud = refs?.hud;
    if (!hud?.root) return { showHud() { }, hideHud() { }, updateHud() { } };

    const { smoothSpeed = true, speedLerp = 0.18, speedUnit = "", enableProgressFill = true } = opts;
    const last = { level: null, position: null, total: null, speedText: null, progressPct: null, statusText: null, name: null, visible: false, speedSmoothed: 0, initedSpeed: false, mapTrack: null, mapBounds: null };
    const mapCanvas = hud.map || null;
    const mapCtx = mapCanvas ? mapCanvas.getContext("2d") : null;

    function showHud(playerName, level) {
        if (!last.visible) {
            hud.root.classList.remove("hidden");
            hud.mapRoot?.classList.remove("hidden");
            hud.inventoryRoot?.classList.remove("hidden");
            last.visible = true;
        }
        const safeName = (playerName || "Player").trim() || "Player";
        if (safeName !== last.name) {
            setText(hud.name, safeName);
            last.name = safeName;
        }
        const safeLevel = Number.isFinite(level) ? level : 1;
        if (safeLevel !== last.level) {
            setText(hud.level, safeLevel);
            last.level = safeLevel;
        }
        if (hud.status && last.statusText !== "Push for 1st Place") {
            setText(hud.status, "Push for 1st Place");
            last.statusText = "Push for 1st Place";
        }
    }

    function hideHud() {
        if (!last.visible) return;
        hud.root.classList.add("hidden");
        hud.mapRoot?.classList.add("hidden");
        hud.boostRoot?.classList.add("hidden");
        hud.inventoryRoot?.classList.add("hidden");
        last.visible = false;
    }

    function updateHud(data, total, speed, progressPct, level) {
        const payload = data && typeof data === "object" ? data : { position: data, total, speed, progressPct, level };
        if (Number.isFinite(payload.level) && payload.level !== last.level) {
            setText(hud.level, payload.level);
            last.level = payload.level;
        }
        const safePosition = Number.isFinite(payload.position) ? payload.position : "-";
        if (safePosition !== last.position) {
            setText(hud.pos, safePosition);
            last.position = safePosition;
        }
        const safeTotal = Number.isFinite(payload.total) ? payload.total : "-";
        if (hud.total && safeTotal !== last.total) {
            setText(hud.total, safeTotal);
            last.total = safeTotal;
        }
        const speedText = updateSpeedDisplay(last, payload.speed, smoothSpeed, speedLerp, speedUnit);
        if (speedText !== last.speedText) {
            setText(hud.speed, speedText);
            last.speedText = speedText;
        }
        const pct = Number.isFinite(payload.progressPct) ? Math.round(clamp(payload.progressPct, 0, 100)) : 0;
        if (pct !== last.progressPct) {
            setText(hud.prog, `${pct}%`);
            last.progressPct = pct;
            if (enableProgressFill && hud.progFill) hud.progFill.style.width = `${pct}%`;
        }
        const statusText = getStatusText(Number.isFinite(payload.position) ? payload.position : null);
        if (hud.status && statusText !== last.statusText) {
            setText(hud.status, statusText);
            last.statusText = statusText;
        }
        updateBoost(hud, clamp(payload.manualBoostPct || 0, 0, 1), Math.max(0, payload.manualBoostTime || 0));
        if (hud.inventoryCount) setText(hud.inventoryCount, Math.max(0, payload.boostInventory || 0));
        drawMiniMap(mapCanvas, mapCtx, last, payload.track, payload.racers, payload.player);
    }

    return { showHud, hideHud, updateHud };
}
