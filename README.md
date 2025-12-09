# PirateOcean
Sail a pirate ship into a vast PvP ocean where every player is an enemy or ally. Upgrade your vessel, hunt treasure, and battle rival captains in fast, strategic naval combat. Rule the seas or be swallowed by them.

## 🎮 Game Overview
A browser-based multiplayer pirate survival game where players control ships, battle enemies (PvP & PvE), collect treasures, and level up by destroying other vessels. Navigate through a procedurally generated ocean map filled with islands, sea creatures, and rival pirates.

---

## 🛠️ Tech Stack Requirements

### Frontend
- **HTML5 Canvas** or **WebGL** (using Phaser.js or PixiJS for 2D rendering)
- **JavaScript/TypeScript** for game logic
- **CSS3** for UI overlays and menus
- **WebSocket** (Socket.io) for real-time multiplayer

### Backend
- **Node.js** with Express.js for game server
- **Socket.io** for WebSocket connections
- **MongoDB** or **PostgreSQL** for player data persistence
- **Redis** (optional) for session management and leaderboards

### Deployment
- **Docker** for containerization
- **Nginx** as reverse proxy
- **AWS/DigitalOcean/Heroku** for hosting
- **CDN** (CloudFlare) for static assets

### Game Engine/Framework
- **Phaser 3** (recommended) - powerful 2D game framework
- OR **PixiJS** - WebGL renderer for performance
- OR **Three.js** - if 3D elements are desired

---

## 📋 Development Roadmap

### Phase 1: Core Setup
- [ ] Initialize project structure (client/server separation)
- [ ] Set up Phaser 3 game canvas
- [ ] Create basic HTML/CSS UI structure
- [ ] Establish WebSocket connection between client and server
- [ ] Implement basic player authentication

### Phase 2: Basic Gameplay
- [ ] Implement ship movement controls (WASD/Arrow keys)
- [ ] Create ocean map with infinite scrolling/wrapping
- [ ] Add collision detection system
- [ ] Implement basic shooting mechanics
- [ ] Create health system for ships
- [ ] Add respawn mechanism

### Phase 3: Game World
- [ ] Generate procedural ocean map with islands
- [ ] Implement island collision and navigation
- [ ] Add treasure spawn system
- [ ] Create treasure collection mechanics
- [ ] Implement fog of war or visibility radius

### Phase 4: Combat System
- [ ] PvE enemy AI (patrol patterns, targeting)
- [ ] PvP combat mechanics (player vs player)
- [ ] Different weapon types (cannons, mortars, etc.)
- [ ] Damage calculation system
- [ ] Ship destruction and loot drops

### Phase 5: Progression System
- [ ] XP and leveling system
- [ ] Ship upgrade system (speed, health, damage)
- [ ] Currency/gold system
- [ ] Inventory management
- [ ] Player statistics tracking

### Phase 6: Advanced Features
- [ ] Sea creature encounters (boss fights)
- [ ] Mini-map implementation
- [ ] Leaderboard system
- [ ] Team/Alliance system
- [ ] Chat functionality
- [ ] Sound effects and background music

### Phase 7: Polish & Optimization
- [ ] Mobile responsive controls
- [ ] Performance optimization
- [ ] Anti-cheat measures
- [ ] Server load balancing
- [ ] Bug fixes and playtesting

---

## 🎨 Art Asset Requirements

### Ship Sprites
**Player Ships (10 Tiers for PvP Progression)**
- `ship_player_tier1.png` - Rickety Sloop (starter ship, 4-8 directions)
- `ship_player_tier2.png` - Coastal Cutter (4-8 directions)
- `ship_player_tier3.png` - Merchant Brig (4-8 directions)
- `ship_player_tier4.png` - War Sloop (4-8 directions)
- `ship_player_tier5.png` - Corsair Frigate (4-8 directions)
- `ship_player_tier6.png` - Battle Galleon (4-8 directions)
- `ship_player_tier7.png` - Heavy Man-o-War (4-8 directions)
- `ship_player_tier8.png` - Imperial Warship (4-8 directions)
- `ship_player_tier9.png` - Legendary Dreadnought (4-8 directions)
- `ship_player_tier10.png` - Mythic Leviathan (ultimate ship, 4-8 directions)
- `ship_damaged_overlay.png` - Damage effect overlay (applies to all tiers)
- `ship_destroyed_animation.png` - Explosion sprite sheet (6-8 frames)

