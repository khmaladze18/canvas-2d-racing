export function clamp(v, a, b) {
    return v < a ? a : v > b ? b : v;
}

export function lowerBound(arr, idx) {
    let lo = 0, hi = arr.length;
    while (lo < hi) {
        const mid = (lo + hi) >>> 1;
        if (arr[mid].idx < idx) lo = mid + 1;
        else hi = mid;
    }
    return lo;
}

export function upperBound(arr, idx) {
    let lo = 0, hi = arr.length;
    while (lo < hi) {
        const mid = (lo + hi) >>> 1;
        if (arr[mid].idx <= idx) lo = mid + 1;
        else hi = mid;
    }
    return lo;
}
