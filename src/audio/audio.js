const MASTER_ON = 0.72;

function clamp(v, a, b) {
    return v < a ? a : v > b ? b : v;
}

function createNoiseBuffer(ctx) {
    const len = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
}

function makeNoiseLoop(ctx, buffer) {
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    return src;
}

export function createAudioManager() {
    return new RacingAudio();
}

class RacingAudio {
    constructor() {
        this.ctx = null;
        this.master = null;
        this.noiseBuffer = null;
        this.engine = null;
        this.music = null;
        this.muted = false;
        this.countdownDuckUntil = 0;
        this.prevPlayerBoost = false;
        this.prevPickupFlash = 0;
        this.unlockHandler = () => this.unlock();
        window.addEventListener("pointerdown", this.unlockHandler, { passive: true });
        window.addEventListener("keydown", this.unlockHandler, { passive: true });
    }

    ensure() {
        if (this.ctx) return;
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        const ctx = new AC();
        const master = ctx.createGain();
        master.gain.value = 0;
        master.connect(ctx.destination);

        this.ctx = ctx;
        this.master = master;
        this.noiseBuffer = createNoiseBuffer(ctx);
        this.engine = this.createEngineBus();
        this.music = this.createMusicBus();
        this.setMuted(false);
    }

    createEngineBus() {
        const ctx = this.ctx;
        const engineGain = ctx.createGain();
        const low = ctx.createOscillator();
        const high = ctx.createOscillator();
        const lowGain = ctx.createGain();
        const highGain = ctx.createGain();
        const driftFilter = ctx.createBiquadFilter();
        const driftResonance = ctx.createBiquadFilter();
        const driftGain = ctx.createGain();
        const driftGainHi = ctx.createGain();
        const driftNoise = makeNoiseLoop(ctx, this.noiseBuffer);
        const driftNoiseHi = makeNoiseLoop(ctx, this.noiseBuffer);

        low.type = "sawtooth";
        high.type = "triangle";
        low.frequency.value = 58;
        high.frequency.value = 110;
        lowGain.gain.value = 0;
        highGain.gain.value = 0;
        driftFilter.type = "bandpass";
        driftFilter.frequency.value = 1650;
        driftFilter.Q.value = 1.9;
        driftResonance.type = "highpass";
        driftResonance.frequency.value = 2100;
        driftGain.gain.value = 0;
        driftGainHi.gain.value = 0;

        low.connect(lowGain).connect(engineGain);
        high.connect(highGain).connect(engineGain);
        driftNoise.connect(driftFilter).connect(driftGain).connect(engineGain);
        driftNoiseHi.connect(driftResonance).connect(driftGainHi).connect(engineGain);
        engineGain.connect(this.master);

        low.start();
        high.start();
        driftNoise.start();
        driftNoiseHi.start();

        return {
            low,
            high,
            lowGain,
            highGain,
            driftGain,
            driftGainHi,
            driftFilter,
            driftResonance,
        };
    }

    createMusicBus() {
        const ctx = this.ctx;
        const bus = ctx.createGain();
        const oscA = ctx.createOscillator();
        const oscB = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gainA = ctx.createGain();
        const gainB = ctx.createGain();

        oscA.type = "triangle";
        oscB.type = "sine";
        oscA.frequency.value = 164.81;
        oscB.frequency.value = 246.94;
        filter.type = "lowpass";
        filter.frequency.value = 900;
        gainA.gain.value = 0;
        gainB.gain.value = 0;
        bus.gain.value = 0;

        oscA.connect(gainA).connect(filter);
        oscB.connect(gainB).connect(filter);
        filter.connect(bus).connect(this.master);

        oscA.start();
        oscB.start();
        return { bus, oscA, oscB, gainA, gainB, chordIndex: -1, nextChangeAt: 0 };
    }

    updateMusic(state) {
        const ctx = this.ctx;
        const music = this.music;
        if (!ctx || !music) return;

        const active = state === "RACE" || state === "CAR";
        const duck = ctx.currentTime < this.countdownDuckUntil ? 0.35 : 1;
        music.bus.gain.setTargetAtTime((active ? 0.05 : 0.02) * duck, ctx.currentTime, 0.25);
        music.gainA.gain.setTargetAtTime((active ? 0.026 : 0.012) * duck, ctx.currentTime, 0.25);
        music.gainB.gain.setTargetAtTime((active ? 0.018 : 0.008) * duck, ctx.currentTime, 0.25);
        if (ctx.currentTime < music.nextChangeAt) return;

        const chords = [
            [164.81, 246.94],
            [174.61, 261.63],
            [146.83, 220.0],
            [196.0, 293.66],
        ];
        music.chordIndex = (music.chordIndex + 1) % chords.length;
        const [fa, fb] = chords[music.chordIndex];
        music.oscA.frequency.setTargetAtTime(fa, ctx.currentTime, 0.3);
        music.oscB.frequency.setTargetAtTime(fb, ctx.currentTime, 0.3);
        music.nextChangeAt = ctx.currentTime + 2.8;
    }

