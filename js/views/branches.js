// Страница 1 — выбор филиала (вариант 1A)
import * as store from '../store.js';
import { esc, money, num, delta, planSpan, photo, tasksButton, info, kpiIcon, ICON } from '../ui.js';

export function renderBranches() {
  const list = store.branches();
  const schools = list.filter(b => b.type === 'school');
  const students = schools.reduce((s, b) => s + b.metrics.students, 0);
  const studentsDelta = schools.reduce((s, b) => s + b.metrics.studentsDelta, 0);
  const revenue = list.reduce((s, b) => s + b.metrics.revenue, 0);
  const stats = list.map(b => store.taskStats(b.id));
  const open = stats.reduce((s, x) => s + x.open, 0);
  const overdue = stats.reduce((s, x) => s + x.overdue, 0);
  const red = list.filter(b => store.branchStatus(b) === 'r').length;

  const card = (b) => {
    const m = b.metrics, ts = store.taskStats(b.id);
    const kpis = b.type === 'school'
      ? [['Ученики', `${num(m.students)} <small>${delta(m.studentsDelta)}</small>`, 'students'], ['План', planSpan(store.planPct(b)), 'plan'], ['Посещ.', `${m.attendance}%`, 'attendance']]
      : [['Чеки', `${num(m.checks)} <small>${delta(m.checksDelta)}</small>`, 'checks'], ['План', planSpan(store.planPct(b)), 'plan'], ['На исходе', `${m.lowStock} поз.`, 'lowStock']];
    return `
    <article class="card branch">
      <a class="stretched" href="#/b/${esc(b.id)}" aria-label="Открыть ${esc(b.name)}"></a>
      ${photo(b, 'branch-photo')}
      ${b.type === 'shop' ? `<span class="type-chip">${ICON.shop}Магазин</span>` : ''}
      <div class="branch-body">
        <div class="branch-top">
          <div class="min0"><h3>${esc(b.name)}</h3><div class="addr">${b.addr ? `${ICON.pin}<span>${esc(b.addr)}</span>` : ''}</div></div>
          ${tasksButton(b.id, ts)}
        </div>
        <div class="chips">${ts.overdue ? `<span class="pill r">${ICON.alert}${ts.overdue} просроч.</span>` : `<span class="calm-note">${ICON.check}Просрочек нет</span>`}</div>
        <div class="mini-kpis">${kpis.map(([l, v, k]) => `<div class="mini"><div class="label lab">${l}${info(k)}</div><div class="v">${v}</div></div>`).join('')}</div>
        <div class="branch-foot"><span class="mgr">${ICON.user}Управляющий: <b>${esc(b.manager)}</b></span>${ICON.chevron}</div>
      </div>
    </article>`;
  };

  const stat = (ic, label, key, value) => `
    <div class="card stat">
      <div class="stat-head">${kpiIcon(ic)}<span class="label lab">${label}${info(key)}</span></div>
      <div class="num">${value}</div>
    </div>`;

  return `
  <main class="wrap">
    <header class="page-head">
      <div><h1 class="h1">Филиалы</h1><p class="sub">Выберите филиал, чтобы открыть показатели</p></div>
      <button class="btn ghost" id="dataBtn">${ICON.data}<span>Данные</span></button>
    </header>

    <section class="summary">
      ${stat('users-group-rounded', 'Учеников в сети', 'netStudents', `${num(students)} <small>${delta(studentsDelta)}</small>`)}
      ${stat('wallet-money', 'Выручка за месяц', 'netRevenue', money(revenue))}
      ${stat('checklist-minimalistic', 'Открытых задач', 'netTasks', `${open} ${overdue ? `<small class="down">${overdue} просроч.</small>` : ''}`)}
      ${stat('danger-circle', 'Требуют внимания', 'netRed', `<span class="${red ? 'down' : 'up'}">${red} из ${list.length}</span>`)}
    </section>

    <section class="branch-grid">${list.map(card).join('')}</section>
  </main>`;
}
