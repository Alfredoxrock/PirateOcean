// Combat system: AI, projectiles, damage
import { rand, clamp, normalizeAngle } from '../utils/math.js';
import { CONFIG } from '../core/config.js';

// ==================== WEAPON SYSTEM ====================

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

// ==================== AI CONFIGURATION ====================

const AI_CONFIG = {
    AGGRESSION_DURATION: 15,        // Seconds to stay aggressive after being hit
    PATROL_DURATION_MIN: 3,         // Min patrol state duration
    PATROL_DURATION_MAX: 8,         // Max patrol state duration
    EVASION_RANGE: 110,             // Distance to start evading cannonballs
    EVASION_MULTIPLIER: 90,         // Speed multiplier when evading
    SEPARATION_DISTANCE: 40,        // Min distance to keep from player
    BROADSIDE_ANGLE_MIN: 0.25,      // Min angle for broadside firing
    BROADSIDE_ANGLE_MAX: 1.6,       // Max angle for broadside firing
};

// ==================== AI BEHAVIORS ====================

const AIBehaviors = {
    patrol: (ship, context) => {
        const { dt } = context;
        // Random wandering behavior
        ship.dir += rand(-0.02, 0.02) * dt;
        ship.x += Math.cos(ship.dir) * ship.speed * dt * 40;
        ship.y += Math.sin(ship.dir) * ship.speed * dt * 40;
    },

    chase: (ship, context) => {
        const { player, angleToPlayer, desiredDist, dt } = context;
        // Initialize flank side if needed
        if (typeof ship._flankSide === 'undefined') {
            ship._flankSide = Math.random() < 0.5 ? 1 : -1;
        }

        // Move to flanking position around player
        const flankAngle = angleToPlayer + (Math.PI / 2) * ship._flankSide;
        const tx = player.x + Math.cos(flankAngle) * desiredDist;
        const ty = player.y + Math.sin(flankAngle) * desiredDist;
        const angToTarget = Math.atan2(ty - ship.y, tx - ship.x);

        ship.dir = angToTarget;
        ship.x += Math.cos(ship.dir) * ship.speed * dt * 80;
        ship.y += Math.sin(ship.dir) * ship.speed * dt * 80;
    },

    attack: (ship, context) => {
        const { player, angleToPlayer, desiredDist, dist, dt, cannonballs } = context;

        // Initialize circle phase if needed
        if (typeof ship._circlePhase === 'undefined') {
            ship._circlePhase = Math.random() * Math.PI * 2;
        }

        // Circle around player to present broadside
        ship._circlePhase += (0.5 + (ship.level || 1) * 0.05) * dt;
        const circX = player.x + Math.cos(ship._circlePhase) * desiredDist;
        const circY = player.y + Math.sin(ship._circlePhase) * desiredDist;
        const angToCirc = Math.atan2(circY - ship.y, circX - ship.x);

        ship.dir = angToCirc;
        ship.x += Math.cos(ship.dir) * ship.speed * dt * 60;
        ship.y += Math.sin(ship.dir) * ship.speed * dt * 60;

        // Back off if too close
        if (dist < desiredDist - 20) {
            ship.x -= Math.cos(angleToPlayer) * ship.speed * dt * 30;
            ship.y -= Math.sin(angleToPlayer) * ship.speed * dt * 30;
        }

        // Fire broadside when perpendicular to player
        tryFireBroadside(ship, context);
    },
};

// ==================== AI HELPER FUNCTIONS ====================

function initializeAIState(ship) {
    if (typeof ship._aggressionTimer === 'undefined') {
        ship._aggressionTimer = 0;
    }
}

function updateTimers(ship, dt) {
    ship.cannonCooldown = Math.max(0, ship.cannonCooldown - dt);
    ship.stateTimer = (ship.stateTimer || 0) - dt;
    ship._aggressionTimer = Math.max(0, ship._aggressionTimer - dt);
}

function selectAIState(ship, context) {
    const { dist, wasHitRecently } = context;

    // Aggressive state if recently attacked
    if (wasHitRecently && dist < ship.aggroRange) {
        return dist <= ship.attackRange ? 'attack' : 'chase';
    }

    // Neutral patrol state by default
    if (!ship.state || ship.state === 'patrol' || ship.stateTimer <= 0) {
        ship.stateTimer = rand(AI_CONFIG.PATROL_DURATION_MIN, AI_CONFIG.PATROL_DURATION_MAX);
        return 'patrol';
    }

    return ship.state;
}

