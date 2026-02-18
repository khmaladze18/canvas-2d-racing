export function createInput() {
    return { up: false, down: false, left: false, right: false };
}

export function bindKeys({ input, onRestart }) {
    const on = (e, v) => {
        const k = e.key.toLowerCase();
        if (k === "arrowup" || k === "w") input.up = v;
        if (k === "arrowdown" || k === "s") input.down = v;
        if (k === "arrowleft" || k === "a") input.left = v;
        if (k === "arrowright" || k === "d") input.right = v;
        if (k === "r" && v === true) onRestart?.();
    };

    window.addEventListener("keydown", (e) => on(e, true));
    window.addEventListener("keyup", (e) => on(e, false));

    // return unbind if you ever need it later
    return () => {
        window.removeEventListener("keydown", (e) => on(e, true));
        window.removeEventListener("keyup", (e) => on(e, false));
    };
}
