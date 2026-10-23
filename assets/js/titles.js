// Section titles: split into words so each one can rise in turn when the title comes into view
// (styles.css § Motion, .title-anim). The gradient part stays one unit: it is wiped in, then a light
// sweep crosses it. Text, spacing and line breaks are unchanged, so search engines and screen readers
// read the same sentence.
const SELECTOR = '.section-head h2, .contact-card h2';

export function initTitles() {
  document.querySelectorAll(SELECTOR).forEach((title) => {
    let index = 0;

    const split = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.append(document.createTextNode(part)); return; }
            const mask = document.createElement('span');
            const word = document.createElement('span');
            mask.className = 'tw';
            word.textContent = part;
            word.style.setProperty('--w', String(index++));
            mask.append(word);
            frag.append(mask);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === Node.ELEMENT_NODE && child.classList.contains('grad-text')) {
          child.classList.add('tw-grad', 'shine');
          child.style.setProperty('--w', String(index++));
        } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== 'BR') {
          split(child);
        }
      });
    };

    split(title);
    title.classList.add('title-anim');
  });
}
