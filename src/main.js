import { Game } from "./game/index.js";
import { UI } from "./ui.js";
import { createAudioManager } from "./audio/audio.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const audio = createAudioManager();
const ui = new UI(audio);
const game = new Game({ canvas, ctx, ui, audio });

game.startBoot();
