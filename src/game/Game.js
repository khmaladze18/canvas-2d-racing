import { STATES } from "./constants.js";
import { createInput, bindKeys } from "./input.js";
import { bindUI } from "./uiBindings.js";
import { createPickups } from "./pickups.js";
import { startLevel } from "./level.js";
import { update } from "./update.js";
import { render } from "./render.js";
import { createTrafficManager } from "../entities/trafic/traffic.js";

export class Game {
    constructor({ canvas, ctx, ui, audio = null }) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.ui = ui;
        this.audio = audio;

        this.state = STATES.LOGIN;
        this.playerName = "";
        this.playerColor = "blue";

        this.level = 1;
        this.bestLevel = 1;

        this.track = null;
        this.player = null;
        this.bots = [];
        this.all = [];
        this.traffic = createTrafficManager(this);

        this.cameraX = 0;
        this.cameraY = 0;
        this.input = createInput();
        this.pickups = [];
        this.impactFx = [];
        this.fxTime = 0;

        this.startDist = 0;
        this.raceStarted = false;
        this.lastT = performance.now();

        bindUI(this);
        bindKeys({ input: this.input, onRestart: () => this.restartRun() });
    }

    setPlayerName(name) {
        this.playerName = name;
    }

    playSound(kind, data) {
        this.audio?.play?.(kind, data);
    }

    goToCarSelect() {
        this.state = "CAR";
        this.ui.showCarSelect();
    }

    async startNewRun(color) {
        this.playerColor = color;
        await this.startLevel(1);
    }

    startBoot() {
        this.ui.showLogin();
        this._loop(performance.now());
    }

    async restartRun() {
        this.level = 1;
        this.bestLevel = 1;
        this.traffic?.reset?.();
        await this.startLevel(1);
    }

    async startLevel(level) {
        this.traffic?.reset?.();
        startLevel(this, level);
        this.pickups = createPickups(this.track);
        this.impactFx = [];
        this.raceStarted = false;
        await this.ui.startCountdown?.();
        this.raceStarted = true;
    }

    endLevel(place) {
        if (place === 1) {
            this.state = STATES.RESULT;
            this.ui.setResult({ place, level: this.level });
            this.ui.showResult();
            return;
        }

        this.state = STATES.OVER;
        this.ui.setGameOver({ bestLevel: this.level, place });
        this.ui.showGameOver();
    }

    _loop(t) {
        const dt = Math.min(0.033, (t - this.lastT) / 1000);
        this.lastT = t;

        update(this, dt);
        render(this);

        requestAnimationFrame((nextTime) => this._loop(nextTime));
    }
}
