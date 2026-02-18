export const THEMES = [
    {
        name: "forest",
        layers: ["sky", "hills", "noise"],
        props: ["tree"],
    },
    {
        name: "city",
        layers: ["sky", "skyline", "noise"],
        props: ["building", "lamp"],
    },
    {
        name: "bridge",
        layers: ["sky", "water", "noise"],
        props: ["lamp"],
    },
];

export function themeForLevel(level = 1) {
    return THEMES[(level - 1) % THEMES.length];
}
