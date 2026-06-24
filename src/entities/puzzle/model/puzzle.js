import { Piece } from './piece.js';

const DEFAULT_ROWS = 10;
const DEFAULT_COLUMNS = 15;
const MAX_IMAGE_WIDTH_PERCENTAGE = 50;
const MAX_IMAGE_HEIGHT_PERCENTAGE = 75;
const ANIMATION_DURATION = 250.0;
const MIN_ANIMATION_DURATION = 50.0;
const SOLVE_RANDOM = false;
const HINTS_ENABLED = true;
const SCALE_MULTIPLIER = 2.0;

export class Puzzle {
    constructor(obj) {
        /** @type {HTMLCanvasElement} */
        this.canvas = obj.canvas;
        /** @type {Number} */
        this.rows = obj.rows || DEFAULT_ROWS;
        /** @type {Number} */
        this.columns = obj.columns || DEFAULT_COLUMNS;

        /** @type {Number} */
        this.maxImageWidth = obj.maxImageWidth || MAX_IMAGE_WIDTH_PERCENTAGE;
        /** @type {Number} */
        this.maxImageHeight = obj.maxImageHeight || MAX_IMAGE_HEIGHT_PERCENTAGE;

        /** @type {Number} */
        this.animationDuration = obj.animationDuration || ANIMATION_DURATION;
        if (this.animationDuration < MIN_ANIMATION_DURATION) this.animationDuration = MIN_ANIMATION_DURATION;

        /** @type {Number} */
        this.solveRandom = obj.solveRandom || SOLVE_RANDOM;

        /** @type {Boolean} */
        this.hintsEnabled = obj.hintsEnabled !== undefined ? obj.hintsEnabled && HINTS_ENABLED : HINTS_ENABLED;

        /** @type {CanvasRenderingContext2D} */
        this.ctx = this.canvas.getContext('2d');

        /** @type {Piece[][]} */
        this.pieces = [];

        /** @type {HTMLImageElement} */
        this.img = obj.image;

        /** @type {Number} */
        this.scaleMultiplier = obj.scaleMultiplier || SCALE_MULTIPLIER;

        this.canvas.width = window.innerWidth * this.scaleMultiplier;
        this.canvas.height = window.innerHeight * this.scaleMultiplier;

        /** @type {Piece} */
        this.selected = null;

        /** @type {String} */
        this.viewMode = 'All';

        /** @type {Number} */
        this.pieceCount = this.rows * this.columns;

        /** @type {Object[]} */
        this.debugPoints = [];

        /** @type {{x: number, y: number}} */
        this.translate = { x: 0, y: 0 };

        this.initImageDimensions();

        // Canvas events will be managed at the widget level to keep entities pure,
        // but we'll bind helper methods to keep the original API compatible if needed.
        this.mousedown = this.mousedown.bind(this);
        this.mousemove = this.mousemove.bind(this);
        this.mouseup = this.mouseup.bind(this);
    }

    initImageDimensions() {
        if (this.img.width > this.img.height) {
            let width = this.canvas.width * (this.maxImageWidth / 100);
            let height = 0;
            let ratio = this.img.width / this.img.height;

            do {
                height = width / ratio;
                if (height > this.canvas.height * ((this.maxImageHeight / 100))) {
                    width--;
                }
            } while (height > this.canvas.height * ((this.maxImageHeight / 100)));

            let x = this.canvas.width / 2.0 - width / 2.0;
            let y = this.canvas.height / 2.0 - height / 2.0;

            this.imgX = x;
            this.imgY = y;
            this.imgWidth = width;
            this.imgHeight = height;
        } else {
            let height = this.canvas.height * (this.maxImageHeight / 100);
            let width = 0;
            let ratio = this.img.height / this.img.width;

            do {
                width = height / ratio;
                if (width > this.canvas.width * ((this.maxImageWidth / 100))) {
                    height--;
                }
            } while (width > this.canvas.width * ((this.maxImageWidth / 100)));

            let x = this.canvas.width / 2.0 - width / 2.0;
            let y = this.canvas.height / 2.0 - height / 2.0;

            this.imgX = x;
            this.imgY = y;
            this.imgWidth = width;
            this.imgHeight = height;
        }
    }

