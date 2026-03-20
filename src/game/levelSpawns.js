export function getTrackBasis(track, idx) {
    const pA = track.pointAtIndex(idx);
    const pB = track.pointAtIndex(idx + 2);
    const dx = pB.x - pA.x;
    const dy = pB.y - pA.y;
    const len = Math.hypot(dx, dy) || 1;

    return {
        pA,
        tx: dx / len,
        ty: dy / len,
        nx: -dy / len,
        ny: dx / len,
        angle: Math.atan2(dy / len, dx / len),
    };
}

export function buildGridSlots(botCount, laneX, rowY) {
    const slots = [];
    const lanes = [-laneX, laneX];

    for (let i = 0; i < botCount + 1; i++) {
        slots.push({
            row: Math.floor(i / 2),
            laneOff: lanes[i % 2],
            zOff: Math.floor(i / 2) * rowY,
        });
    }

    return slots;
}

export function getSpawnPosition(basis, slot) {
    return {
        x: basis.pA.x + basis.nx * slot.laneOff - basis.tx * slot.zOff,
        y: basis.pA.y + basis.ny * slot.laneOff - basis.ty * slot.zOff,
    };
}
