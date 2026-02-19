export function createCarSelect(refs, opts = {}) {
    const { carBtns, buttons, carRow } = refs; // carRow optional (the listbox container)
    const onChange = opts.onChange || null;

    let selectedColor = null;
    let initialized = false;

    // Track listeners so destroy() is clean and cheap
    const cleanup = [];

    function setSelected(btn) {
        if (!btn || btn.disabled) return;

        for (const b of carBtns) {
            b.classList.remove("selected");
            b.setAttribute("aria-selected", "false");
            b.tabIndex = -1; // roving tabindex
        }

        btn.classList.add("selected");
        btn.setAttribute("aria-selected", "true");
        btn.tabIndex = 0;

        selectedColor = btn.dataset.color || null;

        // Enable Start only when a color is selected
        if (buttons?.startBtn) buttons.startBtn.disabled = !selectedColor;

        // Optional: notify app
        if (onChange) onChange(selectedColor, btn);

        // Optional: listbox activedescendant pattern
        if (carRow && btn.id) carRow.setAttribute("aria-activedescendant", btn.id);
    }

    function focusByDelta(fromBtn, delta) {
        const n = carBtns.length;
        if (!n) return;

        const idx = carBtns.indexOf(fromBtn);
        const start = idx >= 0 ? idx : 0;

        // Skip disabled buttons
        for (let step = 1; step <= n; step++) {
            const next = carBtns[(start + delta * step + n * 1000) % n];
            if (!next.disabled) {
                next.focus();
                return;
            }
        }
    }

    function focusFirst() {
        const first = carBtns.find((b) => !b.disabled) || carBtns[0];
        first?.focus();
    }

    function focusLast() {
        for (let i = carBtns.length - 1; i >= 0; i--) {
            if (!carBtns[i].disabled) {
                carBtns[i].focus();
                return;
            }
        }
    }

    function onBtnClick(e) {
        const btn = e.currentTarget;
        setSelected(btn);
    }

    function onBtnKeyDown(e) {
        const btn = e.currentTarget;

        switch (e.key) {
            case "Enter":
            case " ":
                e.preventDefault();
                setSelected(btn);
                break;

            case "ArrowRight":
            case "ArrowDown":
                e.preventDefault();
                focusByDelta(btn, +1);
                break;

            case "ArrowLeft":
            case "ArrowUp":
                e.preventDefault();
                focusByDelta(btn, -1);
                break;

            case "Home":
                e.preventDefault();
                focusFirst();
                break;

            case "End":
                e.preventDefault();
                focusLast();
                break;

            // Optional: Escape clears selection
            case "Escape":
                e.preventDefault();
                reset();
                focusFirst();
                break;
        }
    }

    function init() {
        if (initialized) return;
        initialized = true;

        if (buttons?.startBtn) buttons.startBtn.disabled = true;

        // Ensure listbox semantics
        if (carRow) {
            carRow.setAttribute("role", "listbox");
            carRow.setAttribute("aria-label", carRow.getAttribute("aria-label") || "Car colors");
            carRow.tabIndex = -1;
        }

        // Setup buttons
        for (let i = 0; i < carBtns.length; i++) {
            const btn = carBtns[i];

            // Ensure id for aria-activedescendant (optional)
            if (!btn.id) btn.id = `carColor-${btn.dataset.color || i}`;

            btn.setAttribute("role", "option");
            btn.setAttribute("aria-selected", "false");

            // Roving tabindex: only first focusable is tabbable until selection
            btn.tabIndex = i === 0 ? 0 : -1;

            btn.addEventListener("click", onBtnClick);
            btn.addEventListener("keydown", onBtnKeyDown);

            cleanup.push(() => {
                btn.removeEventListener("click", onBtnClick);
                btn.removeEventListener("keydown", onBtnKeyDown);
            });
        }
    }

    function reset() {
        selectedColor = null;
        if (buttons?.startBtn) buttons.startBtn.disabled = true;

        for (let i = 0; i < carBtns.length; i++) {
            const b = carBtns[i];
            b.classList.remove("selected");
            b.setAttribute("aria-selected", "false");
            b.tabIndex = i === 0 ? 0 : -1;
        }

        if (carRow) carRow.removeAttribute("aria-activedescendant");
        if (onChange) onChange(null, null);
    }

    function getSelectedColor() {
        return selectedColor;
    }

    function destroy() {
        for (const fn of cleanup.splice(0)) fn();
        initialized = false;
    }

    return { init, reset, getSelectedColor, destroy, setSelected };
}
