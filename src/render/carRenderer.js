import { roundRect } from "../utils/draw.js";
import { shade, clamp } from "../utils/math.js";

function carColor(c) {
    if (c === "blue") return "#3b82f6";
    if (c === "red") return "#ef4444";
    if (c === "yellow") return "#f59e0b";
    return "#9ca3af";
}

function glossyFill(ctx, base, y0 = -20, y1 = 20) {
    const g = ctx.createLinearGradient(0, y0, 0, y1);
    g.addColorStop(0, shade(base, 40));
    g.addColorStop(0.35, shade(base, 14));
    g.addColorStop(0.75, shade(base, -12));
    g.addColorStop(1, shade(base, -32));
    ctx.fillStyle = g;
}

function wheel(ctx, x, y, s = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);

    // tire
    ctx.fillStyle = "rgba(0,0,0,0.78)";
    roundRect(ctx, -4.2, -6.1, 8.4, 12.2, 3.2);
    ctx.fill();

    // rim ring
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(0, 0, 2.7, 3.8, 0, 0, Math.PI * 2);
    ctx.stroke();

    // hub
    ctx.fillStyle = "rgba(255,255,255,0.10)";
    ctx.beginPath();
    ctx.ellipse(0, 0, 1.1, 1.6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function speedGlow(ctx, base, amount) {
    ctx.save();
    ctx.globalAlpha = 0.20 * amount;
    ctx.fillStyle = shade(base, 55);
    ctx.beginPath();
    ctx.ellipse(0, 0, 19, 29, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function headlights(ctx, x, y, w, h, a = 0.9) {
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = "rgba(255,255,230,0.92)";
    ctx.fillRect(x, y, w, h);
    ctx.restore();
}

function taillights(ctx, glow) {
    ctx.save();
    ctx.globalAlpha = 0.55 + 0.35 * glow;
    ctx.fillStyle = "rgba(255,80,80,0.85)";
    ctx.fillRect(-9.4, 13.4, 4.6, 3.1);
    ctx.fillRect(4.8, 13.4, 4.6, 3.1);
    ctx.restore();
}

/* =========================
   MODEL: KART
   ========================= */
function drawKart(ctx, base) {
    // wheels
    wheel(ctx, -15, -11);
    wheel(ctx, 15, -11);
    wheel(ctx, -15, 11);
    wheel(ctx, 15, 11);

    // outline
    ctx.fillStyle = "rgba(0,0,0,0.42)";
    roundRect(ctx, -12.2, -18.2, 24.4, 36.4, 8);
    ctx.fill();

    // body
    glossyFill(ctx, base, -18, 18);
    roundRect(ctx, -11.6, -17.6, 23.2, 35.2, 8);
    ctx.fill();

    // carbon side
    ctx.fillStyle = "rgba(0,0,0,0.16)";
    roundRect(ctx, -11.6, -17.6, 7.4, 35.2, 7);
    ctx.fill();

    // center stripe
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.fillRect(-1.7, -16.7, 3.4, 33.4);

    // cockpit
    const glass = ctx.createLinearGradient(0, -10, 0, 10);
    glass.addColorStop(0, "rgba(210,235,255,0.26)");
    glass.addColorStop(1, "rgba(120,170,220,0.14)");
    ctx.fillStyle = glass;
    roundRect(ctx, -8.1, -7.7, 16.2, 14.8, 7);
    ctx.fill();

    ctx.strokeStyle = "rgba(0,0,0,0.22)";
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // bumper
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    roundRect(ctx, -10.6, -18.4, 21.2, 6.2, 3.4);
    ctx.fill();

    // grill slots
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    for (let i = -8; i <= 8; i += 4) ctx.fillRect(i, -16.9, 1.8, 3.2);
    ctx.globalAlpha = 1;

    // headlights
    headlights(ctx, -9.3, -16.6, 4.4, 3.2);
    headlights(ctx, 4.9, -16.6, 4.4, 3.2);

    // spoiler
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    roundRect(ctx, -12, 13.2, 24, 4.6, 3);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.10)";
    roundRect(ctx, -11.2, 13.6, 22.4, 3.2, 3);
    ctx.fill();
}

/* =========================
   MODEL: F1
   ========================= */
function drawF1(ctx, base) {
    // wheels wider + larger (F1)
    wheel(ctx, -18, -13, 1.18);
    wheel(ctx, 18, -13, 1.18);
    wheel(ctx, -17, 13, 1.12);
    wheel(ctx, 17, 13, 1.12);

    // rear wing
    ctx.fillStyle = "rgba(0,0,0,0.26)";
    roundRect(ctx, -17, 14.5, 34, 5.0, 3);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    roundRect(ctx, -16, 15.1, 32, 3.6, 3);
    ctx.fill();

    // main body outline (longer)
    ctx.fillStyle = "rgba(0,0,0,0.46)";
    roundRect(ctx, -10.7, -22.0, 21.4, 44.0, 11);
    ctx.fill();

    // main body
    glossyFill(ctx, base, -24, 24);
    roundRect(ctx, -10.1, -21.4, 20.2, 42.8, 11);
    ctx.fill();

    // sidepods (wide mid)
    ctx.fillStyle = "rgba(0,0,0,0.15)";
    roundRect(ctx, -14.4, -10.2, 28.8, 20.4, 9);
    ctx.fill();

    // nose cone (front)
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    roundRect(ctx, -6.6, -28.0, 13.2, 11.2, 7);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.10)";
    roundRect(ctx, -5.6, -27.0, 11.2, 9.2, 6);
    ctx.fill();

    // front wing
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    roundRect(ctx, -18, -30.0, 36, 5.0, 3);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    roundRect(ctx, -17, -29.4, 34, 3.6, 3);
    ctx.fill();

    // cockpit
    const glass = ctx.createLinearGradient(0, -10, 0, 10);
    glass.addColorStop(0, "rgba(210,235,255,0.22)");
    glass.addColorStop(1, "rgba(120,170,220,0.12)");
    ctx.fillStyle = glass;
    roundRect(ctx, -7.0, -8.7, 14.0, 17.4, 8);
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.20)";
    ctx.lineWidth = 1.3;
    ctx.stroke();

    // stripe
    ctx.fillStyle = "rgba(255,255,255,0.10)";
    ctx.fillRect(-1.2, -21.0, 2.4, 42.0);

    // headlights hint
    headlights(ctx, -6.4, -24.0, 3.0, 2.4, 0.75);
    headlights(ctx, 3.4, -24.0, 3.0, 2.4, 0.75);
}

