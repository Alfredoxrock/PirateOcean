// Physics and collision system
import { clamp } from '../utils/math.js';
import { CONFIG } from '../core/config.js';

export function updatePlayerMovement(player, keys, dt) {
    // Move ship towards target position if set
    if (player.targetX !== undefined && player.targetY !== undefined) {
        const dx = player.targetX - player.x;
        const dy = player.targetY - player.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 5) {
            // Calculate ship speed based on level
            const speedMultiplier = Math.max(1, 2 - (player.level * 0.08));
            const speed = CONFIG.PLAYER_ACCELERATION * speedMultiplier * 200;

            // Normalize direction
            const nx = dx / dist;
            const ny = dy / dist;

            // Set velocity towards target
            player.vx = nx * speed * dt;
            player.vy = ny * speed * dt;
            player.a = Math.atan2(dy, dx);

            // Apply velocity
            player.x += player.vx * dt;
            player.y += player.vy * dt;
        } else {
            // Reached target
            player.targetX = undefined;
            player.targetY = undefined;
            player.vx = 0;
            player.vy = 0;
        }
    } else {
        // Gradually slow down if no target
        player.vx *= 0.85;
        player.vy *= 0.85;

        if (Math.abs(player.vx) < 0.01) player.vx = 0;
        if (Math.abs(player.vy) < 0.01) player.vy = 0;
    }

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

export function updateCamera(camera, player, canvasWidth, canvasHeight, keys, dt) {
    // Camera movement with WASD keys
    const cameraSpeed = 400;

    if (keys['w'] || keys['arrowup']) {
        camera.y -= cameraSpeed * dt;
    }
    if (keys['s'] || keys['arrowdown']) {
        camera.y += cameraSpeed * dt;
    }
    if (keys['a'] || keys['arrowleft']) {
        camera.x -= cameraSpeed * dt;
    }
    if (keys['d'] || keys['arrowright']) {
        camera.x += cameraSpeed * dt;
    }

    // Clamp camera to map bounds
    camera.x = clamp(camera.x, 0, CONFIG.MAP_WIDTH - canvasWidth);
    camera.y = clamp(camera.y, 0, CONFIG.MAP_HEIGHT - canvasHeight);
}
