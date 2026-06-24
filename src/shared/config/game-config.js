export const GAME_CONFIG = {
    // Grid sizes (number of puzzles)
    grid: {
        desktop: { rows: 15, cols: 15 },
        mobile: { rows: 15, cols: 15 }
    },
    // Theme colors for the website
    colors: {
        primary: '60, 120, 255',
        accent: '120, 180, 255',
        backgroundStart: '#07111f',
        backgroundMiddle: '#040c18',
        backgroundEnd: '#020810',
        cardBackground: 'rgba(10, 20, 42, 0.8)',
        hudBackground: 'rgba(10, 20, 40, 0.55)',
        borderMain: 'rgba(255, 255, 255, 0.08)',
        textMain: 'rgba(255, 255, 255, 0.85)',
        textMuted: 'rgba(255, 255, 255, 0.35)',
        particleColor: 'rgba(255, 255, 255, 0.2)'
    },
    // Particle effect settings
    particles: {
        count: 160,
        minSpeed: 0.2,
        maxSpeed: 0.8,
        minSize: 1.5,
        maxSize: 4.5
    }
};
