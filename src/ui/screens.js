export function createScreens(refs) {
    const overlay = refs.overlay;

    // Build a safe list (skip nulls)
    const screens = {
        login: refs.screens.login,
        car: refs.screens.car,
        result: refs.screens.result,
        over: refs.screens.over,
    };

    const list = Object.values(screens).filter(Boolean);

    let activeKey = null;

    function setOverlayVisible(isVisible) {
        if (!overlay) return;
        overlay.style.display = isVisible ? "" : "none";
        // overlay in CSS has pointer-events:none; screens are pointer-events:auto
        // When hidden, we fully disable it
        overlay.setAttribute("aria-hidden", isVisible ? "false" : "true");
    }

    function clearActive() {
        for (const el of list) el.classList.remove("active");
    }

    function focusFor(key) {
        // Focus “best” element per screen (AAA polish)
        if (key === "login") refs.inputs?.nameInput?.focus?.();
        else if (key === "car") refs.carBtns?.[0]?.focus?.();
        else if (key === "result") refs.buttons?.nextLevelBtn?.focus?.();
        else if (key === "over") (refs.buttons?.restartBtnOver || refs.buttons?.restartBtn)?.focus?.();
    }

    function showByKey(key) {
        const screenEl = screens[key];
        if (!screenEl) {
            console.warn(`[UI] Tried to show missing screen: ${key}`);
            return;
        }

        clearActive();
        screenEl.classList.add("active");
        activeKey = key;

        setOverlayVisible(true);

        // Focus after the DOM class applies
        queueMicrotask(() => focusFor(key));
    }

    function hideOverlay() {
        clearActive();
        activeKey = null;
        setOverlayVisible(false);
    }

    // Backward-compatible API: show(el)
    function show(screenEl) {
        if (!screenEl) return;
        clearActive();
        screenEl.classList.add("active");
        activeKey = null; // unknown key when direct element is used
        setOverlayVisible(true);
    }

    return {
        show,
        hideOverlay,
        showLogin: () => showByKey("login"),
        showCar: () => showByKey("car"),
        showResult: () => showByKey("result"),
        showOver: () => showByKey("over"),
        getActive: () => activeKey,
    };
}
