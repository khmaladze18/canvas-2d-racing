import { clamp, lerp } from "../../../utils/math.js";

function getLevelCurve(level) {
    const levelIndex = Math.max(0, (level | 0) - 1);
    return 1 - Math.exp(-levelIndex * 0.18);
}

export function getBotDifficulty(level, botIndex = 0, botCount = 1) {
    const curve = getLevelCurve(level);
    const slot01 = botCount <= 1 ? 0.5 : clamp(botIndex / (botCount - 1), 0, 1);
    const packVariance = lerp(-0.018, 0.022, slot01);

    return {
        curve,
        speedBonus: 0.03 + curve * 0.12 + packVariance,
        accelBonus: 0.015 + curve * 0.1,
        turnBonus: 0.01 + curve * 0.08,
        gripBonus: curve * 0.07,
        stabilityBonus: curve * 0.07,
        targetPace: 0.77 + curve * 0.12 + packVariance * 0.55,
        curveDiscipline: 0.36 - curve * 0.08,
        lookAheadBonus: 2 + curve * 10,
        recoverySpeed: 0.54 + curve * 0.12,
        recoveryThreshold: 1.12 - curve * 0.18,
    };
}

export function applyBotDifficulty(car, level, botIndex, botCount) {
    const diff = getBotDifficulty(level, botIndex, botCount);
    car.botDifficulty = diff;
    car.baseMaxSpeed *= 1 + diff.speedBonus;
    car.maxSpeed = car.baseMaxSpeed;
    car.accel *= 1 + diff.accelBonus;
    car.turnRate *= 1 + diff.turnBonus;
    car.grip *= 1 + diff.gripBonus;
    car.stability *= 1 + diff.stabilityBonus;
}
