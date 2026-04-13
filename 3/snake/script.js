// 遊戲配置
const GameConfig = {
    CANVAS_WIDTH: 400,
    CANVAS_HEIGHT: 400,
    GRID_SIZE: 20,
    SPEEDS: {
        easy: 80,
        normal: 120,
        hard: 160,
        extreme: 240
    },
    BASE_SCORE: 10,
    SPECIAL_SCORE: 50
};

// 遊戲主類
class SnakeGame {
    constructor() {
        this.setupGame();
        this.setupEventListeners();
        this.loadData();
        this.showScreen('main');
    }

    setupGame() {
        this.currentScreen = 'main';
        this.gameState = 'menu';
        this.score = 0;
        this.level = 1;
        this.difficulty = 'normal';
        this.snakeSkin = 'green';
        this.soundEnabled = true;
        this.playerName = '玩家';
        this.gameActive = false;
        this.startTime = 0;
        this.pausedTime = 0;
        
        // 初始化蛇
        this.snake = [
            { x: 10, y: 10 },
            { x: 9, y: 10 },
            { x: 8, y: 10 }
        ];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        
        this.food = this.generateFood();
        this.speedMultiplier = 1;
    }

    setupEventListeners() {
        // 主菜單
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.getElementById('leaderboard-btn').addEventListener('click', () => this.showScreen('leaderboard'));
        document.getElementById('settings-btn').addEventListener('click', () => this.showScreen('settings'));
        document.getElementById('guide-btn').addEventListener('click', () => this.showScreen('guide'));

        // 遊戲控制
        document.getElementById('pause-btn').addEventListener('click', () => this.pauseGame());
        document.getElementById('resume-btn').addEventListener('click', () => this.resumeGame());
        document.getElementById('menu-btn').addEventListener('click', () => this.quitToMenu());
        document.getElementById('exit-btn').addEventListener('click', () => this.quitToMenu());

        // 遊戲結束
        document.getElementById('restart-btn').addEventListener('click', () => this.startGame());
        document.getElementById('menu-btn-over').addEventListener('click', () => this.quitToMenu());

        // 排行榜
        document.getElementById('leaderboard-back-btn').addEventListener('click', () => this.showScreen('main'));

        // 設置
        document.getElementById('player-name').addEventListener('change', (e) => {
            this.playerName = e.target.value || '玩家';
        });
        document.getElementById('difficulty-selector').addEventListener('change', (e) => {
            this.difficulty = e.target.value;
        });
        document.getElementById('snake-skin').addEventListener('change', (e) => {
            this.snakeSkin = e.target.value;
        });
        document.getElementById('sound-toggle').addEventListener('change', (e) => {
            this.soundEnabled = e.target.checked;
        });
        document.getElementById('save-settings-btn').addEventListener('click', () => {
            this.saveSettings();
            alert('設置已保存！');
            this.showScreen('main');
        });
        document.getElementById('clear-data-btn').addEventListener('click', () => {
            if (confirm('確定要清除所有遊戲數據？')) {
                localStorage.clear();
                this.leaderboard = [];
                alert('已清除所有數據');
                this.showScreen('main');
            }
        });
        document.getElementById('settings-back-btn').addEventListener('click', () => this.showScreen('main'));

        // 遊戲說明
        document.getElementById('guide-back-btn').addEventListener('click', () => this.showScreen('main'));

        // 鍵盤控制
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    handleKeyPress(e) {
        if (this.gameState !== 'playing') return;

        switch(e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                if (this.direction.y === 0) this.nextDirection = { x: 0, y: -1 };
                e.preventDefault();
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                if (this.direction.y === 0) this.nextDirection = { x: 0, y: 1 };
                e.preventDefault();
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                if (this.direction.x === 0) this.nextDirection = { x: -1, y: 0 };
                e.preventDefault();
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                if (this.direction.x === 0) this.nextDirection = { x: 1, y: 0 };
                e.preventDefault();
                break;
            case ' ':
                this.pauseGame();
                e.preventDefault();
                break;
        }
    }

    showScreen(screen) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        
        let screenId;
        switch (screen) {
            case 'main':
                screenId = 'main-screen';
                this.updateMainScreen();
                break;
            case 'game':
                screenId = 'game-screen';
                break;
            case 'gameover':
                screenId = 'game-over-screen';
                break;
            case 'leaderboard':
                screenId = 'leaderboard-screen';
                this.updateLeaderboardDisplay();
                break;
            case 'settings':
                screenId = 'settings-screen';
                this.updateSettingsScreen();
                break;
            case 'guide':
                screenId = 'guide-screen';
                break;
        }

        if (screenId) {
            document.getElementById(screenId).classList.add('active');
            this.currentScreen = screen;
        }
    }

