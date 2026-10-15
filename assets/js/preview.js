// Live preview: screenshot links open the real site in a dialog instead of a new tab.
// Without JavaScript (or with a modifier key) they stay ordinary links.
export function initPreview() {
  const dialog = document.querySelector('[data-preview-dialog]');
  const triggers = [...document.querySelectorAll('[data-preview]')];
  if (!dialog || !triggers.length || typeof dialog.showModal !== 'function') return;

  const iframe = dialog.querySelector('[data-preview-iframe]');
  const title = dialog.querySelector('[data-preview-title]');
  const meta = dialog.querySelector('[data-preview-meta]');
  const openLink = dialog.querySelector('[data-preview-open]');
  const loading = dialog.querySelector('[data-preview-loading]');
  const deviceBtns = [...dialog.querySelectorAll('[data-device-btn]')];
  let index = 0;
  let opener = null;

  const show = (i) => {
    index = (i + triggers.length) % triggers.length;
    const t = triggers[index];
    title.textContent = t.dataset.title;
    meta.textContent = `${t.dataset.meta} · ${index + 1}/${triggers.length}`;
    openLink.href = t.href;
    dialog.classList.remove('is-loaded');
    loading.textContent = 'Chargement du site…';
    iframe.title = `Aperçu du site ${t.dataset.title}`;
    iframe.src = t.href;
  };

  const setDevice = (device) => {
    dialog.dataset.device = device;
    deviceBtns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.deviceBtn === device)));
  };

  iframe.addEventListener('load', () => {
    if (iframe.src) { dialog.classList.add('is-loaded'); loading.textContent = ''; }
  });

  // Warm up the connection as soon as the visitor shows intent, so the iframe starts faster.
  const warmed = new Set();
  const warm = (t) => {
    const origin = new URL(t.href).origin;
    if (warmed.has(origin)) return;
    warmed.add(origin);
    const link = Object.assign(document.createElement('link'), { rel: 'preconnect', href: origin });
    document.head.append(link);
  };

  triggers.forEach((t, i) => {
    t.addEventListener('pointerenter', () => warm(t), { once: true });
    t.addEventListener('focus', () => warm(t), { once: true });
    t.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
      e.preventDefault();
      opener = t;
      // Phones get the site at its natural width.
      setDevice(matchMedia('(max-width: 600px)').matches ? 'desktop' : dialog.dataset.device);
      show(i);
      dialog.showModal();
      document.body.style.overflow = 'hidden';
    });
  });

  deviceBtns.forEach((b) => b.addEventListener('click', () => setDevice(b.dataset.deviceBtn)));
  dialog.querySelector('[data-preview-prev]').addEventListener('click', () => show(index - 1));
  dialog.querySelector('[data-preview-next]').addEventListener('click', () => show(index + 1));
  dialog.querySelector('[data-preview-close]').addEventListener('click', () => dialog.close());

  dialog.addEventListener('keydown', (e) => {
    if (e.target === iframe) return;
    if (e.key === 'ArrowLeft') show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
  });
  // Esc is handled natively; this runs for every way of closing.
  dialog.addEventListener('close', () => {
    iframe.removeAttribute('src');
    document.body.style.overflow = '';
    opener?.focus();
  });
}
