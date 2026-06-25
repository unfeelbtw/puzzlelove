export function addTouchSupport(puzzle) {
    const canvas = puzzle.canvas;

    let cachedRect = null;

    function updateCachedRect() {
        cachedRect = canvas.getBoundingClientRect();
    }

    function getTouchPos(touch) {
        if (!cachedRect) {
            updateCachedRect();
        }
        const rect = cachedRect;
        return {
            x: rect.width ? (touch.clientX - rect.left) * (canvas.width / rect.width) : (touch.clientX - rect.left) * puzzle.scaleMultiplier,
            y: rect.height ? (touch.clientY - rect.top) * (canvas.height / rect.height) : (touch.clientY - rect.top) * puzzle.scaleMultiplier
        };
    }

    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (e.touches.length !== 1) return;
        updateCachedRect();
        const t = getTouchPos(e.touches[0]);
        puzzle.selected = puzzle.getClickedPiece(t);
        if (puzzle.selected) {
            puzzle.selected.offset = {
                x: t.x - puzzle.selected.x,
                y: t.y - puzzle.selected.y
            };
        }
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (!puzzle.selected || e.touches.length !== 1) return;
        const t = getTouchPos(e.touches[0]);
        puzzle.selected.x = t.x - puzzle.selected.offset.x;
        puzzle.selected.y = t.y - puzzle.selected.offset.y;
        puzzle.currentClientX = t.x;
        puzzle.currentClientY = t.y;
    }, { passive: false });

    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        if (!puzzle.selected) return;
        if (puzzle.selected.isClose()) puzzle.selected.snap();
        puzzle.selected = null;
        cachedRect = null;
    }, { passive: false });
}
