export function focusByDelta(carBtns, fromBtn, delta) {
    const count = carBtns.length;
    if (!count) return;
    const start = Math.max(0, carBtns.indexOf(fromBtn));
    for (let step = 1; step <= count; step++) {
        const next = carBtns[(start + delta * step + count * 1000) % count];
        if (!next.disabled) {
            next.focus();
            return;
        }
    }
}

export function focusFirst(carBtns) {
    (carBtns.find((b) => !b.disabled) || carBtns[0])?.focus();
}

export function focusLast(carBtns) {
    for (let i = carBtns.length - 1; i >= 0; i--) if (!carBtns[i].disabled) return carBtns[i].focus();
}
