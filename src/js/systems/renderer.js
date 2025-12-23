// Rendering system
import { clamp } from '../utils/math.js';
import { CONFIG } from '../core/config.js';
import { spriteManager } from '../systems/spriteManager.js';

export function renderGame(ctx, camera, map, player, cannonballs, canvas, selectedShip = null, loot = [], effects = []) {
    ctx.save();
    ctx.fillStyle = '#0a2b45';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.translate(-camera.x, -camera.y);

    // Draw target indicator if player has a target
    if (player.targetX !== undefined && player.targetY !== undefined) {
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 4]);
        ctx.beginPath();
        ctx.arc(player.targetX, player.targetY, 20, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // Ocean grid
    const tile = 200;
    ctx.fillStyle = 'rgba(10,25,50,0.25)';
    for (let x = 0; x < CONFIG.MAP_WIDTH; x += tile) {
        ctx.fillRect(x, 0, 2, CONFIG.MAP_HEIGHT);
    }
    for (let y = 0; y < CONFIG.MAP_HEIGHT; y += tile) {
        ctx.fillRect(0, y, CONFIG.MAP_WIDTH, 2);
    }

    // Islands
    for (const isl of map.islands) {
        const grad = ctx.createLinearGradient(isl.x - isl.r, isl.y - isl.r, isl.x + isl.r, isl.y + isl.r);
        grad.addColorStop(0, '#b78f4c');
        grad.addColorStop(0.6, '#8b5a2b');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(isl.x, isl.y, isl.r, isl.r * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();

        const trees = Math.max(1, Math.round(isl.r / 80));
        ctx.fillStyle = '#2e7d32';
        for (let t = 0; t < trees; t++) {
            const theta = (t / trees) * Math.PI * 2;
            const tx = isl.x + Math.cos(theta) * (isl.r * 0.5);
            const ty = isl.y + Math.sin(theta) * (isl.r * 0.4) - 6;
            ctx.beginPath();
            ctx.arc(tx, ty, 6, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Creatures
    for (const c of map.creatures) {
        ctx.fillStyle = c.type === 'shark' ? '#9e9e9e' : c.type === 'serpent' ? '#7b1fa2' : '#263238';
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.size / 2, 0, Math.PI * 2);
        ctx.fill();
    }

    // Treasures
    for (const treasure of map.treasures) {
        // Glow effect
        const gradient = ctx.createRadialGradient(treasure.x, treasure.y, 0, treasure.x, treasure.y, 30);
        gradient.addColorStop(0, 'rgba(255, 215, 0, 0.6)');
        gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(treasure.x, treasure.y, 30, 0, Math.PI * 2);
        ctx.fill();

        // Treasure chest
        ctx.save();
        ctx.translate(treasure.x, treasure.y);

        // Chest base
        ctx.fillStyle = '#8B4513';
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        ctx.fillRect(-12, -8, 24, 16);
        ctx.strokeRect(-12, -8, 24, 16);

        // Chest lid
        ctx.fillStyle = '#A0522D';
        ctx.fillRect(-12, -12, 24, 4);
        ctx.strokeRect(-12, -12, 24, 4);

        // Lock
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    // PvE ships (drawing after treasures so they appear on top)
    for (const s of map.pveShips) {
        // Draw selection indicator if this ship is selected
        if (selectedShip === s) {
            ctx.save();
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 3;
            ctx.setLineDash([8, 8]);
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size + 15, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();
        }

        drawShip(ctx, s.x, s.y, s.dir, '#ff5252', s.size, s.level || 1);
        drawNameAndBar(ctx, s.x, s.y - s.size - 6, s.name || 'Enemy', s.level || 1, (s.hp / (s.maxHp || 50)) * 100);
    }

    // Player
    drawShip(ctx, player.x, player.y, player.a, '#ffd700', 64, player.level || 1);
    drawNameAndBar(ctx, player.x, player.y - 70, player.name || 'Captain', player.level || 1, (player.hp / player.maxHp) * 100);

    // Loot items
    for (const item of loot) {
        ctx.save();
        ctx.translate(item.x, item.y);

        // Draw glow effect
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 20);
        if (item.type === 'gold') {
            gradient.addColorStop(0, 'rgba(255, 215, 0, 0.5)');
            gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(0, 0, 20, 0, Math.PI * 2);
            ctx.fill();

            // Gold coin
            ctx.fillStyle = '#FFD700';
            ctx.strokeStyle = '#FFA500';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        } else if (item.type === 'jewelry') {
            gradient.addColorStop(0, 'rgba(138, 43, 226, 0.5)');
            gradient.addColorStop(1, 'rgba(138, 43, 226, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(0, 0, 20, 0, Math.PI * 2);
            ctx.fill();

            // Jewelry gem
            ctx.fillStyle = '#8A2BE2';
            ctx.strokeStyle = '#4B0082';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, -8);
            ctx.lineTo(6, 0);
            ctx.lineTo(0, 8);
            ctx.lineTo(-6, 0);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        } else if (item.type === 'cannonballs') {
            gradient.addColorStop(0, 'rgba(128, 128, 128, 0.5)');
            gradient.addColorStop(1, 'rgba(128, 128, 128, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(0, 0, 20, 0, Math.PI * 2);
            ctx.fill();

            // Cannonball pile
            ctx.fillStyle = '#555';
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            for (let i = 0; i < 3; i++) {
                const offsetX = (i - 1) * 5;
                ctx.beginPath();
                ctx.arc(offsetX, 0, 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            }
        }

        ctx.restore();
    }

    // Visual effects
    for (const effect of effects) {
        ctx.save();
        ctx.globalAlpha = effect.alpha;

        if (effect.type === 'hit') {
            // Red flash for hits
            ctx.fillStyle = '#ff0000';
            ctx.beginPath();
            ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
            ctx.fill();
        } else if (effect.type === 'explosion') {
            // Orange expanding rings for explosions
            ctx.strokeStyle = '#ff6600';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
            ctx.stroke();

            ctx.strokeStyle = '#ff9900';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(effect.x, effect.y, effect.radius * 0.7, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.restore();
    }

    // Cannonballs
    for (const b of cannonballs) {
        const shadowAlpha = clamp(1 - (b.z / 150), 0.25, 0.85);
        const shadowSize = 6 + (1 - clamp(b.z / 150, 0, 1)) * 8;
        ctx.fillStyle = `rgba(0,0,0,${0.35 * shadowAlpha})`;
        ctx.beginPath();
        ctx.ellipse(b.x, b.y, shadowSize, shadowSize * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#222';
        const scale = 1 + (b.z / 120);
        const size = Math.max(3, Math.round(4 * scale));
        ctx.beginPath();
        ctx.arc(b.x, b.y - Math.max(0, b.z), size, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}
function drawShip(ctx, x, y, angle, color, size, level = 1) {
    ctx.save();
    ctx.translate(x, y);

    // Try to use sprite if available
    const isPlayer = (color === '#ffd700');
    const spriteName = isPlayer ? `player_ship_tier${level}` : 'enemy_ship';
    const frameData = spriteManager.getSpriteFrame(spriteName, angle);

    if (frameData && frameData.sprite) {
        const { sprite, frameIndex } = frameData;

        // Sprite sheet is 4x4 grid (16 frames)
        const cols = 4;
        const rows = 4;
        const frameWidth = sprite.width / cols;
        const frameHeight = sprite.height / rows;

        // Calculate source position in sprite sheet
        const srcX = (frameIndex % cols) * frameWidth;
        const srcY = Math.floor(frameIndex / cols) * frameHeight;

        // Draw the specific frame
        const scale = (size * 2) / Math.max(frameWidth, frameHeight);
        const w = frameWidth * scale;
        const h = frameHeight * scale;

        ctx.drawImage(
            sprite,
            srcX, srcY, frameWidth, frameHeight,  // source
            -w / 2, -h / 2, w, h                   // destination
        );
    } else {
        // Fallback: draw triangle ship
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(size, 0);
        ctx.lineTo(-size * 0.6, size * 0.6);
        ctx.lineTo(-size * 0.6, -size * 0.6);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#6d4c41';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-size * 0.2, -size * 0.2);
        ctx.lineTo(-size * 0.2, size * 0.2);
        ctx.stroke();
    }

    ctx.restore();
}

function drawNameAndBar(ctx, x, y, name, level, healthPct) {
    const padding = 6;
    const barW = 80;
    const barH = 8;

    ctx.save();
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(0,0,0,0.7)';
    ctx.strokeText(name + ' (Lv ' + level + ')', x, y - 10);
    ctx.fillStyle = '#fff';
    ctx.fillText(name + ' (Lv ' + level + ')', x, y - 10);

    const bx = x - barW / 2;
    const by = y;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    roundRect(ctx, bx - padding / 2, by - padding / 2, barW + padding, barH + padding, 4, true, false);

    const pct = clamp(healthPct, 0, 100) / 100;
    const fillW = Math.round(barW * pct);
    const grad = ctx.createLinearGradient(bx, by, bx + barW, by);
    grad.addColorStop(0, '#43a047');
    grad.addColorStop(1, '#c62828');
    ctx.fillStyle = grad;
    roundRect(ctx, bx, by, fillW, barH, 3, true, false);

    ctx.strokeStyle = '#ffffff33';
    ctx.lineWidth = 1;
    roundRect(ctx, bx, by, barW, barH, 3, false, true);
    ctx.restore();
}

function roundRect(ctx, x, y, w, h, r, fill, stroke) {
    if (typeof r === 'undefined') r = 5;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
}

export function renderMinimap(map, player, camera, canvasWidth, canvasHeight) {
    const minimapCanvas = document.getElementById('minimap');
    if (!minimapCanvas) return;

    const ctx = minimapCanvas.getContext('2d');
    const w = minimapCanvas.width;
    const h = minimapCanvas.height;
    const scale = w / CONFIG.MAP_WIDTH;

    // Clear
    ctx.fillStyle = '#0a2b45';
    ctx.fillRect(0, 0, w, h);

    // Draw islands
    ctx.fillStyle = '#8b5a2b';
    for (const island of map.islands) {
        const x = island.x * scale;
        const y = island.y * scale;
        const r = island.r * scale;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    // Draw treasures
    ctx.fillStyle = '#FFD700';
    for (const treasure of map.treasures) {
        const x = treasure.x * scale;
        const y = treasure.y * scale;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    // Draw PvE ships
    ctx.fillStyle = '#ff4444';
    for (const ship of map.pveShips) {
        const x = ship.x * scale;
        const y = ship.y * scale;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    // Draw player
    ctx.fillStyle = '#00ff00';
    const px = player.x * scale;
    const py = player.y * scale;
    ctx.beginPath();
    ctx.arc(px, py, 3, 0, Math.PI * 2);
    ctx.fill();

    // Draw viewport rectangle
    const vx = camera.x * scale;
    const vy = camera.y * scale;
    const vw = canvasWidth * scale;
    const vh = canvasHeight * scale;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(vx, vy, vw, vh);
}