**Enemy Ships (PvE) - 10 Famous Pirate NPCs**
- `ship_blackbeard.png` - Blackbeard's Queen Anne's Revenge (Legendary - Heavy Frigate, 4-8 directions)
- `ship_anne_bonny.png` - Anne Bonny's Revenge (Agile - Fast Sloop, 4-8 directions)
- `ship_calico_jack.png` - Calico Jack's William (Balanced - Medium Brig, 4-8 directions)
- `ship_bartholomew_roberts.png` - Bartholomew Roberts' Royal Fortune (Heavy - War Galleon, 4-8 directions)
- `ship_henry_morgan.png` - Henry Morgan's Satisfaction (Assault - Armed Frigate, 4-8 directions)
- `ship_william_kidd.png` - William Kidd's Adventure Galley (Treasure Hunter - Cargo Ship, 4-8 directions)
- `ship_mary_read.png` - Mary Read's Ranger (Stealth - Light Sloop, 4-8 directions)
- `ship_edward_low.png` - Edward Low's Fancy (Aggressive - Attack Brigantine, 4-8 directions)
- `ship_charles_vane.png` - Charles Vane's Ranger (Raider - Pirate Schooner, 4-8 directions)
- `ship_francois_lolonnais.png` - François l'Olonnais' Terror (Boss - Massive Warship, 4-8 directions)
- `npc_ship_damaged.png` - NPC damage overlay
- `npc_ship_destroyed.png` - NPC destruction animation (6-8 frames)

**Other Players (PvP)**
- Use same 10-tier player ship sprites with different color flags/sails for team identification
- `flag_red_team.png` - Red team flag overlay
- `flag_blue_team.png` - Blue team flag overlay
- `flag_green_team.png` - Green team flag overlay
- `flag_neutral.png` - Solo/neutral player flag

### Environment Sprites
**Ocean & Water**
- `water_tile.png` - Seamless ocean tile (128x128 or 256x256)
- `water_animated.png` - Animated water sprite sheet (optional, 4-6 frames)
- `waves.png` - Wave effect overlay

**Islands**
- `island_small_01.png` - Small islands (5 variations)
- `island_small_02.png`
- `island_small_03.png`
- `island_medium_01.png` - Medium islands (5 variations)
- `island_medium_02.png`
- `island_medium_03.png`
- `island_large_01.png` - Large islands (3 variations)
- `island_large_02.png`
- `island_large_03.png`
- `palm_tree.png` - Decorative vegetation
- `rocks.png` - Rock formations (3 variations)

### Sea Creatures
**Hostile Creatures**
- `kraken_idle.png` - Kraken boss idle sprite
- `kraken_attack.png` - Kraken attack animation (8-12 frames)
- `kraken_tentacle.png` - Individual tentacle sprite
- `sea_serpent.png` - Sea serpent enemy (animated, 6 frames)
- `giant_shark.png` - Shark enemy (animated, 4 frames)
- `jellyfish.png` - Small jellyfish swarm (animated, 3 frames)
- `creature_death.png` - Generic death effect

### Treasures & Collectibles
- `treasure_chest_closed.png` - Closed chest
- `treasure_chest_open.png` - Open chest animation (3-4 frames)
- `gold_coin.png` - Gold coin sprite
- `treasure_map.png` - Map item
- `gem_ruby.png` - Red gem
- `gem_sapphire.png` - Blue gem
- `gem_emerald.png` - Green gem
- `loot_barrel.png` - Floating barrel

### Weapons & Projectiles
- `cannonball.png` - Standard projectile
- `cannonball_fire.png` - Fire cannonball
- `cannonball_ice.png` - Ice cannonball
- `cannon_fire_effect.png` - Muzzle flash effect (3 frames)
- `explosion_small.png` - Small explosion (6 frames)
- `explosion_large.png` - Large explosion (8 frames)
- `water_splash.png` - Water impact effect (4 frames)

### UI Elements
**HUD Components**
- `health_bar_frame.png` - Health bar border
- `health_bar_fill.png` - Health bar fill (green/red gradient)
- `xp_bar_frame.png` - XP bar border
- `xp_bar_fill.png` - XP bar fill (blue/gold gradient)
- `minimap_frame.png` - Mini-map border
- `compass.png` - Compass UI element
- `button_normal.png` - Generic button (normal state)
- `button_hover.png` - Button hover state
- `button_pressed.png` - Button pressed state

**Icons**
- `icon_gold.png` - Gold/currency icon (32x32)
- `icon_health.png` - Health icon
- `icon_speed.png` - Speed upgrade icon
- `icon_damage.png` - Damage upgrade icon
- `icon_armor.png` - Armor upgrade icon
- `icon_treasure.png` - Treasure icon
- `icon_level.png` - Level/rank icon
- `icon_skull.png` - Danger/PvP icon
- `icon_anchor.png` - Port/safe zone icon

