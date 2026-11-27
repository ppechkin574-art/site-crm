// Демо-данные филиалов (заглушки — потом заменим реальными)
const ICON_CAMERA = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 8h3l2-2.5h6L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>';
const ICON_TASKS = '<svg viewBox="0 0 24 24" fill="none" stroke="#1C1C1E" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6h11M9 12h11M9 18h11"/><path d="M3.5 6l1.2 1.2L6.8 5M3.5 12l1.2 1.2L6.8 11M3.5 18l1.2 1.2L6.8 17"/></svg>';
const ICON_CHEVRON = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#8E8E93" stroke-width="2" stroke-linecap="round"><path d="M9 5l7 7-7 7"/></svg>';
const ICON_ALERT = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 8v5M12 16.5v.5"/><circle cx="12" cy="12" r="9.5"/></svg>';

const BRANCHES = [
  { id: 1, type: 'school', name: 'Филиал «Центр»',  addr: 'ул. Ленина, 12',      manager: 'А. Иванов',   p: 'p-1',
    status: 'g', tasks: 3, overdue: 0, students: 184, studentsDelta: +12, revenue: 1.42, plan: 104, attendance: 87, alert: null },
  { id: 2, type: 'school', name: 'Филиал «Север»',  addr: 'пр. Мира, 45',        manager: 'Д. Петров',   p: 'p-2',
    status: 'r', tasks: 9, overdue: 4, students: 96,  studentsDelta: -8,  revenue: 0.71, plan: 78,  attendance: 64, alert: 'Аренда истекает через 14 дн.' },
  { id: 3, type: 'school', name: 'Филиал «Юг»',     addr: 'ул. Садовая, 3',      manager: 'М. Сидорова', p: 'p-3',
    status: 'g', tasks: 2, overdue: 0, students: 152, studentsDelta: +5,  revenue: 1.18, plan: 98,  attendance: 82, alert: null },
  { id: 4, type: 'school', name: 'Филиал «Запад»',  addr: 'ул. Гагарина, 77',    manager: 'С. Козлов',   p: 'p-4',
    status: 'o', tasks: 6, overdue: 1, students: 121, studentsDelta: 0,   revenue: 0.94, plan: 89,  attendance: 75, alert: 'Нужен тренер' },
  { id: 5, type: 'school', name: 'Филиал «Восток»', addr: 'ул. Строителей, 8',   manager: 'Е. Морозова', p: 'p-5',
    status: 'g', tasks: 0, overdue: 0, students: 138, studentsDelta: +9,  revenue: 1.05, plan: 101, attendance: 84, alert: null },
  { id: 6, type: 'shop',   name: 'Магазин спорттоваров', addr: 'ТЦ «Галерея», 2 эт.', manager: 'И. Волков', p: 'p-6',
    status: 'r', tasks: 5, overdue: 2, checks: 412, checksDelta: -6, revenue: 2.36, plan: 86, stock: 12, alert: '12 позиций заканчиваются' },
];

const STATUS_TEXT = { g: 'В норме', o: 'Внимание', r: 'Проблема' };
const fmtDelta = (d) => d > 0 ? `<span class="up">+${d}</span>` : d < 0 ? `<span class="down">${d}</span>` : `<span style="color:var(--text-3)">0</span>`;
const fmtPlan = (p) => `<span class="${p >= 100 ? 'up' : p >= 90 ? '' : 'down'}">${p}%</span>`;
const tasksIcon = (b) => `<div class="tasks" title="Задачи">${ICON_TASKS}<span class="badge ${b.tasks === 0 ? 'zero' : ''}">${b.tasks === 0 ? '✓' : b.tasks}</span></div>`;
