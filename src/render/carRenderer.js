import { roundRect } from "../utils/draw.js";
import { shade } from "../utils/math.js";

/**
 * Enhanced Color Palette
 */
function carColor(c) {
    const palette = {
        blue: "#2563eb",
        red: "#dc2626",
        yellow: "#fbbf24",
        green: "#16a34a",
        grey: "#4b5563",
        black: "#111827",
        white: "#f8fafc"
    };
    if (typeof c === "string" && (c.startsWith("#") || c.startsWith("rgb"))) return c;
    return palette[c] || palette.grey;
}

/**
 * DRAWING UTILITY: Glossy Highlight
 */
function applyGloss(ctx, x, y, w, h) {
    const glint = ctx.createLinearGradient(x, y, x + w, y + h);
    glint.addColorStop(0, "rgba(255,255,255,0.15)");
    glint.addColorStop(0.5, "rgba(255,255,255,0)");
    glint.addColorStop(1, "rgba(0,0,0,0.1)");
    ctx.fillStyle = glint;
    ctx.fillRect(x, y, w, h);
}

/**
 * RE-DESIGNED: KART (The Standard "Chunky" Look)
 */
function drawKart(ctx, base) {
    // 1. Body Base (The "Chassis")
    ctx.fillStyle = shade(base, -20);
    roundRect(ctx, -14, -18, 28, 40, 6);
    ctx.fill();

    // 2. Wheels (Better spacing)
    const wheelW = 8;
    const wheelH = 12;
    ctx.fillStyle = "#1a1a1a";
    [[-16, -12], [10, -12], [-16, 10], [10, 10]].forEach(([x, y]) => {
        roundRect(ctx, x, y, wheelW, wheelH, 3);
        ctx.fill();
    });

    // 3. Main Paint
    const paint = ctx.createLinearGradient(-12, 0, 12, 0);
    paint.addColorStop(0, shade(base, 10));
    paint.addColorStop(0.5, base);
    paint.addColorStop(1, shade(base, -15));
    ctx.fillStyle = paint;
    roundRect(ctx, -12, -18, 24, 38, 5);
    ctx.fill();

    // 4. Roof & Windshield (The 2.5D Pop)
    ctx.fillStyle = "#1e293b"; // Glass
    roundRect(ctx, -10, -5, 20, 14, 3);
    ctx.fill();

    // Windshield Glint
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.beginPath();
    ctx.moveTo(-8, -5); ctx.lineTo(-2, -5); ctx.lineTo(-6, 9); ctx.lineTo(-10, 9);
    ctx.fill();

    // Roof
    ctx.fillStyle = base;
    roundRect(ctx, -10, 2, 20, 12, 2);
    ctx.fill();
}

/**
 * RE-DESIGNED: F1 (Aero & Slim)
 */
function drawF1(ctx, base) {
    // Wheels (Giant rears, smaller fronts)
    ctx.fillStyle = "#111";
    roundRect(ctx, -20, 12, 10, 14, 2); // Rear L
    roundRect(ctx, 10, 12, 10, 14, 2);  // Rear R
    roundRect(ctx, -18, -18, 7, 10, 2); // Front L
    roundRect(ctx, 11, -18, 7, 10, 2);  // Front R
    ctx.fill();

    // Rear Wing
    ctx.fillStyle = "#222";
    ctx.fillRect(-16, 22, 32, 5);

    // Main Body (Tapered)
    ctx.fillStyle = base;
    ctx.beginPath();
    ctx.moveTo(-4, -30); // Nose
    ctx.lineTo(4, -30);
    ctx.quadraticCurveTo(10, 0, 12, 24); // Body flare
    ctx.lineTo(-12, 24);
    ctx.quadraticCurveTo(-10, 0, -4, -30);
    ctx.fill();

    // Cockpit (The "Halo" look)
    ctx.fillStyle = "#111";
    ctx.beginPath();
    ctx.arc(0, 2, 5, 0, Math.PI * 2);
    ctx.fill();
}

/**
 * RE-DESIGNED: RALLY (Wide & Aggressive)
 */
function drawRally(ctx, base) {
    // Wide Fenders
    ctx.fillStyle = shade(base, -30);
    roundRect(ctx, -16, -15, 32, 12, 4); // Front flare
    roundRect(ctx, -16, 8, 32, 12, 4);  // Rear flare
    ctx.fill();

    // Body
    ctx.fillStyle = base;
    roundRect(ctx, -13, -20, 26, 42, 2);
    ctx.fill();

    // Roof Rack / Vent detail
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.fillRect(-4, -10, 8, 4);

    // Windshield (Large and flat)
    ctx.fillStyle = "#0f172a";
    roundRect(ctx, -11, -8, 22, 18, 1);
    ctx.fill();
}

export function drawCar(ctx, car, cameraY) {
    const sy = car.y - cameraY;
    if (sy < -100 || sy > ctx.canvas.height + 100) return;

    ctx.save();
    ctx.translate(car.x, sy);
    ctx.rotate(car.angle - Math.PI / 2 + Math.PI);

    // 1. Ground Shadow (Blurred and offset)
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 6;
    ctx.shadowOffsetX = 3;

    const base = carColor(car.color);

    // 2. Draw Model
    if (car.model === "f1") drawF1(ctx, base);
    else if (car.model === "rally") drawRally(ctx, base);
    else drawKart(ctx, base);

    // 3. Lights (Functional Shaders)
    const isBraking = car.speed < (car.maxSpeed * 0.4);

    // Reset shadow for lights
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Headlights (Front)
    ctx.fillStyle = "#fffde7";
    ctx.shadowBlur = 10;
    ctx.shadowColor = "white";
    ctx.fillRect(-10, -19, 4, 2);
    ctx.fillRect(6, -19, 4, 2);

    // Taillights (Rear)
    ctx.fillStyle = isBraking ? "#ff1111" : "#800000";
    ctx.shadowColor = "red";
    ctx.shadowBlur = isBraking ? 15 : 5;
    ctx.fillRect(-9, 21, 5, 3);
    ctx.fillRect(4, 21, 5, 3);

    ctx.restore();
}