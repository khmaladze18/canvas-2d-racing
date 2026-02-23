// src/ui/bindUI.js

let alreadyBound = false;

/**
 * Senior Dev Improvements:
 * 1. Debouncing: Prevents rapid-fire clicks on game-state transitions.
 * 2. Focus Management: Auto-focuses the input for a "console-like" feel.
 * 3. Event Abstraction: Centralizes logic for easier maintenance.
 */
export function bindUI(game) {
    if (alreadyBound) return;
    alreadyBound = true;

    const ui = game.ui;
    if (!ui) throw new Error("bindUI: game.ui is missing");

    // Helper: prevent double-clicks or "click-spam"
    const clickOnce = (el, handler) => {
        if (!el) return;
        el.addEventListener("click", (e) => {
            if (el.disabled) return;
            el.disabled = true; // Temporary disable to prevent race conditions
            setTimeout(() => (el.disabled = false), 500);
            handler(e);
            game.playSound?.("click"); // Hook for audio feedback
        });
    };

    // --- Login & Onboarding ---
    // Auto-focus name input if it exists for immediate interaction
    if (ui.nameInput) setTimeout(() => ui.nameInput.focus(), 100);

    clickOnce(ui.loginBtn, () => {
        const name = (ui.nameInput?.value || "").trim().substring(0, 12); // Limit name length
        game.setPlayerName?.(name || "Player");
        game.goToCarSelect?.();
    });

    ui.nameInput?.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            ui.loginBtn?.dispatchEvent(new Event("click"));
        }
    });

    // --- Race Initiation ---
    clickOnce(ui.startBtn, () => {
        // Validation: ensure a car/color is actually picked
        if (!ui.selectedColor) {
            ui.startBtn.classList.add("shake-animation"); // Visual feedback
            setTimeout(() => ui.startBtn.classList.remove("shake-animation"), 400);
            return;
        }
        game.startNewRun?.(ui.selectedColor);
    });

    // --- Progression ---
    clickOnce(ui.nextLevelBtn, () => {
        game.startLevel?.(game.level + 1);
    });

    // --- Restart Logic (Centralized) ---
    const handleRestart = () => {
        if (game.isRestarting) return;
        game.isRestarting = true;
        game.restartRun?.();
        // Brief timeout to reset the flag after transition
        setTimeout(() => (game.isRestarting = false), 1000);
    };

    [ui.restartBtn, ui.restartBtnOver, ui.restartBtn2].forEach(btn => {
        if (btn) clickOnce(btn, handleRestart);
    });

    // --- Global Input Management ---
    window.addEventListener("keydown", (e) => {
        const key = e.key.toLowerCase();
        const activeTag = document.activeElement?.tagName;

        // 1. Guard against accidental restarts while typing
        if (activeTag === "INPUT" || activeTag === "TEXTAREA") return;

        // 2. Map hotkeys to actions
        switch (key) {
            case "r":
                if (game.isInRun?.() || game.isGameOver?.()) {
                    handleRestart();
                }
                break;
            case "p":
            case "escape":
                game.togglePause?.();
                break;
        }
    });
}