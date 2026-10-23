// Pointer-driven effects (mouse / trackpad only).
// Each effect writes CSS custom properties; the look and easing live in styles.css.
const finePointer = () => matchMedia('(hover: hover) and (pointer: fine)').matches;

// Buttons lean toward the pointer, then spring back.
export function initMagnetic() {
  if (!finePointer()) return;
  const PULL = 0.3;
  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--tx', `${((e.clientX - r.left - r.width / 2) * PULL).toFixed(1)}px`);
      el.style.setProperty('--ty', `${((e.clientY - r.top - r.height / 2) * PULL).toFixed(1)}px`);
    });
    el.addEventListener('pointerleave', () => {
      el.style.setProperty('--tx', '0px');
      el.style.setProperty('--ty', '0px');
    });
  });
}
