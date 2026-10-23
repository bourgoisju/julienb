// Entry point. Each module enhances markup that already works without JavaScript.
import { initTheme } from './theme.js?v=20261024j';
import { initHeader, initReveal, initParallax } from './motion.js?v=20261024j';
import { initPreview } from './preview.js?v=20261024j';
import { initCursor } from './cursor.js?v=20261024j';
import { initMagnetic } from './effects.js?v=20261024j';
import { initDevices } from './devices.js?v=20261024j';
import { initTitles } from './titles.js?v=20261024j';

const root = document.documentElement;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

const year = document.querySelector('[data-year]');
if (year) year.textContent = String(new Date().getFullYear());

initTheme();
initHeader();
// Split titles before the reveal observer starts, so their first appearance is animated.
if (!reducedMotion.matches) initTitles();
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
