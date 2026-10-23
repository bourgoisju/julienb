// Entry point. Each module enhances markup that already works without JavaScript.
import { initTheme } from './theme.js?v=20261024i';
import { initHeader, initReveal, initParallax } from './motion.js?v=20261024i';
import { initPreview } from './preview.js?v=20261024i';
import { initCursor } from './cursor.js?v=20261024i';
import { initMagnetic } from './effects.js?v=20261024i';
import { initDevices } from './devices.js?v=20261024i';

const root = document.documentElement;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

const year = document.querySelector('[data-year]');
if (year) year.textContent = String(new Date().getFullYear());

initTheme();
initHeader();
initReveal();
initPreview();
initDevices({ motion: !reducedMotion.matches });
if (!reducedMotion.matches) {
  initParallax();
  initCursor();
  initMagnetic();
}

// Tells the inline head script that motion can stay on.
root.classList.add('is-ready');