    /**
     * Find the clicked piece
     * @param {{x: number, y: number}} e 
     * @returns {Piece|null}
     */
    getClickedPiece(e) {
        if (this.pieces.length <= 0) return null;

        let clicked = null;

        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.columns; x++) {
                const piece = this.pieces[x]?.[y];
                if (!piece) continue;

                if (e.x > piece.x && e.x < piece.x + piece.width) {
                    if (e.y > piece.y && e.y < piece.y + piece.height) {
                        if (!piece.isClose()) {
                            if (this.viewMode === 'All') {
                                clicked = piece;
                            } else if (this.viewMode === 'BorderPieces') {
                                if (piece.isBorder === true) {
                                    clicked = piece;
                                }
                            } else if (this.viewMode === 'NonBorderPieces') {
                                if (piece.isBorder === false) {
                                    clicked = piece;
                                }
                            }
                        }
                    }
                }
            }
        }

        return clicked;
    }

    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) * this.scaleMultiplier,
            y: (e.clientY - rect.top) * this.scaleMultiplier,
        };
    }

    mousedown(e) {
        e.stopPropagation();
        e.preventDefault();

        const pos = this.getMousePos(e);
        this.selected = this.getClickedPiece(pos);

        if (this.selected != null) {
            this.selected.offset = {
                x: pos.x - this.selected.x,
                y: pos.y - this.selected.y
            };
        }
    }

    mousemove(e) {
        const pos = this.getMousePos(e);

        if (this.selected != null) {
            this.selected.x = pos.x - this.selected.offset.x;
            this.selected.y = pos.y - this.selected.offset.y;
        }

        this.currentClientY = pos.y;
        this.currentClientX = pos.x;
    }

    mouseup(e) {
        if (this.selected === null || this.pieces.length <= 0) return;

        if (this.selected.isClose()) {
            this.selected.snap();
        }

        this.selected = null;
    }

    generatePieces() {
        const puzzleWidth = this.imgWidth / this.columns;
        const puzzleHeight = this.imgHeight / this.rows;

        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.columns; x++) {
                if (!this.pieces[x]) this.pieces[x] = [];
                this.pieces[x][y] = new Piece({
                    x: x * puzzleWidth + this.imgX,
                    y: y * puzzleHeight + this.imgY,
                    width: puzzleWidth,
                    height: puzzleHeight,
                    row: y,
                    column: x,
                    rows: this.rows,
                    columns: this.columns,
                    img: this.img,
                    ctx: this.ctx,
                    zIndex: 0,
                    hintsEnabled: this.hintsEnabled
                });

                this.pieces[x][y].isBorder = (y === 0 || y === this.rows - 1 || x === 0 || x === this.columns - 1);
            }
        }

        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.columns; x++) {
                const curPiece = this.pieces[x][y];

                if (y === this.rows - 1) {
                    curPiece.bottom = null;
                } else {
                    const tabState = Math.random() > 0.5 ? 1 : -1;
                    const pos = tabState * (Math.random() * 0.4 + 0.3);
                    curPiece.bottom = pos;
                }

                if (x === this.columns - 1) {
                    curPiece.right = null;
                } else {
                    const tabState = Math.random() > 0.5 ? 1 : -1;
                    const pos = tabState * (Math.random() * 0.4 + 0.3);
                    curPiece.right = pos;
                }

                if (x === 0) {
                    curPiece.left = null;
                } else {
                    const pos = -this.pieces[x - 1][y].right;
                    curPiece.left = pos;
                }

                if (y === 0) {
                    curPiece.top = null;
                } else {
                    const pos = -this.pieces[x][y - 1].bottom;
                    curPiece.top = pos;
                }
            }
        }
    }

    randomizePieces() {
        const puzzleWidth = this.pieces[0][0].width;
        const puzzleHeight = this.pieces[0][0].height;
        const margin = 10 * this.scaleMultiplier;

        for (const pieceList of this.pieces) {
            for (const piece of pieceList) {
                let moved = false;
                let attempts = 0;

                while (moved === false && attempts < 500) {
                    attempts++;
                    const x = Math.floor(Math.random() * (this.canvas.width - puzzleWidth - margin * 2)) + margin;
                    const y = Math.floor(Math.random() * (this.canvas.height - puzzleHeight - margin * 2)) + margin;

                    // Check if piece falls completely outside the image board area (with margin)
                    const isLeft = x + puzzleWidth + margin < this.imgX;
                    const isRight = x > this.imgX + this.imgWidth + margin;
                    const isAbove = y + puzzleHeight + margin < this.imgY;
                    const isBelow = y > this.imgY + this.imgHeight + margin;

                    if (isLeft || isRight || isAbove || isBelow) {
                        piece.setPosition(x, y);
                        moved = true;
                    }
                }

                // Fallback for extremely small viewports to prevent browser freeze
                if (!moved) {
                    const x = Math.floor(Math.random() * (this.canvas.width - puzzleWidth - margin * 2)) + margin;
                    const y = Math.floor(Math.random() * (this.canvas.height - puzzleHeight - margin * 2)) + margin;
                    piece.setPosition(x, y);
                }
            }
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();
        this.ctx.translate(this.translate.x, this.translate.y);

        this.ctx.globalAlpha = 0.4;
        this.ctx.fillStyle = '#2a2a2a';
        this.ctx.fillRect(this.imgX, this.imgY, this.imgWidth, this.imgHeight);

        this.ctx.globalAlpha = 1;

        this.pieces.forEach(pieceList => {
            pieceList.forEach((piece) => {
                if (piece.animation) {
                    piece.x += piece.animation.dX * piece.animation.xFactor;
                    piece.y += piece.animation.dY * piece.animation.yFactor;

                    if (piece.isClose()) {
                        piece.animation = undefined;
                        piece.snap();
                        this.solved = true;
                    }
                }

                if (this.viewMode === 'All') {
                    piece.draw(this.ctx);
                } else if (this.viewMode === 'BorderPieces') {
                    if (piece.isBorder === true || piece.snapped === true) piece.draw(this.ctx);
                } else if (this.viewMode === 'NonBorderPieces') {
                    if (piece.isBorder === false || piece.snapped === true) piece.draw(this.ctx);
                }
            });
        });

        this.ctx.restore();

        requestAnimationFrame(this.draw.bind(this));
    }

    resize(windowWidth, windowHeight) {
        if (this.pieces.length === 0) return;

        const snapState = [];
        for (const col of this.pieces) {
            for (const piece of col) {
                snapState.push(piece.snapped);
            }
        }

        const oldCanvasWidth = this.canvas.width;
        const oldCanvasHeight = this.canvas.height;

        const oldX = this.imgX;
        const oldY = this.imgY;
        const oldW = this.imgWidth;
        const oldH = this.imgHeight;

        this.canvas.width = windowWidth * this.scaleMultiplier;
        this.canvas.height = windowHeight * this.scaleMultiplier;

        const isMobile = windowWidth < 600;
        this.maxImageWidth = isMobile ? 85 : 50;
        this.maxImageHeight = isMobile ? 60 : 75;

        this.initImageDimensions();

        const sx = this.imgWidth / oldW;
        const sy = this.imgHeight / oldH;

        let i = 0;
        for (const col of this.pieces) {
            for (const piece of col) {
                // Update piece dimensions
                piece.width = this.imgWidth / this.columns;
                piece.height = this.imgHeight / this.rows;

                // Update correct positions relative to the board
                const relCX = piece.xCorrect - oldX;
                const relCY = piece.yCorrect - oldY;
                piece.xCorrect = this.imgX + relCX * sx;
                piece.yCorrect = this.imgY + relCY * sy;

                piece.snapped = snapState[i++];

                if (piece.snapped) {
                    piece.x = piece.xCorrect;
                    piece.y = piece.yCorrect;
                } else {
                    // Map unsnapped pieces relative to canvas boundaries
                    const rx = piece.x / oldCanvasWidth;
                    const ry = piece.y / oldCanvasHeight;
                    piece.x = rx * this.canvas.width;
                    piece.y = ry * this.canvas.height;

                    // Clamp to make sure they remain inside viewport
                    const margin = 10 * this.scaleMultiplier;
                    piece.x = Math.max(margin, Math.min(piece.x, this.canvas.width - piece.width - margin));
                    piece.y = Math.max(margin, Math.min(piece.y, this.canvas.height - piece.height - margin));
                }
            }
        }
    }

    solve() {
        this.viewMode = 'All';
        this.pieces.forEach(pieceList => {
            pieceList.forEach((piece) => {
                let animationDuration = (this.solveRandom === true ? Math.floor(Math.random() * this.animationDuration + MIN_ANIMATION_DURATION) : this.animationDuration);
                let xFactor = piece.x < piece.xCorrect ? 1 : -1;
                let dX = Math.abs(piece.x - piece.xCorrect) / animationDuration;

                let yFactor = piece.y < piece.yCorrect ? 1 : -1;
                let dY = Math.abs(piece.y - piece.yCorrect) / animationDuration;

                piece.animation = {
                    dX,
                    dY,
                    xFactor,
                    yFactor
                };
            });
        });
    }

    toggleHints(val) {
        this.hintsEnabled = val;
        this.pieces.forEach(pieceList => {
            pieceList.forEach((piece) => {
                piece.hintsEnabled = val;
            });
        });
    }
}
