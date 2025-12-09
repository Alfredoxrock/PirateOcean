// Lightweight game engine: procedural ocean map with islands, static sea creatures,
// PvE ships, and a player ship. Renders to `#gameCanvas` and updates HUD via
// window.gameMenu.updateHUD.

(function () {
    const Game = {};

    // Config
    const MAP_WIDTH = 4000;
    const MAP_HEIGHT = 4000;
    const NUM_ISLANDS = 35;
    const NUM_CREATURES = 12;
    const NUM_PVE_SHIPS = 10;

    // State
    let canvas, ctx, camera;
    let map = { islands: [], creatures: [], pveShips: [] };
    let player = null;
    let keys = {};
    let running = false;

    // Utilities
    function rand(min, max) { return Math.random() * (max - min) + min; }
    function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

    // Procedural generation: islands as non-overlapping circles
    function generateIslands() {
        const islands = [];
        let attempts = 0;
        while (islands.length < NUM_ISLANDS && attempts < 2000) {
            attempts++;
            const r = Math.round(rand(60, 220));
            const x = Math.round(rand(r, MAP_WIDTH - r));
            const y = Math.round(rand(r, MAP_HEIGHT - r));
            const pad = 20;
            let ok = true;
            for (const other of islands) {
                const dx = other.x - x;
                const dy = other.y - y;
                const dist = Math.hypot(dx, dy);
                if (dist < other.r + r + pad) { ok = false; break; }
            }
            if (ok) islands.push({ x, y, r });
        }
        return islands;
    }

    function generateCreatures() {
        const creatures = [];
        for (let i = 0; i < NUM_CREATURES; i++) {
            creatures.push({
                id: i,
                x: rand(100, MAP_WIDTH - 100),
                y: rand(100, MAP_HEIGHT - 100),
                type: ['shark', 'serpent', 'kraken'][Math.floor(rand(0, 3))],
                size: Math.round(rand(18, 80))
            });
        }
        return creatures;
    }

    function generatePveShips() {
        const ships = [];
        for (let i = 0; i < NUM_PVE_SHIPS; i++) {
            ships.push({
                id: i,
                x: rand(100, MAP_WIDTH - 100),
                y: rand(100, MAP_HEIGHT - 100),
                speed: rand(20, 60) / 100,
                dir: rand(0, Math.PI * 2),
                hp: 30 + Math.round(rand(0, 70)),
                size: Math.round(rand(18, 42)),
            });
        }
        return ships;
    }

    // Input handling
    function setupInput() {
        window.addEventListener('keydown', (e) => { keys[e.key.toLowerCase()] = true; });
        window.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });
    }

    // Camera follows player
    function updateCamera() {
        camera.x = clamp(player.x - canvas.width / 2, 0, MAP_WIDTH - canvas.width);
        camera.y = clamp(player.y - canvas.height / 2, 0, MAP_HEIGHT - canvas.height);
    }

    // Physics & AI
    function update(dt) {
        if (!player) return;
        // player movement
        const acc = 0.18;
        if (keys['w'] || keys['arrowup']) { player.vx += Math.cos(player.a) * acc * dt; player.vy += Math.sin(player.a) * acc * dt; }
        if (keys['s'] || keys['arrowdown']) { player.vx *= 0.98; player.vy *= 0.98; }
        if (keys['a'] || keys['arrowleft']) { player.a -= 0.06 * dt; }
        if (keys['d'] || keys['arrowright']) { player.a += 0.06 * dt; }
        // apply velocity
        player.x += player.vx * dt;
        player.y += player.vy * dt;
        // simple damping
        player.vx *= 0.995;
        player.vy *= 0.995;
        // clamp to map
        player.x = clamp(player.x, 0, MAP_WIDTH);
        player.y = clamp(player.y, 0, MAP_HEIGHT);

        // PvE ships simple wandering + occasional chase when close
        for (const s of map.pveShips) {
            // wander
            s.dir += rand(-0.02, 0.02) * dt;
            s.x += Math.cos(s.dir) * s.speed * dt * 60;
            s.y += Math.sin(s.dir) * s.speed * dt * 60;
            s.x = clamp(s.x, 0, MAP_WIDTH);
            s.y = clamp(s.y, 0, MAP_HEIGHT);
            // if player is close chase a bit
            const dx = player.x - s.x;
            const dy = player.y - s.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 300) {
                s.dir = Math.atan2(dy, dx);
                s.x += Math.cos(s.dir) * s.speed * dt * 100;
                s.y += Math.sin(s.dir) * s.speed * dt * 100;
            }
        }

        // collisions with islands (simple push-out)
        for (const isl of map.islands) {
            const dx = player.x - isl.x;
            const dy = player.y - isl.y;
            const d = Math.hypot(dx, dy);
            if (d < isl.r + 12) {
                const overlap = isl.r + 12 - d;
                if (d > 0) {
                    player.x += (dx / d) * overlap;
                    player.y += (dy / d) * overlap;
                } else {
                    // push randomly
                    player.x += overlap;
                    player.y += overlap;
                }
                // slight damage
                player.hp = Math.max(0, player.hp - 0.02 * overlap);
            }
        }

        // update HUD
        if (window.gameMenu && window.gameMenu.updateHUD) {
            window.gameMenu.updateHUD({ health: clamp((player.hp / player.maxHp) * 100, 0, 100) });
        }
    }

    // Rendering
    function draw() {
        ctx.save();
        // clear
        ctx.fillStyle = '#0a2b45';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // translate camera
        ctx.translate(-camera.x, -camera.y);

        // ocean grid faint
        const tile = 200;
        ctx.fillStyle = 'rgba(10,25,50,0.25)';
        for (let x = 0; x < MAP_WIDTH; x += tile) {
            ctx.fillRect(x, 0, 2, MAP_HEIGHT);
        }
        for (let y = 0; y < MAP_HEIGHT; y += tile) {
            ctx.fillRect(0, y, MAP_WIDTH, 2);
        }

        // islands
        for (const isl of map.islands) {
            const grad = ctx.createLinearGradient(isl.x - isl.r, isl.y - isl.r, isl.x + isl.r, isl.y + isl.r);
            grad.addColorStop(0, '#b78f4c');
            grad.addColorStop(0.6, '#8b5a2b');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.ellipse(isl.x, isl.y, isl.r, isl.r * 0.7, 0, 0, Math.PI * 2);
            ctx.fill();
            // palm trees as small green circles
            const trees = Math.max(1, Math.round(isl.r / 80));
            ctx.fillStyle = '#2e7d32';
            for (let t = 0; t < trees; t++) {
                const theta = (t / trees) * Math.PI * 2;
                const tx = isl.x + Math.cos(theta) * (isl.r * 0.5);
                const ty = isl.y + Math.sin(theta) * (isl.r * 0.4) - 6;
                ctx.beginPath(); ctx.arc(tx, ty, 6, 0, Math.PI * 2); ctx.fill();
            }
        }

        // creatures
        for (const c of map.creatures) {
            ctx.fillStyle = c.type === 'shark' ? '#9e9e9e' : c.type === 'serpent' ? '#7b1fa2' : '#263238';
            ctx.beginPath(); ctx.arc(c.x, c.y, c.size / 2, 0, Math.PI * 2); ctx.fill();
        }

        // PvE ships
        for (const s of map.pveShips) {
            drawShip(s.x, s.y, s.dir, '#ff5252', s.size);
        }

        // player
        drawShip(player.x, player.y, player.a, '#ffd700', 28);

        ctx.restore();
    }

    function drawShip(x, y, angle, color, size) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        // triangle ship
        ctx.beginPath();
        ctx.moveTo(size, 0);
        ctx.lineTo(-size * 0.6, size * 0.6);
        ctx.lineTo(-size * 0.6, -size * 0.6);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        // mast
        ctx.strokeStyle = '#6d4c41'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(-size * 0.2, -size * 0.2); ctx.lineTo(-size * 0.2, size * 0.2); ctx.stroke();
        ctx.restore();
    }

    // Main loop
    let last = 0;
    function frame(t) {
        if (!running) return;
        const dt = Math.min(1 / 15, (t - last) / 16.666); // normalized
        update(dt);
        draw();
        last = t;
        requestAnimationFrame(frame);
    }

    // Public API
    Game.start = function (opts) {
        if (running) return;
        canvas = document.getElementById('gameCanvas');
        if (!canvas) { console.warn('No canvas found'); return; }
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        ctx = canvas.getContext('2d');

        camera = { x: 0, y: 0 };

        // generate world
        map.islands = generateIslands();
        map.creatures = generateCreatures();
        map.pveShips = generatePveShips();

        // create player
        player = {
            name: (opts && opts.name) || 'Captain',
            x: MAP_WIDTH / 2,
            y: MAP_HEIGHT / 2,
            vx: 0, vy: 0, a: 0,
            hp: 100, maxHp: 100
        };

        // initial HUD
        if (window.gameMenu && window.gameMenu.updateHUD) {
            window.gameMenu.updateHUD({ level: 1, gold: 0, health: 100 });
        }

        setupInput();
        running = true;
        last = performance.now();
        requestAnimationFrame(frame);

        // update camera once
        updateCamera();

        // resize handling
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth; canvas.height = window.innerHeight; updateCamera();
        });
    };

    window.Game = Game;
})();
