// Phone menu: the burger button opens the page list under the header.
// Closes with Escape, on a link click, or when the screen grows back to desktop width.
export function initNav() {
  const button = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-menu]');
  if (!button || !menu) return;

  const setOpen = (open) => {
    menu.hidden = !open;
    button.setAttribute('aria-expanded', String(open));
    button.querySelector('.visually-hidden').textContent = open ? 'Fermer le menu' : 'Menu';
  };

  button.addEventListener('click', () => {
    const open = menu.hidden;
    setOpen(open);
    if (open) menu.querySelector('a')?.focus();
  });
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !menu.hidden) { setOpen(false); button.focus(); }
  });
  matchMedia('(min-width: 1341px)').addEventListener('change', (e) => { if (e.matches) setOpen(false); });
}
