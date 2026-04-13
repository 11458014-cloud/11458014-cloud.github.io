// 遊戲配置
const GameConfig = {
    HOLE_COUNT: 9,
    GAME_DURATIONS: {
        easy: 60,
        normal: 45,
        hard: 30
    },
    MOLE_DISPLAY_TIME: {
        easy: 1200,
        normal: 1000,
        hard: 800
    },
    MOLE_APPEARANCE_RATE: {
        easy: 1500,
        normal: 1200,
        hard: 900
    },
    MAX_HITS: 20,
    BASE_SCORE: 10,
    COMBO_BONUS: 5,
    LEVEL_BONUS: 50,
    GOLDEN_MOLE_SCORE: 30,
    BOSS_MOLE_SCORE: 100
};

// 遊戲主類
class WhackAMoleGame {
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
        this.combo = 0;
        this.maxCombo = 0;
        this.hitsLeft = GameConfig.MAX_HITS;
        this.level = 1;
        this.difficulty = 'normal';
        this.moleSkin = 'classic';
        this.soundEnabled = true;
        this.effectsEnabled = true;
        this.playerName = '玩家';
        this.timeLeft = 45;
        this.gameActive = false;
        this.activeMoles = new Set();
        this.totalHits = 0;
        this.hitCount = 0;
        this.startTime = 0;
    }

    setupEventListeners() {
        // 主菜單
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.getElementById('leaderboard-btn').addEventListener('click', () => this.showScreen('leaderboard'));
        document.getElementById('settings-btn').addEventListener('click', () => this.showScreen('settings'));
        document.getElementById('guide-btn').addEventListener('click', () => this.showScreen('guide'));

        // 遊戲界面
        document.getElementById('pause-btn').addEventListener('click', () => this.pauseGame());
        document.getElementById('resume-btn').addEventListener('click', () => this.resumeGame());
        document.getElementById('menu-btn').addEventListener('click', () => this.quitToMenu());
        document.getElementById('exit-btn').addEventListener('click', () => this.quitToMenu());

        // 遊戲結束
        document.getElementById('restart-btn').addEventListener('click', () => this.startGame());
        document.getElementById('menu-btn-over').addEventListener('click', () => this.quitToMenu());

        // 排行榜
        document.getElementById('leaderboard-back-btn').addEventListener('click', () => this.showScreen('main'));
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchLeaderboardTab(e));
        });

        // 設置
        document.getElementById('player-name').addEventListener('change', (e) => {
            this.playerName = e.target.value || '玩家';
        });
        document.getElementById('sound-toggle').addEventListener('change', (e) => {
            this.soundEnabled = e.target.checked;
        });
        document.getElementById('difficulty-selector').addEventListener('change', (e) => {
            this.difficulty = e.target.value;
        });
        document.getElementById('mole-skin').addEventListener('change', (e) => {
            this.moleSkin = e.target.value;
        });
        document.getElementById('effects-toggle').addEventListener('change', (e) => {
            this.effectsEnabled = e.target.checked;
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

        // 暫停菜單
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && this.gameState === 'playing') {
                e.preventDefault();
                this.pauseGame();
            }
        });
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
        this.timeLeft = GameConfig.GAME_DURATIONS[this.difficulty];
        this.createGameBoard();
        this.gameState = 'playing';
        this.gameActive = true;
        this.startTime = Date.now();
        this.showScreen('game');
        this.playSound('start');
        this.updateDisplay();
        this.startGameLoop();
    }

    createGameBoard() {
        const board = document.getElementById('game-board');
        board.innerHTML = '';

        for (let i = 0; i < GameConfig.HOLE_COUNT; i++) {
            const hole = document.createElement('div');
            hole.className = 'hole';
            hole.id = `hole-${i}`;
            hole.addEventListener('click', () => this.hitMole(hole));
            board.appendChild(hole);
        }
    }

    startGameLoop() {
        this.timerInterval = setInterval(() => {
            if (this.gameActive) {
                this.timeLeft--;
                document.getElementById('timer').textContent = Math.max(0, this.timeLeft);

                if (this.timeLeft <= 0) {
                    this.endGame();
                }
            }
        }, 1000);

        this.moleInterval = setInterval(() => {
            if (this.gameActive) {
                this.spawnMole();
            }
        }, GameConfig.MOLE_APPEARANCE_RATE[this.difficulty]);
    }

    spawnMole() {
        if (this.activeMoles.size >= 3) return; // 最多 3 個地鼠同時出現

        let holeIndex;
        do {
            holeIndex = Math.floor(Math.random() * GameConfig.HOLE_COUNT);
        } while (this.activeMoles.has(holeIndex));

        const hole = document.getElementById(`hole-${holeIndex}`);
        const isGolden = Math.random() < 0.15; // 15% 概率黃金地鼠
        const isBoss = this.level >= 3 && Math.random() < 0.08; // 等級 3+ 時 8% 概率 BOSS

        this.activeMoles.add(holeIndex);

        const mole = document.createElement('div');
        mole.className = `mole ${this.moleSkin}`;
        mole.dataset.index = holeIndex;

        if (isGolden) {
            mole.innerHTML = '⭐';
            mole.classList.add('golden');
        } else if (isBoss) {
            mole.dataset.boss = true;
            mole.innerHTML += '<span class="special-icon">👑</span>';
        }

        hole.appendChild(mole);

        setTimeout(() => {
            if (mole.parentNode) {
                mole.classList.add('disappear');
                setTimeout(() => {
                    mole.remove();
                    this.activeMoles.delete(holeIndex);
                }, 300);
            }
        }, GameConfig.MOLE_DISPLAY_TIME[this.difficulty]);
    }

    hitMole(hole) {
        const mole = hole.querySelector('.mole');
        if (!mole || this.gameState !== 'playing') return;

        const isGolden = mole.classList.contains('golden');
        const isBoss = mole.dataset.boss === 'true';

        let points = GameConfig.BASE_SCORE;
        if (isGolden) points = GameConfig.GOLDEN_MOLE_SCORE;
        if (isBoss) points = GameConfig.BOSS_MOLE_SCORE;

        points += this.combo * GameConfig.COMBO_BONUS;
        this.score += points;

        this.combo++;
        this.maxCombo = Math.max(this.maxCombo, this.combo);
        this.hitCount++;
        this.totalHits++;

        // 更新等級
        this.updateLevel();

        mole.classList.add('hit');
        this.playSound('hit');

        if (this.effectsEnabled) {
            this.createHitEffect(hole, points);
        }

        // 移除地鼠
        setTimeout(() => {
            mole.remove();
            const index = parseInt(mole.dataset.index);
            this.activeMoles.delete(index);
        }, 400);

        this.updateDisplay();
    }

    createHitEffect(hole, points) {
        const effect = document.createElement('div');
        effect.style.position = 'absolute';
        effect.style.left = hole.offsetLeft + 'px';
        effect.style.top = hole.offsetTop + 'px';
        effect.style.fontSize = '20px';
        effect.style.fontWeight = 'bold';
        effect.style.color = points > GameConfig.BASE_SCORE ? '#FFD700' : '#00FF00';
        effect.style.pointerEvents = 'none';
        effect.style.animation = 'popUp 0.6s ease-out forwards';
        effect.textContent = `+${points}`;

        document.getElementById('game-board').parentNode.appendChild(effect);
        setTimeout(() => effect.remove(), 600);
    }

    updateLevel() {
        this.level = Math.floor(this.hitCount / 5) + 1;
        document.getElementById('level').textContent = `Lv.${this.level}`;
    }

    pauseGame() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            this.gameActive = false;
            document.getElementById('pause-overlay').classList.remove('hidden');
            document.getElementById('pause-btn').style.display = 'none';
            this.playSound('pause');
        }
    }

    resumeGame() {
        if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.gameActive = true;
            document.getElementById('pause-overlay').classList.add('hidden');
            document.getElementById('pause-btn').style.display = 'flex';
            this.playSound('resume');
        }
    }

    endGame() {
        this.gameActive = false;
        this.gameState = 'ended';
        clearInterval(this.timerInterval);
        clearInterval(this.moleInterval);

        // 移除所有地鼠
        document.querySelectorAll('.mole').forEach(mole => {
            mole.classList.add('disappear');
        });

        this.playSound('gameover');

        const isNewRecord = this.addToLeaderboard();

        setTimeout(() => {
            this.showGameOverScreen(isNewRecord);
        }, 500);
    }

    showGameOverScreen(isNewRecord) {
        const accuracy = this.totalHits > 0 ? Math.round((this.hitCount / this.totalHits) * 100) : 0;

        document.getElementById('final-score').textContent = this.score;
        document.getElementById('final-hits').textContent = this.hitCount;
        document.getElementById('final-accuracy').textContent = `${accuracy}%`;
        document.getElementById('final-level').textContent = `Lv.${this.level}`;

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
        clearInterval(this.timerInterval);
        clearInterval(this.moleInterval);
        document.getElementById('pause-overlay').classList.add('hidden');
        this.showScreen('main');
    }

    updateDisplay() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('combo').textContent = this.combo;
        document.getElementById('timer').textContent = Math.max(0, this.timeLeft);
        document.getElementById('hits-left').textContent = Math.max(0, GameConfig.MAX_HITS - this.totalHits);

        // 連擊提示
        const comboElem = document.getElementById('combo');
        if (this.combo > 0 && this.combo % 5 === 0) {
            comboElem.classList.add('combo-active');
            setTimeout(() => comboElem.classList.remove('combo-active'), 300);
        }
    }

    // 排行榜管理
    loadData() {
        const saved = localStorage.getItem('whackAMoleLeaderboard');
        this.leaderboard = saved ? JSON.parse(saved) : [];
    }

    addToLeaderboard() {
        const entry = {
            name: this.playerName,
            score: this.score,
            date: new Date().toLocaleDateString('zh-TW'),
            hits: this.hitCount,
            accuracy: this.hitCount > 0 ? Math.round((this.hitCount / this.totalHits) * 100) : 0,
            level: this.level,
            difficulty: this.difficulty
        };

        this.leaderboard.unshift(entry);
        this.leaderboard.sort((a, b) => b.score - a.score);
        this.leaderboard = this.leaderboard.slice(0, 20);

        localStorage.setItem('whackAMoleLeaderboard', JSON.stringify(this.leaderboard));
        localStorage.setItem('whackAMoleGamesPlayed', (parseInt(localStorage.getItem('whackAMoleGamesPlayed') || 0) + 1).toString());
        
        const currentHighScore = parseInt(localStorage.getItem('whackAMoleHighScore') || 0);
        if (this.score > currentHighScore) {
            localStorage.setItem('whackAMoleHighScore', this.score.toString());
            return true;
        }
        return false;
    }

    updateMainScreen() {
        const highScore = parseInt(localStorage.getItem('whackAMoleHighScore') || 0);
        const gamesPlayed = parseInt(localStorage.getItem('whackAMoleGamesPlayed') || 0);
        document.getElementById('main-highscore').textContent = highScore;
        document.getElementById('games-count').textContent = gamesPlayed;
    }

    updateSettingsScreen() {
        document.getElementById('player-name').value = this.playerName;
        document.getElementById('sound-toggle').checked = this.soundEnabled;
        document.getElementById('difficulty-selector').value = this.difficulty;
        document.getElementById('mole-skin').value = this.moleSkin;
        document.getElementById('effects-toggle').checked = this.effectsEnabled;
    }

    saveSettings() {
        const settings = {
            playerName: this.playerName,
            soundEnabled: this.soundEnabled,
            difficulty: this.difficulty,
            moleSkin: this.moleSkin,
            effectsEnabled: this.effectsEnabled
        };
        localStorage.setItem('whackAMoleSettings', JSON.stringify(settings));
    }

    loadSettings() {
        const saved = localStorage.getItem('whackAMoleSettings');
        if (saved) {
            const settings = JSON.parse(saved);
            this.playerName = settings.playerName || '玩家';
            this.soundEnabled = settings.soundEnabled !== false;
            this.difficulty = settings.difficulty || 'normal';
            this.moleSkin = settings.moleSkin || 'classic';
            this.effectsEnabled = settings.effectsEnabled !== false;
        }
    }

    updateLeaderboardDisplay() {
        const list = document.getElementById('leaderboard-list');
        const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
        list.innerHTML = '';

        let sortedLeaderboard = [...this.leaderboard];
        
        if (activeTab === 'accuracy') {
            sortedLeaderboard.sort((a, b) => b.accuracy - a.accuracy);
        }

        if (sortedLeaderboard.length === 0) {
            list.innerHTML = '<div style="padding: 20px; text-align: center; color: #888;">暫無排行榜記錄</div>';
            return;
        }

        sortedLeaderboard.forEach((entry, index) => {
            const item = document.createElement('div');
            item.className = 'leaderboard-item';
            const displayValue = activeTab === 'accuracy' ? `${entry.accuracy}%` : entry.score;
            item.innerHTML = `
                <div class="leaderboard-rank rank-${index + 1}">${index + 1}</div>
                <div class="leaderboard-name">${entry.name}</div>
                <div class="leaderboard-score">${displayValue}</div>
                <div class="leaderboard-date">${entry.date}</div>
            `;
            list.appendChild(item);
        });
    }

    switchLeaderboardTab(e) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        this.updateLeaderboardDisplay();
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
                case 'hit':
                    oscillator.frequency.value = 800;
                    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.1);
                    break;
                case 'start':
                    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
                    oscillator.frequency.linearRampToValueAtTime(600, audioContext.currentTime + 0.2);
                    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.2);
                    break;
                case 'gameover':
                    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
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
    new WhackAMoleGame();
});
