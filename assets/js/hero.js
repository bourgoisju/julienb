// Hero « vitrine vivante »: the stack of real sites cycles to the front, leans toward the pointer,
// and fans out as the visitor scrolls past. Positions and timings live in styles.css (.stack-card[data-pos]).
const DELAY = 4000;

export function initHero({ motion }) {
  const hero = document.querySelector('[data-hero]');
  const stack = hero?.querySelector('[data-stack]');
  if (!stack) return;

  const cards = [...stack.querySelectorAll('.stack-card')];
  const dots = [...hero.querySelectorAll('[data-stack-go]')];
  const num = hero.querySelector('[data-stack-num]');
  const name = hero.querySelector('[data-stack-name]');
  const meta = hero.querySelector('[data-stack-meta]');
  const projects = [...document.querySelectorAll('.project')];
  const n = cards.length;
  let active = 0;
  let timer = 0;

  hero.style.setProperty('--stack-delay', `${DELAY}ms`);

  const show = (i) => {
    active = (i + n) % n;
    cards.forEach((card, k) => { card.dataset.pos = String((k - active + n) % n); });
    const front = cards[active];
    hero.style.setProperty('--site-glow', front.dataset.glow);
    num.textContent = String(active + 1).padStart(2, '0');
    name.textContent = front.dataset.name;
    meta.textContent = front.dataset.meta;
    dots.forEach((d, k) => d.setAttribute('aria-pressed', String(k === active)));
  };

  // Autoplay — only when motion is welcome, the hero is on screen, the tab is visible and nobody is hovering.
  const pauses = new Set();
  const schedule = () => {
    clearTimeout(timer);
    const paused = !motion || pauses.size > 0;
    hero.classList.toggle('is-paused', paused);
    if (!paused) timer = setTimeout(() => { show(active + 1); restartBar(); schedule(); }, DELAY);
  };
  const pause = (why) => { pauses.add(why); schedule(); };
  const resume = (why) => { pauses.delete(why); restartBar(); schedule(); };
  // Restart the progress bar inside the active dot.
  const restartBar = () => {
    const d = dots[active];
    d.setAttribute('aria-pressed', 'false');
    void d.offsetWidth;
    d.setAttribute('aria-pressed', 'true');
  };

  dots.forEach((d) => d.addEventListener('click', () => { show(Number(d.dataset.stackGo)); restartBar(); schedule(); }));
  hero.querySelector('.hero-stage').addEventListener('pointerenter', () => pause('hover'));
  hero.querySelector('.hero-stage').addEventListener('pointerleave', () => resume('hover'));
  hero.addEventListener('focusin', (e) => { if (e.target.closest('.stack-dots')) pause('focus'); });
  hero.addEventListener('focusout', (e) => { if (e.target.closest('.stack-dots')) resume('focus'); });
  document.addEventListener('visibilitychange', () => (document.hidden ? pause('hidden') : resume('hidden')));
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => (e.isIntersecting ? resume('offscreen') : pause('offscreen'))).observe(hero);
  }

  // Clicking the front card jumps to that project further down the page.
  stack.addEventListener('click', () => {
    const target = projects[Number(cards[active].dataset.target)];
    target?.scrollIntoView({ behavior: motion ? 'smooth' : 'auto', block: 'center' });
  });

  show(0);
  schedule();
  if (!motion) return;

  // Pointer depth (mouse / trackpad), eased toward the target each frame.
  let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
  const loop = () => {
    cx += (tx - cx) * 0.08;
    cy += (ty - cy) * 0.08;
    hero.style.setProperty('--px', cx.toFixed(3));
    hero.style.setProperty('--py', cy.toFixed(3));
    raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.002 ? requestAnimationFrame(loop) : 0;
  };
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width) * 2 - 1;
      ty = ((e.clientY - r.top) / r.height) * 2 - 1;
      if (!raf) raf = requestAnimationFrame(loop);
    });
    hero.addEventListener('pointerleave', () => { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(loop); });
  }

  // Scroll: 0 at the top, 1 once the hero has scrolled out.
  let ticking = false;
  const onScroll = () => {
    ticking = false;
    const p = Math.min(1, Math.max(0, scrollY / (hero.offsetHeight || 1)));
    hero.style.setProperty('--p', p.toFixed(3));
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();
}
