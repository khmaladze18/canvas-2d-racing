export function createInput() {
    return {
        up: false,
        down: false,
        left: false,
        right: false,
        boostPressed: false,
        drift: false,
    };
}

export function bindKeys({ input, onRestart }) {
    const on = (e, isPressed) => {
        const key = e.key.toLowerCase();
        if (key === "arrowup" || key === "w") input.up = isPressed;
        if (key === "arrowdown" || key === "s") input.down = isPressed;
        if (key === "arrowleft" || key === "a") input.left = isPressed;
        if (key === "arrowright" || key === "d") input.right = isPressed;
        if (key === " ") input.drift = isPressed;
        if (key === "b" && isPressed) input.boostPressed = true;
        if (key === "r" && isPressed) onRestart?.();
    };

    const handleKeyDown = (e) => on(e, true);
    const handleKeyUp = (e) => on(e, false);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
    };
}
