# Assets Instructions

## Adding the Pirate Ship Sprite

To add your pirate ship sprite to the game:

1. **Download the sprite sheet** from the nicepng.com link you provided
2. **Save it** as `player_ship.png` in this `assets/sprites/` folder
3. **Refresh the game** - the sprite will automatically load and display

### Sprite Requirements

- **Format**: PNG with transparency
- **Recommended size**: 64x64 to 128x128 pixels per ship frame
- **File name**: `player_ship.png`

### Optional Sprite Additions

You can also add these optional sprites to enhance the game:

- `enemy_ship.png` - For NPC pirate ships
- `island_small.png`, `island_medium.png` - For islands
- `shark.png`, `serpent.png`, `kraken.png` - For sea creatures

### How It Works

The game uses a **SpriteManager** system that:
1. Attempts to load sprites from the `assets/sprites/` folder
2. Falls back to simple shapes if sprites aren't found
3. Automatically scales sprites to fit the game size
4. Handles sprite rotation for ship movement

### Current Status

- ✅ Sprite loading system implemented
- ⏳ Waiting for `player_ship.png` to be added
- 🎨 Fallback shapes render until sprites are added

Place your downloaded pirate ship sprite in this folder and the game will automatically use it!
