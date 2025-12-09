// Rendering system
import { clamp } from '../utils/math.js';
import { CONFIG } from '../core/config.js';
import { spriteManager } from '../systems/spriteManager.js';

export function renderGame(ctx, camera, map, player, cannonballs, canvas) {
    ctx.save();
    ctx.fillStyle = '#0a2b45';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.translate(-camera.x, -camera.y);

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

    // PvE ships
    for (const s of map.pveShips) {
        drawShip(ctx, s.x, s.y, s.dir, '#ff5252', s.size, s.level || 1);
        drawNameAndBar(ctx, s.x, s.y - s.size - 6, s.name || 'Enemy', s.level || 1, (s.hp / (s.maxHp || 50)) * 100);
    }

    // Player
    drawShip(ctx, player.x, player.y, player.a, '#ffd700', 48, player.level || 1);
    drawNameAndBar(ctx, player.x, player.y - 54, player.name || 'Captain', player.level || 1, (player.hp / player.maxHp) * 100);

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