    startGame() {
        this.setupGame();
        this.loadSettings();
        this.gameState = 'playing';
        this.gameActive = true;
        this.startTime = Date.now() - this.pausedTime;
        this.showScreen('game');
        this.playSound('start');
        this.updateDisplay();
        this.startGameLoop();
    }

    startGameLoop() {
        const baseSpeed = GameConfig.SPEEDS[this.difficulty];
        const speed = Math.max(40, baseSpeed - this.level * 5);
        
        this.gameInterval = setInterval(() => {
            if (this.gameActive) {
                this.update();
                this.draw();
            }
        }, speed);
    }

    generateFood() {
        let newFood;
        let collision = true;
        
        while (collision) {
            newFood = {
                x: Math.floor(Math.random() * (GameConfig.CANVAS_WIDTH / GameConfig.GRID_SIZE)),
                y: Math.floor(Math.random() * (GameConfig.CANVAS_HEIGHT / GameConfig.GRID_SIZE))
            };
            
            collision = this.snake.some(segment => 
                segment.x === newFood.x && segment.y === newFood.y
            );
        }
        
        return newFood;
    }

    update() {
        this.direction = this.nextDirection;
        
        // 計算新頭部位置
        const head = this.snake[0];
        const newHead = {
            x: (head.x + this.direction.x + (GameConfig.CANVAS_WIDTH / GameConfig.GRID_SIZE)) % (GameConfig.CANVAS_WIDTH / GameConfig.GRID_SIZE),
            y: (head.y + this.direction.y + (GameConfig.CANVAS_HEIGHT / GameConfig.GRID_SIZE)) % (GameConfig.CANVAS_HEIGHT / GameConfig.GRID_SIZE)
        };
        
        // 檢查碰撞
        if (this.snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
            this.endGame();
            return;
        }
        
        this.snake.unshift(newHead);
        
        // 檢查是否吃到食物
        if (newHead.x === this.food.x && newHead.y === this.food.y) {
            this.score += GameConfig.BASE_SCORE;
            this.updateLevel();
            this.playSound('eat');
            this.food = this.generateFood();
        } else {
            this.snake.pop();
        }
    }

