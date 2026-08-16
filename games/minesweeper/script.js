const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const mineCountDisplay = document.getElementById('mine-count');
const timerDisplay = document.getElementById('timer');
const resetBtn = document.getElementById('reset-btn');
const diffButtons = document.querySelectorAll('.diff-btn');

// Game Constants
const CONFIG = {
    easy: { rows: 9, cols: 9, mines: 10, cellSize: 32 },
    medium: { rows: 16, cols: 16, mines: 40, cellSize: 24 },
    hard: { rows: 16, cols: 24, mines: 99, cellSize: 18 }
};

let currentLevel = 'easy';
let grid = [];
let gameOver = false;
let gameWon = false;
let minesLeft = 0;
let timeElapsed = 0;
let timerInterval = null;
let firstClick = true;

// Modern Aesthetic Colors
const COLORS = {
    cell: '#334155',
    revealed: '#1e293b',
    border: '#475569',
    mine: '#ef4444',
    flag: '#38bdf8',
    text: ['#38bdf8', '#4ade80', '#fbbf24', '#f87171', '#818cf8', '#2dd4bf', '#a78bfa', '#e879f9']
};

function initGame() {
    const { rows, cols, mines, cellSize } = CONFIG[currentLevel];
    canvas.width = cols * cellSize;
    canvas.height = rows * cellSize;
    
    grid = [];
    gameOver = false;
    gameWon = false;
    firstClick = true;
    minesLeft = mines;
    timeElapsed = 0;
    
    clearInterval(timerInterval);
    updateStats();
    resetBtn.textContent = '😊';
    
    // Update active button UI
    diffButtons.forEach(btn => {
        if(btn.dataset.level === currentLevel) {
            btn.classList.add('bg-sky-500', 'text-slate-900', 'border-sky-500');
        } else {
            btn.classList.remove('bg-sky-500', 'text-slate-900', 'border-sky-500');
        }
    });

    for (let r = 0; r < rows; r++) {
        grid[r] = [];
        for (let c = 0; c < cols; c++) {
            grid[r][c] = {
                r, c,
                isMine: false,
                isRevealed: false,
                isFlagged: false,
                neighborCount: 0
            };
        }
    }
    draw();
}

function placeMines(firstR, firstC) {
    const { rows, cols, mines } = CONFIG[currentLevel];
    let placed = 0;
    while (placed < mines) {
        let r = Math.floor(Math.random() * rows);
        let c = Math.floor(Math.random() * cols);
        
        if (!grid[r][c].isMine && (Math.abs(r - firstR) > 1 || Math.abs(c - firstC) > 1)) {
            grid[r][c].isMine = true;
            placed++;
        }
    }

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (!grid[r][c].isMine) {
                let count = 0;
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        let nr = r + dr, nc = c + dc;
                        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc].isMine) count++;
                    }
                }
                grid[r][c].neighborCount = count;
            }
        }
    }
}

function reveal(r, c) {
    if (gameOver || gameWon || grid[r][c].isFlagged) return;

    if (firstClick) {
        placeMines(r, c);
        firstClick = false;
        startTimer();
    }

    if (grid[r][c].isRevealed) {
        // Chord logic: If already revealed and neighbors flagged matches number, reveal others
        const { rows, cols } = CONFIG[currentLevel];
        let flags = 0;
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                let nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc].isFlagged) flags++;
            }
        }
        if (flags === grid[r][c].neighborCount) {
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    let nr = r + dr, nc = c + dc;
                    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !grid[nr][nc].isRevealed && !grid[nr][nc].isFlagged) {
                        reveal(nr, nc);
                    }
                }
            }
        }
        return;
    }

    grid[r][c].isRevealed = true;

    if (grid[r][c].isMine) {
        endGame(false);
        return;
    }

    if (grid[r][c].neighborCount === 0) {
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                let nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < CONFIG[currentLevel].rows && nc >= 0 && nc < CONFIG[currentLevel].cols) {
                    reveal(nr, nc);
                }
            }
        }
    }

    checkWin();
    draw();
}

function toggleFlag(r, c) {
    if (gameOver || gameWon || grid[r][c].isRevealed) return;
    grid[r][c].isFlagged = !grid[r][c].isFlagged;
    
    // Mobile Haptic
    if (grid[r][c].isFlagged) {
        ArcadeHub.vibrate(20);
    }
    
    minesLeft += grid[r][c].isFlagged ? -1 : 1;
    updateStats();
    draw();
}

function checkWin() {
    let unrevealedSafeCells = 0;
    grid.forEach(row => row.forEach(cell => {
        if (!cell.isMine && !cell.isRevealed) unrevealedSafeCells++;
    }));
    if (unrevealedSafeCells === 0) endGame(true);
}

function endGame(win) {
    gameOver = !win;
    gameWon = win;
    clearInterval(timerInterval);
    resetBtn.textContent = win ? '😎' : '😵';
    
    // Mobile Haptic on Loss
    if (!win) {
        ArcadeHub.vibrate([50, 50, 50]);
    } else {
        ArcadeHub.saveScore('minesweeper', timeElapsed);
    }
    
    grid.forEach(row => row.forEach(cell => {
        if (cell.isMine) cell.isRevealed = true;
    }));
    draw();
}

function startTimer() {
    timerInterval = setInterval(() => {
        timeElapsed++;
        updateStats();
    }, 1000);
}

function updateStats() {
    mineCountDisplay.textContent = String(Math.max(0, minesLeft)).padStart(3, '0');
    timerDisplay.textContent = String(Math.min(999, timeElapsed)).padStart(3, '0');
}

function draw() {
    const { rows, cols, cellSize } = CONFIG[currentLevel];
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const cell = grid[r][c];
            const x = c * cellSize;
            const y = r * cellSize;

            ctx.fillStyle = cell.isRevealed ? COLORS.revealed : COLORS.cell;
            ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
            
            if (cell.isRevealed) {
                if (cell.isMine) {
                    ctx.fillStyle = COLORS.mine;
                    ctx.beginPath();
                    ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize / 4, 0, Math.PI * 2);
                    ctx.fill();
                } else if (cell.neighborCount > 0) {
                    ctx.fillStyle = COLORS.text[cell.neighborCount - 1];
                    ctx.font = `bold ${cellSize * 0.6}px Inter, sans-serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(cell.neighborCount, x + cellSize / 2, y + cellSize / 2);
                }
            } else if (cell.isFlagged) {
                ctx.fillStyle = COLORS.flag;
                ctx.beginPath();
                ctx.moveTo(x + cellSize * 0.3, y + cellSize * 0.3);
                ctx.lineTo(x + cellSize * 0.7, y + cellSize * 0.5);
                ctx.lineTo(x + cellSize * 0.3, y + cellSize * 0.7);
                ctx.fill();
            }
        }
    }
}

canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const c = Math.floor((e.clientX - rect.left) * scaleX / CONFIG[currentLevel].cellSize);
    const r = Math.floor((e.clientY - rect.top) * scaleY / CONFIG[currentLevel].cellSize);

    if (e.button === 0) reveal(r, c);
    if (e.button === 2) toggleFlag(r, c);
});

canvas.addEventListener('contextmenu', e => e.preventDefault());
resetBtn.addEventListener('click', initGame);

diffButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        currentLevel = btn.dataset.level;
        initGame();
    });
});

initGame();
