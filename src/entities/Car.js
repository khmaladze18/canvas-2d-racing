import { clamp, lerp, normalizeAngle } from "../utils/math.js";
import { drawCar } from "../render/carRenderer.js";

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
        this.angle = -Math.PI / 2; // facing up
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

        // AI lane offset (for bots)
        this.laneOffset = 0;
    }

    updatePlayer(dt, input, track) {
        const forward = input.up ? 1 : 0;
        const backward = input.down ? 1 : 0;

        if (forward) this.speed += this.accel * dt;
        else this.speed -= 420 * dt; // natural drag
        if (backward) this.speed -= this.brake * dt;

        this.speed = clamp(this.speed, 0, this.maxSpeed);

        const steer = (input.left ? -1 : 0) + (input.right ? 1 : 0);
        const steerStrength = this.turnRate * (0.35 + (this.speed / this.maxSpeed) * 0.65);
        this.angle += steer * steerStrength * dt;

        this.vx = Math.cos(this.angle) * this.speed;
        this.vy = Math.sin(this.angle) * this.speed;

        this.x += this.vx * dt;
        this.y += this.vy * dt;

        // keep car inside road corridor
        const clampRes = track.clampToRoad(this.x, this.y, this.trackIdxHint, 10);
        this.trackIdxHint = clampRes.idx;

        if (clampRes.clamped) {
            // apply corrected position
            this.x = clampRes.x;
            this.y = clampRes.y;

            // remove sideways velocity component so it doesn't keep sliding out
            const sideV = this.vx * clampRes.nx + this.vy * clampRes.ny;
            this.vx -= clampRes.nx * sideV;
            this.vy -= clampRes.ny * sideV;

            // small speed penalty (feels like grass/curb)
            this.speed *= 0.985;
        }

        this.progressDist = track.distanceAtIndex(this.trackIdxHint);
    }

    updateBot(dt, track, level) {
        const lookAhead = 22 + level * 1.2;
        const targetIdx = clamp(Math.floor(this.trackIdxHint + lookAhead), 0, track.points.length - 1);
        const p = track.pointAtIndex(targetIdx);

        const p2 = track.pointAtIndex(Math.min(targetIdx + 2, track.points.length - 1));
        const dx = p2.x - p.x;
        const dy = p2.y - p.y;
        const len = Math.hypot(dx, dy) || 1;
        const nx = -dy / len;
        const ny = dx / len;

        const tx = p.x + nx * this.laneOffset;
        const ty = p.y + ny * this.laneOffset;

        const angToTarget = Math.atan2(ty - this.y, tx - this.x);

        let delta = normalizeAngle(angToTarget - this.angle);
        const maxTurn = this.turnRate * dt;
        delta = clamp(delta, -maxTurn, maxTurn);
        this.angle += delta;

        const targetSpeed = clamp(this.maxSpeed * (0.82 + Math.random() * 0.04), 0, this.maxSpeed);
        this.speed = lerp(this.speed, targetSpeed, 0.9 * dt);

        this.vx = Math.cos(this.angle) * this.speed;
        this.vy = Math.sin(this.angle) * this.speed;
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        const clampRes = track.clampToRoad(this.x, this.y, this.trackIdxHint, 12);
        this.trackIdxHint = clampRes.idx;

        if (clampRes.clamped) {
            this.x = clampRes.x;
            this.y = clampRes.y;

            const sideV = this.vx * clampRes.nx + this.vy * clampRes.ny;
            this.vx -= clampRes.nx * sideV;
            this.vy -= clampRes.ny * sideV;

            this.speed *= 0.992;
        }

        this.progressDist = track.distanceAtIndex(this.trackIdxHint);
    }

    draw(ctx, cameraY) {
        drawCar(ctx, this, cameraY);
    }
}
