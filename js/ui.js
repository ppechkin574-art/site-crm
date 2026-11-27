// Общие помощники интерфейса
import { icon } from './icons.js';
import { INFO } from './config.js';

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const nf = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 });
export function money(v) {
  if (v >= 1e6) return `${nf.format(Math.round(v / 1e4) / 100)} млн ₸`;
  if (v >= 1e3) return `${nf.format(Math.round(v / 1e3))} тыс ₸`;
  return `${nf.format(v)} ₸`;
}
export const num = (v) => nf.format(v);

export function delta(d, suffix = '') {
  if (d > 0) return `<span class="up">+${num(d)}${suffix}</span>`;
  if (d < 0) return `<span class="down">−${num(-d)}${suffix}</span>`;
  return `<span class="muted">0${suffix}</span>`;
}
export const planSpan = (p) => `<span class="${p >= 100 ? 'up' : 'down'}">${p}%</span>`;

export function dateLabel(iso) {
  if (!iso) return 'без срока';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

export const STATUS_TEXT = { g: 'В норме', r: 'Проблема' };

export const ICON = {
  camera:  icon('camera', { size: 40 }),
  tasks:   icon('checklist-minimalistic', { size: 22 }),
  chevron: icon('alt-arrow-right', { size: 20, cls: 'chev' }),
  back:    icon('alt-arrow-left', { size: 22 }),
  alert:   icon('danger-circle', { size: 16 }),
  close:   icon('close-circle', { size: 22 }),
  trash:   icon('trash-bin-minimalistic', { size: 20 }),
  data:    icon('database', { size: 20 }),
  pin:     icon('map-point', { size: 16 }),
  user:    icon('user', { size: 16 }),
  shop:    icon('shop', { size: 16 }),
  add:     icon('add-circle', { size: 20 }),
  check:   icon('check-circle', { size: 16 }),
};

// Значок «i» с пояснением. key — ключ из INFO или готовый текст
export function info(key) {
  const text = INFO[key] ?? key;
  return `<button type="button" class="info" data-info="${esc(text)}" aria-label="Пояснение">${icon('info-circle', { size: 16 })}</button>`;
}

// Контурная иконка показателя, без фона
export const kpiIcon = (name) => `<span class="kpi-ic">${icon(name, { size: 22 })}</span>`;

export function tasksButton(branchId, stats, attr = 'data-tasks') {
  const badge = stats.open === 0
    ? '<span class="badge zero">✓</span>'
    : `<span class="badge ${stats.overdue ? '' : 'calm'}">${stats.open}</span>`;
  return `<button class="tasks-btn" ${attr}="${esc(branchId)}" aria-label="Задачи: ${stats.open} открыто, ${stats.overdue} просрочено">${ICON.tasks}${badge}</button>`;
}

export function photo(b, cls = '') {
  return b.photo
    ? `<div class="photo ${cls}"><img src="${esc(b.photo)}" alt="Фото: ${esc(b.name)}" loading="lazy" decoding="async"${b.photoPos ? ` style="object-position:${esc(b.photoPos)}"` : ''}></div>`
    : `<div class="photo tone-${b.tone} ${cls}">${ICON.camera}</div>`;
}
