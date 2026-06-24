export class ProgressTracker {
    constructor(puzzle, elements) {
        this.puzzle = puzzle;
        this.elements = {
            count: document.querySelector(elements.count),
            fill: document.querySelector(elements.fill),
            winScreen: document.querySelector(elements.winScreen)
        };
        this.totalPieces = puzzle.rows * puzzle.columns;
        this.interval = null;
    }

    start() {
        this.update();
        this.interval = setInterval(() => this.update(), 500);
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    update() {
        if (!this.puzzle || this.puzzle.pieces.length === 0) return;

        let snapped = 0;
        for (const col of this.puzzle.pieces) {
            for (const piece of col) {
                if (piece.snapped) snapped++;
            }
        }

        if (this.elements.count) {
            this.elements.count.textContent = `${snapped} / ${this.totalPieces}`;
        }

        if (this.elements.fill) {
            const pct = this.totalPieces > 0 ? (snapped / this.totalPieces) * 100 : 0;
            this.elements.fill.style.width = `${pct}%`;
        }

        if (snapped === this.totalPieces && this.totalPieces > 0) {
            if (this.elements.winScreen) {
                this.elements.winScreen.classList.add('win-modal--visible');
            }
            this.stop();
        }
    }
}
