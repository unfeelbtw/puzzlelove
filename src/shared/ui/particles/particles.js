import { GAME_CONFIG } from '../../config/game-config.js';

export class ParticleBackground {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector) || document.body;
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.animationId = null;

        this.canvas.style.position = 'absolute';
        this.canvas.style.inset = '0';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '1';

        this.handleResize = this.handleResize.bind(this);
    }

    init() {
        this.container.appendChild(this.canvas);
        this.resize();
        this.createParticles();
        this.animate();

        window.addEventListener('resize', this.handleResize);
    }

    handleResize() {
        this.resize();
    }

    resize() {
        this.canvas.width = this.container.clientWidth;
        this.canvas.height = this.container.clientHeight;
    }

    createParticles() {
        const { count, minSpeed, maxSpeed, minSize, maxSize } = GAME_CONFIG.particles;
        this.particles = [];

        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * (maxSpeed - minSpeed) + (Math.random() > 0.5 ? minSpeed : -minSpeed),
                vy: (Math.random() - 0.5) * (maxSpeed - minSpeed) + (Math.random() > 0.5 ? minSpeed : -minSpeed),
                radius: Math.random() * (maxSize - minSize) + minSize,
                alpha: Math.random() * 0.5 + 0.1
            });
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = GAME_CONFIG.colors.particleColor;

        for (const p of this.particles) {
            this.ctx.save();
            this.ctx.globalAlpha = p.alpha;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();

            p.x += p.vx;
            p.y += p.vy;

            // Bounce or loop particles
            if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;
        }

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        window.removeEventListener('resize', this.handleResize);
        if (this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
}
