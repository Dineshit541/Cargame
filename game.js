/**
 * Rock Escape Game - JavaScript Logic
 * A thrilling escape game where you dodge falling rocks with progressive difficulty
 */

class RockEscapeGame {
    constructor() {
        this.gameContainer = document.querySelector('.game-container');
        this.playerCar = document.getElementById('playerCar');
        this.road = document.querySelector('.road');
        this.scoreElement = document.getElementById('score');
        this.speedElement = document.getElementById('speed');
        this.gameOverElement = document.getElementById('gameOver');
        this.finalScoreElement = document.getElementById('finalScore');
        this.startScreenElement = document.getElementById('startScreen');
        
        // Game state variables
        this.playerPosition = 175; // Center position for horizontal movement
        this.score = 0;
        this.speed = 1;
        this.gameRunning = false;
        this.gameStarted = false;
        this.fallingRocks = [];
        this.roadLines = [];
        this.keys = {};
        
        // Game settings
        this.playerSpeed = 5;
        this.enemySpawnRate = 1500;
        this.speedIncrement = 0.1;
        this.scoreIncrement = 1;
        
        this.init();
    }
    
    init() {
        this.createRoadLines();
        this.bindEvents();
        this.showStartScreen();
    }
    
    showStartScreen() {
        if (this.startScreenElement) {
            this.startScreenElement.style.display = 'block';
        }
    }
    
    hideStartScreen() {
        if (this.startScreenElement) {
            this.startScreenElement.style.display = 'none';
        }
    }
    
    createRoadLines() {
        // Clear existing road lines
        this.roadLines.forEach(line => {
            if (line.parentNode) {
                line.parentNode.removeChild(line);
            }
        });
        this.roadLines = [];
        
        // Create simple center road lines like original
        for (let i = 0; i < 15; i++) {
            const line = document.createElement('div');
            line.className = 'road-line';
            line.style.top = (i * 50 - 40) + 'px';
            this.road.appendChild(line);
            this.roadLines.push(line);
        }
    }
    
    bindEvents() {
        // Keyboard events for smooth movement
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            // Prevent default behavior for game keys
            if (['arrowleft', 'arrowright', 'a', 'd', ' '].includes(e.key.toLowerCase())) {
                e.preventDefault();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        // Touch events for mobile support
        let touchStartX = 0;
        this.gameContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            e.preventDefault();
        });
        