/* =========================
   MODEL: RALLY (hatch)
   ========================= */
function drawRally(ctx, base) {
    wheel(ctx, -14.5, -11.5);
    wheel(ctx, 14.5, -11.5);
    wheel(ctx, -14.0, 11.5);
    wheel(ctx, 14.0, 11.5);

    // body outline
    ctx.fillStyle = "rgba(0,0,0,0.42)";
    roundRect(ctx, -13.0, -18.0, 26.0, 36.0, 10);
    ctx.fill();

    // body
    glossyFill(ctx, base, -20, 20);
    roundRect(ctx, -12.4, -17.4, 24.8, 34.8, 10);
    ctx.fill();

    // fenders
    ctx.fillStyle = "rgba(0,0,0,0.14)";
    roundRect(ctx, -12.4, -17.4, 24.8, 8.4, 8);
    ctx.fill();
    roundRect(ctx, -12.4, 9.0, 24.8, 8.4, 8);
    ctx.fill();

    // roof scoop
    ctx.fillStyle = "rgba(0,0,0,0.20)";
    roundRect(ctx, -4.8, -15.8, 9.6, 5.6, 3.2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    roundRect(ctx, -4.1, -15.2, 8.2, 4.2, 3);
    ctx.fill();

    // glass
    const glass = ctx.createLinearGradient(0, -12, 0, 12);
    glass.addColorStop(0, "rgba(210,235,255,0.22)");
    glass.addColorStop(1, "rgba(120,170,220,0.12)");
    ctx.fillStyle = glass;
    roundRect(ctx, -8.8, -8.8, 17.6, 17.6, 8.5);
    ctx.fill();

    ctx.strokeStyle = "rgba(0,0,0,0.20)";
    ctx.lineWidth = 1.3;
    ctx.stroke();

    // bumper
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    roundRect(ctx, -11.4, -18.9, 22.8, 6.8, 3.6);
    ctx.fill();

    // bigger headlights
    headlights(ctx, -10.0, -16.4, 5.4, 3.7);
    headlights(ctx, 4.6, -16.4, 5.4, 3.7);

    // rally stripe offset
    ctx.fillStyle = "rgba(255,255,255,0.10)";
    ctx.fillRect(-4.2, -16.8, 2.8, 33.6);
}

export function drawCar(ctx, car, cameraY) {
    const sx = car.x;
    const sy = car.y - cameraY;

    ctx.save();
    ctx.translate(sx, sy);

    // keep your orientation stable
    ctx.rotate(car.angle - Math.PI / 2 + Math.PI);

    // shadow
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.ellipse(0, 7, 16, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.scale(1.08, 1.08);

    const base = carColor(car.color);

    // speed glow
    const g = clamp(car.speed / (car.maxSpeed || 1), 0, 1);
    if (g > 0.15) speedGlow(ctx, base, g);

    // draw selected model
    if (car.model === "f1") drawF1(ctx, base);
    else if (car.model === "rally") drawRally(ctx, base);
    else drawKart(ctx, base);

    // taillights more visible at low speed
    const brakeGlow = clamp(1 - (car.speed / (car.maxSpeed || 1)), 0, 1);
    taillights(ctx, brakeGlow);

    // spec edge
    ctx.globalAlpha = 0.20;
    ctx.strokeStyle = "rgba(255,255,255,0.22)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(0, 0, 12.5, 18.8, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // badge
    if (car.isPlayer) {
        ctx.save();
        ctx.globalAlpha = 0.95;
        ctx.fillStyle = "rgba(0,0,0,0.40)";
        roundRect(ctx, -16, -33, 32, 11, 6);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.92)";
        ctx.font = "700 7.5px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("YOU", 0, -27.3);
        ctx.restore();
    }

    ctx.restore();
}
