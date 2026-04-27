const grid = document.getElementById('grid');
const scoreEl = document.getElementById('score');
const timeEl = document.getElementById('time');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const notice = document.getElementById('notice');

const gameDuration = 30;
const moleInterval = 900;
let score = 0;
let timeLeft = gameDuration;
let gameTimer = null;
let moleTimer = null;
let currentMole = null;
let gameActive = false;

function createGrid() {
  for (let i = 0; i < 9; i++) {
    const hole = document.createElement('div');
    hole.className = 'hole';
    hole.dataset.index = i;
    hole.addEventListener('click', handleHit);
    grid.appendChild(hole);
  }
}

function handleHit(event) {
  if (!gameActive) return;
  const hole = event.currentTarget;
  if (hole.dataset.hasMole === 'true') {
    score += 1;
    scoreEl.textContent = score;
    hole.dataset.hasMole = 'false';
    hole.querySelector('.mole')?.classList.remove('active');
    currentMole = null;
    notice.textContent = '好棒！繼續打地鼠！';
  }
}

function showMole() {
  const holes = Array.from(document.querySelectorAll('.hole'));
  if (currentMole) {
    currentMole.dataset.hasMole = 'false';
    currentMole.querySelector('.mole')?.classList.remove('active');
    currentMole = null;
  }

  const index = Math.floor(Math.random() * holes.length);
  const hole = holes[index];
  hole.dataset.hasMole = 'true';
  let mole = hole.querySelector('.mole');
  if (!mole) {
    mole = document.createElement('div');
    mole.className = 'mole';
    mole.textContent = '🐹';
    hole.appendChild(mole);
  }
  mole.classList.add('active');
  currentMole = hole;
}

function updateTime() {
  timeLeft -= 1;
  timeEl.textContent = timeLeft;
  if (timeLeft <= 0) {
    endGame();
  }
}

function startGame() {
  if (gameActive) return;
  gameActive = true;
  score = 0;
  timeLeft = gameDuration;
  scoreEl.textContent = score;
  timeEl.textContent = timeLeft;
  notice.textContent = '遊戲開始！迅速點擊地鼠！';

  showMole();
  gameTimer = setInterval(updateTime, 1000);
  moleTimer = setInterval(showMole, moleInterval);
}

function endGame() {
  gameActive = false;
  clearInterval(gameTimer);
  clearInterval(moleTimer);
  moleTimer = null;
  gameTimer = null;
  notice.textContent = `遊戲結束！你的分數是 ${score} 分。按開始重新挑戰！`;
  if (currentMole) {
    currentMole.dataset.hasMole = 'false';
    currentMole.querySelector('.mole')?.classList.remove('active');
    currentMole = null;
  }
}

function resetGame() {
  endGame();
  score = 0;
  timeLeft = gameDuration;
  scoreEl.textContent = score;
  timeEl.textContent = timeLeft;
  notice.textContent = '準備好了嗎？按開始展開打地鼠挑戰！';
}

startBtn.addEventListener('click', startGame);
resetBtn.addEventListener('click', resetGame);

createGrid();
resetGame();
