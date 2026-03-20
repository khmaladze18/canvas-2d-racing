export const THEMES = [
    {
        name: "circuitA",
        layers: ["grassPixel", "serviceRoad", "paddock", "circuitBorder", "noise"],
        props: ["shrub", "boxBuilding", "shrub", "lamp"],
    },
    {
        name: "circuitB",
        layers: ["grassPixel", "serviceRoad", "paddock", "circuitBorder", "noise"],
        props: ["shrub", "boxBuilding", "shrub"],
    },
    {
        name: "circuitC",
        layers: ["grassPixel", "serviceRoad", "paddock", "circuitBorder", "noise"],
        props: ["shrub", "lamp", "boxBuilding", "shrub"],
    },
];

export function themeForLevel(level = 1) {
    return THEMES[(level - 1) % THEMES.length];
}
