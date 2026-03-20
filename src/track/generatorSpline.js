export function catmull(p0, p1, p2, p3, t) {
    const v0 = (p2 - p0) * 0.5;
    const v1 = (p3 - p1) * 0.5;
    const t2 = t * t;
    const t3 = t2 * t;
    return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;
}

export function generateSmoothPath(points, segments) {
    const smooth = [];
    for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i === 0 ? points.length - 2 : i - 1];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[(i + 2) % points.length];
        for (let t = 0; t < 1; t += 1 / segments) {
            smooth.push({ x: catmull(p0.x, p1.x, p2.x, p3.x, t), y: catmull(p0.y, p1.y, p2.y, p3.y, t) });
        }
    }
    return smooth;
}
