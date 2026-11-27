// Общий навбар филиала. Разделы, кроме «Обзора», пока пустые листы.
const SECTIONS = [
  { id: 'overview',  name: 'Обзор' },
  { id: 'supply',    name: 'Снабжение' },
  { id: 'hiring',    name: 'Найм' },
  { id: 'marketing', name: 'Маркетинг' },
  { id: 'rent',      name: 'Аренда зала' },
  { id: 'legal',     name: 'Юр. часть' },
  // Предложенные дополнительно
  { id: 'finance',   name: 'Финансы',     extra: true },
  { id: 'clients',   name: 'Ученики',     extra: true },
  { id: 'schedule',  name: 'Расписание',  extra: true },
  { id: 'staff',     name: 'Персонал',    extra: true },
  { id: 'tasks',     name: 'Задачи',      extra: true },
];

function renderNav(el, branchName, style) {
  el.innerHTML = `
    <div class="nav-in">
      <a class="back" href="index.html" title="К филиалам">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M15 5l-7 7 7 7"/></svg>
      </a>
      <div class="bn"><span class="dot r"></span>${branchName}</div>
      <nav class="tabs ${style}">
        ${SECTIONS.map((s, i) => `<button data-id="${s.id}" class="${i === 0 ? 'on' : ''} ${s.extra ? 'extra' : ''}" title="${s.extra ? 'Предложенный раздел' : ''}">${s.name}</button>`).join('')}
      </nav>
      <div class="tasks" title="Задачи филиала">${ICON_TASKS}<span class="badge">9</span></div>
    </div>`;
  el.querySelectorAll('.tabs button').forEach(b => b.onclick = () => {
    el.querySelectorAll('.tabs button').forEach(x => x.classList.toggle('on', x === b));
    const s = SECTIONS.find(x => x.id === b.dataset.id);
    document.getElementById('overview').hidden = s.id !== 'overview';
    const empty = document.getElementById('empty');
    empty.hidden = s.id === 'overview';
    empty.querySelector('h2').textContent = s.name;
    empty.querySelector('.extra-note').hidden = !s.extra;
  });
}

const NAV_CSS = `
  .topbar { position: sticky; top: 0; z-index: 50; background: rgba(255,255,255,.86); backdrop-filter: saturate(180%) blur(20px);
    -webkit-backdrop-filter: saturate(180%) blur(20px); border-bottom: 1px solid var(--card-strong); }
  .nav-in { max-width: 1240px; margin: 0 auto; padding: 12px 24px; display: flex; align-items: center; gap: 16px; }
  .back { width: 36px; height: 36px; border-radius: 10px; background: var(--card); border: 1px solid var(--card-strong);
    display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-sm); flex: none; }
  .bn { font-weight: 700; font-size: 17px; white-space: nowrap; display: flex; align-items: center; gap: 8px; }
  .tabs { flex: 1; display: flex; gap: 4px; overflow-x: auto; scrollbar-width: none; }
  .tabs::-webkit-scrollbar { display: none; }
  .tabs button { white-space: nowrap; padding: 8px 14px; border-radius: 10px; font-size: 14px; font-weight: 600; color: var(--text-2); }
  .tabs button:hover { color: var(--text); background: var(--card); }
  .tabs button.extra { color: var(--text-3); }
  .tabs button.extra::after { content: ""; display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: var(--blue); margin-left: 6px; vertical-align: 2px; }
  .tabs.pill button.on { background: var(--text); color: #fff; box-shadow: var(--shadow-sm); }
  .tabs.line button { border-radius: 0; padding: 10px 12px; border-bottom: 2.5px solid transparent; }
  .tabs.line button:hover { background: none; }
  .tabs.line button.on { color: var(--text); border-bottom-color: var(--blue); }
  @media (max-width: 640px) { .nav-in { padding: 10px 16px; flex-wrap: wrap; } .tabs { order: 3; flex-basis: 100%; } }

  #empty { text-align: center; padding: 80px 24px; }
  #empty .sheet { max-width: 520px; margin: 0 auto; padding: 56px 32px; border-style: dashed; border-width: 2px; border-color: var(--border); }
  #empty h2 { font-size: 26px; font-weight: 700; margin-bottom: 6px; }
`;
document.head.insertAdjacentHTML('beforeend', `<style>${NAV_CSS}</style>`);

const EMPTY_HTML = `
  <section id="empty" hidden>
    <div class="sheet card">
      <h2></h2>
      <div class="sub">Пустой лист — раздел проработаем отдельно</div>
      <div class="sub extra-note" style="color:var(--blue);margin-top:12px">● Предложенный раздел — можно убрать</div>
    </div>
  </section>`;
