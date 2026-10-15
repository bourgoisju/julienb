// "Aperçu" bubble that follows the pointer over screenshots. Mouse / trackpad only.
export function initCursor() {
  const cursor = document.querySelector('[data-cursor]');
  if (!cursor || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  document.documentElement.classList.add('has-cursor');

  let x = -200, y = -200, cx = x, cy = y, raf = 0;
  const loop = () => {
    // Ease toward the pointer for a soft trailing feel.
    cx += (x - cx) * 0.22;
    cy += (y - cy) * 0.22;
    cursor.style.setProperty('--x', `${cx.toFixed(1)}px`);
    cursor.style.setProperty('--y', `${cy.toFixed(1)}px`);
    raf = Math.abs(x - cx) + Math.abs(y - cy) > 0.3 ? requestAnimationFrame(loop) : 0;
  };
  const move = (e) => {
    x = e.clientX; y = e.clientY;
    if (!raf) raf = requestAnimationFrame(loop);
  };

  document.querySelectorAll('.project-shot').forEach((shot) => {
    shot.addEventListener('pointerenter', (e) => {
      cx = x = e.clientX; cy = y = e.clientY;
      move(e);
      cursor.classList.add('is-active');
    });
    shot.addEventListener('pointermove', move);
    shot.addEventListener('pointerleave', () => cursor.classList.remove('is-active'));
  });
}
