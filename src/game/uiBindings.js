let alreadyBound = false;

export function bindUI(game) {
    if (alreadyBound) return;
    alreadyBound = true;

    const ui = game.ui;
    if (!ui) throw new Error("bindUI: game.ui is missing");

    const on = (el, event, handler, opts) => {
        if (!el) return;
        el.addEventListener(event, handler, opts);
    };

    // --- Login ---
    on(ui.loginBtn, "click", () => {
        const name = (ui.nameInput?.value || "").trim();
        game.setPlayerName?.(name.length ? name : "Player");
        game.goToCarSelect?.();
    });

    on(ui.nameInput, "keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            ui.loginBtn?.click();
        }
    });

    // --- Start ---
    on(ui.startBtn, "click", () => {
        if (!ui.selectedColor) return;
        game.startNewRun?.(ui.selectedColor);
    });

    // --- Next Level ---
    on(ui.nextLevelBtn, "click", () => {
        game.startLevel?.(game.level + 1);
    });

    // --- Restart ---
    const restart = () => game.restartRun?.();

    on(ui.restartBtn, "click", restart);
    on(ui.restartBtnOver || ui.restartBtn2, "click", restart);

    // --- Global Restart Hotkey ---
    on(window, "keydown", (e) => {
        if (e.key !== "r" && e.key !== "R") return;

        // Don't restart while typing in input
        const tag = document.activeElement?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;

        // Optional: only allow restart during race or result
        if (!game.isInRun?.()) return;

        restart();
    });
}
