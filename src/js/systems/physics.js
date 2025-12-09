// Physics and collision system
import { clamp } from '../utils/math.js';
import { CONFIG } from '../core/config.js';

export function updatePlayerMovement(player, keys, dt) {
    // Lower level = faster ship (level 1 is fastest)
    const speedMultiplier = Math.max(1, 2 - (player.level * 0.08));
    const speed = CONFIG.PLAYER_ACCELERATION * speedMultiplier * 200;

    let moveX = 0;
    let moveY = 0;

    // Direct WASD movement
    if (keys['w'] || keys['arrowup']) {
        moveY = -1;
    }
    if (keys['s'] || keys['arrowdown']) {
        moveY = 1;
    }
    if (keys['a'] || keys['arrowleft']) {
        moveX = -1;
    }
    if (keys['d'] || keys['arrowright']) {
        moveX = 1;
    }

    // Normalize diagonal movement
    if (moveX !== 0 && moveY !== 0) {
        const len = Math.sqrt(moveX * moveX + moveY * moveY);
        moveX /= len;
        moveY /= len;
    }

    // Apply movement
    if (moveX !== 0 || moveY !== 0) {
        player.vx = moveX * speed * dt;
        player.vy = moveY * speed * dt;
        player.a = Math.atan2(moveY, moveX);
    } else {
        player.vx *= 0.85;
        player.vy *= 0.85;
    }

    // Apply velocity
    player.x += player.vx * dt;
    player.y += player.vy * dt;

    // No damping since we're using direct movement
    // player.vx *= CONFIG.PLAYER_DAMPING;
    // player.vy *= CONFIG.PLAYER_DAMPING;

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
