// Combat system: AI, projectiles, damage
import { rand, clamp, normalizeAngle } from '../utils/math.js';
import { CONFIG } from '../core/config.js';

export function spawnCannonball(owner, tx, ty, speed, cannonballs, player) {
    const ox = owner.x;
    const oy = owner.y;
    const dx = tx - ox;
    const dy = ty - oy;
    const dist = Math.hypot(dx, dy);
    const horizSpeed = Math.max(60, speed || 300);

    const travelTime = clamp(dist / horizSpeed, 0.5, 3.0);
    const initZ = 40 + Math.min(80, dist * 0.03);
    const vz = (initZ + 0.5 * CONFIG.GRAVITY * travelTime * travelTime) / travelTime;

    const vx = dx / travelTime;
    const vy = dy / travelTime;

    const b = {
        x: ox,
        y: oy,
        z: initZ,
        vx: vx,
        vy: vy,
        vz: vz,
        ownerId: (owner === player) ? 'player' : owner.id,
        damage: 20 + ((owner.level) ? owner.level * 4 : 0),
        travelTime: 0
    };
    cannonballs.push(b);
}

export function updatePveShipAI(ship, player, dt, cannonballs) {
    ship.cannonCooldown = Math.max(0, ship.cannonCooldown - dt);
    ship.stateTimer -= dt;

    const dx = player.x - ship.x;
    const dy = player.y - ship.y;
    const dist = Math.hypot(dx, dy);

    // State transitions
    if (dist < ship.aggroRange) {
        if (dist <= ship.attackRange) {
            ship.state = 'attack';
        } else {
            ship.state = 'chase';
        }
    } else {
        if (ship.stateTimer <= 0) {
            ship.state = 'patrol';
            ship.stateTimer = rand(2, 5);
        }
    }

    // Behavior
    if (ship.state === 'patrol') {
        ship.dir += rand(-0.01, 0.01) * dt;
        ship.x += Math.cos(ship.dir) * ship.speed * dt * 60;
        ship.y += Math.sin(ship.dir) * ship.speed * dt * 60;
    } else if (ship.state === 'chase') {
        ship.dir = Math.atan2(dy, dx);
        ship.x += Math.cos(ship.dir) * ship.speed * dt * 120;
        ship.y += Math.sin(ship.dir) * ship.speed * dt * 120;
    } else if (ship.state === 'attack') {
        ship.dir = Math.atan2(dy, dx);
        
        // Keep distance instead of stacking on player
        const keepawayDist = 180;
        if (dist > keepawayDist) {
            ship.x += Math.cos(ship.dir) * ship.speed * dt * 40;
            ship.y += Math.sin(ship.dir) * ship.speed * dt * 40;
        } else if (dist < keepawayDist - 30) {
            // Back away if too close
            ship.x -= Math.cos(ship.dir) * ship.speed * dt * 25;
            ship.y -= Math.sin(ship.dir) * ship.speed * dt * 25;
        }
        // Else maintain distance

        if (ship.cannonCooldown <= 0) {
            spawnCannonball(ship, player.x, player.y, 320 + ship.level * 20, cannonballs, player);
            ship.cannonCooldown = 1.5 - Math.min(1.0, ship.level * 0.05);
        }
    }

    ship.x = clamp(ship.x, 0, CONFIG.MAP_WIDTH);
    ship.y = clamp(ship.y, 0, CONFIG.MAP_HEIGHT);
}

export function updateCannonballs(cannonballs, player, pveShips, dt) {
    for (let i = cannonballs.length - 1; i >= 0; i--) {
        const b = cannonballs[i];
        b.x += b.vx * dt * 60;
        b.y += b.vy * dt * 60;
        b.vz -= CONFIG.GRAVITY * dt * 60;
        b.z += b.vz * dt * 60;
        b.travelTime += dt;

        if (b.z <= 0) {
            const hitRadius = 28;
            let hit = null;

            const pd = Math.hypot(b.x - player.x, b.y - player.y);
            if (pd <= hitRadius && b.ownerId !== 'player') {
                hit = player;
            }

            if (!hit) {
                for (const s of pveShips) {
                    const sd = Math.hypot(b.x - s.x, b.y - s.y);
                    // Only allow player cannonballs to hit NPCs (PvP disabled)
                    if (sd <= hitRadius && b.ownerId === 'player') {
                        hit = s;
                        break;
                    }
                }
            }

            if (hit) {
                hit.hp = (hit.hp || hit.maxHp || 50) - (b.damage || 25);
                if (hit.hp <= 0) {
                    if (hit === player) {
                        player.x = CONFIG.MAP_WIDTH / 2;
                        player.y = CONFIG.MAP_HEIGHT / 2;
                        player.hp = player.maxHp;
                    } else {
                        hit.x = rand(100, CONFIG.MAP_WIDTH - 100);
                        hit.y = rand(100, CONFIG.MAP_HEIGHT - 100);
                        hit.hp = hit.maxHp;
                        hit.state = 'patrol';
                    }
                }
            }

            cannonballs.splice(i, 1);
        }
    }
}
