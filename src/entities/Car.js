// src/entities/Car.js
import { drawCar } from "../render/carRenderer.js";
import { updateBotCar } from "./controllers/BotController.js";
import { updatePlayerCar } from "./controllers/PlayerController.js";
import { syncForward } from "./systems/carPhysics.js";
import { updateTrafficCar } from "./controllers/TrafficController.js";

export class Car {
    constructor({ name, color, x, y, isPlayer, level, model = "kart" }) {
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

        // tuning
        const baseMax = isPlayer ? 420 : 380;
        this.maxSpeed = baseMax + level * (isPlayer ? 10 : 18);

        this.accel = isPlayer ? 680 : 620;
        this.brake = isPlayer ? 840 : 700;
        this.turnRate = isPlayer ? 3.2 : 2.7;

        this.drag = isPlayer ? 2.6 : 2.3;
        this.roll = isPlayer ? 110 : 95;
        this.grip = isPlayer ? 10.5 : 9.0;

        // AI state
        this.laneOffset = 0;
        this._ai = { speedNoise: 0, t: Math.random() * 1000 };
    }

    getRadius() {
        return this.model === "kart" ? 10 : 12;
    }

    updatePlayer(dt, input, track) {
        updatePlayerCar(this, dt, input, track);
    }

    updateBot(dt, track, level) {
        updateBotCar(this, dt, track, level);
    }

    draw(ctx, cameraY) {
        drawCar(ctx, this, cameraY);
    }

    updateTraffic(dt, track) {
        updateTrafficCar(this, dt, track);
    }

}
