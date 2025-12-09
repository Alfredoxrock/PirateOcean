// Procedural map generation system
import { rand } from '../utils/math.js';
import { CONFIG } from '../core/config.js';

export function generateIslands() {
    const islands = [];
    let attempts = 0;
    const centerX = CONFIG.MAP_WIDTH / 2;
    const centerY = CONFIG.MAP_HEIGHT / 2;

    while (islands.length < CONFIG.NUM_ISLANDS && attempts < 2000) {
        attempts++;
        const r = Math.round(rand(60, 220));
        const x = Math.round(rand(r, CONFIG.MAP_WIDTH - r));
        const y = Math.round(rand(r, CONFIG.MAP_HEIGHT - r));
        const pad = 20;
        let ok = true;

        // Skip islands that overlap the spawn clearance circle
        const dxc = x - centerX;
        const dyc = y - centerY;
        const distc = Math.hypot(dxc, dyc);
        if (distc < CONFIG.SPAWN_CLEAR_RADIUS + r) ok = false;

        for (const other of islands) {
            const dx = other.x - x;
            const dy = other.y - y;
            const dist = Math.hypot(dx, dy);
            if (dist < other.r + r + pad) {
                ok = false;
                break;
            }
        }
        if (ok) islands.push({ x, y, r });
    }
    return islands;
}

export function generateCreatures() {
    const creatures = [];
    for (let i = 0; i < CONFIG.NUM_CREATURES; i++) {
        creatures.push({
            id: i,
            x: rand(100, CONFIG.MAP_WIDTH - 100),
            y: rand(100, CONFIG.MAP_HEIGHT - 100),
            type: ['shark', 'serpent', 'kraken'][Math.floor(rand(0, 3))],
            size: Math.round(rand(18, 80))
        });
    }
    return creatures;
}
