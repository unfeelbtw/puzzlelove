import './index.css';
import { GameBoard } from '../widgets/game-board/game-board.js';
import { ProgressTracker } from '../features/progress-tracker/progress-tracker.js';
import { GAME_CONFIG } from '../shared/config/game-config.js';
import { ParticleBackground } from '../shared/ui/particles/particles.js';

let board = null;
let tracker = null;
let particlesBg = null;

function applyTheme() {
    const root = document.documentElement;
    const colors = GAME_CONFIG.colors;
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-accent', colors.accent);
    root.style.setProperty('--color-bg-start', colors.backgroundStart);
    root.style.setProperty('--color-bg-middle', colors.backgroundMiddle);
    root.style.setProperty('--color-bg-end', colors.backgroundEnd);
    root.style.setProperty('--color-card-bg', colors.cardBackground);
    root.style.setProperty('--color-hud-bg', colors.hudBackground);
    root.style.setProperty('--color-border-main', colors.borderMain);
    root.style.setProperty('--color-text-main', colors.textMain);
    root.style.setProperty('--color-text-muted', colors.textMuted);
}

async function initGame() {
    const winScreen = document.querySelector('.win-modal');
    if (winScreen) {
        winScreen.classList.remove('win-modal--visible');
    }

    if (tracker) {
        tracker.stop();
    }

    if (board) {
        board.destroy();
    }

    board = new GameBoard('#puzzleCanvas', 'photo.jpg');
    const puzzleInstance = await board.init();

    tracker = new ProgressTracker(puzzleInstance, {
        count: '.progress-bar__count',
        fill: '.progress-bar__fill',
        winScreen: '.win-modal'
    });
    tracker.start();
}

document.addEventListener('DOMContentLoaded', () => {
    applyTheme();

    particlesBg = new ParticleBackground('.page-bg');
    particlesBg.init();

    initGame();

    const restartBtn = document.getElementById('btn-restart');
    const winRestartBtn = document.getElementById('btn-win-restart');

    if (restartBtn) {
        restartBtn.addEventListener('click', initGame);
    }
    if (winRestartBtn) {
        winRestartBtn.addEventListener('click', initGame);
    }
});
