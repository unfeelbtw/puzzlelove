import { Puzzle } from '../../entities/puzzle/model/puzzle.js';
import { addTouchSupport } from '../../features/game-controls/touch-controls.js';
import { GAME_CONFIG } from '../../shared/config/game-config.js';

export class GameBoard {
    constructor(canvasSelector, imageSrc, options = {}) {
        this.canvas = document.querySelector(canvasSelector);
        this.imageSrc = imageSrc;
        this.options = options;
        this.game = null;
        this.resizeTimer = null;

        this.handleResize = this.handleResize.bind(this);
    }

    async init() {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = this.imageSrc;
            img.onload = () => {
                const isMobile = window.innerWidth < 600;
                const configGrid = isMobile ? GAME_CONFIG.grid.mobile : GAME_CONFIG.grid.desktop;
                const rows = configGrid.rows;
                const cols = configGrid.cols;

                this.game = new Puzzle({
                    canvas: this.canvas,
                    image: img,
                    rows: rows,
                    columns: cols,
                    hintsEnabled: false,
                    maxImageWidth: isMobile ? 85 : 50,
                    maxImageHeight: isMobile ? 60 : 75,
                    ...this.options
                });

                this.game.generatePieces();
                this.game.randomizePieces();

                // Override draw method to draw dashed border over pieces
                const originalDraw = this.game.draw.bind(this.game);
                this.game.draw = () => {
                    originalDraw();
                    this.drawBoardBorder(
                        this.game.ctx,
                        this.game.imgX + this.game.translate.x,
                        this.game.imgY + this.game.translate.y,
                        this.game.imgWidth,
                        this.game.imgHeight,
                        this.game.scaleMultiplier
                    );
                };

                this.game.draw();

                // Add event listeners
                this.canvas.addEventListener('mousedown', (e) => this.game.mousedown(e));
                this.canvas.addEventListener('mousemove', (e) => this.game.mousemove(e));
                this.canvas.addEventListener('mouseup', (e) => this.game.mouseup(e));

                addTouchSupport(this.game);

                window.addEventListener('resize', this.handleResize);

                resolve(this.game);
            };
        });
    }

    drawBoardBorder(ctx, x, y, w, h, scale) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 2.5 * scale;
        ctx.setLineDash([14 * scale, 10 * scale]);
        ctx.lineDashOffset = 0;
        ctx.lineJoin = 'miter';
        ctx.beginPath();
        ctx.rect(x, y, w, h);
        ctx.stroke();
        ctx.restore();
    }

    handleResize() {
        clearTimeout(this.resizeTimer);
        this.resizeTimer = setTimeout(() => this.onResize(), 300);
    }

    onResize() {
        if (this.game) {
            this.game.resize(window.innerWidth, window.innerHeight);
        }
    }

    destroy() {
        window.removeEventListener('resize', this.handleResize);
    }
}
