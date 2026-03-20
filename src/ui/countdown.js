function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function resetLights(lights) {
    lights.forEach((light) => {
        light.className = "countdown-light";
    });
}

function showGoState(lights) {
    lights.forEach((light) => {
        light.classList.remove("active-red");
        light.classList.add("active-green");
    });
}

export async function playCountdown(countdown, audio) {
    const overlay = countdown?.overlay;
    const text = countdown?.text;
    const lights = countdown?.lights || [];
    if (!overlay || !text || lights.length !== 3) return;

    overlay.classList.remove("hidden", "fade-out");
    resetLights(lights);
    text.textContent = "READY?";
    await delay(450);

    const sequence = ["3", "2", "1", "GO!"];
    for (let i = 0; i < sequence.length; i++) {
        const step = sequence[i];
        text.textContent = step;
        audio?.playCountdownStep?.(step);

        if (step === "GO!") showGoState(lights);
        else lights[i]?.classList.add("active-red");

        await delay(1000);
    }

    overlay.classList.add("fade-out");
    await delay(500);
    overlay.classList.add("hidden");
    overlay.classList.remove("fade-out");
}
