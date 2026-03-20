import { syncForward, updateProgress } from "../systems/carPhysics.js";
import { clamp1 } from "./trafficHelpers.js";

export function applyTrafficRecovery(car, track, state, halfRoadWidth) {
    state.recT = 0.75;
    state.stuckT = 0;
    state.clampHits = 0;

    const idx = car.trackIdxHint | 0;
    const point = track.pointAtIndex(idx);
    const normal = track.normalAtIndex(idx);
    const tangent = track.tangentAtIndex(idx);
    const angle = Math.atan2(tangent.y, tangent.x);
    const laneFrac = clamp1(state.laneFrac, -0.55, 0.55);
    const laneOffset = laneFrac * halfRoadWidth * 0.72;

    car.x = point.x + normal.x * laneOffset;
    car.y = point.y + normal.y * laneOffset;
    car.angle = angle;
    syncForward(car);

    const speed = (car.maxSpeed || 260) * 0.7;
    car.vx = car.fx * speed;
    car.vy = car.fy * speed;
    car.grip = Math.max(car.grip, 10.5);

    updateProgress(car, track);
}
