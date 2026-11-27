// Выдвижная панель: на телефоне — снизу, на компьютере — справа
import { ICON, esc } from './ui.js';

let root, lastFocus, onCloseCb;

export function openSheet(title, bodyHtml, bind, onClose) {
  closeSheet(true);
  lastFocus = document.activeElement;
  onCloseCb = onClose;
  root = document.createElement('div');
  root.className = 'sheet-root';
  root.innerHTML = `
    <div class="sheet-backdrop" data-close></div>
    <aside class="sheet" role="dialog" aria-modal="true" aria-label="${esc(title)}">
      <div class="sheet-grab" aria-hidden="true"></div>
      <header class="sheet-head"><h2>${esc(title)}</h2><button class="icon-btn" data-close aria-label="Закрыть">${ICON.close}</button></header>
      <div class="sheet-body">${bodyHtml}</div>
    </aside>`;
  document.body.appendChild(root);
  document.body.classList.add('no-scroll');
  root.addEventListener('click', e => { if (e.target.closest('[data-close]')) closeSheet(); });
  document.addEventListener('keydown', onKey);
  requestAnimationFrame(() => root.classList.add('open'));
  bind?.(root.querySelector('.sheet-body'));
  root.querySelector('.sheet [data-close]').focus({ preventScroll: true });
}

export function setSheetBody(html, bind) {
  if (!root) return;
  const body = root.querySelector('.sheet-body');
  body.innerHTML = html;
  bind?.(body);
}

function onKey(e) { if (e.key === 'Escape') closeSheet(); }

export function closeSheet(immediate) {
  if (!root) return;
  const r = root; root = null;
  document.removeEventListener('keydown', onKey);
  document.body.classList.remove('no-scroll');
  const cb = onCloseCb; onCloseCb = null;
  if (immediate) r.remove();
  else { r.classList.remove('open'); setTimeout(() => r.remove(), 250); }
  lastFocus?.focus?.({ preventScroll: true });
  cb?.();
}
