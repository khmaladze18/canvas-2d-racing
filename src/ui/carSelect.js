import { focusByDelta, focusFirst, focusLast } from "./carSelectFocus.js";
import { resetSelection, setSelectedState } from "./carSelectState.js";

export function createCarSelect(refs, opts = {}) {
    const { carBtns, buttons, carRow } = refs;
    const onChange = opts.onChange || null;
    const cleanup = [];
    let selectedColor = null;
    let initialized = false;

    function setSelected(btn) {
        selectedColor = setSelectedState(carBtns, buttons, carRow, btn, selectedColor, onChange);
    }

    function onBtnKeyDown(e) {
        const btn = e.currentTarget;
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); return setSelected(btn); }
        if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); return focusByDelta(carBtns, btn, +1); }
        if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); return focusByDelta(carBtns, btn, -1); }
        if (e.key === "Home") { e.preventDefault(); return focusFirst(carBtns); }
        if (e.key === "End") { e.preventDefault(); return focusLast(carBtns); }
        if (e.key === "Escape") { e.preventDefault(); reset(); focusFirst(carBtns); }
    }

    function init() {
        if (initialized) return;
        initialized = true;
        if (buttons?.startBtn) buttons.startBtn.disabled = true;
        if (carRow) {
            carRow.setAttribute("role", "listbox");
            carRow.setAttribute("aria-label", carRow.getAttribute("aria-label") || "Car colors");
            carRow.tabIndex = -1;
        }
        carBtns.forEach((btn, i) => {
            if (!btn.id) btn.id = `carColor-${btn.dataset.color || i}`;
            btn.setAttribute("role", "option");
            btn.setAttribute("aria-selected", "false");
            btn.tabIndex = i === 0 ? 0 : -1;
            btn.addEventListener("click", () => setSelected(btn));
            btn.addEventListener("keydown", onBtnKeyDown);
            cleanup.push(() => btn.removeEventListener("keydown", onBtnKeyDown));
        });
    }

    function reset() {
        selectedColor = null;
        resetSelection(carBtns, buttons, carRow, onChange);
    }

    function destroy() {
        cleanup.splice(0).forEach((fn) => fn());
        initialized = false;
    }

    return { init, reset, getSelectedColor: () => selectedColor, destroy, setSelected };
}
