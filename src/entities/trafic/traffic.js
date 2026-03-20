export function createTrafficManager() {
    return {
        cars: [],
        reset() {
            this.cars.length = 0;
        },
        update() { },
    };
}
