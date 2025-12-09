// Menu Navigation Functions
function showMainMenu() {
    hideAllMenus();
    document.getElementById('mainMenu').classList.add('active');
}

function showPlayerSetup() {
    hideAllMenus();
    document.getElementById('playerSetup').classList.add('active');
}

function showHowToPlay() {
    hideAllMenus();
    document.getElementById('howToPlay').classList.add('active');
}

function showLeaderboard() {
    hideAllMenus();
    document.getElementById('leaderboard').classList.add('active');
}

function showSettings() {
    hideAllMenus();
    document.getElementById('settings').classList.add('active');
}

function hideAllMenus() {
    const menus = document.querySelectorAll('.menu-container');
    menus.forEach(menu => menu.classList.remove('active'));
}

// Game Functions
function startGame() {
    const playerName = document.getElementById('playerName').value.trim();

    if (!playerName) {
        alert('Please enter your captain\'s name!');
        return;
    }

    // Store player name
    localStorage.setItem('playerName', playerName);

    // Update HUD with player name
    document.getElementById('hudPlayerName').textContent = playerName;

    // Hide menus and show game
    hideAllMenus();
    document.getElementById('gameContainer').style.display = 'block';

    // Initialize game (this is where you'd start Phaser or your game engine)
    initializeGame();
}

function initializeGame() {
    console.log('Starting lightweight game engine...');

    // Update HUD with initial values
    updateHUD({ level: 1, gold: 0, health: 100, xp: 0 });

    // Start the Game engine we added in game.js
    try {
        const playerName = localStorage.getItem('playerName') || 'Captain';
        if (window.Game && typeof window.Game.start === 'function') {
            window.Game.start({ name: playerName });
        } else {
            console.warn('Game engine not found.');
            alert('Game engine not loaded. Check console for errors.');
        }
    } catch (err) {
        console.error('Failed to start game engine', err);
        alert('Failed to start game. See console for details.');
    }
}

function showPauseMenu() {
    document.getElementById('pauseMenu').style.display = 'flex';
}

function resumeGame() {
    document.getElementById('pauseMenu').style.display = 'none';
}

function exitToMainMenu() {
    document.getElementById('gameContainer').style.display = 'none';
    document.getElementById('pauseMenu').style.display = 'none';
    showMainMenu();
}

// Update HUD values
function updateHUD(stats) {
    if (stats.level !== undefined) {
        document.getElementById('hudLevel').textContent = stats.level;
    }
    if (stats.gold !== undefined) {
        document.getElementById('hudGold').textContent = stats.gold.toLocaleString();
    }
    if (stats.health !== undefined) {
        document.getElementById('healthFill').style.width = stats.health + '%';
    }
    if (stats.xp !== undefined) {
        document.getElementById('xpFill').style.width = stats.xp + '%';
    }
}

// Settings Functions
function saveSettings() {
    const settings = {
        musicVolume: document.getElementById('musicVolume').value,
        sfxVolume: document.getElementById('sfxVolume').value,
        graphicsQuality: document.getElementById('graphicsQuality').value,
        showMinimap: document.getElementById('showMinimap').checked,
        showPlayerNames: document.getElementById('showPlayerNames').checked,
        enableChat: document.getElementById('enableChat').checked
    };

    localStorage.setItem('gameSettings', JSON.stringify(settings));
    alert('Settings saved!');
}

function loadSettings() {
    const savedSettings = localStorage.getItem('gameSettings');

    if (savedSettings) {
        const settings = JSON.parse(savedSettings);

        document.getElementById('musicVolume').value = settings.musicVolume;
        document.getElementById('sfxVolume').value = settings.sfxVolume;
        document.getElementById('graphicsQuality').value = settings.graphicsQuality;
        document.getElementById('showMinimap').checked = settings.showMinimap;
        document.getElementById('showPlayerNames').checked = settings.showPlayerNames;
        document.getElementById('enableChat').checked = settings.enableChat;

        updateVolumeDisplays();
    }
}

// Volume slider updates
document.addEventListener('DOMContentLoaded', function () {
    const musicSlider = document.getElementById('musicVolume');
    const sfxSlider = document.getElementById('sfxVolume');

    if (musicSlider) {
        musicSlider.addEventListener('input', function () {
            document.getElementById('musicValue').textContent = this.value + '%';
        });
    }

    if (sfxSlider) {
        sfxSlider.addEventListener('input', function () {
            document.getElementById('sfxValue').textContent = this.value + '%';
        });
    }

    // Load saved settings
    loadSettings();
});

function updateVolumeDisplays() {
    document.getElementById('musicValue').textContent = document.getElementById('musicVolume').value + '%';
    document.getElementById('sfxValue').textContent = document.getElementById('sfxVolume').value + '%';
}

// Keyboard controls
document.addEventListener('keydown', function (e) {
    // Escape key to pause
    if (e.key === 'Escape') {
        const gameContainer = document.getElementById('gameContainer');
        const pauseMenu = document.getElementById('pauseMenu');

        if (gameContainer.style.display !== 'none') {
            if (pauseMenu.style.display === 'none') {
                showPauseMenu();
            } else {
                resumeGame();
            }
        }
    }
});

// Export functions for use in game
window.gameMenu = {
    updateHUD: updateHUD,
    showPauseMenu: showPauseMenu,
    resumeGame: resumeGame,
    exitToMainMenu: exitToMainMenu
};

console.log('Pirate Ocean Menu System Loaded!');
console.log('Menu functions available globally and via window.gameMenu');
