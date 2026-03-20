export function setSelectedState(carBtns, buttons, carRow, btn, selectedColor, onChange) {
    if (!btn || btn.disabled) return selectedColor;
    for (const option of carBtns) {
        option.classList.remove("selected");
        option.setAttribute("aria-selected", "false");
        option.tabIndex = -1;
    }
    btn.classList.add("selected");
    btn.setAttribute("aria-selected", "true");
    btn.tabIndex = 0;
    selectedColor = btn.dataset.color || null;
    if (buttons?.startBtn) buttons.startBtn.disabled = !selectedColor;
    if (onChange) onChange(selectedColor, btn);
    if (carRow && btn.id) carRow.setAttribute("aria-activedescendant", btn.id);
    return selectedColor;
}

export function resetSelection(carBtns, buttons, carRow, onChange) {
    if (buttons?.startBtn) buttons.startBtn.disabled = true;
    for (let i = 0; i < carBtns.length; i++) {
        carBtns[i].classList.remove("selected");
        carBtns[i].setAttribute("aria-selected", "false");
        carBtns[i].tabIndex = i === 0 ? 0 : -1;
    }
    carRow?.removeAttribute("aria-activedescendant");
    onChange?.(null, null);
}
