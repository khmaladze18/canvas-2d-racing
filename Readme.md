<img width="1912" height="937" alt="image" src="https://github.com/user-attachments/assets/21cb2554-2aa6-4eae-869f-cf505ef4bf5f" />

# 🏎️ Car Racing — Modern Canvas Game

A modular 2D racing game built with **Vanilla JavaScript (ES Modules)** and **HTML5 Canvas**.

This project demonstrates advanced frontend architecture, procedural track generation, AI behavior, and custom rendering without external libraries.

---

## 🚀 Live Demo

👉 Deployed on Netlify  
([live URL here](https://2d-car-game1.netlify.app/))

---

## 🎮 Features

- 🛣️ Procedurally generated curved tracks  
- 🚗 Player + AI-controlled opponents  
- 🏁 Real-time race position system  
- 📊 HUD with speed, level & progress tracking  
- 🎨 Custom car renderer (multiple models: Kart, Rally, F1-style)  
- 🌆 Dynamic scenery system (theme-based backgrounds)  
- 🧠 Road-bound collision system (cars cannot leave the road)  
- 🎥 Smooth camera follow system  
- 🧩 Fully modular architecture  

---

## 🏗️ Tech Stack

- HTML5 Canvas
- JavaScript (ES6 Modules)
- Modern CSS (glass / minimal AAA UI styling)
- No external frameworks or libraries

---

## 🧠 Architecture Overview

The project follows clean separation of concerns:

- **Game** → State management, game loop, orchestration  
- **Track** → Procedural generation + road geometry  
- **Car** → Physics + AI logic  
- **Renderer** → Isolated drawing logic  
- **Scenery** → Background and environmental styling  
- **Utils** → Math helpers and drawing utilities  

This structure allows easy scaling and maintainability.

---

## 🎯 Gameplay Controls

- **W / Arrow Up** → Accelerate  
- **S / Arrow Down** → Brake  
- **A / Arrow Left** → Turn Left  
- **D / Arrow Right** → Turn Right  

Win by finishing **1st place** to advance to the next level.

Difficulty increases with each level.

---

## 🧪 Run Locally

Using VS Code:

1. Install **Live Server**
2. Open `index.html`
3. Start Live Server

Or via terminal:

---

## 🌍 Deployment

This is a static frontend project.

Deploy easily to:

- Netlify

No backend required.

---

## 📄 License

MIT License

This project is built for educational and portfolio purposes only.
Not intended for commercial use.
