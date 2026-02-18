import { getRefs } from "./refs.js";
import { createScreens } from "./screens.js";
import { createHud } from "./hud.js";
import { createCarSelect } from "./carSelect.js";

function ordinal(n) {
    const v = n % 100;
    if (v >= 11 && v <= 13) return `${n}th`;
    switch (n % 10) {
        case 1: return `${n}st`;
        case 2: return `${n}nd`;
        case 3: return `${n}rd`;
        default: return `${n}th`;
    }
}

export class UI {
    constructor() {
        this.refs = getRefs();

        this.screens = createScreens(this.refs);
        this.hud = createHud(this.refs);
        this.carSelect = createCarSelect(this.refs);

        this.carSelect.init();
        this.showLogin();
    }

    // --- Elements (stable API for Game/bindings) ---
    get overlay() { return this.refs.overlay; }

    get nameInput() { return this.refs.inputs.nameInput; }
    get loginBtn() { return this.refs.buttons.loginBtn; }
    get startBtn() { return this.refs.buttons.startBtn; }
    get nextLevelBtn() { return this.refs.buttons.nextLevelBtn; }

    get restartBtn() { return this.refs.buttons.restartBtn; }
    // NEW: game over restart button (with fallback already handled in refs.js)
    get restartBtnOver() { return this.refs.buttons.restartBtnOver; }

    // Back-compat: if old code asks for restartBtn2, keep it working.
    get restartBtn2() { return this.refs.buttons.restartBtnOver; }

    get selectedColor() { return this.carSelect.getSelectedColor(); }

    // --- Screens ---
    showLogin() {
        this.screens.showLogin();
        this.hud.hideHud();
    }

    showCarSelect() {
        // Reset selection each time you enter car select (optional but clean)
        this.carSelect.reset?.();
        this.screens.showCar();
        this.hud.hideHud();
    }

    showResult() {
        this.screens.showResult();
        this.hud.hideHud();
    }

    showGameOver() {
        this.screens.showOver();
        this.hud.hideHud();
    }

    hideOverlay() {
        this.screens.hideOverlay();
    }

    // --- HUD ---
    showHud(playerName, level) { this.hud.showHud(playerName, level); }
    hideHud() { this.hud.hideHud(); }
    updateHud(payload) { this.hud.updateHud(payload); }

    // --- Result texts ---
    setResult({ place, level }) {
        const p = Number(place);

        if (p === 1) {
            this.refs.result.title.textContent = "You won!";
            this.refs.result.text.textContent = `You finished 1st. Level ${level} cleared.`;
            this.refs.buttons.nextLevelBtn.style.display = "";
        } else {
            this.refs.result.title.textContent = "Level failed";
            this.refs.result.text.textContent =
                `You finished ${ordinal(p)}. You must place 1st to continue.`;
            this.refs.buttons.nextLevelBtn.style.display = "none";
        }
    }

    setGameOver({ bestLevel, place }) {
        const p = Number(place);
        this.refs.result.overText.textContent =
            `You finished ${ordinal(p)}. Your run ended at level ${bestLevel}. Press Restart.`;
    }
}
