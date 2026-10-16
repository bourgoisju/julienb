// Light / dark switch. The saved choice is applied before paint by the inline head script;
// without a saved choice the system preference wins.
const KEY = 'theme';
const darkQuery = matchMedia('(prefers-color-scheme: dark)');

const current = () => document.documentElement.dataset.theme || (darkQuery.matches ? 'dark' : 'light');

function apply(theme, button) {
  document.documentElement.dataset.theme = theme;
  button.setAttribute('aria-label', theme === 'dark' ? 'Passer en thème clair' : 'Passer en thème sombre');
  const meta = document.querySelectorAll('meta[name="theme-color"]');
  meta.forEach((m) => m.setAttribute('content', theme === 'dark' ? '#0f0f0e' : '#f4f2ee'));
}

export function initTheme() {
  const button = document.querySelector('[data-theme-toggle]');
  if (!button) return;
  apply(current(), button);

  button.addEventListener('click', () => {
    const next = current() === 'dark' ? 'light' : 'dark';
    apply(next, button);
    try { localStorage.setItem(KEY, next); } catch { /* private mode: choice lasts for this page only */ }
  });
}
