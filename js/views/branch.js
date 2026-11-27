// Страница 2 — филиал: навбар разделов + обзор (вариант 2A)
import * as store from '../store.js';
import { SECTIONS } from '../config.js';
import { icon } from '../icons.js';
import { esc, money, num, delta, planSpan, tasksButton, info, kpiIcon, ICON } from '../ui.js';
import { tasksHTML, bindTasks } from './tasks.js';

export function renderBranch(b, sectionId) {
  const sections = SECTIONS[b.type];
  const current = sections.find(s => s.id === sectionId) ?? sections[0];
  const st = store.branchStatus(b);

  const nav = `
  <header class="topbar">
    <div class="topbar-in">
      <a class="icon-btn back" href="#/" aria-label="К филиалам">${ICON.back}</a>
      <div class="bn"><span class="dot ${st}"></span><span class="bn-text">${esc(b.name)}</span></div>
      ${tasksButton(b.id, store.taskStats(b.id), 'data-goto-tasks')}
      <nav class="tabs" aria-label="Разделы">
        ${sections.map(s => `<a href="#/b/${esc(b.id)}/${s.id}" class="tab ${s.id === current.id ? 'on' : ''}" ${s.id === current.id ? 'aria-current="page"' : ''}>${icon(s.icon, { size: 18 })}${esc(s.name)}</a>`).join('')}
      </nav>
    </div>
  </header>`;

  const body = current.id === 'overview' ? overview(b, sections) : emptySection(current);
  return nav + `<main class="wrap">${body}</main>`;
}

function emptySection(s) {
  return `
  <section class="empty-sheet card">
    <span class="empty-ic">${icon(s.icon, { size: 40 })}</span>
    <h1 class="h2">${esc(s.name)}</h1>
    <p class="sub">Раздел в разработке — проработаем отдельно</p>
  </section>`;
}

function overview(b, sections) {
  const m = b.metrics, pct = store.planPct(b);
  const month = new Date().toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });

  // [иконка, подпись, значение, пояснение-строка, ключ INFO]
  const kpis = b.type === 'school' ? [
    ['wallet-money', 'Выручка', money(m.revenue), `${planSpan(pct)} от плана`, 'revenue'],
    ['users-group-rounded', 'Активные ученики', num(m.students), `${delta(m.studentsDelta)} за месяц`, 'students'],
    ['calendar-mark', 'Посещаемость', `${m.attendance}%`, `${delta(m.attendanceDelta, ' п.')} к прошлому`, 'attendance'],
    ['user-plus', 'Новые заявки', num(m.leads), `${delta(m.leadsDelta)} к прошлому`, 'leads'],
    ['refresh-circle', 'Продления', `${m.renewals}%`, `${delta(m.renewalsDelta, ' п.')} к прошлому`, 'renewals'],
  ] : [
    ['wallet-money', 'Выручка', money(m.revenue), `${planSpan(pct)} от плана`, 'revenue'],
    ['bill-list', 'Чеки', num(m.checks), `${delta(m.checksDelta)} к прошлому`, 'checks'],
    ['tag-price', 'Средний чек', money(m.avgCheck), `${delta(m.avgCheckDelta, ' ₸')}`, 'avgCheck'],
    ['box', 'На исходе', `${m.lowStock} поз.`, 'нужно дозаказать', 'lowStock'],
    ['undo-left-round', 'Возвраты', num(m.returns), 'за месяц', 'returns'],
  ];

  // «Требует внимания»: предупреждения + просроченные задачи (все задачи — в отдельной карточке ниже)
  const secName = (id) => sections.find(s => s.id === id)?.name ?? 'Общее';
  const overdue = store.tasksOf(b.id).filter(store.isOverdue).sort((a, c) => a.due.localeCompare(c.due));
  const attention = [
    ...b.alerts.map(a => ({ text: a.text, meta: secName(a.section) })),
    ...overdue.map(t => ({ text: t.title, meta: `просрочено · ${secName(t.section)}` })),
  ];
  const ts = store.taskStats(b.id);

  const cats = sections.filter(s => s.id !== 'overview').map(s => {
    const ts = store.taskStats(b.id, s.id);
    const alert = b.alerts.some(a => a.section === s.id);
    const c = ts.overdue || alert ? 'r' : 'g';
    return `
      <a class="card cat ${c}" href="#/b/${esc(b.id)}/${s.id}">
        <div class="cat-t">${kpiIcon(s.icon)}<span class="cat-name">${esc(s.name)}</span><span class="dot ${c}"></span></div>
        <div class="cat-v">${ts.open} ${plural(ts.open, 'задача', 'задачи', 'задач')}</div>
        <div class="label">${ts.overdue ? `<span class="down">${ts.overdue} просрочено</span>` : alert ? '<span class="down">есть предупреждение</span>' : 'без просрочек'}</div>
      </a>`;
  }).join('');

  const plan = Math.round(m.revenuePlan / 1000);

  return `
  <div class="page-head">
    <div><h1 class="h1">Обзор</h1><p class="sub">${[b.addr, b.manager, month].filter(Boolean).map(esc).join(' · ')}</p></div>
  </div>

  <section class="kpis">
    ${kpis.map(([ic, l, v, d, k], i) => `
      <div class="card stat ${i === 0 ? 'wide' : ''}">
        <div class="stat-head">${kpiIcon(ic)}<span class="label lab">${l}${info(k)}</span></div>
        <div class="num">${v}</div><div class="d">${d}</div>
      </div>`).join('')}
  </section>

  <section class="two">
    <div class="card panel">
      <div class="panel-t">
        <h2 class="lab">${kpiIcon('chart-2')}Выручка по месяцам${info('chart')}</h2>
        <span class="legend"><i class="legend-plan"></i>план ${num(plan)} тыс ₸</span>
      </div>
      <div class="chart-box" id="revChart" role="img" aria-label="Выручка по месяцам: ${esc(m.history.map(([mo, v]) => `${mo} ${v}`).join(", "))} тыс ₸; план ${plan}"></div>
    </div>
    <div class="card panel">
      <div class="panel-t">
        <h2 class="lab">${kpiIcon('bell')}Требует внимания${info('attention')}</h2>
        ${attention.length ? `<span class="pill r">${attention.length}</span>` : '<span class="pill g">всё в норме</span>'}
      </div>
      ${attention.length ? `<ul class="att">${attention.map(x => `<li><span class="dot r"></span><div>${esc(x.text)}<small>${esc(x.meta)}</small></div></li>`).join('')}</ul>` : '<p class="empty-note">Предупреждений и просроченных задач нет</p>'}
    </div>
  </section>

  <section class="card panel tasks-card" id="tasks">
    <div class="panel-t">
      <h2 class="lab">${kpiIcon('checklist-minimalistic')}Задачи филиала${info('tasks')}</h2>
      <span class="pill ${ts.overdue ? 'r' : 'g'}">${ts.open} открыто${ts.overdue ? ` · ${ts.overdue} просроч.` : ''}</span>
    </div>
    <div class="tasks-body">${tasksHTML(b.id)}</div>
  </section>

  <h2 class="h3 lab">По разделам${info('sections')}</h2>
  <section class="cats">${cats}</section>`;
}

