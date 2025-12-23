// Main game orchestrator
import { CONFIG } from './config.js';
import { clamp } from '../utils/math.js';
import { generateIslands, generateCreatures, generateTreasures } from '../systems/mapGenerator.js';
import { generatePveShips, createPlayer, upgradeShip, canUpgradeShip } from '../entities/Ship.js';
import { updatePlayerMovement, handleIslandCollisions, updateCamera } from '../systems/physics.js';
import { updatePveShipAI, updateCannonballs, spawnCannonball } from '../systems/combat.js';
import { renderGame, renderMinimap } from '../systems/renderer.js';
import { spriteManager } from '../systems/spriteManager.js';

class Game {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.camera = { x: 0, y: 0 };
        this.map = { islands: [], creatures: [], pveShips: [], treasures: [] };
        this.cannonballs = [];
        this.loot = [];
        this.effects = [];
        this.player = null;
        this.keys = {};
        this.running = false;
        this.paused = false;
        this.lastTime = 0;
        this.selectedShip = null;
    }

    setupInput() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;

            // ESC to pause
            if (e.key === 'Escape') {
                e.preventDefault();
                this.togglePause();
            }

            // Spacebar to shoot
            if (e.key === ' ') {
                e.preventDefault();
                this.fireAtCursor();
            }
        });
        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });

        // Left click to move ship
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const worldX = e.clientX - rect.left + this.camera.x;
            const worldY = e.clientY - rect.top + this.camera.y;

            // Set target position for ship
            this.player.targetX = worldX;
            this.player.targetY = worldY;
        });

        // Right click to shoot
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left + this.camera.x;
            this.mouseY = e.clientY - rect.top + this.camera.y;
            this.fireAtCursor();
        });

        // Track mouse position for spacebar shooting
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left + this.camera.x;
            this.mouseY = e.clientY - rect.top + this.camera.y;
        });
    }

    togglePause() {
        this.paused = !this.paused;
        const pauseMenu = document.getElementById('pauseMenu');
        if (pauseMenu) {
            pauseMenu.style.display = this.paused ? 'flex' : 'none';
        }
    }

    tryUpgrade() {
        if (!this.player) return;
        
        if (canUpgradeShip(this.player)) {
            upgradeShip(this.player);
            this.updateHUDStats();
        }
    }

    updateHUDStats() {
        if (window.gameMenu && window.gameMenu.updateHUD && this.player) {
            window.gameMenu.updateHUD({
                health: clamp((this.player.hp / this.player.maxHp) * 100, 0, 100),
                gold: this.player.gold,
                jewelry: this.player.jewelry,
                cannonballs: this.player.cannonballs,
                level: this.player.level,
                tier: this.player.tier
            });
        }
    }

    fireAtCursor() {
        if (!this.player || !this.mouseX || !this.mouseY) return;

        // Check cooldown and ammo
        if (this.player.cannonCooldown > 0) return;
        if (this.player.cannonballs <= 0) return;

        // Fire cannonball toward mouse position
        spawnCannonball(this.player, this.mouseX, this.mouseY, 300, this.cannonballs, this.player);

        // Consume ammo
        this.player.cannonballs--;

        // Set cooldown (0.5 seconds)
        this.player.cannonCooldown = 0.5;
    }

    update(dt) {
        if (!this.player || this.paused) return;

        // Update player cooldowns
        if (this.player.cannonCooldown > 0) {
            this.player.cannonCooldown -= dt;
        }

        // Health regeneration (1 HP per second when not at full health)
        if (this.player.hp < this.player.maxHp) {
            this.player.hp = Math.min(this.player.maxHp, this.player.hp + dt);
        }

        // Update player
        updatePlayerMovement(this.player, this.keys, dt);
        handleIslandCollisions(this.player, this.map.islands);

        // Update PvE ships
        for (const ship of this.map.pveShips) {
            updatePveShipAI(ship, this.player, dt, this.cannonballs);
        }

        // Update projectiles
        updateCannonballs(this.cannonballs, this.player, this.map.pveShips, dt, this.loot, this.effects);

        // Collect loot
        for (let i = this.loot.length - 1; i >= 0; i--) {
            const item = this.loot[i];
            const dist = Math.hypot(this.player.x - item.x, this.player.y - item.y);
            if (dist < 40) {
                if (item.type === 'gold') {
                    this.player.gold += item.value;
                } else if (item.type === 'jewelry') {
                    this.player.jewelry += item.value;
                } else if (item.type === 'cannonballs') {
                    this.player.cannonballs += item.value;
                }
                this.loot.splice(i, 1);
            }
        }

        // Collect treasures
        for (let i = this.map.treasures.length - 1; i >= 0; i--) {
            const treasure = this.map.treasures[i];
            const dist = Math.hypot(this.player.x - treasure.x, this.player.y - treasure.y);
            if (dist < 40) {
                this.player.gold += treasure.value;
                this.map.treasures.splice(i, 1);
            }
        }

        // Update effects
        for (let i = this.effects.length - 1; i >= 0; i--) {
            const effect = this.effects[i];
            effect.life -= dt;
            if (effect.life <= 0) {
                this.effects.splice(i, 1);
            } else if (effect.type === 'explosion') {
                effect.radius += dt * 100;
                effect.alpha -= dt * 1.5;
            }
        }

        // Update camera
        updateCamera(this.camera, this.player, this.canvas.width, this.canvas.height, this.keys, dt);

        // Update HUD
        this.updateHUDStats();
    }

    draw() {
        renderGame(this.ctx, this.camera, this.map, this.player, this.cannonballs, this.canvas, this.selectedShip, this.loot, this.effects);
        renderMinimap(this.map, this.player, this.camera, this.canvas.width, this.canvas.height);
    }

    frame(timestamp) {
        if (!this.running) return;

        const dt = Math.min(1 / 15, (timestamp - this.lastTime) / 16.666);
        this.update(dt);
        this.draw();
        this.lastTime = timestamp;

        requestAnimationFrame((t) => this.frame(t));
    }

    async start(opts = {}) {
        if (this.running) return;

        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) {
            console.warn('No canvas found');
            return;
        }

        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.ctx = this.canvas.getContext('2d');

        // Load sprites (non-blocking, will use fallback if sprites fail)
        spriteManager.loadAll().catch(err => {
            console.warn('Continuing with fallback rendering');
        });

        // Generate world
        this.map.islands = generateIslands();
        this.map.creatures = generateCreatures();
        this.map.pveShips = generatePveShips();
        this.map.treasures = generateTreasures(this.map.islands);

        // Create player
        this.player = createPlayer(opts);

        // Initial HUD
        this.updateHUDStats();

        this.setupInput();
        this.running = true;
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.frame(t));

        // Update camera
        updateCamera(this.camera, this.player, this.canvas.width, this.canvas.height, this.keys, dt);

        // Resize handling
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            updateCamera(this.camera, this.player, this.canvas.width, this.canvas.height, this.keys, 0);
        });
    }
}

// Export singleton instance
const gameInstance = new Game();
window.Game = {
    start: (opts) => gameInstance.start(opts)
};
window.gameInstance = gameInstance;

export default gameInstance;
