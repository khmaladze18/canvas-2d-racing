export function getRefs() {
    const byId = (id) => document.getElementById(id);

    // Small helper: warn once if missing (doesn't hard-crash release builds)
    const req = (id) => {
        const el = byId(id);
        if (!el) console.warn(`[UI] Missing element #${id}`);
        return el;
    };

    const overlay = req("overlay");

    const screens = {
        login: req("screen-login"),
        car: req("screen-car"),
        result: req("screen-result"),
        over: req("screen-over"),
    };

    const inputs = {
        nameInput: req("nameInput"),
    };

    const buttons = {
        loginBtn: req("loginBtn"),
        startBtn: req("startBtn"),
        nextLevelBtn: req("nextLevelBtn"),
        audioToggleBtn: req("audioToggleBtn"),

        // Result screen restart
        restartBtn: req("restartBtn"),

        // Game over restart (new id). Keep old fallback for older HTML builds.
        restartBtnOver: req("restartBtnOver") || byId("restartBtn2"),
    };

    const result = {
        title: req("resultTitle"),
        text: req("resultText"),
        overText: req("overText"),
    };

    const hud = {
        root: req("hud"),
        mapRoot: req("hudMapShell"),
        name: req("hudName"),
        level: req("hudLevel"),
        status: req("hudStatus"),
        pos: req("hudPos"),
        total: byId("hudTotal"), // optional (recommended by our HUD fix)
        speed: req("hudSpeed"),
        prog: req("hudProg"),
        progFill: req("hudProgFill"),
        map: req("hudMap"),
        boostRoot: req("hudBoostShell"),
        boostFill: req("hudBoostFill"),
        boostTime: req("hudBoostTime"),
        inventoryRoot: req("hudInventoryShell"),
        inventoryCount: req("hudBoostInventory"),
    };

    const countdown = {
        overlay: req("countdown-overlay"),
        text: req("countdown-text"),
        lights: [req("light-1"), req("light-2"), req("light-3")].filter(Boolean),
    };

    const carBtns = Array.from(document.querySelectorAll(".car-btn"));
    if (!carBtns.length) console.warn("[UI] No .car-btn elements found");

    return { overlay, screens, inputs, buttons, result, hud, countdown, carBtns };
}
