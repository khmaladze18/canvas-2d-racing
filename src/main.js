import { Game } from "./game/index.js";
import { UI } from "./ui.js";
console.log("main.js loaded ✅");

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const ui = new UI();
const game = new Game({ canvas, ctx, ui });

game.startBoot();