    unlock() {
        this.ensure();
        this.ctx?.resume?.();
    }

    setMuted(muted) {
        this.muted = !!muted;
        if (!this.master || !this.ctx) return;
        this.master.gain.setTargetAtTime(this.muted ? 0 : MASTER_ON, this.ctx.currentTime, 0.03);
    }

    toggleMute() {
        this.setMuted(!this.muted);
        return this.muted;
    }

    getLabel() {
        return this.muted ? "Sound Off" : "Sound On";
    }

    update(game) {
        this.ensure();
        const ctx = this.ctx;
        const engine = this.engine;
        if (!ctx || !engine) return;
        this.updateMusic(game.state);

        const player = game.player;
        if (!player || game.state !== "RACE") {
            engine.lowGain.gain.setTargetAtTime(0, ctx.currentTime, 0.08);
            engine.highGain.gain.setTargetAtTime(0, ctx.currentTime, 0.08);
            engine.driftGain.gain.setTargetAtTime(0, ctx.currentTime, 0.08);
            return;
        }

        const baseMax = Math.max(1, player.baseMaxSpeed || player.maxSpeed || 1);
        const speed01 = clamp(player.speed / baseMax, 0, 1.6);
        const throttle = game.input?.up ? 1 : 0;
        const forward = player.vx * player.fx + player.vy * player.fy;
        const latVx = player.vx - player.fx * forward;
        const latVy = player.vy - player.fy * forward;
        const lateralSpeed = Math.hypot(latVx, latVy);
        const slip01 = clamp(lateralSpeed / 120, 0, 1.4);
        const lowFreq = 55 + speed01 * 85 + throttle * 8;
        const highFreq = 110 + speed01 * 180 + throttle * 15;
        const lowGain = 0.03 + speed01 * 0.1 + throttle * 0.05;
        const highGain = 0.015 + speed01 * 0.055;
        const driftGain = player.isDrifting ? Math.min(0.22, 0.03 + slip01 * 0.14) : 0;
        const driftGainHi = player.isDrifting ? Math.min(0.14, 0.01 + slip01 * 0.1) : 0;

        engine.low.frequency.setTargetAtTime(lowFreq, ctx.currentTime, 0.04);
        engine.high.frequency.setTargetAtTime(highFreq, ctx.currentTime, 0.04);
        engine.lowGain.gain.setTargetAtTime(lowGain, ctx.currentTime, 0.05);
        engine.highGain.gain.setTargetAtTime(highGain, ctx.currentTime, 0.05);
        engine.driftGain.gain.setTargetAtTime(driftGain, ctx.currentTime, 0.02);
        engine.driftGainHi.gain.setTargetAtTime(driftGainHi, ctx.currentTime, 0.02);
        if (player.isDrifting) {
            const scrubFreq = 1100 + Math.min(1800, lateralSpeed * 13);
            const q = 1.2 + Math.min(4.5, lateralSpeed / 28);
            const hissFreq = 1800 + Math.min(2600, lateralSpeed * 15);
            engine.driftFilter.frequency.setTargetAtTime(scrubFreq, ctx.currentTime, 0.025);
            engine.driftFilter.Q.setTargetAtTime(q, ctx.currentTime, 0.025);
            engine.driftResonance.frequency.setTargetAtTime(hissFreq, ctx.currentTime, 0.025);
        } else {
            engine.driftFilter.frequency.setTargetAtTime(1650, ctx.currentTime, 0.06);
            engine.driftFilter.Q.setTargetAtTime(1.9, ctx.currentTime, 0.06);
            engine.driftResonance.frequency.setTargetAtTime(2100, ctx.currentTime, 0.06);
        }

        if (player.manualBoostActive && !this.prevPlayerBoost) this.playBoost();
        if ((player.boostPickupFlash || 0) > this.prevPickupFlash + 0.08) this.playPickup(1);
        this.prevPlayerBoost = !!player.manualBoostActive;
        this.prevPickupFlash = player.boostPickupFlash || 0;
    }

