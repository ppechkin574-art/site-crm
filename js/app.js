// Точка входа: маршрутизация по hash (работает на GitHub Pages без настроек сервера)
//   #/            — выбор филиала
//   #/b/:id       — обзор филиала
//   #/b/:id/:sec  — раздел филиала
import * as store from './store.js';
import { renderBranches } from './views/branches.js';
import { renderBranch, mountBranch, mountTasksCard } from './views/branch.js';
import { openTasks } from './views/tasks.js';
import { openSheet, closeSheet } from './sheet.js';
import { esc } from './ui.js';
import { initTooltips, hide as hideTip } from './tooltip.js';

const app = document.getElementById('app');
let lastRoute = '';
let cleanup = () => {};
let scrollToTasks = false;

function route() {
  hideTip();
  cleanup(); cleanup = () => {};
  const [, kind, id, sec] = location.hash.replace(/^#/, '').split('/');
  const key = `${kind}/${id}`;
  if (kind === 'b') {
    const b = store.branch(id);
    if (!b) { location.replace('#/'); return; }
    app.innerHTML = renderBranch(b, sec);
    cleanup = mountBranch(b, app, key !== lastRoute);
    mountTasksCard(b, app, ({ added }) => {
      route();
      if (added) app.querySelector('#tasks input[name=title]')?.focus({ preventScroll: true });
    });
    if (scrollToTasks) { scrollToTasks = false; requestAnimationFrame(() => app.querySelector('#tasks')?.scrollIntoView({ behavior: 'smooth', block: 'start' })); }
    document.title = `${b.name} — CRM`;
    // Прокрутить активную вкладку в видимую область (на телефоне вкладки листаются)
    app.querySelector('.tab.on')?.scrollIntoView({ inline: 'center', block: 'nearest' });
  } else {
    app.innerHTML = renderBranches();
    document.title = 'Филиалы — CRM';
    app.querySelector('#dataBtn')?.addEventListener('click', openDataMenu);
  }
  if (key !== lastRoute) window.scrollTo(0, 0);
  lastRoute = key;
}

// Кнопки задач есть на обеих страницах — ловим клики делегированием
app.addEventListener('click', e => {
  // В навбаре филиала значок задач ведёт к карточке задач в «Обзоре»
  const go = e.target.closest('[data-goto-tasks]');
  if (go) {
    const card = app.querySelector('#tasks');
    if (card) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    else { scrollToTasks = true; location.hash = `#/b/${go.dataset.gotoTasks}`; }
    return;
  }
  const btn = e.target.closest('[data-tasks]');
  if (!btn) return;
  e.preventDefault();
  openTasks(btn.dataset.tasks, route);
});

function openDataMenu() {
  openSheet('Данные', `
    <p class="sub">Сейчас данные хранятся в этом браузере. Выгрузите файл, чтобы перенести их на другое устройство или сделать резервную копию.</p>
    <div class="stack">
      <button class="btn primary full" id="exp">Скачать данные (JSON)</button>
      <label class="btn ghost full">Загрузить из файла<input type="file" accept="application/json,.json" id="imp" hidden></label>
      <button class="btn danger full" id="reset">Сбросить к демо-данным</button>
    </div>
    <p class="err" id="err" role="alert"></p>`, body => {
    body.querySelector('#exp').onclick = () => store.exportJSON();
    body.querySelector('#imp').onchange = async e => {
      const f = e.target.files[0];
      if (!f) return;
      try { await store.importJSON(f); closeSheet(); route(); }
      catch (err) { body.querySelector('#err').textContent = 'Ошибка импорта: ' + err.message; }
    };
    body.querySelector('#reset').onclick = async () => {
      if (!confirm('Все изменения в этом браузере будут удалены. Продолжить?')) return;
      await store.resetToSeed(); closeSheet(); route();
    };
  });
}

(async () => {
  try {
    initTooltips();
    await store.loadState();
    window.addEventListener('hashchange', route);
    route();
  } catch (err) {
    app.innerHTML = `<main class="wrap"><div class="card empty-sheet"><h1 class="h2">Не удалось загрузить данные</h1><p class="sub">${esc(err.message)}</p></div></main>`;
  }
})();
