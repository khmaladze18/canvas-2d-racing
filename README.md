<img width="1912" height="937" alt="image" src="https://github.com/user-attachments/assets/21cb2554-2aa6-4eae-869f-cf505ef4bf5f" />

# 🏎️ 2D F1 Racing Game

A browser-based top-down arcade racing game built with **Vanilla JavaScript (ES Modules)** and **HTML5 Canvas**. Race against 5 AI bots across procedurally generated circuits, advance by finishing 1st, and push the limits with drifting, boost pickups, and fully synthesized audio — no frameworks, no libraries, no prerecorded sounds.

> Built with ChatGPT and Claude. UI designed with Gemini.

Initially built with (ChatGPT 5.2), and later only the UI was updated using (Google Gemini).

---

## 🚀 Live Demo

👉 Deployed on Netlify
([live URL here](https://2d-car-game1.netlify.app/))

---

## 🎮 Features

- 🛣️ Procedurally generated closed-circuit tracks that scale in difficulty per level
- 🚗 3 car models (F1, Sedan, SUV) with tuned physics per model
- 🤖 Bot AI with curve-aware speed control, lane navigation, stuck recovery, and per-level difficulty scaling
- 💨 Player drifting with tire marks and smoke particle effects
- ⚡ Auto straight-line boost + manual boost from on-track pickups
- 💥 SAT-based car-to-car collision physics with impulse resolution
- 🎵 Fully synthesized audio — engine, drift, music, and SFX via Web Audio API
- 📊 HUD with speed, position, progress, boost inventory, and minimap
- 🌆 3 circuit themes cycling per level
- 🎨 Post-processing effects: scanlines, vignette, horizon bloom, spark particles

---

## 🎯 Controls

| Action | Keys |
|---|---|
| Accelerate | `W` / `↑` |
| Brake / Reverse | `S` / `↓` |
| Steer | `A` `D` / `←` `→` |
| Drift | `Space` |
| Manual Boost | `B` |
| Restart | `R` |

---

## 🏁 Gameplay

- Finish **1st** to advance to the next level
- Finishing **2nd–5th** ends your run (Game Over)
- Collect boost pickups scattered on the track (max 3 stored)
- Auto-boost activates when driving straight at high speed (1.5× speed)
- Manual boost lasts 5 seconds at 3× speed factor
- Drift through corners for a small speed bonus

---

## 🏗️ Tech Stack

- HTML5 Canvas (2D, no WebGL)
- JavaScript ES6 Modules
- Web Audio API (synthesized sounds, no audio files)
- Modern CSS (glass / minimal UI)
- No external frameworks or libraries

---

## 🧠 Architecture

```
src/
├── main.js                          # Entry point
├── audio/
│   └── audio.js                     # Web Audio synthesizer (engine, drift, music, SFX)
├── entities/
│   ├── Car.js                       # Car entity (position, velocity, angle, state)
│   ├── carConfig.js                 # Tuning profiles and collision shapes per model
│   ├── systems/
│   │   ├── carMotion.js             # Speed, grip, drag, stability, steering
│   │   ├── carBoost.js              # Auto-boost and manual boost
│   │   └── carTrack.js              # Track position tracking
│   ├── controllers/
│   │   ├── PlayerController.js      # Player input → physics
│   │   ├── playerDrift.js           # Drift mechanics and visual effects
│   │   ├── TrafficController.js     # Traffic AI
│   │   └── bot/
│   │       ├── pipeline.js          # Bot update loop
│   │       ├── navigation.js        # Steering to track target
│   │       ├── speed.js             # Curve-aware speed control
│   │       ├── recovery.js          # Off-road recovery
│   │       └── difficulty.js        # Per-level stat scaling
├── game/
│   ├── Game.js                      # Main game class and loop
│   ├── update.js                    # Per-frame update pipeline
│   ├── render.js                    # Render pipeline
│   ├── pickups.js                   # Boost pickup spawning and collection
│   ├── impactFx.js                  # Collision spark particles
│   ├── renderEffects.js             # Drift marks, smoke, bloom, vignette, scanlines
│   └── levelSpawns.js               # Race grid spawn positions
├── physics/
│   ├── collisionMath.js             # SAT math utilities
│   └── collisionResolve.js          # Impulse-based collision response
├── track/
│   ├── Track.js                     # Track class
│   ├── config.js                    # Track difficulty parameters per level
│   ├── generators.js                # Procedural circuit generation
│   ├── drawRoad.js                  # Road render entry point
│   ├── roadLayers.js                # Asphalt, curbs, center line, finish line
│   └── roadStroke.js                # Spline stroke helpers
├── render/
│   ├── carRenderer.js               # Car draw pipeline (shadow, body, effects)
│   ├── carBodyModels.js             # F1 / Sedan / SUV body shapes
│   └── carEffects.js                # Boost flames, player marker, speed glow
├── scenery/
│   ├── scenery.js                   # Scenery manager
│   └── themes.js                    # 3 circuit themes (A, B, C)
└── ui/
    ├── UI.js                        # Main UI class
    ├── hud.js                       # In-race HUD
    ├── hudMinimap.js                # Minimap canvas
    ├── carSelect.js                 # Car selection screen
    └── countdown.js                 # 3-2-1-GO countdown
```

---

## 🛣️ Road Visual Style

The road uses a clean, minimal arcade look:

| Layer | Details |
|---|---|
| **Asphalt** | Dark navy `#1b2235`, flat `butt` caps, `round` joins |
| **Curbs** | 4 dashed offset strokes — red `#e11d48` + off-white `#f8fafc`, alternating phase |
| **Road stamp** | Re-drawn asphalt at exact road width to clean up curb intrusion at tight curves |
| **Center line** | `rgba(255,255,255,0.2)`, dashed `[15, 30]`, width 3 |
| **Finish line** | 2-row × 12-col black/white checker, 10px row height |

---

## 🚗 Car Models

| Model | Trait |
|---|---|
| **F1** | Lightest, sharpest handling |
| **Sedan** | Balanced mass and grip |
| **SUV** | Heaviest, wider collision box |

---

## ⚙️ Physics

- **Motion**: acceleration, grip (lateral friction), drag, stability (velocity-to-heading alignment), rolling resistance
- **Drift**: reduces grip and stability; adds yaw torque and a slight speed bonus
- **Collisions**: SAT detection, impulse-based resolution, 6 passes per frame, substep on frame drops to prevent tunneling

---

## 🤖 Bot AI

Difficulty scales with level using `1 − exp(−level × 0.18)`:

| Attribute | Level 1 | Level 10 | Level 20 |
|---|---|---|---|
| Speed bonus | ~3% | ~11% | ~15% |
| Look-ahead | +2 pts | +8 pts | +12 pts |
| Target pace | 77% | 85% | 89% |

Each bot runs a pipeline each frame: track refresh → lookahead target → steer → stuck detection → unstick → boost decision → speed control → physics → clamp to road.

---

## 🔊 Audio

All sounds are synthesized at runtime via Web Audio API — no audio files required.

| Sound | Method |
|---|---|
| Engine | Two oscillators modulated by speed (55–290 Hz range) |
| Drift | Bandpass noise + resonant hiss scaled by lateral speed |
| Boost | Sawtooth sweep + noise burst |
| Collision | Noise burst + tone sweep scaled by impulse magnitude |
| Pickup | Rising triangle + sine pitch sweep |
| Music | 4-chord ambient loop, low-pass filtered ~900 Hz |
| Countdown | Musical notes D/E/F# → chord gliss on GO |

---

## 🛤️ Track Generation

1. Place 10 random waypoints in a circle
2. Smooth with Catmull-Rom spline interpolation
3. Resample to uniform segment length
4. All tracks are closed circuits

Track parameters scale with level:

| Parameter | Level 1 | High Level |
|---|---|---|
| Road half-width | 132 | 88 (tighter) |
| Curve strength | 0.34 | 0.72 (sharper) |
| Track length | ~1500 pts | 1500 + level×40 |

---

## 📈 Progression

- Must finish **1st** to advance — 2nd or lower ends the run
- Level theme cycles: Circuit A → B → C → A → …
- Player and bot stat baselines grow each level, bots scale faster to maintain challenge
- Best level reached is tracked and shown on Game Over

---

## 🧪 Run Locally

Using VS Code:

1. Install **Live Server** extension
2. Open `index.html`
3. Click **Go Live**

Or just open `index.html` directly in any modern browser — no build step required.

---

## 🌍 Deployment

Static frontend — deploy anywhere:

- **Netlify** (current): drag and drop the project folder
- **GitHub Pages**, **Vercel**, or any static host

No backend required.

---

## 📄 License

MIT License. Built for educational and portfolio purposes.
