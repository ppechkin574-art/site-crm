// Хранилище данных. Сейчас: демо-данные из data/seed.json + правки в localStorage этого браузера.
// Импорт/экспорт JSON позволяет переносить данные. Позже заменим на общую базу.
import { PLAN_RED_BELOW } from './config.js';

const KEY = 'crm:v1';
let state = null;
let seedVersion = null;

export async function loadState() {
  const seed = await fetchSeed();
  seedVersion = seed.version;
  try {
    const raw = localStorage.getItem(KEY);
    const saved = raw && JSON.parse(raw);
    if (saved && saved.version === seed.version) { state = saved; return state; }
    // Демо-данные обновились (новая version в seed.json): филиалы берём новые,
    // а задачи, созданные в браузере, сохраняем — для тех филиалов, что остались
    if (saved && Array.isArray(saved.tasks)) {
      const ids = new Set(seed.branches.map(b => b.id));
      state = { ...seed, tasks: saved.tasks.filter(t => ids.has(t.branchId)) };
      save();
      return state;
    }
  } catch { /* приватный режим или битые данные — берём демо */ }
  state = seed;
  return state;
}

async function fetchSeed() {
  const res = await fetch('data/seed.json', { cache: 'no-cache' });
  if (!res.ok) throw new Error('Не удалось загрузить data/seed.json');
  return res.json();
}

function save() {
  state.updatedAt = new Date().toISOString();
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* нет доступа к хранилищу */ }
}

export const branches = () => state.branches;
export const branch = (id) => state.branches.find(b => b.id === id);

export const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
export const isOverdue = (t) => !t.done && t.due && t.due < today();

export const tasksOf = (branchId, section) =>
  state.tasks.filter(t => t.branchId === branchId && (!section || t.section === section));

export function taskStats(branchId, section) {
  const open = tasksOf(branchId, section).filter(t => !t.done);
  return { open: open.length, overdue: open.filter(isOverdue).length };
}

export const planPct = (b) => Math.round(b.metrics.revenue / b.metrics.revenuePlan * 100);

// Только два статуса: зелёный (g) и красный (r)
export function branchStatus(b) {
  const { overdue } = taskStats(b.id);
  return overdue > 0 || planPct(b) < PLAN_RED_BELOW || b.alerts.length > 0 ? 'r' : 'g';
}

export function addTask(branchId, { title, section, due }) {
  state.tasks.push({ id: 't' + Date.now().toString(36), branchId, title, section, due: due || null, done: false });
  save();
}
export function toggleTask(id) {
  const t = state.tasks.find(x => x.id === id);
  if (t) { t.done = !t.done; save(); }
}
export function deleteTask(id) {
  state.tasks = state.tasks.filter(x => x.id !== id);
  save();
}

export function exportJSON() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `crm-${today()}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export async function importJSON(file) {
  const data = JSON.parse(await file.text());
  if (!Array.isArray(data.branches) || !Array.isArray(data.tasks)) throw new Error('Файл не похож на выгрузку CRM');
  data.version = seedVersion; // импортированные данные не должны затираться демо-данными
  state = data;
  save();
}

export async function resetToSeed() {
  try { localStorage.removeItem(KEY); } catch {}
  state = await fetchSeed();
}
