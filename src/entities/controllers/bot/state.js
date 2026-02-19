// src/entities/controllers/bot/botAIState.js
export function getBotAI(car) {
    return (car._ai ||= {
        t: 0,
        speedNoise: 0.5,
        stuckTime: 0,
        lastProgressIdx: 0,
        _centerDist: 0,
    });
}
