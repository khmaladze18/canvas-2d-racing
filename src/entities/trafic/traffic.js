// src/entities/traffic/traffic.js
import { Car } from "../Car.js";
import { clamp } from "../../utils/math.js";

const LEFT_LANES = [-0.48, -0.24];
const RIGHT_LANES = [0.24, 0.48];

function pick(arr) {
    return arr[(Math.random() * arr.length) | 0];
}
function randGrey() {
    return pick(["#9ca3af", "#a1a1aa", "#b0b6bf", "#8b949e", "#c0c4cc", "#9aa3ad"]);
}

function gatePair(baseIdx) {
    const leftIdx = baseIdx + 8 + ((Math.random() * 8) | 0);
    const rightIdx = baseIdx - 6 - ((Math.random() * 8) | 0);
    return { leftIdx, rightIdx };
}

export function createTrafficManager(game) {
    return {
        cars: [],

        // 🚀 MUCH MORE TRAFFIC
        baseMaxTraffic: 22,       // was 14
        spawnAheadIdx: 80,        // closer to player
        spawnJitterIdx: 120,
        despawnBehindIdx: 140,

        // tighter spacing
        minGapIdx: 12,
        minGapBotIdx: 20,

        reset() {
            this.cars.length = 0;
        },

        update(dt, track, player) {
            if (!track || !player) return;

            const lvl = game.level || 1;

            // scales aggressively
            const maxTraffic = clamp(
                this.baseMaxTraffic + (lvl - 1) * 3,
                22,
                40
            );

            // spawn more per frame
            let attempts = 0;
            while (this.cars.length < maxTraffic && attempts++ < 40) {
                this._spawnGate(track, player);
            }

            for (const c of this.cars) c.updateTraffic(dt, track);

            // despawn behind
            const pIdx = player.trackIdxHint | 0;
            const minIdx = pIdx - this.despawnBehindIdx;

            for (let i = this.cars.length - 1; i >= 0; i--) {
                if ((this.cars[i].trackIdxHint | 0) < minIdx) {
                    this.cars.splice(i, 1);
                }
            }
        },

        _spawnGate(track, player) {
            const pIdx = player.trackIdxHint | 0;

            const baseIdx = clamp(
                pIdx + this.spawnAheadIdx + ((Math.random() * this.spawnJitterIdx) | 0),
                0,
                track.points.length - 3
            );

            const { leftIdx, rightIdx } = gatePair(baseIdx);

            const okL = this._canSpawnAt(leftIdx);
            const okR = this._canSpawnAt(rightIdx);

            if (!okL && !okR) return false;

            for (const b of game.bots || []) {
                const bi = b.trackIdxHint | 0;
                if (okL && Math.abs(bi - leftIdx) < this.minGapBotIdx) return false;
                if (okR && Math.abs(bi - rightIdx) < this.minGapBotIdx) return false;
            }

            if (okL) this.cars.push(this._spawnOne(track, leftIdx, "L"));
            if (okR) this.cars.push(this._spawnOne(track, rightIdx, "R"));

            return true;
        },

        _canSpawnAt(idx) {
            for (const t of this.cars) {
                const ti = t.trackIdxHint | 0;
                if (Math.abs(ti - idx) < this.minGapIdx) return false;
            }
            return true;
        },

        _spawnOne(track, idx, side) {
            idx = clamp(idx, 0, track.points.length - 3);

            const p = track.pointAtIndex(idx);
            const n = track.normalAtIndex(idx);

            const laneFrac = side === "L" ? pick(LEFT_LANES) : pick(RIGHT_LANES);
            const off = laneFrac * track.roadHalfWidth * 0.85;

            const x = p.x + n.x * off;
            const y = p.y + n.y * off;

            const traffic = new Car({
                name: "Traffic",
                color: randGrey(),
                x,
                y,
                isPlayer: false,
                level: track.level,
                model: "kart",
            });

            traffic.isTraffic = true;
            traffic.renderScale = 1.2;

            // slower than player but still real speed
            traffic.maxSpeed = 230 + Math.random() * 80;
            traffic.accel = 380 + Math.random() * 100;

            traffic.turnRate = 2.0;
            traffic.drag = 2.6;
            traffic.grip = 9.5;

            traffic.angle = -Math.PI / 2;

            const fx = Math.cos(traffic.angle);
            const fy = Math.sin(traffic.angle);
            const v0 = traffic.maxSpeed * 0.6;

            traffic.vx = fx * v0;
            traffic.vy = fy * v0;

            traffic.trackIdxHint = idx;
            traffic.progressDist = idx * track.segmentLen;

            return traffic;
        },
    };
}