        this.gameContainer.addEventListener('touchmove', (e) => {
            if (!this.gameRunning) return;
            
            const touchX = e.touches[0].clientX;
            const deltaX = touchX - touchStartX;
            
            if (Math.abs(deltaX) > 10) {
                this.movePlayer(deltaX > 0 ? 1 : -1);
                touchStartX = touchX;
            }
            e.preventDefault();
        });
    }
    
    handleInput() {
        if (!this.gameRunning) return;
        
        // Handle continuous movement
        if (this.keys['arrowleft'] || this.keys['a']) {
            this.movePlayer(-1);
        }
        if (this.keys['arrowright'] || this.keys['d']) {
            this.movePlayer(1);
        }
    }
    
    movePlayer(direction) {
        // Original smooth horizontal movement
        this.playerPosition += direction * this.playerSpeed;
        this.playerPosition = Math.max(25, Math.min(325, this.playerPosition));
        this.playerCar.style.left = this.playerPosition + 'px';
    }
    
    startGame() {
        this.gameRunning = true;
        this.gameStarted = true;
        this.hideStartScreen();
        this.gameLoop();
        this.spawnFallingRocks();
    }
    
    spawnFallingRocks() {
        if (!this.gameRunning) return;
        
        const fallingRock = document.createElement('div');
        fallingRock.className = 'enemy-car'; // Keep same CSS class for styling
        
        // Random horizontal positioning like original
        const randomLane = Math.random() * 320 + 30;
        
        fallingRock.style.left = randomLane + 'px';
        fallingRock.style.top = '-100px';
        
        // Adjust animation speed based on game speed
        const animationDuration = Math.max(1, 3 - this.speed * 0.3);
        fallingRock.style.animationDuration = animationDuration + 's';
        
        this.gameContainer.appendChild(fallingRock);
        this.fallingRocks.push({
            element: fallingRock,
            x: randomLane,
            y: -100,
            speed: 300 / animationDuration // pixels per second
        });
        
        // Remove rock after it goes off screen
        setTimeout(() => {
            if (fallingRock.parentNode) {
                fallingRock.parentNode.removeChild(fallingRock);
                this.fallingRocks = this.fallingRocks.filter(rock => rock.element !== fallingRock);
            }
        }, animationDuration * 1000 + 500);
        
        // Schedule next rock spawn
        const spawnDelay = Math.max(500, this.enemySpawnRate - this.speed * 50);
        setTimeout(() => this.spawnFallingRocks(), spawnDelay);
    }
    
    checkCollisions() {
        const playerRect = this.playerCar.getBoundingClientRect();
        const containerRect = this.gameContainer.getBoundingClientRect();
        
        this.fallingRocks.forEach(rockData => {
            const rockRect = rockData.element.getBoundingClientRect();
            
            // Check if car hits falling rocks with smaller collision box for emoji
            const margin = 5; // Small margin for more forgiving collision
            const horizontalOverlap = (playerRect.left + margin) < (rockRect.right - margin) && 
                                    (playerRect.right - margin) > (rockRect.left + margin);
            const verticalOverlap = (playerRect.top + margin) < (rockRect.bottom - margin) && 
                                  (playerRect.bottom - margin) > (rockRect.top + margin);
            
            if (horizontalOverlap && verticalOverlap) {
                this.gameOver();
                return;
            }
        });
    }
    
    updateScore() {
        this.score += this.scoreIncrement;
        this.scoreElement.textContent = this.score;
        
        // Increase speed every 100 points
        if (this.score > 0 && this.score % 100 === 0) {
            this.speed = Math.min(5, this.speed + this.speedIncrement);
            this.speedElement.textContent = this.speed.toFixed(1);
            
            // Visual feedback for speed increase
            this.gameContainer.style.transform = 'scale(1.05)';
            setTimeout(() => {
                this.gameContainer.style.transform = 'scale(1)';
            }, 200);
        }
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        this.handleInput();
        this.checkCollisions();
        this.updateScore();
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    gameOver() {
        this.gameRunning = false;
        this.finalScoreElement.textContent = this.score;
        this.gameOverElement.style.display = 'block';
        
        // Stop all falling rock animations
        this.fallingRocks.forEach(rockData => {
            rockData.element.style.animationPlayState = 'paused';
        });
        
        // Add game over effect
        this.gameContainer.style.filter = 'grayscale(50%)';
        
        // Save high score to localStorage
        this.saveHighScore();
    }
    
    saveHighScore() {
        const highScore = localStorage.getItem('carRacingHighScore') || 0;
        if (this.score > highScore) {
            localStorage.setItem('carRacingHighScore', this.score);
            // Show new high score message
            const highScoreMsg = document.createElement('div');
            highScoreMsg.textContent = 'NEW HIGH SCORE!';
            highScoreMsg.style.color = '#ffff00';
            highScoreMsg.style.fontWeight = 'bold';
            highScoreMsg.style.marginTop = '10px';
            this.gameOverElement.appendChild(highScoreMsg);
        }
    }
    
    getHighScore() {
        return localStorage.getItem('carRacingHighScore') || 0;
    }
    
    restart() {
        // Reset game state
        this.playerPosition = 175; // Center position
        this.score = 0;
        this.speed = 1;
        this.gameRunning = false;
        this.gameStarted = false;
        
        // Reset UI
        this.scoreElement.textContent = '0';
        this.speedElement.textContent = '1';
        this.gameOverElement.style.display = 'none';
        this.playerCar.style.left = '50%';
        this.gameContainer.style.filter = 'none';
        this.gameContainer.style.transform = 'scale(1)';
        
        // Remove all falling rocks
        this.fallingRocks.forEach(rockData => {
            if (rockData.element.parentNode) {
                rockData.element.parentNode.removeChild(rockData.element);
            }
        });
        this.fallingRocks = [];
        
        // Clear any extra elements added during game over
        const extraElements = this.gameOverElement.querySelectorAll('div:not(h2):not(p):not(.restart-btn)');
        extraElements.forEach(el => el.remove());
        
        // Show start screen again
        this.showStartScreen();
    }
    
    pause() {
        if (this.gameRunning) {
            this.gameRunning = false;
            // Pause all animations
            this.fallingRocks.forEach(rockData => {
                rockData.element.style.animationPlayState = 'paused';
            });
        }
    }
    
    resume() {
        if (this.gameStarted && !this.gameRunning) {
            this.gameRunning = true;
            // Resume all animations
            this.fallingRocks.forEach(rockData => {
                rockData.element.style.animationPlayState = 'running';
            });
            this.gameLoop();
        }
    }
}

// Global game instance
let game;

// Game control functions
function startGame() {
    if (game) {
        game.startGame();
    }
}

function restartGame() {
    if (game) {
        game.restart();
    }
}

function pauseGame() {
    if (game) {
        game.pause();
    }
}

function resumeGame() {
    if (game) {
        game.resume();
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    game = new RockEscapeGame();
    
    // Display high score on start screen
    const highScore = game.getHighScore();
    if (highScore > 0) {
        const highScoreElement = document.getElementById('highScore');
        if (highScoreElement) {
            highScoreElement.textContent = highScore;
        }
    }
});

// Handle page visibility changes (pause when tab is not active)
document.addEventListener('visibilitychange', () => {
    if (game) {
        if (document.hidden) {
            game.pause();
        } else {
            // Don't auto-resume, let player choose
        }
    }
});

// Prevent context menu on right click
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RockEscapeGame, startGame, restartGame, pauseGame, resumeGame };
}
