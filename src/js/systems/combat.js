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
    // Update timers
    ship.cannonCooldown = Math.max(0, ship.cannonCooldown - dt);
    ship.stateTimer = (ship.stateTimer || 0) - dt;

    // Relative vector to player
    const dx = player.x - ship.x;
    const dy = player.y - ship.y;
    const dist = Math.hypot(dx, dy);
    const angleToPlayer = Math.atan2(dy, dx);

    // Desired engagement distance scales with level
    const desiredDist = clamp(220 + (6 - (ship.level || 1)) * 8, 140, 320);

    // State selection
    if (dist < ship.aggroRange) {
        ship.state = dist <= ship.attackRange ? 'attack' : 'chase';
    } else {
        if (!ship.state || ship.state === 'patrol') {
            if (ship.stateTimer <= 0) {
                ship.state = 'patrol';
                ship.stateTimer = rand(2, 6);
            }
        } else {
            ship.state = 'patrol';
            ship.stateTimer = rand(2, 6);
        }
    }

    // Dodge incoming cannonballs (simple heuristic)
    for (const b of cannonballs) {
        if (b.ownerId === ship.id) continue;
        const db = Math.hypot(b.x - ship.x, b.y - ship.y);
        if (db < 110 && b.z > 0) {
            const evadeAng = Math.atan2(b.vy, b.vx) + Math.PI / 2;
            ship.x += Math.cos(evadeAng) * ship.speed * dt * 90;
            ship.y += Math.sin(evadeAng) * ship.speed * dt * 90;
            ship.cannonCooldown = Math.max(ship.cannonCooldown, 0.25);
            ship.x = clamp(ship.x, 0, CONFIG.MAP_WIDTH);
            ship.y = clamp(ship.y, 0, CONFIG.MAP_HEIGHT);
            return;
        }
    }

    // Behaviors
    if (ship.state === 'patrol') {
        ship.dir += rand(-0.02, 0.02) * dt;
        ship.x += Math.cos(ship.dir) * ship.speed * dt * 40;
        ship.y += Math.sin(ship.dir) * ship.speed * dt * 40;
    }
    else if (ship.state === 'chase') {
        // Move to flanking/broadside position around player
        if (typeof ship._flankSide === 'undefined') ship._flankSide = Math.random() < 0.5 ? 1 : -1;
        const flankAngle = angleToPlayer + (Math.PI / 2) * ship._flankSide;
        const tx = player.x + Math.cos(flankAngle) * desiredDist;
        const ty = player.y + Math.sin(flankAngle) * desiredDist;
        const angToTarget = Math.atan2(ty - ship.y, tx - ship.x);
        ship.dir = angToTarget;
        ship.x += Math.cos(ship.dir) * ship.speed * dt * 80;
        ship.y += Math.sin(ship.dir) * ship.speed * dt * 80;
    }
    else if (ship.state === 'attack') {
        // Circle around player to present broadside
        if (typeof ship._circlePhase === 'undefined') ship._circlePhase = Math.random() * Math.PI * 2;
        ship._circlePhase += (0.5 + (ship.level || 1) * 0.05) * dt;
        const circX = player.x + Math.cos(ship._circlePhase) * desiredDist;
        const circY = player.y + Math.sin(ship._circlePhase) * desiredDist;
        const angToCirc = Math.atan2(circY - ship.y, circX - ship.x);
        ship.dir = angToCirc;
        ship.x += Math.cos(ship.dir) * ship.speed * dt * 60;
        ship.y += Math.sin(ship.dir) * ship.speed * dt * 60;

        // If too close, back off
        if (dist < desiredDist - 20) {
            ship.x -= Math.cos(angleToPlayer) * ship.speed * dt * 30;
            ship.y -= Math.sin(angleToPlayer) * ship.speed * dt * 30;
        }

        // Fire when roughly perpendicular to player (broadside)
        const angDiff = Math.abs(((ship.dir - angleToPlayer) + Math.PI) % (Math.PI * 2) - Math.PI);
        if (ship.cannonCooldown <= 0 && angDiff > 0.25 && angDiff < 1.6) {
            spawnCannonball(ship, player.x, player.y, 320 + (ship.level || 1) * 26, cannonballs, player);
            ship.cannonCooldown = 1.4 - Math.min(0.9, (ship.level || 1) * 0.04);
        }
    }

    // Separation from player to avoid stacking
    const keepaway = 40 + (ship.size || 24);
    if (dist < keepaway) {
        ship.x -= (dx / (dist || 1)) * (keepaway - dist) * 0.6;
        ship.y -= (dy / (dist || 1)) * (keepaway - dist) * 0.6;
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
