// Pointer-driven effects (mouse / trackpad only) and the hero counter.
// Each effect writes CSS custom properties; the look and easing live in styles.css.
const finePointer = () => matchMedia('(hover: hover) and (pointer: fine)').matches;

// Screenshot tilts toward the pointer, like a card held in the hand.
export function initTilt() {
  if (!finePointer()) return;
  const MAX = 7; // degrees
  document.querySelectorAll('.project-shot').forEach((el) => {
    el.addEventListener('pointerenter', () => el.classList.add('is-tilting'));
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty('--ry', `${(px * MAX * 2).toFixed(2)}deg`);
      el.style.setProperty('--rx', `${(-py * MAX * 2).toFixed(2)}deg`);
    });
    el.addEventListener('pointerleave', () => {
      el.classList.remove('is-tilting');
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
    });
  });
}

// Soft glow that follows the pointer inside cards.
export function initSpotlight() {
  if (!finePointer()) return;
  document.querySelectorAll('.project, .principles li').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });
}

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
