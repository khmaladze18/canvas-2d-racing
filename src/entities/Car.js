// src/entities/Car.js
import { drawCar } from "../render/carRenderer.js";
import {
    applyCarStateDefaults,
    applyCarTuning,
    getCarRadius,
    getCollisionBox,
    getCollisionProfile,
    getCollisionRadius,
} from "./carConfig.js";
import { updateBotCar } from "./controllers/BotController.js";
import { updatePlayerCar } from "./controllers/PlayerController.js";
import { capSpeed, clampToRoad, syncForward } from "./systems/carPhysics.js";
import { updateTrafficCar } from "./controllers/TrafficController.js";

export class Car {
    constructor({ name, color, x, y, isPlayer, level, model = "sedan" }) {
        this.name = name;
        this.color = color;
        this.model = model;

        this.x = x;
        this.y = y;

        this.isPlayer = isPlayer;

        // motion
        this.vx = 0;
        this.vy = 0;

        // heading
        this.angle = -Math.PI / 2;
        this.fx = 0;
        this.fy = -1;
        syncForward(this);

        // derived/cached
        this.speed = 0;

        // progress tracking
        this.trackIdxHint = 0;
        this.progressDist = 0;
        applyCarTuning(this, { isPlayer, level, model: this.model });
        applyCarStateDefaults(this);
    }

    getRadius() {
        return getCarRadius(this.model);
    }

    getCollisionRadius() {
        return getCollisionRadius(this.model);
    }

    getCollisionProfile() {
        return getCollisionProfile(this.model);
    }

    getCollisionBox() {
        return getCollisionBox(this.model);
    }

    updatePlayer(dt, input, track) {
        updatePlayerCar(this, dt, input, track);
    }

    updateBot(dt, track, level) {
        updateBotCar(this, dt, track, level);
    }

    draw(ctx, cameraX, cameraY) {
        drawCar(ctx, this, cameraX, cameraY);
    }

    updateTraffic(dt, track) {
        updateTrafficCar(this, dt, track);
    }

    _capSpeed() {
        capSpeed(this);
    }

    _applyRoadClamp(track, radius, speedPenalty) {
        clampToRoad(this, track, radius, speedPenalty);
    }
}
