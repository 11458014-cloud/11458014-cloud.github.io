// 遊戲狀態管理
const GameState = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameOver',
    LEADERBOARD: 'leaderboard',
    SETTINGS: 'settings',
    ABOUT: 'about'
};

// 遊戲配置
const Config = {
    GRID_SIZE: 20,
    CANVAS_SIZE: 400,
    INITIAL_SPEED: {
        easy: 80,
        normal: 60,
        hard: 40,
        extreme: 30
    },
    SPEED_INCREASE_PER_LEVEL: 2,
    MIN_SPEED: 20
};

// 主遊戲類
class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.currentState = GameState.MENU;
        
        this.initializeSettings();
        this.setupEventListeners();
        this.loadData();
        this.showScreen(GameState.MENU);
        this.playSound('bg-music', true); // 播放背景音樂
    }

    // 初始化設置
    initializeSettings() {
        this.settings = {
            skin: 'classic',
            soundEnabled: true,
            difficulty: 'easy',
            itemsEnabled: true,
            playerName: '玩家'
        };
        this.loadSettings();
    }

    // 加載設置
    loadSettings() {
        const saved = localStorage.getItem('snakeSettings');
        if (saved) {
            this.settings = JSON.parse(saved);
        }
        this.applySkin();
    }

    // 保存設置
    saveSettings() {
        localStorage.setItem('snakeSettings', JSON.stringify(this.settings));
        this.applySkin();
    }

    // 應用皮膚
    applySkin() {
        const skinMap = {
            classic: { snake: '#00ff00', food: '#ff0000', bg: '#000000' },
            blue: { snake: '#00aaff', food: '#ffaa00', bg: '#1a1a2e' },
            purple: { snake: '#ff00ff', food: '#ffff00', bg: '#2a1a3e' },
            red: { snake: '#ff4444', food: '#ffdd00', bg: '#3a1a1a' },
            gold: { snake: '#ffd700', food: '#00ffff', bg: '#2a2a1a' },
            neon: { snake: '#00ff88', food: '#ff0088', bg: '#001a1a' }
        };
        this.currentSkin = skinMap[this.settings.skin];
    }

    // 設置事件監聽
    setupEventListeners() {
        // 主菜單按鈕
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.getElementById('leaderboard-btn').addEventListener('click', () => this.showScreen(GameState.LEADERBOARD));
        document.getElementById('settings-btn').addEventListener('click', () => this.showScreen(GameState.SETTINGS));
        document.getElementById('about-btn').addEventListener('click', () => this.showScreen(GameState.ABOUT));

        // 遊戲控制按鈕
        document.getElementById('pause-btn').addEventListener('click', () => this.pauseGame());
        document.getElementById('resume-btn').addEventListener('click', () => this.resumeGame());
        document.getElementById('exit-btn').addEventListener('click', () => this.exitGame());

        // 遊戲結束按鈕
        document.getElementById('restart-btn').addEventListener('click', () => this.startGame());
        document.getElementById('menu-btn').addEventListener('click', () => this.showScreen(GameState.MENU));

        // 排行榜返回
        document.getElementById('leaderboard-back-btn').addEventListener('click', () => this.showScreen(GameState.MENU));

        // 設置
        document.getElementById('skin-selector').addEventListener('change', (e) => {
            this.settings.skin = e.target.value;
        });
        document.getElementById('sound-toggle').addEventListener('change', (e) => {
            this.settings.soundEnabled = e.target.checked;
        });
        document.getElementById('difficulty-selector').addEventListener('change', (e) => {
            this.settings.difficulty = e.target.value;
        });
        document.getElementById('items-toggle').addEventListener('change', (e) => {
            this.settings.itemsEnabled = e.target.checked;
        });
        document.getElementById('player-name').addEventListener('change', (e) => {
            this.settings.playerName = e.target.value || '玩家';
        });
        document.getElementById('save-settings-btn').addEventListener('click', () => {
            this.saveSettings();
            alert('設置已保存！');
            this.showScreen(GameState.MENU);
        });
        document.getElementById('clear-data-btn').addEventListener('click', () => {
            if (confirm('確定要清除所有遊戲數據和排行榜嗎？')) {
                localStorage.clear();
                this.leaderboard = [];
                alert('已清除所有數據');
                this.showScreen(GameState.MENU);
            }
        });
        document.getElementById('settings-back-btn').addEventListener('click', () => this.showScreen(GameState.MENU));
        document.getElementById('about-back-btn').addEventListener('click', () => this.showScreen(GameState.MENU));

        // 鍵盤控制
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    // 顯示屏幕
    showScreen(state) {
        // 隱藏所有屏幕
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        
        // 顯示指定屏幕
        let screenId;
        switch (state) {
            case GameState.MENU:
                screenId = 'main-screen';
                this.updateMainScreen();
                break;
            case GameState.PLAYING:
                screenId = 'game-screen';
                break;
            case GameState.GAME_OVER:
                screenId = 'game-over-screen';
                this.updateGameOverScreen();
                break;
            case GameState.LEADERBOARD:
                screenId = 'leaderboard-screen';
                this.updateLeaderboard();
                break;
            case GameState.SETTINGS:
                screenId = 'settings-screen';
                this.updateSettingsScreen();
                break;
            case GameState.ABOUT:
                screenId = 'about-screen';
                break;
        }
        
        if (screenId) {
            document.getElementById(screenId).classList.add('active');
            this.currentState = state;
        }
    }

    // 更新設置屏幕
    updateSettingsScreen() {
        document.getElementById('skin-selector').value = this.settings.skin;
        document.getElementById('sound-toggle').checked = this.settings.soundEnabled;
        document.getElementById('difficulty-selector').value = this.settings.difficulty;
        document.getElementById('items-toggle').checked = this.settings.itemsEnabled;
        document.getElementById('player-name').value = this.settings.playerName;
    }

    // 開始遊戲
    startGame() {
        this.initializeGame();
        this.showScreen(GameState.PLAYING);
        this.gameLoop();
        this.playSound('start');
    }

    // 初始化遊戲
    initializeGame() {
        this.snake = [{ x: 10, y: 10 }];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.food = this.generateFood();
        this.items = [];
        this.score = 0;
        this.level = 1;
        this.gameSpeed = Config.INITIAL_SPEED[this.settings.difficulty];
        this.lastMoveTime = 0;
        this.startTime = Date.now();
        this.isPaused = false;
        this.invincibleUntil = 0;
        this.speedBoostUntil = 0;
        this.foodEaten = 0;
        
        // 添加初始道具
        if (this.settings.itemsEnabled) {
            this.generateItem();
        }
    }

    // 遊戲循環
    gameLoop() {
        if (!this.isPaused && this.currentState === GameState.PLAYING) {
            const now = Date.now();
            if (now - this.lastMoveTime > this.gameSpeed) {
                this.update();
                this.lastMoveTime = now;
            }
        }
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }

    // 更新遊戲邏輯
    update() {
        // 更新蛇的方向
        this.direction = this.nextDirection;

        // 計算新頭部位置
        const head = this.snake[0];
        const newHead = {
            x: head.x + this.direction.x,
            y: head.y + this.direction.y
        };

        // 檢查撞牆
        if (newHead.x < 0 || newHead.x >= Config.GRID_SIZE || 
            newHead.y < 0 || newHead.y >= Config.GRID_SIZE) {
            this.endGame();
            return;
        }

        // 檢查撞蛇身
        if (!this.isInvincible()) {
            for (let segment of this.snake) {
                if (newHead.x === segment.x && newHead.y === segment.y) {
                    this.endGame();
                    return;
                }
            }
        }

        this.snake.unshift(newHead);

        // 檢查是否吃到食物
        if (newHead.x === this.food.x && newHead.y === this.food.y) {
            this.eatFood();
            this.food = this.generateFood();
        } else {
            this.snake.pop();
        }

        // 檢查是否吃到道具
        for (let i = this.items.length - 1; i >= 0; i--) {
            const item = this.items[i];
            if (newHead.x === item.x && newHead.y === item.y) {
                this.eatItem(item);
                this.items.splice(i, 1);
            }
        }

        // 定期生成新道具
        if (this.settings.itemsEnabled && Math.random() < 0.01) {
            this.generateItem();
        }
    }

    // 吃到食物
    eatFood() {
        this.foodEaten++;
        const scoreBonus = Math.floor(10 * (1 + this.level / 10));
        this.score += scoreBonus;
        this.updateLevel();
        this.playSound('eat');

        // 更新頂部信息
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = `Lv.${this.level}`;
    }

    // 更新等級和速度
    updateLevel() {
        const newLevel = Math.floor(this.foodEaten / 5) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            this.gameSpeed = Math.max(
                Config.MIN_SPEED,
                Config.INITIAL_SPEED[this.settings.difficulty] - (this.level - 1) * Config.SPEED_INCREASE_PER_LEVEL
            );
            this.playSound('levelup');
        }
    }

    // 生成食物
    generateFood() {
        let newFood;
        let collision;
        do {
            newFood = {
                x: Math.floor(Math.random() * Config.GRID_SIZE),
                y: Math.floor(Math.random() * Config.GRID_SIZE)
            };
            collision = this.snake.some(s => s.x === newFood.x && s.y === newFood.y);
        } while (collision);
        return newFood;
    }

    // 生成道具
    generateItem() {
        const types = ['star', 'shield', 'speed'];
        let newItem;
        let collision;
        do {
            newItem = {
                x: Math.floor(Math.random() * Config.GRID_SIZE),
                y: Math.floor(Math.random() * Config.GRID_SIZE),
                type: types[Math.floor(Math.random() * types.length)],
                createdAt: Date.now()
            };
            collision = this.snake.some(s => s.x === newItem.x && s.y === newItem.y) ||
                       (this.food && newItem.x === this.food.x && newItem.y === this.food.y);
        } while (collision);
        
        this.items.push(newItem);
    }

    // 吃到道具
    eatItem(item) {
        this.playSound('powerup');
        switch (item.type) {
            case 'star':
                this.score += 50;
                this.speedBoostUntil = Date.now() + 5000; // 5秒加速
                break;
            case 'shield':
                this.invincibleUntil = Date.now() + 5000; // 5秒無敵
                break;
            case 'speed':
                this.speedBoostUntil = Date.now() + 3000; // 3秒加速
                break;
        }
        document.getElementById('items-count').textContent = this.items.length;
    }

    // 檢查是否無敵
    isInvincible() {
        return Date.now() < this.invincibleUntil;
    }

    // 繪製遊戲
    draw() {
        // 清空畫布
        this.ctx.fillStyle = this.currentSkin.bg;
        this.ctx.fillRect(0, 0, Config.CANVAS_SIZE, Config.CANVAS_SIZE);

        // 繪製網格（可選）
        if (false) { // 設為 true 可顯示網格
            this.drawGrid();
        }

        // 繪製無敵效果
        if (this.isInvincible()) {
            this.ctx.fillStyle = 'rgba(255, 255, 0, 0.1)';
            this.ctx.fillRect(0, 0, Config.CANVAS_SIZE, Config.CANVAS_SIZE);
        }

        // 繪製蛇
        this.drawSnake();

        // 繪製食物
        this.drawFood();

        // 繪製道具
        this.drawItems();
    }

    // 繪製網格
    drawGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 0.5;
        const cellSize = Config.CANVAS_SIZE / Config.GRID_SIZE;
        for (let i = 0; i <= Config.GRID_SIZE; i++) {
            const pos = i * cellSize;
            this.ctx.beginPath();
            this.ctx.moveTo(pos, 0);
            this.ctx.lineTo(pos, Config.CANVAS_SIZE);
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.moveTo(0, pos);
            this.ctx.lineTo(Config.CANVAS_SIZE, pos);
            this.ctx.stroke();
        }
    }

    // 繪製蛇
    drawSnake() {
        const cellSize = Config.CANVAS_SIZE / Config.GRID_SIZE;
        
        for (let i = 0; i < this.snake.length; i++) {
            const segment = this.snake[i];
            const x = segment.x * cellSize;
            const y = segment.y * cellSize;

            // 蛇頭 - 更新亮
            if (i === 0) {
                this.ctx.fillStyle = this.currentSkin.snake;
                this.ctx.fillRect(x, y, cellSize - 1, cellSize - 1);
                
                // 繪製眼睛
                this.ctx.fillStyle = 'white';
                const eyeSize = cellSize / 6;
                const eyeOffsets = this.getEyeOffsets();
                this.ctx.fillRect(x + eyeOffsets[0].x, y + eyeOffsets[0].y, eyeSize, eyeSize);
                this.ctx.fillRect(x + eyeOffsets[1].x, y + eyeOffsets[1].y, eyeSize, eyeSize);
            } else {
                // 蛇身
                const brightness = 1 - (i / this.snake.length) * 0.3;
                this.ctx.fillStyle = this.adjustColor(this.currentSkin.snake, brightness);
                this.ctx.fillRect(x, y, cellSize - 1, cellSize - 1);
            }
        }
    }

    // 獲取眼睛偏移量
    getEyeOffsets() {
        const cellSize = Config.CANVAS_SIZE / Config.GRID_SIZE;
        const ratio = cellSize / 20;
        
        switch (true) {
            case this.direction.x === 1: // 右
                return [{ x: cellSize * 0.6, y: cellSize * 0.2 }, 
                        { x: cellSize * 0.6, y: cellSize * 0.7 }];
            case this.direction.x === -1: // 左
                return [{ x: cellSize * 0.1, y: cellSize * 0.2 }, 
                        { x: cellSize * 0.1, y: cellSize * 0.7 }];
            case this.direction.y === 1: // 下
                return [{ x: cellSize * 0.2, y: cellSize * 0.6 }, 
                        { x: cellSize * 0.7, y: cellSize * 0.6 }];
            case this.direction.y === -1: // 上
                return [{ x: cellSize * 0.2, y: cellSize * 0.1 }, 
                        { x: cellSize * 0.7, y: cellSize * 0.1 }];
        }
    }

    // 調整顏色亮度
    adjustColor(color, brightness) {
        // 簡單的亮度調整
        if (color === '#00ff00') return `rgb(0, ${Math.floor(255 * brightness)}, 0)`;
        if (color === '#00aaff') return `rgb(0, ${Math.floor(170 * brightness)}, ${Math.floor(255 * brightness)})`;
        return color;
    }

    // 繪製食物
    drawFood() {
        const cellSize = Config.CANVAS_SIZE / Config.GRID_SIZE;
        const x = this.food.x * cellSize + cellSize / 2;
        const y = this.food.y * cellSize + cellSize / 2;
        const radius = cellSize / 3;

        this.ctx.fillStyle = this.currentSkin.food;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();

        // 食物光暈
        this.ctx.strokeStyle = this.currentSkin.food;
        this.ctx.globalAlpha = 0.3;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius + 3, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.globalAlpha = 1;
    }

    // 繪製道具
    drawItems() {
        const cellSize = Config.CANVAS_SIZE / Config.GRID_SIZE;
        const now = Date.now();

        this.items = this.items.filter(item => {
            // 道具 10 秒後消失
            return now - item.createdAt < 10000;
        });

        for (let item of this.items) {
            const x = item.x * cellSize + cellSize / 2;
            const y = item.y * cellSize + cellSize / 2;
            const size = cellSize / 2;

            // 旋轉效果
            this.ctx.save();
            this.ctx.translate(x, y);
            this.ctx.rotate((now / 200) * Math.PI / 180);

            switch (item.type) {
                case 'star':
                    this.drawStar(size, '#FFD700');
                    break;
                case 'shield':
                    this.drawShield(size, '#0088FF');
                    break;
                case 'speed':
                    this.drawFlame(size, '#FF4444');
                    break;
            }

            this.ctx.restore();
        }
    }

    // 繪製星形
    drawStar(size, color) {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
            const r = i % 2 === 0 ? size : size / 2;
            const px = Math.cos(angle) * r;
            const py = Math.sin(angle) * r;
            if (i === 0) this.ctx.moveTo(px, py);
            else this.ctx.lineTo(px, py);
        }
        this.ctx.closePath();
        this.ctx.fill();
    }

    // 繪製盾牌
    drawShield(size, color) {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(0, -size);
        this.ctx.lineTo(size, -size / 2);
        this.ctx.lineTo(size / 2, size);
        this.ctx.lineTo(-size / 2, size);
        this.ctx.lineTo(-size, -size / 2);
        this.ctx.closePath();
        this.ctx.fill();
    }

    // 繪製火焰
    drawFlame(size, color) {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(0, -size);
        this.ctx.bezierCurveTo(size / 2, -size / 2, size, 0, 0, size);
        this.ctx.bezierCurveTo(-size, 0, -size / 2, -size / 2, 0, -size);
        this.ctx.fill();
    }

    // 暫停遊戲
    pauseGame() {
        if (this.currentState === GameState.PLAYING) {
            this.isPaused = true;
            document.getElementById('game-overlay').classList.add('show');
            document.getElementById('pause-btn').style.display = 'none';
            document.getElementById('resume-btn').style.display = 'flex';
            this.playSound('pause');
        }
    }

    // 恢復遊戲
    resumeGame() {
        if (this.currentState === GameState.PLAYING) {
            this.isPaused = false;
            document.getElementById('game-overlay').classList.remove('show');
            document.getElementById('pause-btn').style.display = 'flex';
            document.getElementById('resume-btn').style.display = 'none';
            this.lastMoveTime = Date.now();
            this.playSound('resume');
        }
    }

    // 結束遊戲
    endGame() {
        this.currentState = GameState.GAME_OVER;
        const score = this.score;
        const isNewRecord = this.addToLeaderboard(score);
        this.playSound('gameover');
        
        // 延遲顯示結束屏幕
        setTimeout(() => {
            this.showGameOverScreen(isNewRecord);
        }, 500);
    }

    // 顯示遊戲結束屏幕
    showGameOverScreen(isNewRecord) {
        const surviveTime = Math.floor((Date.now() - this.startTime) / 1000);
        
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('final-length').textContent = this.snake.length;
        document.getElementById('survive-time').textContent = `${surviveTime}s`;
        document.getElementById('final-level').textContent = `Lv.${this.level}`;
        
        const newRecordElem = document.getElementById('new-record');
        if (isNewRecord) {
            newRecordElem.classList.remove('hidden');
            this.playSound('newrecord');
        } else {
            newRecordElem.classList.add('hidden');
        }

        this.showScreen(GameState.GAME_OVER);
    }

    // 返回主菜單
    exitGame() {
        this.currentState = GameState.MENU;
        this.showScreen(GameState.MENU);
    }

    // 處理鍵盤輸入
    handleKeyboard(e) {
        if (this.currentState !== GameState.PLAYING) return;

        const key = e.key.toUpperCase();

        // 暫停/繼續
        if (key === ' ') {
            e.preventDefault();
            if (this.isPaused) {
                this.resumeGame();
            } else {
                this.pauseGame();
            }
            return;
        }

        // 方向控制
        if (['ARROWUP', 'W'].includes(key)) {
            if (this.direction.y === 0) this.nextDirection = { x: 0, y: -1 };
        } else if (['ARROWDOWN', 'S'].includes(key)) {
            if (this.direction.y === 0) this.nextDirection = { x: 0, y: 1 };
        } else if (['ARROWLEFT', 'A'].includes(key)) {
            if (this.direction.x === 0) this.nextDirection = { x: -1, y: 0 };
        } else if (['ARROWRIGHT', 'D'].includes(key)) {
            if (this.direction.x === 0) this.nextDirection = { x: 1, y: 0 };
        }
    }

    // 排行榜管理
    loadData() {
        const saved = localStorage.getItem('snakeLeaderboard');
        this.leaderboard = saved ? JSON.parse(saved) : [];
    }

    // 添加到排行榜
    addToLeaderboard(score) {
        const entry = {
            name: this.settings.playerName,
            score: score,
            date: new Date().toLocaleDateString('zh-TW'),
            length: this.snake.length,
            level: this.level
        };

        this.leaderboard.unshift(entry);
        this.leaderboard.sort((a, b) => b.score - a.score);
        this.leaderboard = this.leaderboard.slice(0, 20); // 只保留前 20

        localStorage.setItem('snakeLeaderboard', JSON.stringify(this.leaderboard));
        localStorage.setItem('gamesPlayed', (parseInt(localStorage.getItem('gamesPlayed') || 0) + 1).toString());
        localStorage.setItem('highScore', Math.max(score, parseInt(localStorage.getItem('highScore') || 0)).toString());

        return entry === this.leaderboard[0];
    }

    // 更新排行榜顯示
    updateLeaderboard() {
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

    // 更新主屏幕
    updateMainScreen() {
        const highScore = parseInt(localStorage.getItem('highScore') || 0);
        const gamesPlayed = parseInt(localStorage.getItem('gamesPlayed') || 0);
        document.getElementById('main-highscore').textContent = highScore;
        document.getElementById('games-played').textContent = gamesPlayed;
    }

    // 更新遊戲結束屏幕
    updateGameOverScreen() {
        // 在 endGame 中已經實現
    }

    // 音效管理
    playSound(name, loop = false) {
        if (!this.settings.soundEnabled && name !== 'bg-music') return;

        // 簡單的音效模擬（使用 Web Audio API）
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        switch (name) {
            case 'eat':
                oscillator.frequency.value = 800;
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.1);
                break;
            case 'powerup':
                oscillator.frequency.value = 1000;
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.15);
                break;
            case 'levelup':
                oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
                oscillator.frequency.linearRampToValueAtTime(900, audioContext.currentTime + 0.1);
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.2);
                break;
            case 'gameover':
                oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
                oscillator.frequency.linearRampToValueAtTime(200, audioContext.currentTime + 0.5);
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.5);
                break;
            case 'newrecord':
                for (let i = 0; i < 3; i++) {
                    setTimeout(() => {
                        const osc = audioContext.createOscillator();
                        const gain = audioContext.createGain();
                        osc.connect(gain);
                        gain.connect(audioContext.destination);
                        osc.frequency.value = 800 + i * 200;
                        gain.gain.setValueAtTime(0.2, audioContext.currentTime);
                        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                        osc.start(audioContext.currentTime);
                        osc.stop(audioContext.currentTime + 0.1);
                    }, i * 150);
                }
                break;
        }
    }
}

// 初始化遊戲
window.addEventListener('DOMContentLoaded', () => {
    new SnakeGame();
});