**Menu Screens**
- `menu_background.png` - Main menu background
- `panel_large.png` - Large UI panel (9-slice)
- `panel_small.png` - Small UI panel (9-slice)
- `scroll_parchment.png` - Parchment-style background
- `logo.png` - Game logo

### Effects & Particles
- `smoke_particle.png` - Smoke particle
- `spark_particle.png` - Spark particle
- `bubble_particle.png` - Water bubble
- `foam_particle.png` - Sea foam
- `flag_animation.png` - Ship flag animation (4 frames)
- `sail_animation.png` - Sail billowing animation (3 frames)

### Font/Typography
- `pixel_font.ttf` - Custom pixel font for UI
- `pirate_font.ttf` - Thematic pirate-style font for titles

---

## 📐 Sprite Specifications

### General Guidelines
- **Format**: PNG with transparency (alpha channel)
- **Resolution**: 2x scale for retina displays (design at 2x, display at 1x)
- **Color Depth**: 32-bit RGBA
- **Sprite Sheets**: Organize animations as horizontal strips (left to right)
- **Naming Convention**: lowercase_with_underscores.png
- **Organization**: Separate folders by category (ships/, environment/, ui/, effects/)

### Size Recommendations
- **Player Ships**: 64x64 to 128x128 pixels (base size)
- **Enemy Ships**: 48x48 to 96x96 pixels
- **Islands**: 128x128 to 512x512 pixels
- **Sea Creatures**: 96x96 to 256x256 pixels
- **Treasures**: 32x32 to 64x64 pixels
- **Projectiles**: 16x16 to 32x32 pixels
- **UI Icons**: 32x32 to 64x64 pixels
- **Particles**: 8x8 to 16x16 pixels

### Color Palette Suggestions
- **Ocean Blues**: #0d47a1, #1565c0, #1976d2, #42a5f5
- **Sand/Beach**: #d7ccc8, #bcaaa4, #8d6e63
- **Wood (Ships)**: #5d4037, #6d4c41, #795548
- **Treasure Gold**: #ffd700, #ffb300, #ff8f00
- **Danger Red**: #c62828, #d32f2f, #e53935
- **Health Green**: #2e7d32, #388e3c, #43a047

---

## 🎯 Technical Implementation Notes

### Server Requirements
- Handle 50-100+ concurrent players per instance
- Tick rate: 20-30 updates per second
- Implement server-side validation for all actions
- Use spatial partitioning (quadtree) for efficient collision detection
- Implement interpolation for smooth movement

### Client Requirements
- Target 60 FPS performance
- Implement client-side prediction
- Server reconciliation for multiplayer
- Asset preloading with progress bar
- Responsive design (min 1024x768 resolution)

### Security Considerations
- Validate all player inputs server-side
- Implement rate limiting on actions
- Encrypt sensitive data transmission
- Use JWT for authentication
- Prevent teleportation/speed hacking

---

## 🚀 Getting Started

### Installation
```bash
# Clone the repository
git clone https://github.com/Alfredoxrock/PirateOcean.git
cd PirateOcean

# Install dependencies
npm install

# Start development server
npm run dev
```

### Project Structure
```
PirateOcean/
├── client/
│   ├── assets/
│   │   ├── sprites/
│   │   ├── sounds/
│   │   └── music/
│   ├── src/
│   │   ├── scenes/
│   │   ├── entities/
│   │   ├── systems/
│   │   └── main.js
│   └── index.html
├── server/
│   ├── src/
│   │   ├── game/
│   │   ├── networking/
│   │   └── database/
│   └── server.js
├── shared/
│   └── constants.js
└── package.json
```

---

## 📝 Notes for Artists

### Style Direction
- **Art Style**: Pixel art or hand-drawn 2D cartoon style
- **Perspective**: Top-down (bird's eye view)
- **Theme**: Classic pirate adventure with vibrant colors
- **Mood**: Fun, adventurous, slightly cartoony (not too realistic)

### Animation Requirements
- **Ship Movement**: Smooth rotation or directional sprites
- **Water**: Gentle animated waves (subtle, looping)
- **Explosions**: Impactful with 6-8 frames
- **Creatures**: Intimidating but not overly detailed
- **Treasures**: Eye-catching with optional sparkle effect

### Deliverables Format
- All assets in PNG format with transparency
- Sprite sheets with consistent frame dimensions
- JSON metadata file for animation frames (if using sprite sheets)
- Separate layers for easy color variations (ship flags, teams)

---

## 🤝 Contributing
Contributions are welcome! Please read the contributing guidelines before submitting pull requests.

## 📄 License
MIT License - feel free to use this for learning and personal projects.

---

**Last Updated**: December 8, 2025
