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

        // feel / physics knobs
        this.drag = isPlayer ? 520 : 460; // natural slowdown when not accelerating
        this.grip = isPlayer ? 10.5 : 9.0; // higher = less sideways drift

        // AI lane offset (for bots)
        this.laneOffset = 0;

        // AI state to avoid per-frame randomness jitter
        this._ai = {
            speedNoise: 0, // smoothed noise value
            speedNoiseT: Math.random() * 1000,
        };
    }

    // --- Helpers -------------------------------------------------------------

    _applySteering(dt, steerInput) {
        // Speed-sensitive steering: weaker at very low speed, strongest mid speed, slightly reduced at top speed
        const v = this.maxSpeed > 0 ? this.speed / this.maxSpeed : 0;
        const steerScale = 0.25 + 0.85 * Math.sqrt(clamp(v, 0, 1)); // smooth ramp
        const maxYaw = this.turnRate * steerScale;
        this.angle += steerInput * maxYaw * dt;
    }

    _integrateForward(dt) {
        this.vx = Math.cos(this.angle) * this.speed;
        this.vy = Math.sin(this.angle) * this.speed;
        this.x += this.vx * dt;
        this.y += this.vy * dt;
    }

    _applyRoadClamp(track, radius = 10, speedPenalty = 0.985) {
        const clampRes = track.clampToRoad(this.x, this.y, this.trackIdxHint, radius);
        this.trackIdxHint = clampRes.idx;

        if (!clampRes.clamped) return;

        // corrected position
        this.x = clampRes.x;
        this.y = clampRes.y;

        // remove velocity component pushing outward (prevents sticky edge sliding)
        const sideV = this.vx * clampRes.nx + this.vy * clampRes.ny;
        this.vx -= clampRes.nx * sideV;
        this.vy -= clampRes.ny * sideV;

        // project velocity back to "car speed" so internal state stays consistent
        this.speed = Math.hypot(this.vx, this.vy);

        // small penalty (curb/grass)
        this.speed *= speedPenalty;
    }

    _updateProgress(track) {
        this.progressDist = track.distanceAtIndex(this.trackIdxHint);
    }

    // --- Player --------------------------------------------------------------

    updatePlayer(dt, input, track) {
        const up = input.up ? 1 : 0;
        const down = input.down ? 1 : 0;

        // throttle/brake
        if (up) this.speed += this.accel * dt;
        else this.speed -= this.drag * dt;

        if (down) this.speed -= this.brake * dt;

        this.speed = clamp(this.speed, 0, this.maxSpeed);

        // steering
        const steer = (input.left ? -1 : 0) + (input.right ? 1 : 0);
        this._applySteering(dt, steer);

        // integrate
        this._integrateForward(dt);

        // clamp to road + edge behavior
        this._applyRoadClamp(track, 10, 0.985);

        // final progress
        this._updateProgress(track);
    }

    // --- Bot -----------------------------------------------------------------

    updateBot(dt, track, level) {
        // dynamic lookahead: more when fast, a bit more at higher level
        const v = this.maxSpeed > 0 ? this.speed / this.maxSpeed : 0;
        const lookAhead = 18 + 18 * v + level * 1.2;

        const targetIdx = clamp(
            Math.floor(this.trackIdxHint + lookAhead),
            0,
            track.points.length - 1
        );

        const p = track.pointAtIndex(targetIdx);
        const p2 = track.pointAtIndex(Math.min(targetIdx + 2, track.points.length - 1));

        // approximate road normal from forward tangent
        const dx = p2.x - p.x;
        const dy = p2.y - p.y;
        const len = Math.hypot(dx, dy) || 1;
        const nx = -dy / len;
        const ny = dx / len;

        // lane offset target point
        const tx = p.x + nx * this.laneOffset;
        const ty = p.y + ny * this.laneOffset;

        // steer towards target
        const angToTarget = Math.atan2(ty - this.y, tx - this.x);
        let delta = normalizeAngle(angToTarget - this.angle);

        // limit turning per frame
        const maxTurn = this.turnRate * dt;
        delta = clamp(delta, -maxTurn, maxTurn);
        this.angle += delta;

        // speed target: remove per-frame random jitter, use smoothed noise
        // (simple cheap noise: sine + smooth lerp)
        this._ai.speedNoiseT += dt * (0.8 + level * 0.08);
        const rawNoise = Math.sin(this._ai.speedNoiseT) * 0.5 + 0.5; // 0..1
        this._ai.speedNoise = lerp(this._ai.speedNoise, rawNoise, 2.5 * dt);

        const base = 0.82 + this._ai.speedNoise * 0.06; // 0.82..0.88
        const targetSpeed = clamp(this.maxSpeed * base, 0, this.maxSpeed);

        // smooth to target speed
        this.speed = lerp(this.speed, targetSpeed, 1.4 * dt);

        // integrate
        this._integrateForward(dt);

        // clamp to road
        this._applyRoadClamp(track, 12, 0.992);

        // progress
        this._updateProgress(track);
    }

    // --- Render --------------------------------------------------------------

    draw(ctx, cameraY) {
        drawCar(ctx, this, cameraY);
    }
}