// Графики создаются после вставки HTML в страницу. Возвращает функцию очистки.
export function mountBranch(b, root, animate = true) {
  const el = root.querySelector('#revChart');
  if (!el || typeof ApexCharts === 'undefined') return () => {};
  const css = getComputedStyle(document.documentElement);
  const c = (name) => css.getPropertyValue(name).trim();
  const m = b.metrics, plan = Math.round(m.revenuePlan / 1000);
  const months = m.history.map(h => h[0]), vals = m.history.map(h => h[1]);
  const last = vals.length - 1;
  const colors = vals.map((v, i) => i === last ? (v < plan ? c('--red') : c('--blue')) : c('--bar'));

  const chart = new ApexCharts(el, {
    chart: { type: 'bar', height: 240, toolbar: { show: false }, zoom: { enabled: false }, fontFamily: c('--font'), foreColor: c('--text-2'),
      animations: { enabled: animate && !matchMedia('(prefers-reduced-motion: reduce)').matches, speed: 400 }, parentHeightOffset: 0 },
    series: [{ name: 'Выручка', data: vals }],
    colors,
    plotOptions: { bar: { distributed: true, borderRadius: 6, borderRadiusApplication: 'end', columnWidth: '58%', dataLabels: { position: 'top' } } },
    // Подпись только у текущего месяца, остальные значения — в подсказке
    dataLabels: {
      enabled: true, offsetY: -26,
      formatter: (v, { dataPointIndex }) => dataPointIndex === last ? num(v) : '',
      // при включённом фоне style.colors красит плашку подписи — берём цвет столбца
      style: { fontSize: '12px', fontWeight: 700, colors: [({ dataPointIndex }) => colors[dataPointIndex]] },
      background: { enabled: true, foreColor: '#fff', borderRadius: 6, padding: 5, borderWidth: 0, opacity: 1, dropShadow: { enabled: false } },
    },
    legend: { show: false },
    grid: { borderColor: c('--card-strong'), strokeDashArray: 0, padding: { left: 4, right: 4, top: 0 }, yaxis: { lines: { show: true } } },
    xaxis: { categories: months, axisBorder: { show: false }, axisTicks: { show: false }, labels: { style: { fontSize: '12px' } },
      crosshairs: { show: false }, tooltip: { enabled: false } },
    yaxis: { min: 0, max: Math.ceil(Math.max(plan, ...vals) * 1.2 / 100) * 100, tickAmount: 4, labels: { formatter: v => num(Math.round(v)), style: { fontSize: '11px' } } },
    annotations: { yaxis: [{ y: plan, borderColor: c('--red'), strokeDashArray: 6, borderWidth: 2, opacity: 1 }] },
    states: { hover: { filter: { type: 'darken', value: 0.9 } }, active: { filter: { type: 'none' } } },
    tooltip: {
      custom: ({ dataPointIndex: i }) => `<div class="ctip">${esc(months[i])}<b>${num(vals[i])} тыс ₸</b><span>${Math.round(vals[i] / plan * 100)}% от плана</span></div>`,
    },
  });
  chart.render();
  return () => chart.destroy();
}

// Карточка задач в «Обзоре»; onChange перерисовывает страницу
export function mountTasksCard(b, root, onChange) {
  const card = root.querySelector('#tasks .tasks-body');
  if (card) bindTasks(card, b.id, onChange);
}

function plural(n, one, few, many) {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}
