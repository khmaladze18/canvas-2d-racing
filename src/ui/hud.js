import { clamp } from "../utils/math.js";

export function createHud(refs) {
    // Cache last values to avoid DOM spam (updateHud can run every frame)
    const last = {
        level: null,
        position: null,
        total: null,
        speed: null,
        progressPct: null,
        name: null,
        visible: false,
    };

    function showHud(playerName, level) {
        if (!last.visible) {
            refs.hud.root.classList.remove("hidden");
            last.visible = true;
        }

        const name = (playerName || "Player").trim() || "Player";
        if (name !== last.name) {
            refs.hud.name.textContent = name;
            last.name = name;
        }

        const lvl = typeof level === "number" ? level : 1;
        if (lvl !== last.level) {
            refs.hud.level.textContent = String(lvl);
            last.level = lvl;
        }
    }

    function hideHud() {
        if (!last.visible) return;
        refs.hud.root.classList.add("hidden");
        last.visible = false;
    }

    function updateHud({ position, total, speed, progressPct, level }) {
        // Level (optional)
        if (typeof level === "number" && level !== last.level) {
            refs.hud.level.textContent = String(level);
            last.level = level;
        }

        // Position
        const pos = Number.isFinite(position) ? position : "-";
        if (pos !== last.position) {
            refs.hud.pos.textContent = String(pos);
            last.position = pos;
        }

        // Total (optional but recommended)
        if (refs.hud.total) {
            const tot = Number.isFinite(total) ? total : "-";
            if (tot !== last.total) {
                refs.hud.total.textContent = String(tot);
                last.total = tot;
            }
        }

        // Speed
        const spd = Number.isFinite(speed) ? Math.max(0, Math.round(speed)) : 0;
        if (spd !== last.speed) {
            refs.hud.speed.textContent = String(spd);
            last.speed = spd;
        }

        // Progress %
        const pct = Number.isFinite(progressPct)
            ? Math.round(clamp(progressPct, 0, 100))
            : 0;

        if (pct !== last.progressPct) {
            refs.hud.prog.textContent = `${pct}%`;
            last.progressPct = pct;
        }
    }

    return { showHud, hideHud, updateHud };
}
