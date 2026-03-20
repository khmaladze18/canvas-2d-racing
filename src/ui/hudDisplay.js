import { clamp } from "../utils/math.js";

export function setText(el, value) {
    if (!el) return false;
    const next = String(value);
    if (el.textContent === next) return false;
    el.textContent = next;
    return true;
}

export function getStatusText(position) {
    if (position === 1) return "Leading the race";
    if (position === 2) return "Hunting the leader";
    if (position === 3) return "Podium pressure";
    return "Fight through traffic";
}

export function updateBoost(hud, boostPct, boostTime) {
    if (!hud.boostRoot || !hud.boostFill || !hud.boostTime) return;
    if (boostPct > 0) {
        hud.boostRoot.classList.remove("hidden");
        hud.boostFill.style.width = `${Math.round(boostPct * 100)}%`;
        setText(hud.boostTime, `${boostTime.toFixed(1)}s`);
        return;
    }
    hud.boostRoot.classList.add("hidden");
    hud.boostFill.style.width = "0%";
    setText(hud.boostTime, "0.0s");
}

export function updateSpeedDisplay(last, speed, smoothSpeed, speedLerp, speedUnit) {
    let displaySpeed = Number.isFinite(speed) ? Math.max(0, speed) : 0;
    if (smoothSpeed) {
        if (!last.initedSpeed) {
            last.speedSmoothed = displaySpeed;
            last.initedSpeed = true;
        } else {
            last.speedSmoothed += (displaySpeed - last.speedSmoothed) * clamp(speedLerp, 0, 1);
        }
        displaySpeed = last.speedSmoothed;
    }
    return speedUnit ? `${Math.round(displaySpeed)} ${speedUnit}` : String(Math.round(displaySpeed));
}
