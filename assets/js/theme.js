// Light / dark switch. The saved choice is applied before paint by the inline head script;
// without a saved choice the site opens in dark.
const KEY = 'theme';

// Dark is the brand's signature: it is the default whatever the system preference.
const current = () => document.documentElement.dataset.theme || 'dark';

function apply(theme, button) {
  document.documentElement.dataset.theme = theme;
  button.setAttribute('aria-label', theme === 'dark' ? 'Passer en thème clair' : 'Passer en thème sombre');
  const meta = document.querySelectorAll('meta[name="theme-color"]');
  meta.forEach((m) => m.setAttribute('content', theme === 'dark' ? '#060a14' : '#f5f7fc'));
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
