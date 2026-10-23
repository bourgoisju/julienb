// Hero devices: the laptop and phone show the same real site, then cross-fade to the next one.
// The scene leans toward the pointer (CSS reads --px / --py, from -1 to 1).
const DELAY = 4200;

export function initDevices({ motion }) {
  const hero = document.querySelector('[data-devices]');
  if (!hero) return;
  const desktop = [...hero.querySelectorAll('[data-screen="desktop"] img')];
  const mobile = [...hero.querySelectorAll('[data-screen="mobile"] img')];
  const name = hero.querySelector('[data-device-name]');
  const meta = hero.querySelector('[data-device-meta]');
  const projects = [...document.querySelectorAll('.project [data-preview]')];
  const n = desktop.length;
  if (!n || !motion) return;

  let active = 0;
  let timer = 0;
  const show = (i) => {
    active = i % n;
    desktop.forEach((img, k) => img.classList.toggle('is-active', k === active));
    mobile.forEach((img, k) => img.classList.toggle('is-active', k === active));
    const p = projects[active];
    if (p && name) {
      name.textContent = p.dataset.title;
      meta.textContent = p.dataset.meta.split(' · ')[0];
    }
  };

  // Cycle only while the hero is on screen and the tab is visible.
  let onScreen = true;
  const schedule = () => {
    clearTimeout(timer);
    if (onScreen && !document.hidden) timer = setTimeout(() => { show(active + 1); schedule(); }, DELAY);
  };
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; schedule(); }).observe(hero);
  }
  document.addEventListener('visibilitychange', schedule);
  schedule();

  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
  const loop = () => {
    cx += (tx - cx) * 0.08;
    cy += (ty - cy) * 0.08;
    hero.style.setProperty('--px', cx.toFixed(3));
    hero.style.setProperty('--py', cy.toFixed(3));
    raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.002 ? requestAnimationFrame(loop) : 0;
  };
  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect();
    tx = ((e.clientX - r.left) / r.width) * 2 - 1;
    ty = ((e.clientY - r.top) / r.height) * 2 - 1;
    if (!raf) raf = requestAnimationFrame(loop);
  });
  hero.addEventListener('pointerleave', () => { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(loop); });
}
