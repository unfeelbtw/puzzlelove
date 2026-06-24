export function addTouchSupport(puzzle) {
    const canvas = puzzle.canvas;

    function getTouchPos(touch) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: (touch.clientX - rect.left) * puzzle.scaleMultiplier,
            y: (touch.clientY - rect.top) * puzzle.scaleMultiplier
        };
    }

    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (e.touches.length !== 1) return;
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
    }, { passive: false });
}
