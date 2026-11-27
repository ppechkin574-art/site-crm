// Всплывающие подсказки для любых элементов с атрибутом data-info.
// Мышь — по наведению; палец — по нажатию (повторное нажатие или тап мимо закрывает).
let tip, current = null;

export function initTooltips() {
  tip = document.createElement('div');
  tip.className = 'tip';
  tip.id = 'tip';
  tip.setAttribute('role', 'tooltip');
  document.body.appendChild(tip);

  document.addEventListener('pointerover', e => {
    if (e.pointerType !== 'mouse') return;
    const el = e.target.closest('[data-info]');
    if (el && el !== current) show(el);
  });
  document.addEventListener('pointerout', e => {
    if (e.pointerType !== 'mouse' || !current) return;
    if (!current.contains(e.relatedTarget)) hide();
  });
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-info]');
    if (!el) { hide(); return; }
    // Подсказка внутри карточки-ссылки не должна открывать филиал
    if (el.matches('button.info')) { e.preventDefault(); e.stopPropagation(); }
    if (current === el && e.pointerType !== 'mouse') hide(); else show(el);
  }, true);
  // Только фокус с клавиатуры — иначе тап сначала покажет подсказку через фокус, а click тут же её закроет
  document.addEventListener('focusin', e => { const el = e.target.closest?.('[data-info]'); if (el && el.matches(':focus-visible')) show(el); });
  document.addEventListener('focusout', () => hide());
  document.addEventListener('keydown', e => { if (e.key === 'Escape') hide(); });
  window.addEventListener('scroll', hide, { passive: true, capture: true });
  window.addEventListener('resize', hide);
}

function show(el) {
  hide();
  current = el;
  tip.textContent = el.dataset.info;
  el.setAttribute('aria-describedby', 'tip');
  tip.classList.add('on');
  place(el);
}

export function hide() {
  if (!current) return;
  current.removeAttribute('aria-describedby');
  current = null;
  tip.classList.remove('on');
}

function place(el) {
  const r = el.getBoundingClientRect();
  const vw = document.documentElement.clientWidth;
  tip.style.left = '0px'; tip.style.top = '0px';
  const t = tip.getBoundingClientRect();
  const gap = 8, pad = 8;
  let top = r.top - t.height - gap;
  let below = false;
  if (top < pad) { top = r.bottom + gap; below = true; }
  let left = r.left + r.width / 2 - t.width / 2;
  left = Math.max(pad, Math.min(left, vw - t.width - pad));
  tip.style.left = `${left}px`;
  tip.style.top = `${top}px`;
  tip.classList.toggle('below', below);
  tip.style.setProperty('--arrow-x', `${r.left + r.width / 2 - left}px`);
}
