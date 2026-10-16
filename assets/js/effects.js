// Pointer-driven effects (mouse / trackpad only) and the hero counter.
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

// Counts up from 0 to the number already in the markup.
export function initCountUp() {
  document.querySelectorAll('[data-count-up]').forEach((el) => {
    const target = parseInt(el.textContent, 10);
    if (!Number.isFinite(target) || target < 1) return;
    const duration = 1400;
    const start = performance.now() + 500; // let the hero settle first
    const tick = (now) => {
      const t = Math.min(1, Math.max(0, (now - start) / duration));
      const eased = 1 - Math.pow(1 - t, 4);
      el.textContent = String(Math.round(eased * target));
      if (t < 1) requestAnimationFrame(tick);
    };
    el.textContent = '0';
    requestAnimationFrame(tick);
    // Never leave a wrong number if frames are throttled (background tab, slow device).
    setTimeout(() => { el.textContent = String(target); }, duration + 1500);
  });
}
