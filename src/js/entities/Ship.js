// Ship entity class for PvE ships
import { rand } from '../utils/math.js';
import { CONFIG, PIRATE_NAMES } from '../core/config.js';

export function generatePveShips() {
    const ships = [];
    for (let i = 0; i < CONFIG.NUM_PVE_SHIPS; i++) {
        const level = Math.max(1, Math.round(rand(1, 8)));
        const maxHp = 30 + level * 20;
        ships.push({
            id: i,
            name: PIRATE_NAMES[i % PIRATE_NAMES.length],
            x: rand(100, CONFIG.MAP_WIDTH - 100),
            y: rand(100, CONFIG.MAP_HEIGHT - 100),
            speed: rand(5, 15) / 100,
            dir: rand(0, Math.PI * 2),
            hp: maxHp,
            maxHp: maxHp,
            level: level,
            size: Math.round(rand(18, 42)),
            // AI state
            state: 'patrol',
            stateTimer: rand(1, 4),
            aggroRange: 400 + level * 20,
            attackRange: 260 + level * 10,
            cannonCooldown: 0
        });
    }
    return ships;
}

export function createPlayer(opts) {
    return {
        name: (opts && opts.name) || 'Captain',
        x: CONFIG.MAP_WIDTH / 2,
        y: CONFIG.MAP_HEIGHT / 2,
        vx: 0,
        vy: 0,
        a: 0,
        hp: 100,
        maxHp: 100,
        level: (opts && opts.level) || 1,
        xp: 0,
        xpToNext: 100,
        weaponRange: 420,
        cannonCooldown: 0,
        gold: 0,
        jewelry: 0,
        cannonballs: 50
    };
}
