// Задачи филиала: список, добавление, отметка выполнения.
// Одна разметка используется в двух местах: карточка в «Обзоре» и выдвижная панель на главной.
import * as store from '../store.js';
import { SECTIONS } from '../config.js';
import { esc, dateLabel, ICON } from '../ui.js';
import { openSheet, setSheetBody } from '../sheet.js';

export function tasksHTML(branchId) {
  const b = store.branch(branchId);
  const sections = SECTIONS[b.type];
  const secName = (id) => id === 'overview' ? 'Общее' : sections.find(s => s.id === id)?.name ?? 'Общее';
  const all = store.tasksOf(branchId);
  const open = all.filter(t => !t.done).sort((a, c) => (a.due || '9999').localeCompare(c.due || '9999'));
  const done = all.filter(t => t.done);
  const item = (t) => `
    <li class="task ${store.isOverdue(t) ? 'overdue' : ''} ${t.done ? 'done' : ''}">
      <label class="check"><input type="checkbox" data-toggle="${esc(t.id)}" ${t.done ? 'checked' : ''} aria-label="Выполнено: ${esc(t.title)}"><span></span></label>
      <div class="task-main">
        <div class="task-title">${esc(t.title)}</div>
        <div class="task-meta">${esc(secName(t.section))} · ${store.isOverdue(t) ? '<b>просрочено</b>, ' : ''}${dateLabel(t.due)}</div>
      </div>
      <button type="button" class="icon-btn subtle" data-del="${esc(t.id)}" aria-label="Удалить задачу">${ICON.trash}</button>
    </li>`;
  return `
    <form class="task-form" autocomplete="off">
      <input name="title" required maxlength="200" placeholder="Новая задача…" aria-label="Текст задачи">
      <select name="section" aria-label="Раздел">${sections.map(s => `<option value="${s.id}">${esc(secName(s.id))}</option>`).join('')}</select>
      <input name="due" type="date" aria-label="Срок">
      <button class="btn primary" type="submit">${ICON.add}Добавить</button>
    </form>
    <div class="list-title">Открытые · ${open.length}</div>
    ${open.length ? `<ul class="task-list">${open.map(item).join('')}</ul>` : '<p class="empty-note">Открытых задач нет</p>'}
    ${done.length ? `<details class="done-block"><summary>Выполненные · ${done.length}</summary><ul class="task-list">${done.map(item).join('')}</ul></details>` : ''}`;
}

// onChange({ added }) вызывается после любого изменения
export function bindTasks(root, branchId, onChange) {
  root.querySelector('.task-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(e.target);
    const title = String(f.get('title')).trim();
    if (!title) return;
    store.addTask(branchId, { title, section: f.get('section'), due: f.get('due') });
    onChange({ added: true });
  });
  root.querySelectorAll('[data-toggle]').forEach(el => el.addEventListener('change', () => { store.toggleTask(el.dataset.toggle); onChange({}); }));
  root.querySelectorAll('[data-del]').forEach(el => el.addEventListener('click', () => {
    if (confirm('Удалить задачу?')) { store.deleteTask(el.dataset.del); onChange({}); }
  }));
}

// Выдвижная панель (главная страница)
export function openTasks(branchId, onClose) {
  const b = store.branch(branchId);
  if (!b) return;
  const bind = (body) => bindTasks(body, branchId, ({ added }) => {
    setSheetBody(tasksHTML(branchId), bind);
    if (added) body.querySelector('input[name=title]')?.focus();
  });
  openSheet(`Задачи · ${b.name}`, tasksHTML(branchId), bind, onClose);
}
