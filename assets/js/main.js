// Entry point. Each module enhances markup that already works without JavaScript.
import { initTheme } from './theme.js';
import { initHeader, initReveal, initParallax } from './motion.js';
import { initPreview } from './preview.js';
import { initCursor } from './cursor.js';
import { initTilt, initSpotlight, initMagnetic, initCountUp } from './effects.js';
import { initHero } from './hero.js';

const root = document.documentElement;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

const year = document.querySelector('[data-year]');
if (year) year.textContent = String(new Date().getFullYear());

const count = document.querySelectorAll('.project').length;
document.querySelectorAll('[data-site-count]').forEach((el) => { el.textContent = String(count); });
document.querySelectorAll('[data-site-count-label]').forEach((el) => { el.textContent = `${count} projets`; });

initTheme();
initHeader();
initReveal();
initPreview();
initHero({ motion: !reducedMotion.matches });
if (!reducedMotion.matches) {
  initParallax();
  initCursor();
  initTilt();
  initSpotlight();
  initMagnetic();
  initCountUp();
}

// Tells the inline head script that motion can stay on.
root.classList.add('is-ready');