function tryEvadeCannonballs(ship, cannonballs, dt) {
    for (const b of cannonballs) {
        if (b.ownerId === ship.id) continue;

        const db = Math.hypot(b.x - ship.x, b.y - ship.y);
        if (db < AI_CONFIG.EVASION_RANGE && b.z > 0) {
            const evadeAng = Math.atan2(b.vy, b.vx) + Math.PI / 2;
            ship.x += Math.cos(evadeAng) * ship.speed * dt * AI_CONFIG.EVASION_MULTIPLIER;
            ship.y += Math.sin(evadeAng) * ship.speed * dt * AI_CONFIG.EVASION_MULTIPLIER;
            ship.cannonCooldown = Math.max(ship.cannonCooldown, 0.25);
            ship.x = clamp(ship.x, 0, CONFIG.MAP_WIDTH);
            ship.y = clamp(ship.y, 0, CONFIG.MAP_HEIGHT);
            return true;
        }
    }
    return false;
}

function tryFireBroadside(ship, context) {
    const { player, angleToPlayer, cannonballs } = context;

    // Check if perpendicular enough for broadside
    const angDiff = Math.abs(((ship.dir - angleToPlayer) + Math.PI) % (Math.PI * 2) - Math.PI);
    const canFire = ship.cannonCooldown <= 0 &&
        angDiff > AI_CONFIG.BROADSIDE_ANGLE_MIN &&
        angDiff < AI_CONFIG.BROADSIDE_ANGLE_MAX;

    if (canFire) {
        const projectileSpeed = 320 + (ship.level || 1) * 26;
        spawnCannonball(ship, player.x, player.y, projectileSpeed, cannonballs, player);
        ship.cannonCooldown = 1.4 - Math.min(0.9, (ship.level || 1) * 0.04);
    }
}

function applySeparation(ship, context) {
    const { player, dist, dx, dy } = context;
    const keepaway = AI_CONFIG.SEPARATION_DISTANCE + (ship.size || 24);

    if (dist < keepaway && dist > 0) {
        ship.x -= (dx / dist) * (keepaway - dist) * 0.6;
        ship.y -= (dy / dist) * (keepaway - dist) * 0.6;
    }
}

function constrainToMap(ship) {
    ship.x = clamp(ship.x, 0, CONFIG.MAP_WIDTH);
    ship.y = clamp(ship.y, 0, CONFIG.MAP_HEIGHT);
}

// ==================== MAIN AI UPDATE ====================

export function updatePveShipAI(ship, player, dt, cannonballs) {
    // Initialize AI state
    initializeAIState(ship);
    updateTimers(ship, dt);

    // Calculate relative position to player
    const dx = player.x - ship.x;
    const dy = player.y - ship.y;
    const dist = Math.hypot(dx, dy);
    const angleToPlayer = Math.atan2(dy, dx);
    const desiredDist = clamp(220 + (6 - (ship.level || 1)) * 8, 140, 320);
    const wasHitRecently = ship._aggressionTimer > 0;

    // Build context object for behaviors
    const context = {
        ship, player, dt, cannonballs,
        dx, dy, dist, angleToPlayer, desiredDist, wasHitRecently
    };

    // Try to evade incoming projectiles (highest priority)
    if (tryEvadeCannonballs(ship, cannonballs, dt)) {
        return;
    }

    // Select and execute AI state
    ship.state = selectAIState(ship, context);
    const behavior = AIBehaviors[ship.state];
    if (behavior) {
        behavior(ship, context);
    }

    // Apply separation and boundary constraints
    applySeparation(ship, context);
    constrainToMap(ship);
}

// ==================== PROJECTILE SYSTEM ====================

export function updateCannonballs(cannonballs, player, pveShips, dt, loot = []) {
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

                // If player hit an NPC, make it aggressive
                if (hit !== player && b.ownerId === 'player') {
                    hit._aggressionTimer = 15; // Stay aggressive for 15 seconds after being hit
                }

                if (hit.hp <= 0) {
                    if (hit === player) {
                        player.x = CONFIG.MAP_WIDTH / 2;
                        player.y = CONFIG.MAP_HEIGHT / 2;
                        player.hp = player.maxHp;
                    } else {
                        // Spawn loot when NPC dies
                        const lootValue = rand(10, 30) + hit.level * 5;
                        const lootType = Math.random() < 0.7 ? 'gold' : 'jewelry';
                        loot.push({
                            x: hit.x,
                            y: hit.y,
                            type: lootType,
                            value: lootValue
                        });

                        // Also drop some cannonballs
                        if (Math.random() < 0.5) {
                            loot.push({
                                x: hit.x + rand(-20, 20),
                                y: hit.y + rand(-20, 20),
                                type: 'cannonballs',
                                value: rand(5, 15)
                            });
                        }

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
