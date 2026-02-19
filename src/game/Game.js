// src/Game.js
import { STATES } from "./constants.js";
import { createInput, bindKeys } from "./input.js";
import { bindUI } from "./uiBindings.js";
import { startLevel } from "./level.js";
import { update } from "./update.js";
import { render } from "./render.js";
import { createTrafficManager } from "../entities/trafic/traffic.js";

export class Game {
    constructor({ canvas, ctx, ui }) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.ui = ui;

        this.state = STATES.LOGIN;
        this.playerName = "";
        this.playerColor = "blue";

        this.level = 1;
        this.bestLevel = 1;

        this.track = null;
        this.player = null;
        this.bots = [];
        this.all = [];

        // ✅ Traffic obstacle system (created once, reset per run/level)
        this.traffic = createTrafficManager(this);

        this.cameraY = 0;
        this.input = createInput();

        this.startDist = 0;
        this.lastT = performance.now();

        bindUI(this);
        bindKeys({ input: this.input, onRestart: () => this.restartRun() });
    }

    setPlayerName(name) {
        this.playerName = name;
    }

    goToCarSelect() {
        this.state = "CAR";
        this.ui.showCarSelect();
    }

    startNewRun(color) {
        this.playerColor = color;
        this.startLevel(1);
    }

    isInRun() {
        return this.state === "PLAY" || this.state === "RESULT";
    }

    startBoot() {
        this.ui.showLogin();
        this._loop(performance.now());
    }

    restartRun() {
        this.level = 1;
        this.bestLevel = 1;

        // ✅ reset traffic for a clean run
        this.traffic?.reset?.();

        this.startLevel(1);
    }

    startLevel(level) {
        // ✅ reset traffic when starting a new level (new track)
        this.traffic?.reset?.();

        startLevel(this, level);
    }

    endLevel(place) {
        if (place === 1) {
            this.state = STATES.RESULT;
            this.ui.setResult({ place, level: this.level });
            this.ui.showResult();
        } else {
            this.state = STATES.OVER;
            this.ui.setGameOver({ bestLevel: this.level, place });
            this.ui.showGameOver();
        }
    }

    _loop(t) {
        const dt = Math.min(0.033, (t - this.lastT) / 1000);
        this.lastT = t;

        update(this, dt);
        render(this);

        requestAnimationFrame((tt) => this._loop(tt));
    }
}
