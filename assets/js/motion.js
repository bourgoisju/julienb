// Scroll-driven motion: header state + progress bar, reveal on enter, screenshot parallax.
// Timings live in CSS (--dur-*, --ease-*, --stagger); JS only toggles classes and variables.

export function initHeader() {
  const header = document.querySelector('[data-header]');
  const progress = document.querySelector('[data-progress]');
  if (!header) return;

  let ticking = false;
  const update = () => {
    ticking = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    header.classList.toggle('is-scrolled', scrollY > 8);
    if (progress) progress.style.setProperty('--progress', max > 0 ? (scrollY / max).toFixed(4) : '0');
  };
  update();
  addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });

  // Highlight the nav entry of the section in view.
  const links = [...document.querySelectorAll('[data-nav] a')];
  const sections = links.map((a) => document.querySelector(a.hash)).filter(Boolean);
  if (!('IntersectionObserver' in window) || !sections.length) return;
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((a) => {
        if (a.hash === `#${entry.target.id}`) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => spy.observe(s));
}

export function initReveal() {
  // Groups ([data-reveal]) reveal themselves and every .reveal inside them at once, staggered by --i.
  // A lone .reveal outside any group is its own trigger.
  const targets = [
    ...document.querySelectorAll('[data-reveal]'),
    ...[...document.querySelectorAll('.reveal')].filter((el) => !el.closest('[data-reveal]')),
  ];
  const show = (el) => {
    el.classList.add('is-visible');
    el.querySelectorAll('.reveal').forEach((child) => child.classList.add('is-visible'));
  };

  // The hero is always on screen at load: play its entrance right away rather than waiting on an observer.
  const hero = document.querySelector('.hero[data-reveal]');
  if (hero && scrollY < innerHeight) {
    void hero.offsetHeight; // commit the hidden state first so the transition runs
    show(hero);
    targets.splice(targets.indexOf(hero), 1);
  }

  if (!('IntersectionObserver' in window)) { targets.forEach(show); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      // Also reveal what a fast scroll or an anchor jump has already passed.
      if (!entry.isIntersecting && entry.boundingClientRect.top > 0) return;
      show(entry.target);
      io.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -10% 0px' });
  targets.forEach((el) => io.observe(el));
}

export function initParallax() {
  const shots = [...document.querySelectorAll('.project-shot img')];
  if (!shots.length) return;
  const visible = new Set();
  let ticking = false;

  const update = () => {
    ticking = false;
    visible.forEach((img) => {
      const box = img.parentElement.getBoundingClientRect();
      // -1 when the card enters at the bottom, +1 when it leaves at the top.
      const t = (innerHeight / 2 - (box.top + box.height / 2)) / (innerHeight / 2 + box.height / 2);
      img.style.setProperty('--parallax', `${(Math.max(-1, Math.min(1, t)) * 3).toFixed(2)}%`);
    });
  };
  const request = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
    request();
  });
  shots.forEach((img) => io.observe(img));
  addEventListener('scroll', request, { passive: true });
  addEventListener('resize', request, { passive: true });
}
