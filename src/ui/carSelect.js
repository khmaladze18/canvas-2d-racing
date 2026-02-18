export function createCarSelect(refs) {
    let selectedColor = null;
    let initialized = false;

    const { carBtns, buttons } = refs;

    function selectButton(btn) {
        carBtns.forEach((b) => {
            b.classList.remove("selected");
            b.setAttribute("aria-selected", "false");
        });

        btn.classList.add("selected");
        btn.setAttribute("aria-selected", "true");

        selectedColor = btn.dataset.color;
        buttons.startBtn.disabled = false;
    }

    function init() {
        if (initialized) return;
        initialized = true;

        buttons.startBtn.disabled = true;

        carBtns.forEach((btn, index) => {
            btn.setAttribute("role", "option");
            btn.setAttribute("aria-selected", "false");

            btn.addEventListener("click", () => {
                selectButton(btn);
            });

            // Keyboard support (← → Enter Space)
            btn.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    selectButton(btn);
                }

                if (e.key === "ArrowRight") {
                    e.preventDefault();
                    const next = carBtns[(index + 1) % carBtns.length];
                    next.focus();
                }

                if (e.key === "ArrowLeft") {
                    e.preventDefault();
                    const prev =
                        carBtns[(index - 1 + carBtns.length) % carBtns.length];
                    prev.focus();
                }
            });
        });
    }

    function reset() {
        selectedColor = null;
        buttons.startBtn.disabled = true;

        carBtns.forEach((b) => {
            b.classList.remove("selected");
            b.setAttribute("aria-selected", "false");
        });
    }

    function getSelectedColor() {
        return selectedColor;
    }

    function destroy() {
        // Optional future-proofing for large apps
        carBtns.forEach((btn) => {
            btn.replaceWith(btn.cloneNode(true));
        });
        initialized = false;
    }

    return { init, reset, getSelectedColor, destroy };
}
