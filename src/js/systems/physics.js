// Physics and collision system
import { clamp } from '../utils/math.js';
import { CONFIG } from '../core/config.js';

export function updatePlayerMovement(player, keys, dt) {
    const acc = CONFIG.PLAYER_ACCELERATION;
    if (keys['w'] || keys['arrowup']) {
        player.vx += Math.cos(player.a) * acc * dt;
        player.vy += Math.sin(player.a) * acc * dt;
    }
    if (keys['s'] || keys['arrowdown']) {
        player.vx *= 0.98;
        player.vy *= 0.98;
    }
    if (keys['a'] || keys['arrowleft']) {
        player.a -= CONFIG.PLAYER_ROTATION_SPEED * dt;
    }
    if (keys['d'] || keys['arrowright']) {
        player.a += CONFIG.PLAYER_ROTATION_SPEED * dt;
    }

    // Apply velocity
    player.x += player.vx * dt;
    player.y += player.vy * dt;

    // Damping
    player.vx *= CONFIG.PLAYER_DAMPING;
    player.vy *= CONFIG.PLAYER_DAMPING;

    // Clamp to map
    player.x = clamp(player.x, 0, CONFIG.MAP_WIDTH);
    player.y = clamp(player.y, 0, CONFIG.MAP_HEIGHT);
}

export function handleIslandCollisions(player, islands) {
    for (const isl of islands) {
        const dx = player.x - isl.x;
        const dy = player.y - isl.y;
        const d = Math.hypot(dx, dy);
        if (d < isl.r + 12) {
            const desiredDist = isl.r + 12 + 2;
            if (d > 0) {
                const nx = dx / d;
                const ny = dy / d;
                player.x = isl.x + nx * desiredDist;
                player.y = isl.y + ny * desiredDist;
            } else {
                const ang = Math.random() * Math.PI * 2;
                player.x = isl.x + Math.cos(ang) * desiredDist;
                player.y = isl.y + Math.sin(ang) * desiredDist;
            }
            player.vx *= 0.2;
            player.vy *= 0.2;
            player.hp = Math.max(0, player.hp - 0.02 * desiredDist);
        }
    }
}

export function updateCamera(camera, player, canvasWidth, canvasHeight) {
    camera.x = clamp(player.x - canvasWidth / 2, 0, CONFIG.MAP_WIDTH - canvasWidth);
    camera.y = clamp(player.y - canvasHeight / 2, 0, CONFIG.MAP_HEIGHT - canvasHeight);
}
