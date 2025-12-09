// Sprite loader and manager
export class SpriteManager {
    constructor() {
        this.sprites = {};
        this.loaded = false;
        this.loadPromises = [];
    }

    loadSprite(name, path) {
        const img = new Image();
        const promise = new Promise((resolve, reject) => {
            img.onload = () => {
                this.sprites[name] = img;
                resolve(img);
            };
            img.onerror = () => {
                console.warn(`Failed to load sprite: ${path}`);
                reject(new Error(`Failed to load ${path}`));
            };
        });
        img.src = path;
        this.loadPromises.push(promise);
        return promise;
    }

    async loadAll() {
        // Player ships (different tiers)
        this.loadSprite('player_ship', 'assets/sprites/player_ship.png');

        // NPC ships
        this.loadSprite('enemy_ship', 'assets/sprites/enemy_ship.png');

        // Islands
        this.loadSprite('island_small', 'assets/sprites/island_small.png');
        this.loadSprite('island_medium', 'assets/sprites/island_medium.png');

        // Creatures
        this.loadSprite('shark', 'assets/sprites/shark.png');
        this.loadSprite('serpent', 'assets/sprites/serpent.png');
        this.loadSprite('kraken', 'assets/sprites/kraken.png');

        try {
            await Promise.all(this.loadPromises);
            this.loaded = true;
            console.log('All sprites loaded successfully');
            return true;
        } catch (error) {
            console.warn('Some sprites failed to load, using fallback rendering');
            this.loaded = false;
            return false;
        }
    }

    getSprite(name) {
        return this.sprites[name] || null;
    }

    isLoaded() {
        return this.loaded;
    }
}

// Singleton instance
export const spriteManager = new SpriteManager();
