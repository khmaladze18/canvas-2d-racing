// src/entities/controllers/BotController.js
import { updateBotCar as _updateBotCar } from "./bot/pipeline.js";

export function updateBotCar(car, dt, track, level) {
    return _updateBotCar(car, dt, track, level);
}
