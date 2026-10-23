// Entry point. Each module enhances markup that already works without JavaScript.
import { initTheme } from './theme.js?v=20261024';
import { initHeader, initReveal, initParallax } from './motion.js?v=20261024';
import { initPreview } from './preview.js?v=20261024';
import { initCursor } from './cursor.js?v=20261024';
import { initMagnetic, initCountUp } from './effects.js?v=20261024';
import { initDevices } from './devices.js?v=20261024';

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
initDevices({ motion: !reducedMotion.matches });
if (!reducedMotion.matches) {
  initParallax();
  initCursor();
  initMagnetic();
  initCountUp();
}

// Tells the inline head script that motion can stay on.
root.classList.add('is-ready');
