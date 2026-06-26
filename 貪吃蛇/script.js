const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const statusEl = document.getElementById('status');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

const directions = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
};

let snake;
let food;
let velocity;
let nextDirection;
let score;
let gameOver;
let gameLoopId;

function resetGame() {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ];
  velocity = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  gameOver = false;
  food = createFood();
  scoreEl.textContent = score;
  statusEl.textContent = '進行中';
  cancelAnimationFrame(gameLoopId);
  requestAnimationFrame(gameLoop);
}

function createFood() {
  const availablePositions = [];
  for (let x = 0; x < tileCount; x++) {
    for (let y = 0; y < tileCount; y++) {
      if (!snake.some(segment => segment.x === x && segment.y === y)) {
        availablePositions.push({ x, y });
      }
    }
  }

  return availablePositions[Math.floor(Math.random() * availablePositions.length)];
}

function drawGrid() {
  ctx.fillStyle = '#161724';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i <= tileCount; i++) {
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(i * gridSize, 0);
    ctx.lineTo(i * gridSize, canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * gridSize);
    ctx.lineTo(canvas.width, i * gridSize);
    ctx.stroke();
  }
}

function drawSnake() {
  ctx.fillStyle = '#63e6be';
  snake.forEach((segment, index) => {
    ctx.fillStyle = index === 0 ? '#9bf6ff' : '#63e6be';
    ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 1, gridSize - 1);
  });
}

function drawFood() {
  ctx.fillStyle = '#ff6262';
  ctx.fillRect(food.x * gridSize + 3, food.y * gridSize + 3, gridSize - 6, gridSize - 6);
}

function moveSnake() {
  velocity = nextDirection;
  const head = { x: snake[0].x + velocity.x, y: snake[0].y + velocity.y };

  if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
    gameOver = true;
    return;
  }

  if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
    gameOver = true;
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 1;
    scoreEl.textContent = score;
    food = createFood();
  } else {
    snake.pop();
  }
}

function update() {
  if (gameOver) {
    statusEl.textContent = '失敗！按 R 重新開始';
    return;
  }
  moveSnake();
}

function render() {
  drawGrid();
  drawFood();
  drawSnake();
}

function gameLoop() {
  update();
  render();
  if (!gameOver) {
    gameLoopId = setTimeout(() => requestAnimationFrame(gameLoop), 100);
  }
}

window.addEventListener('keydown', event => {
  const direction = directions[event.key];
  if (direction) {
    if (direction.x !== -velocity.x || direction.y !== -velocity.y) {
      nextDirection = direction;
    }
    event.preventDefault();
  }
  if (event.key.toLowerCase() === 'r') {
    resetGame();
  }
});

resetGame();
