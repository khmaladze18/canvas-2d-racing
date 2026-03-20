export function getAxes(car) {
    const fx = Number.isFinite(car.fx) ? car.fx : Math.cos(car.angle || 0);
    const fy = Number.isFinite(car.fy) ? car.fy : Math.sin(car.angle || 0);
    return { fx, fy, rx: -fy, ry: fx };
}

export function buildBox(car, dims) {
    const axes = getAxes(car);
    return { cx: car.x, cy: car.y, fx: axes.fx, fy: axes.fy, rx: axes.rx, ry: axes.ry, halfLength: dims.halfLength, halfWidth: dims.halfWidth };
}

function projectBox(box, ax, ay) {
    const c = box.cx * ax + box.cy * ay;
    const r = Math.abs(box.fx * ax + box.fy * ay) * box.halfLength + Math.abs(box.rx * ax + box.ry * ay) * box.halfWidth;
    return { min: c - r, max: c + r };
}

export function overlapOnAxis(a, b, ax, ay) {
    const pa = projectBox(a, ax, ay);
    const pb = projectBox(b, ax, ay);
    return Math.min(pa.max, pb.max) - Math.max(pa.min, pb.min);
}
