// Entry point. Each module enhances markup that already works without JavaScript.
import { initTheme } from './theme.js?v=20261024d';
import { initHeader, initReveal, initParallax, initBand, initBandLoop } from './motion.js?v=20261024d';
import { initPreview } from './preview.js?v=20261024d';
import { initCursor } from './cursor.js?v=20261024d';
import { initMagnetic } from './effects.js?v=20261024d';
import { initDevices } from './devices.js?v=20261024d';
import { initTitles } from './titles.js?v=20261024d';
import { initNav } from './nav.js?v=20261024d';

const root = document.documentElement;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

const year = document.querySelector('[data-year]');
if (year) year.textContent = String(new Date().getFullYear());

initTheme();
initNav();
initHeader();
// Split titles before the reveal observer starts, so their first appearance is animated.
if (!reducedMotion.matches) initTitles();
initReveal();
initPreview();
initBandLoop();
initDevices({ motion: !reducedMotion.matches });
// Scroll-linked effects only with a mouse / trackpad: on phones they cost a style recalculation
// every frame of the scroll, for an effect barely visible on a small screen.
const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
if (!reducedMotion.matches) {
  if (finePointer) {
    initParallax();
    initBand();
  }
  initCursor();
  initMagnetic();
}

// Tells the inline head script that motion can stay on.
root.classList.add('is-ready');