    draw() {
        const canvas = document.getElementById('game-canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = GameConfig.CANVAS_WIDTH;
        canvas.height = GameConfig.CANVAS_HEIGHT;
        
        // 背景
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 網格
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 0.5;
        for (let i = 0; i <= GameConfig.CANVAS_WIDTH; i += GameConfig.GRID_SIZE) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, GameConfig.CANVAS_HEIGHT);
            ctx.stroke();
        }
        for (let i = 0; i <= GameConfig.CANVAS_HEIGHT; i += GameConfig.GRID_SIZE) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(GameConfig.CANVAS_WIDTH, i);
            ctx.stroke();
        }
        
        // 繪製蛇
        this.snake.forEach((segment, index) => {
            const x = segment.x * GameConfig.GRID_SIZE;
            const y = segment.y * GameConfig.GRID_SIZE;
            
            ctx.fillStyle = this.getSnakeColor(index);
            ctx.shadowColor = 'rgba(0, 204, 68, 0.5)';
            ctx.shadowBlur = 10;
            ctx.fillRect(x + 1, y + 1, GameConfig.GRID_SIZE - 2, GameConfig.GRID_SIZE - 2);
            ctx.shadowColor = 'transparent';
            
            // 眼睛
            if (index === 0) {
                ctx.fillStyle = '#fff';
                const eyeOffset = 6;
                const eyeSize = 3;
                ctx.fillRect(x + eyeOffset, y + eyeOffset, eyeSize, eyeSize);
            }
        });
        
        // 繪製食物
        const foodX = this.food.x * GameConfig.GRID_SIZE;
        const foodY = this.food.y * GameConfig.GRID_SIZE;
        ctx.fillStyle = '#ff4444';
        ctx.beginPath();
        ctx.arc(foodX + GameConfig.GRID_SIZE / 2, foodY + GameConfig.GRID_SIZE / 2, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowColor = 'rgba(255, 68, 68, 0.5)';
        ctx.shadowBlur = 10;
        
        this.updateDisplay();
    }

    getSnakeColor(index) {
        const colors = {
            green: ['#00ff00', '#00dd00'],
            red: ['#ff0000', '#dd0000'],
            blue: ['#0000ff', '#0000dd'],
            purple: ['#ff00ff', '#dd00dd'],
            gold: ['#ffff00', '#dddd00'],
            rainbow: ['#ff0000', '#00ff00']
        };
        
        const colorPair = colors[this.snakeSkin] || colors.green;
        return index === 0 ? colorPair[0] : colorPair[1];
    }

    updateLevel() {
        const newLevel = Math.floor(this.score / 100) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            this.playSound('levelup');
        }
    }

    pauseGame() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            this.gameActive = false;
            clearInterval(this.gameInterval);
            document.getElementById('pause-overlay').classList.remove('hidden');
            this.playSound('pause');
        }
    }

    resumeGame() {
        if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.gameActive = true;
            document.getElementById('pause-overlay').classList.add('hidden');
            this.startGameLoop();
            this.playSound('resume');
        }
    }

    endGame() {
        this.gameActive = false;
        this.gameState = 'ended';
        clearInterval(this.gameInterval);
        this.playSound('gameover');
        
        const isNewRecord = this.addToLeaderboard();
        
        setTimeout(() => {
            this.showGameOverScreen(isNewRecord);
        }, 300);
    }

    showGameOverScreen(isNewRecord) {
        const gameTime = Math.floor((Date.now() - this.startTime) / 1000);
        
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('final-length').textContent = this.snake.length;
        document.getElementById('final-level').textContent = this.level;
        document.getElementById('final-time').textContent = `${gameTime}秒`;
        
        const newRecordElem = document.getElementById('new-record');
        if (isNewRecord) {
            newRecordElem.classList.remove('hidden');
            this.playSound('newrecord');
        } else {
            newRecordElem.classList.add('hidden');
        }
        
        this.showScreen('gameover');
    }

    quitToMenu() {
        this.gameActive = false;
        this.gameState = 'menu';
        clearInterval(this.gameInterval);
        document.getElementById('pause-overlay').classList.add('hidden');
        this.showScreen('main');
    }

    updateDisplay() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('speed').textContent = `${(1 + (this.level - 1) * 0.2).toFixed(1)}x`;
        document.getElementById('length').textContent = this.snake.length;
    }

    // 排行榜管理
    loadData() {
        const saved = localStorage.getItem('snakeLeaderboard');
        this.leaderboard = saved ? JSON.parse(saved) : [];
    }

    addToLeaderboard() {
        const entry = {
            name: this.playerName,
            score: this.score,
            date: new Date().toLocaleDateString('zh-TW'),
            level: this.level,
            length: this.snake.length,
            difficulty: this.difficulty
        };
        
        this.leaderboard.unshift(entry);
        this.leaderboard.sort((a, b) => b.score - a.score);
        this.leaderboard = this.leaderboard.slice(0, 20);
        
        localStorage.setItem('snakeLeaderboard', JSON.stringify(this.leaderboard));
        localStorage.setItem('snakeGamesPlayed', (parseInt(localStorage.getItem('snakeGamesPlayed') || 0) + 1).toString());
        
        const currentHighScore = parseInt(localStorage.getItem('snakeHighScore') || 0);
        if (this.score > currentHighScore) {
            localStorage.setItem('snakeHighScore', this.score.toString());
            return true;
        }
        return false;
    }

    updateMainScreen() {
        const highScore = parseInt(localStorage.getItem('snakeHighScore') || 0);
        const gamesPlayed = parseInt(localStorage.getItem('snakeGamesPlayed') || 0);
        document.getElementById('main-highscore').textContent = highScore;
        document.getElementById('games-count').textContent = gamesPlayed;
    }

    updateSettingsScreen() {
        document.getElementById('player-name').value = this.playerName;
        document.getElementById('difficulty-selector').value = this.difficulty;
        document.getElementById('snake-skin').value = this.snakeSkin;
        document.getElementById('sound-toggle').checked = this.soundEnabled;
    }

    saveSettings() {
        const settings = {
            playerName: this.playerName,
            difficulty: this.difficulty,
            snakeSkin: this.snakeSkin,
            soundEnabled: this.soundEnabled
        };
        localStorage.setItem('snakeSettings', JSON.stringify(settings));
    }

    loadSettings() {
        const saved = localStorage.getItem('snakeSettings');
        if (saved) {
            const settings = JSON.parse(saved);
            this.playerName = settings.playerName || '玩家';
            this.difficulty = settings.difficulty || 'normal';
            this.snakeSkin = settings.snakeSkin || 'green';
            this.soundEnabled = settings.soundEnabled !== false;
        }
    }

    updateLeaderboardDisplay() {
        const list = document.getElementById('leaderboard-list');
        list.innerHTML = '';
        
        if (this.leaderboard.length === 0) {
            list.innerHTML = '<div style="padding: 20px; text-align: center; color: #888;">暫無排行榜記錄</div>';
            return;
        }
        
        this.leaderboard.forEach((entry, index) => {
            const item = document.createElement('div');
            item.className = 'leaderboard-item';
            item.innerHTML = `
                <div class="leaderboard-rank rank-${index + 1}">${index + 1}</div>
                <div class="leaderboard-name">${entry.name}</div>
                <div class="leaderboard-score">${entry.score}</div>
                <div class="leaderboard-date">${entry.date}</div>
            `;
            list.appendChild(item);
        });
    }

    // 音效管理
    playSound(name) {
        if (!this.soundEnabled) return;
        
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            switch (name) {
                case 'eat':
                    oscillator.frequency.value = 600;
                    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.15);
                    break;
                case 'start':
                    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
                    oscillator.frequency.linearRampToValueAtTime(700, audioContext.currentTime + 0.3);
                    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.3);
                    break;
                case 'gameover':
                    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
                    oscillator.frequency.linearRampToValueAtTime(200, audioContext.currentTime + 0.5);
                    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.5);
                    break;
                case 'levelup':
                    for (let i = 0; i < 2; i++) {
                        setTimeout(() => {
                            const osc = audioContext.createOscillator();
                            const gain = audioContext.createGain();
                            osc.connect(gain);
                            gain.connect(audioContext.destination);
                            osc.frequency.value = 800 + i * 200;
                            gain.gain.setValueAtTime(0.2, audioContext.currentTime);
                            gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
                            osc.start(audioContext.currentTime);
                            osc.stop(audioContext.currentTime + 0.15);
                        }, i * 100);
                    }
                    break;
                case 'newrecord':
                    for (let i = 0; i < 3; i++) {
                        setTimeout(() => {
                            const osc = audioContext.createOscillator();
                            const gain = audioContext.createGain();
                            osc.connect(gain);
                            gain.connect(audioContext.destination);
                            osc.frequency.value = 880 + i * 200;
                            gain.gain.setValueAtTime(0.2, audioContext.currentTime);
                            gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
                            osc.start(audioContext.currentTime);
                            osc.stop(audioContext.currentTime + 0.15);
                        }, i * 150);
                    }
                    break;
                case 'pause':
                case 'resume':
                    oscillator.frequency.value = 700;
                    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.1);
                    break;
            }
        } catch (e) {
            console.log('音效播放失敗:', e);
        }
    }
}

// 初始化
window.addEventListener('DOMContentLoaded', () => {
    new SnakeGame();
});