    play(kind, data) {
        if (kind === "click") this.playClick();
    }

    playClick() {
        this.tone({ type: "triangle", freq: 640, endFreq: 560, gain: 0.03, dur: 0.07 });
    }

    playPickup(intensity = 1) {
        this.tone({ type: "triangle", freq: 720, endFreq: 1040, gain: 0.05 * intensity, dur: 0.12 });
        this.tone({ type: "sine", freq: 980, endFreq: 1380, gain: 0.028 * intensity, dur: 0.14, delay: 0.03 });
    }

    playBoost() {
        this.tone({ type: "sawtooth", freq: 180, endFreq: 420, gain: 0.06, dur: 0.22 });
        this.noiseBurst({ gain: 0.03, dur: 0.18, freq: 1200 });
    }

    playCollision(impulse = 120) {
        const strength = clamp(impulse / 420, 0.25, 1);
        if (impulse < 180) {
            this.noiseBurst({ gain: 0.035 * strength, dur: 0.08 + strength * 0.05, freq: 1200 - strength * 250 });
            this.tone({ type: "triangle", freq: 165, endFreq: 120, gain: 0.014 * strength, dur: 0.06 + strength * 0.02 });
            return;
        }
        this.noiseBurst({ gain: 0.05 * strength, dur: 0.12 + strength * 0.08, freq: 900 - strength * 280 });
        this.tone({ type: "square", freq: 120, endFreq: 70, gain: 0.02 * strength, dur: 0.09 + strength * 0.03 });
        if (impulse > 320) {
            this.noiseBurst({ gain: 0.04 * strength, dur: 0.16, freq: 520 });
            this.tone({ type: "sawtooth", freq: 88, endFreq: 52, gain: 0.022 * strength, dur: 0.14 });
        }
    }

    playCountdownStep(step) {
        this.ensure();
        if (!this.ctx) return;
        this.countdownDuckUntil = this.ctx.currentTime + 0.85;
        const countdownNotes = { "3": 349.23, "2": 392.0, "1": 440.0 };
        if (countdownNotes[step]) {
            const root = countdownNotes[step];
            this.tone({ type: "square", freq: root, endFreq: root * 0.98, gain: 0.085, dur: 0.14 });
            this.tone({ type: "triangle", freq: root * 1.5, endFreq: root * 1.62, gain: 0.05, dur: 0.22, delay: 0.01 });
            this.tone({ type: "sine", freq: root * 2, endFreq: root * 2.08, gain: 0.022, dur: 0.2, delay: 0.03 });
            return;
        }
        if (step === "GO!") {
            this.countdownDuckUntil = this.ctx.currentTime + 1.1;
            this.tone({ type: "triangle", freq: 523.25, endFreq: 659.25, gain: 0.08, dur: 0.18 });
            this.tone({ type: "triangle", freq: 659.25, endFreq: 783.99, gain: 0.075, dur: 0.2, delay: 0.08 });
            this.tone({ type: "sine", freq: 783.99, endFreq: 1046.5, gain: 0.08, dur: 0.34, delay: 0.16 });
            this.tone({ type: "sawtooth", freq: 261.63, endFreq: 523.25, gain: 0.04, dur: 0.24, delay: 0.02 });
            this.noiseBurst({ gain: 0.035, dur: 0.16, freq: 1800 });
            return;
        }
    }

    tone({ type = "sine", freq, endFreq = freq, gain = 0.04, dur = 0.1, delay = 0 }) {
        this.ensure();
        const ctx = this.ctx;
        if (!ctx || !this.master) return;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        const t0 = ctx.currentTime + delay;
        osc.type = type;
        osc.frequency.setValueAtTime(freq, t0);
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), t0 + dur);
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
        osc.connect(g).connect(this.master);
        osc.start(t0);
        osc.stop(t0 + dur + 0.02);
    }

    noiseBurst({ gain = 0.04, dur = 0.1, freq = 1000 }) {
        this.ensure();
        const ctx = this.ctx;
        if (!ctx || !this.master) return;
        const src = ctx.createBufferSource();
        const filter = ctx.createBiquadFilter();
        const g = ctx.createGain();
        src.buffer = this.noiseBuffer;
        filter.type = "bandpass";
        filter.frequency.value = freq;
        filter.Q.value = 0.7;
        g.gain.setValueAtTime(0.0001, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(gain, ctx.currentTime + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
        src.connect(filter).connect(g).connect(this.master);
        src.start();
        src.stop(ctx.currentTime + dur + 0.02);
    }
}
