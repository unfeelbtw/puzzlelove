export class Piece {
    constructor(obj) {
        /** @type {Number} */
        this.x = obj.x;
        /** @type {Number} */
        this.xCorrect = obj.x;
        /** @type {Number} */
        this.y = obj.y;
        /** @type {Number} */
        this.yCorrect = obj.y;
        /** @type {Number} */
        this.row = obj.row;
        /** @type {Number} */
        this.zIndex = obj.zIndex;
        /** @type {Boolean} */
        this.hintsEnabled = obj.hintsEnabled;
        /** @type {Number} */
        this.column = obj.column;
        /** @type {Number} */
        this.rows = obj.rows;
        /** @type {Number} */
        this.columns = obj.columns;
        /** @type {HTMLImageElement} */
        this.img = obj.img;
        /** @type {Number} */
        this.width = obj.width;
        /** @type {Number} */
        this.height = obj.height;
        /** @type {CanvasRenderingContext2D} */
        this.ctx = obj.ctx;
        /** @type {Boolean} */
        this.snapped = false;
        /** @type {number|null} */
        this.top = null;
        /** @type {number|null} */
        this.right = null;
        /** @type {number|null} */
        this.bottom = null;
        /** @type {number|null} */
        this.left = null;
        /** @type {Boolean} */
        this.isBorder = false;
        /** @type {Object} */
        this.offset = { x: 0, y: 0 };
    }

    /**
     * Draws the puzzle piece
     * @param {CanvasRenderingContext2D} ctx - the canvas context to draw the piece on
     */
    draw(ctx) {
        ctx.fillStyle = '#000';
        ctx.beginPath();

        // calculate puzzle stats
        const size = Math.min(this.width, this.height);
        const neck = 0.1 * size;
        const tabWidth = 0.2 * size;
        const tabHeight = 0.2 * size;

        // if the piece is close to the correct position, not already snapped and hints are enabled, draw the hint outline
        if (!this.snapped) {
            this.ctx.strokeStyle = '#000'; // Всегда черный контур во время перетаскивания
        } else {
            this.ctx.strokeStyle = 'rgba(1,1,1,0)'; // Прозрачный, когда деталь встала на место
        }

        // from top left
        ctx.moveTo(this.x, this.y);

        // to top right
        if (this.top) {
            ctx.lineTo(this.x + this.width * Math.abs(this.top) - neck, this.y);
            ctx.bezierCurveTo(
                this.x + this.width * Math.abs(this.top) - neck,
                this.y - tabHeight * Math.sign(this.top) * 0.2,

                this.x + this.width * Math.abs(this.top) - tabWidth,
                this.y - tabHeight * Math.sign(this.top),

                this.x + this.width * Math.abs(this.top),
                this.y - tabHeight * Math.sign(this.top)
            );
            ctx.bezierCurveTo(
                this.x + this.width * Math.abs(this.top) + tabWidth,
                this.y - tabHeight * Math.sign(this.top),

                this.x + this.width * Math.abs(this.top) + neck,
                this.y - tabHeight * Math.sign(this.top) * 0.2,

                this.x + this.width * Math.abs(this.top) + neck,
                this.y
            );
            ctx.lineTo(this.x + this.width * Math.abs(this.top) + neck, this.y);
        }
        ctx.lineTo(this.x + this.width, this.y);

        // to bottom right
        if (this.right) {
            ctx.lineTo(this.x + this.width, this.y + this.height * Math.abs(this.right) - neck);
            ctx.bezierCurveTo(
                this.x + this.width - tabHeight * Math.sign(this.right) * 0.2,
                this.y + this.height * Math.abs(this.right) - neck,

                this.x + this.width - tabHeight * Math.sign(this.right),
                this.y + this.height * Math.abs(this.right) - tabWidth,

                this.x + this.width - tabHeight * Math.sign(this.right),
                this.y + this.height * Math.abs(this.right)
            );
            ctx.bezierCurveTo(
                this.x + this.width - tabHeight * Math.sign(this.right),
                this.y + this.height * Math.abs(this.right) + tabWidth,

                this.x + this.width - tabHeight * Math.sign(this.right) * 0.2,
                this.y + this.height * Math.abs(this.right) + neck,

                this.x + this.width,
                this.y + this.height * Math.abs(this.right) + neck
            );
            ctx.lineTo(this.x + this.width, this.y + this.height * Math.abs(this.right) + neck);
        }
        ctx.lineTo(this.x + this.width, this.y + this.height);

        // to bottom left
        if (this.bottom) {
            ctx.lineTo(this.x + this.width * Math.abs(this.bottom) + neck, this.y + this.height);
            ctx.bezierCurveTo(
                this.x + this.width * Math.abs(this.bottom) + neck,
                this.y + this.height + tabHeight * Math.sign(this.bottom) * 0.2,

                this.x + this.width * Math.abs(this.bottom) + tabWidth,
                this.y + this.height + tabHeight * Math.sign(this.bottom),

                this.x + this.width * Math.abs(this.bottom),
                this.y + this.height + tabHeight * Math.sign(this.bottom)
            );
            ctx.bezierCurveTo(
                this.x + this.width * Math.abs(this.bottom) - tabWidth,
                this.y + this.height + tabHeight * Math.sign(this.bottom),

                this.x + this.width * Math.abs(this.bottom) - neck,
                this.y + this.height + tabHeight * Math.sign(this.bottom) * 0.2,

                this.x + this.width * Math.abs(this.bottom) - neck,
                this.y + this.height
            );
            ctx.lineTo(this.x + this.width * Math.abs(this.bottom) - neck, this.y + this.height);
        }
        ctx.lineTo(this.x, this.y + this.height);

        // back to top left
        if (this.left) {
            ctx.lineTo(this.x, this.y + this.height * Math.abs(this.left) + neck);
            ctx.bezierCurveTo(
                this.x + tabHeight * Math.sign(this.left) * 0.2,
                this.y + this.height * Math.abs(this.left) + neck,

                this.x + tabHeight * Math.sign(this.left),
                this.y + this.height * Math.abs(this.left) + tabWidth,

                this.x + tabHeight * Math.sign(this.left),
                this.y + this.height * Math.abs(this.left)
            );

            ctx.bezierCurveTo(
                this.x + tabHeight * Math.sign(this.left),
                this.y + this.height * Math.abs(this.left) - tabWidth,

                this.x + tabHeight * Math.sign(this.left) * 0.2,
                this.y + this.height * Math.abs(this.left) - neck,

                this.x,
                this.y + this.height * Math.abs(this.left) - neck
            );
            ctx.lineTo(this.x, this.y + this.height * Math.abs(this.left) - neck);
        }
        ctx.lineTo(this.x, this.y);

        ctx.save();
        // clip contents so the image part fits to the puzzle piece
        ctx.clip();

        const scaledTabHeight = Math.min(this.img.width / this.columns,
            this.img.height / this.rows) * tabHeight / size;

        // draw the cropped image to the puzzle piece
        ctx.drawImage(this.img,
            this.column * (this.img.width / this.columns) - scaledTabHeight,
            this.row * (this.img.height / this.rows) - scaledTabHeight,
            this.img.width / this.columns + (scaledTabHeight * 2),
            this.img.height / this.rows + (scaledTabHeight * 2),
            this.x - tabHeight,
            this.y - tabHeight,
            this.width + tabHeight * 2,
            this.height + tabHeight * 2);

        ctx.restore();
        ctx.stroke();
        this.ctx.strokeStyle = '#000';
    }

    /**
     * sets the position of the current piece
     * @param {Number} x - destination x coordinate 
     * @param {Number} y - destination y coordinate
     */
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * checks if the piece is close enough to the correct position
     * @returns {Boolean} true if the piece is close enough to the correct position
     */
    isClose() {
        // check distance against threshold
        if (this.distance({ x: this.x, y: this.y }, { x: this.xCorrect, y: this.yCorrect }) <= this.width / 5) {
            return true;
        }
        return false;
    }

    /**
     * Snap the piece to the correct position
     */
    snap() {
        this.x = this.xCorrect;
        this.y = this.yCorrect;
        this.snapped = true;
    }

    /**
     * calculates the distance between two points
     * @param {Number} a 
     * @param {Number} b 
     * @returns {Number} distance between the two points
     */
    distance(a, b) {
        return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
    }
}
