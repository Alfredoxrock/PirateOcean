// Math utility functions
export function rand(min, max) {
    return Math.random() * (max - min) + min;
}

export function clamp(v, a, b) {
    return Math.max(a, Math.min(b, v));
}

export function normalizeAngle(a) {
    while (a <= -Math.PI) a += Math.PI * 2;
    while (a > Math.PI) a -= Math.PI * 2;
    return a;
}
