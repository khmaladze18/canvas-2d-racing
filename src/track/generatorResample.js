function dist(a, b) {
    return Math.hypot(b.x - a.x, b.y - a.y);
}

export function resampleClosed(points, count) {
    if (!points.length) return [];
    const cumulative = new Float32Array(points.length + 1);
    for (let i = 0; i < points.length; i++) cumulative[i + 1] = cumulative[i] + dist(points[i], points[(i + 1) % points.length]);
    const total = cumulative[points.length] || 1;
    const out = new Array(count);

    for (let i = 0; i < count; i++) {
        const target = (i / count) * total;
        let seg = 0;
        while (seg < points.length - 1 && cumulative[seg + 1] < target) seg++;
        const a = points[seg];
        const b = points[(seg + 1) % points.length];
        const segStart = cumulative[seg];
        const segLen = Math.max(1e-6, cumulative[seg + 1] - segStart);
        const t = (target - segStart) / segLen;
        out[i] = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    }

    return out;
}
