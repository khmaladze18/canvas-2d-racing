import { clamp } from "../utils/math.js";

export function createHud(refs, opts = {}) {
    const hud = refs?.hud;
    if (!hud?.root) {
        // Fail safe in case HUD is missing in some screens
        return { showHud() { }, hideHud() { }, updateHud() { } };
    }

    const {
        smoothSpeed = true,
        speedLerp = 0.18,         // 0..1 per update (simple smoothing)
        speedUnit = "",           // "km/h" if you want
        enableProgressFill = true // if hud.progFill exists
    } = opts;

    // Cache last values to avoid DOM spam
    const last = {
        level: null,
        position: null,
        total: null,
        speedText: null,
        progressPct: null,
        name: null,
        visible: false,

        // smoothing state
        speedSmoothed: 0,
        initedSpeed: false,
    };

    function setText(el, value) {
        if (!el) return false;
        const s = String(value);
        if (el.textContent !== s) {
            el.textContent = s;
            return true;
        }
        return false;
    }

    function showHud(playerName, level) {
        if (!last.visible) {
            hud.root.classList.remove("hidden");
            last.visible = true;
        }

        const name = (playerName || "Player").trim() || "Player";
        if (name !== last.name) {
            setText(hud.name, name);
            last.name = name;
        }

        const lvl = Number.isFinite(level) ? level : 1;
        if (lvl !== last.level) {
            setText(hud.level, lvl);
            last.level = lvl;
        }
    }

    function hideHud() {
        if (!last.visible) return;
        hud.root.classList.add("hidden");
        last.visible = false;
    }

    /**
     * Update HUD values.
     * Accepts either an object {position,total,speed,progressPct,level}
     * or positional args for lower overhead: (position,total,speed,progressPct,level)
     */
    function updateHud(a, total, speed, progressPct, level) {
        // Support both call styles
        let position;
        if (a && typeof a === "object") {
            position = a.position;
            total = a.total;
            speed = a.speed;
            progressPct = a.progressPct;
            level = a.level;
        } else {
            position = a;
        }

        // Collect DOM writes, then apply (minor but helps)
        // Level
        if (Number.isFinite(level) && level !== last.level) {
            setText(hud.level, level);
            last.level = level;
        }

        // Position
        const pos = Number.isFinite(position) ? position : "-";
        if (pos !== last.position) {
            setText(hud.pos, pos);
            last.position = pos;
        }

        // Total
        if (hud.total) {
            const tot = Number.isFinite(total) ? total : "-";
            if (tot !== last.total) {
                setText(hud.total, tot);
                last.total = tot;
            }
        }

        // Speed (optionally smoothed)
        let spd = Number.isFinite(speed) ? Math.max(0, speed) : 0;

        if (smoothSpeed) {
            if (!last.initedSpeed) {
                last.speedSmoothed = spd;
                last.initedSpeed = true;
            } else {
                last.speedSmoothed += (spd - last.speedSmoothed) * clamp(speedLerp, 0, 1);
            }
            spd = last.speedSmoothed;
        }

        const spdInt = Math.round(spd);
        const spdText = speedUnit ? `${spdInt} ${speedUnit}` : String(spdInt);
        if (spdText !== last.speedText) {
            setText(hud.speed, spdText);
            last.speedText = spdText;
        }

        // Progress %
        const pct = Number.isFinite(progressPct) ? Math.round(clamp(progressPct, 0, 100)) : 0;
        if (pct !== last.progressPct) {
            setText(hud.prog, `${pct}%`);
            last.progressPct = pct;

            // Optional progress fill bar
            if (enableProgressFill && hud.progFill) {
                hud.progFill.style.width = `${pct}%`;
            }
        }
    }

    return { showHud, hideHud, updateHud };
}
