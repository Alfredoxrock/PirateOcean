// Main game orchestrator
import { CONFIG } from './config.js';
import { clamp } from '../utils/math.js';
import { generateIslands, generateCreatures } from '../systems/mapGenerator.js';
import { generatePveShips, createPlayer } from '../entities/Ship.js';
import { updatePlayerMovement, handleIslandCollisions, updateCamera } from '../systems/physics.js';
import { updatePveShipAI, updateCannonballs } from '../systems/combat.js';
import { renderGame } from '../systems/renderer.js';
import { spriteManager } from '../systems/spriteManager.js';

class Game {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.camera = { x: 0, y: 0 };
        this.map = { islands: [], creatures: [], pveShips: [] };
        this.cannonballs = [];
        this.player = null;
        this.keys = {};
        this.running = false;
        this.lastTime = 0;
        this.selectedShip = null;
    }

    setupInput() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
        });
        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });

        // Click to move ship
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const worldX = e.clientX - rect.left + this.camera.x;
            const worldY = e.clientY - rect.top + this.camera.y;

            // Set target position for ship
            this.player.targetX = worldX;
            this.player.targetY = worldY;
        });
    }

    update(dt) {
        if (!this.player) return;

        // Update player
        updatePlayerMovement(this.player, this.keys, dt);
        handleIslandCollisions(this.player, this.map.islands);

        // Update PvE ships
        for (const ship of this.map.pveShips) {
            updatePveShipAI(ship, this.player, dt, this.cannonballs);
        }

        // Update projectiles
        updateCannonballs(this.cannonballs, this.player, this.map.pveShips, dt);

        // Update camera
        updateCamera(this.camera, this.player, this.canvas.width, this.canvas.height, this.keys, dt);

        // Update HUD
        if (window.gameMenu && window.gameMenu.updateHUD) {
            window.gameMenu.updateHUD({
                health: clamp((this.player.hp / this.player.maxHp) * 100, 0, 100)
            });
        }
    }

    draw() {
        renderGame(this.ctx, this.camera, this.map, this.player, this.cannonballs, this.canvas, this.selectedShip);
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

        // Create player
        this.player = createPlayer(opts);

        // Initial HUD
        if (window.gameMenu && window.gameMenu.updateHUD) {
            window.gameMenu.updateHUD({ level: 1, gold: 0, health: 100 });
        }

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

export default gameInstance;
