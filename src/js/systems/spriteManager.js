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
        // Player ship sprite sheet (16 directional frames in a grid)
        this.loadSprite('player_ship_tier1', 'assets/sprites/ShipLevel1.png');
        this.loadSprite('player_ship_tier2', 'assets/sprites/player_ship_tier2.png');
        this.loadSprite('player_ship_tier3', 'assets/sprites/player_ship_tier3.png');
        this.loadSprite('player_ship_tier4', 'assets/sprites/player_ship_tier4.png');
        this.loadSprite('player_ship_tier5', 'assets/sprites/player_ship_tier5.png');
        this.loadSprite('player_ship_tier6', 'assets/sprites/player_ship_tier6.png');
        this.loadSprite('player_ship_tier7', 'assets/sprites/player_ship_tier7.png');
        this.loadSprite('player_ship_tier8', 'assets/sprites/player_ship_tier8.png');
        this.loadSprite('player_ship_tier9', 'assets/sprites/player_ship_tier9.png');
        this.loadSprite('player_ship_tier10', 'assets/sprites/player_ship_tier10.png');

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

    // Get sprite frame from sprite sheet based on angle (16 directions)
    getSpriteFrame(spriteName, angle) {
        const sprite = this.sprites[spriteName];
        if (!sprite || !sprite.complete) return null;

        // Normalize angle to 0-360 degrees
        let normalizedAngle = ((angle * 180 / Math.PI) % 360 + 360) % 360;
        
        // Rotate by 90 degrees to match sprite sheet layout
        // (sprite sheet has up at 0, we have right at 0)
        normalizedAngle = (normalizedAngle + 90) % 360;

        // Calculate which of 16 frames to use (clockwise from top)
        const frameIndex = Math.round(normalizedAngle / 22.5) % 16;

        return { sprite, frameIndex };
    }

    isLoaded() {
        return this.loaded;
    }
}

// Singleton instance
export const spriteManager = new SpriteManager();
