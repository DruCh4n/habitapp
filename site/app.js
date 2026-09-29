'use strict';

/* =========================================================
   HabitApp — a small offline-first habit tracker.
   All data lives in localStorage under STORE_KEY.
   ========================================================= */

const STORE_KEY = 'habitapp.v1';
const DAY = 86400000;
const COLORS = ['#a8d1f0', '#99d5c9', '#f7d49b', '#f4a7b0', '#c9b3e6', '#aab4de', '#e9a0b8', '#f5b09a', '#b5dcb0', '#a9b8bf', '#c2b0a8', '#f2e394'];
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DOW1 = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MILESTONES = [1, 3, 7, 14, 30, 60, 90, 180, 365, 730, 1095, 1825, 3650].map(d => d * DAY);
const TIME_UNIT = /^(m|min|mins|minutes?|h|hr|hrs|hours?)$/i;
const HOUR_UNIT = /^(h|hr|hrs|hours?)$/i;

const TEMPLATES = {
  build: [
    { name: 'Drink Water', goal: 8, unit: 'cups', step: 1, color: '#a8d1f0' },
    { name: 'Steps', goal: 10000, unit: 'steps', step: 1000, color: '#99d5c9' },
    { name: 'Wake Up Early', goal: 1, unit: 'time', step: 1, color: '#f7d49b' },
    { name: 'Read', goal: 30, unit: 'min', step: 5, color: '#c9b3e6' },
    { name: 'Work Out', goal: 30, unit: 'min', step: 5, color: '#f4a7b0' },
    { name: 'Meditate', goal: 10, unit: 'min', step: 5, color: '#aab4de' },
    { name: 'Stretch', goal: 2, unit: 'times', step: 1, color: '#e9a0b8' },
    { name: 'Journal', goal: 1, unit: 'time', step: 1, color: '#b5dcb0' },
  ],
  quit: [
    { name: 'Quit Smoking', color: '#a9b8bf' },
    { name: 'Quit Drinking', color: '#e9a0b8' },
    { name: 'Quit Vaping', color: '#99d5c9' },
    { name: 'Limit Caffeine', color: '#c2b0a8' },
    { name: 'Limit Fast Food', color: '#f4a7b0' },
    { name: 'Limit Social Media', color: '#aab4de' },
  ],
};

/* ---------- Icons ---------- */
const ICONS = {
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  chart: '<rect x="3" y="3" width="18" height="18" rx="3" fill="currentColor" stroke="none"/><path d="M8 17v-4M12 17V8M16 17v-6" stroke="#000" stroke-width="2.6"/>',
  stopwatch: '<circle cx="12" cy="13.5" r="7.5" fill="currentColor" stroke="none"/><path d="M12 13.5V9.5" stroke="#000" stroke-width="2.4"/><path d="M9.5 2.5h5M12 2.5v3M18.5 6l1.5-1.5"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  reset: '<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3"/><path d="M19.5 4.5v4.5H15"/>',
  flame: '<path fill="currentColor" stroke="none" d="M12.2 2c.9 3.4 5.3 5.6 5.3 11.2A5.5 5.5 0 0 1 6.5 13c0-2.7 1.3-4.6 2.8-6 .1 1.9.9 3.2 2.1 3.7C11 8.2 11.3 5 12.2 2z"/>',
  ban: '<circle cx="12" cy="12" r="8"/><path d="M6.6 17.4 17.4 6.6"/>',
  chevDown: '<path d="M7 10l5 5 5-5"/>',
  chevLeft: '<path d="M15 6l-6 6 6 6"/>',
  chevRight: '<path d="M9 6l6 6-6 6"/>',
  chevUp: '<path d="M7 14l5-5 5 5"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  list: '<path d="M4 7h11M4 12h7M4 17h5M12.5 16l2.5 2.5L20 13.5"/>',
  habits: '<rect x="4" y="5" width="16" height="5" rx="1"/><rect x="4" y="14" width="16" height="5" rx="1"/>',
  flag: '<path d="M6 21V4"/><path fill="currentColor" stroke="none" d="M6 3.5h12l-3 4.5 3 4.5H6z"/>',
  note: '<rect x="5" y="4" width="14" height="16" rx="2"/><path d="M8.5 9h7M8.5 12.5h7M8.5 16h4"/>',
  play: '<path fill="currentColor" stroke="none" d="M7 4.5l13 7.5-13 7.5z"/>',
  pause: '<rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none"/><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none"/>',
  stop: '<rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" stroke="none"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
  home: '<path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z"/>',
  gear: '<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
  download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
  upload: '<path d="M12 16V5M7 10l5-5 5 5M5 20h14"/>',
  sparkle: '<path d="M12 3l2 5.5L19.5 10 14 12l-2 6-2-6-5.5-2L10 8.5z"/>',
  install: '<rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M12 7v7M9 11l3 3 3-3"/>',
};
const ic = (name, cls = '') =>
  `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;

/* ---------- Small utils ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-5);
const round2 = n => Math.round(n * 100) / 100;
const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
const fmtNum = n => Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 });
const vibrate = ms => { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) { /* ignore */ } };

const pad = n => String(n).padStart(2, '0');
const dkey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseKey = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const startOfDay = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const startOfWeek = d => addDays(startOfDay(d), -d.getDay());
const todayKey = () => dkey(new Date());
const fmtShort = d => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
const fmtTime = hhmm => { const [h, m] = hhmm.split(':').map(Number); return new Date(2000, 0, 1, h, m).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); };
const fmtDateTime = ms => new Date(ms).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
const toLocalInput = ms => { const d = new Date(ms); return `${dkey(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`; };

function fmtClock(ms) {
  const s = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), sec = s % 60;
  return h ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
}
function fmtQuit(ms) {
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60), sec = s % 60;
  if (d) return [`${d}d, ${h}h`, `${m}m, ${sec}s`];
  if (h) return [`${h}h, ${m}m`, `${sec}s`];
  return [`${m}m, ${sec}s`, ''];
}
function fmtSpan(ms) {
  const d = Math.floor(ms / DAY), h = Math.floor(ms % DAY / 3600000), m = Math.floor(ms % 3600000 / 60000);
  if (d) return `${d}d ${h}h`;
  if (h) return `${h}h ${m}m`;
  return `${m}m`;
}

/* ---------- State ---------- */
function defaultTimer() {
  return { tab: 'countdown', kind: 'countdown', mode: 'idle', startedAt: 0, acc: 0, duration: 25 * 60000, focusId: '', notify: false, events: [] };
}
function defaultState() {
  return { version: 1, habits: [], logs: {}, todos: [], timer: defaultTimer(), collapsed: {} };
}
function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const s = Object.assign(defaultState(), JSON.parse(raw));
      s.timer = Object.assign(defaultTimer(), s.timer);
      return s;
    }
  } catch (e) { console.warn('Could not load saved data', e); }
  return defaultState();
}
let state = load();
function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
  catch (e) { toast('Could not save — storage is full or blocked'); }
}

const ui = { view: 'today', date: todayKey(), today: todayKey(), reportMode: 'year', reportAnchor: todayKey(), installEvt: null };

/* ---------- Habit logic ---------- */
const builds = () => state.habits.filter(h => h.type === 'build');
const quits = () => state.habits.filter(h => h.type === 'quit');
const habitById = id => state.habits.find(h => h.id === id);

function getVal(h, k) { return (state.logs[h.id] || {})[k] || 0; }
function setVal(h, k, v) {
  v = Math.max(0, round2(v));
  const log = state.logs[h.id] || (state.logs[h.id] = {});
  if (v) log[k] = v; else delete log[k];
  if (v && k < h.createdAt) h.createdAt = k;
  save();
}
function periodKeys(h, k) {
  if (h.period !== 'week') return [k];
  const s = startOfWeek(parseKey(k));
  return Array.from({ length: 7 }, (_, i) => dkey(addDays(s, i)));
}
const periodVal = (h, k) => periodKeys(h, k).reduce((a, x) => a + getVal(h, x), 0);
const isMet = (h, k) => periodVal(h, k) >= h.goal;

/* Current streak as of day k. If the current period isn't met yet the streak is still alive. */
function streakOf(h, k) {
  const step = h.period === 'week' ? 7 : 1;
  let d = h.period === 'week' ? startOfWeek(parseKey(k)) : parseKey(k);
  const created = h.period === 'week' ? startOfWeek(parseKey(h.createdAt)) : parseKey(h.createdAt);
  if (!isMet(h, dkey(d))) d = addDays(d, -step);
  let n = 0;
  while (d >= created && n < 5000 && isMet(h, dkey(d))) { n++; d = addDays(d, -step); }
  return n;
}
function bestStreak(h) {
  const step = h.period === 'week' ? 7 : 1;
  let d = h.period === 'week' ? startOfWeek(parseKey(h.createdAt)) : parseKey(h.createdAt);
  const end = new Date();
  let best = 0, cur = 0;
  while (d <= end) {
    if (isMet(h, dkey(d))) { cur++; best = Math.max(best, cur); } else cur = 0;
    d = addDays(d, step);
  }
  return best;
}
function goalText(h) {
  if (h.type === 'quit') return 'Quit habit';
  if (h.goal === 1 && h.period !== 'week' && /^times?$/i.test(h.unit)) return 'Every day';
  return `${fmtNum(h.goal)} ${h.unit} per ${h.period === 'week' ? 'week' : 'day'}`;
}

/* Quit habits */
const quitElapsed = (h, now = Date.now()) => Math.max(0, now - h.startedAt);
function quitPct(ms) {
  const next = MILESTONES.find(m => ms < m);
  return next ? ms / next * 100 : 100;
}
function quitBest(h) { return Math.max(h.bestMs || 0, quitElapsed(h)); }

/* Day status for reports: met | part | miss | fut | na */
function dayState(h, k, t, relapseDays) {
  if (k > t) return 'fut';
  if (k < h.createdAt) return 'na';
  if (h.type === 'quit') {
    if (k < dkey(new Date(h.startedAt)) && !relapseDays.size) return 'na';
    return relapseDays.has(k) ? 'miss' : 'met';
  }
  const v = getVal(h, k);
  if (h.period === 'week') return v ? (isMet(h, k) ? 'met' : 'part') : 'miss';
  return v >= h.goal ? 'met' : v > 0 ? 'part' : 'miss';
}
const relapseDaysOf = h => new Set((h.relapses || []).map(r => dkey(new Date(r.at))));

function completionPct(h, s, e) {
  const t = todayKey(), rd = relapseDaysOf(h);
  let met = 0, total = 0;
  if (h.type === 'build' && h.period === 'week') {
    for (let d = startOfWeek(s); d <= e; d = addDays(d, 7)) {
      const k = dkey(d), end = dkey(addDays(d, 6));
      if (k > t || end < h.createdAt) continue;
      const ok = isMet(h, k);
      if (end >= t && !ok) continue; // current week still in progress
      total++; if (ok) met++;
    }
  } else {
    for (let d = new Date(s); d <= e; d = addDays(d, 1)) {
      const k = dkey(d), st = dayState(h, k, t, rd);
      if (st === 'fut' || st === 'na') continue;
      if (k === t && st !== 'met') continue; // today still in progress
      total++; if (st === 'met') met++;
    }
  }
  return total ? Math.round(met / total * 100) : null;
}

/* To-dos */
function todosFor(k) {
  const t = todayKey();
  return state.todos.filter(td => {
    if (td.done) return td.doneOn === k;
    if (!td.date) return k === t;
    if (td.date === k) return true;
    return k === t && td.date < t;
  }).sort((a, b) => (a.done - b.done) || `${a.date || ''}${a.time || '99'}`.localeCompare(`${b.date || ''}${b.time || '99'}`));
}

/* ---------- Timer ---------- */
const T = () => state.timer;
const tElapsed = () => T().acc + (T().mode === 'running' ? Date.now() - T().startedAt : 0);
const timerActive = () => T().mode !== 'idle';
function timerEvent(type) { T().events.push({ t: Date.now(), type }); }
function timerStart() {
  const t = T();
  Object.assign(t, { mode: 'running', kind: t.tab, startedAt: Date.now(), acc: 0, events: [] });
  timerEvent('Start');
  if (t.notify) askNotify();
  save(); render();
}
function timerPause() { const t = T(); t.acc = tElapsed(); t.mode = 'paused'; timerEvent('Pause'); save(); render(); }
function timerResume() { const t = T(); t.startedAt = Date.now(); t.mode = 'running'; timerEvent('Resume'); save(); render(); }
function timerStop(finished) {
  const t = T();
  let ms = tElapsed();
  if (t.kind === 'countdown') ms = Math.min(ms, t.duration);
  t.mode = 'idle'; t.acc = 0;
  timerEvent(finished ? 'Done' : 'Stop');
  save();
  const credited = creditFocus(ms);
  if (finished) {
    vibrate([200, 100, 200]);
    beep();
    notify('Countdown complete', credited || `${Math.round(t.duration / 60000)} minute timer finished`);
    toast(credited ? `Time's up! ${credited}` : "Time's up!");
  } else if (credited) toast(credited);
  render();
}
function creditFocus(ms) {
  const h = habitById(T().focusId);
  const min = ms / 60000;
  if (!h || min < 1) return '';
  const add = HOUR_UNIT.test(h.unit) ? round2(min / 60) : Math.round(min);
  const k = todayKey();
  setVal(h, k, getVal(h, k) + add);
  return `Added ${fmtNum(add)} ${h.unit} to ${h.name}`;
}
function askNotify() {
  if (!('Notification' in window)) { toast('Notifications are not supported here'); return; }
  if (Notification.permission === 'default') Notification.requestPermission();
}
function notify(title, body) {
  if (!T().notify || !('Notification' in window) || Notification.permission !== 'granted') return;
  const opts = { body, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png' };
  if (navigator.serviceWorker && navigator.serviceWorker.controller) {
    navigator.serviceWorker.ready.then(r => r.showNotification(title, opts)).catch(() => {});
  } else {
    try { new Notification(title, opts); } catch (e) { /* ignore */ }
  }
}
function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, .35, .7].forEach(off => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.value = 880; o.connect(g); g.connect(ctx.destination);
      g.gain.setValueAtTime(.001, ctx.currentTime + off);
      g.gain.exponentialRampToValueAtTime(.3, ctx.currentTime + off + .02);
      g.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + off + .25);
      o.start(ctx.currentTime + off); o.stop(ctx.currentTime + off + .3);
    });
  } catch (e) { /* ignore */ }
}

/* =========================================================
   Rendering
   ========================================================= */
function dayTitle(k) {
  const t = todayKey();
  if (k === t) return 'Today';
  if (k === dkey(addDays(new Date(), -1))) return 'Yesterday';
  if (k === dkey(addDays(new Date(), 1))) return 'Tomorrow';
  return parseKey(k).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

function weekStrip() {
  const s = startOfWeek(parseKey(ui.date)), t = todayKey();
  let out = '';
  for (let i = 0; i < 7; i++) {
    const d = addDays(s, i), k = dkey(d);
    out += `<button class="day${k === ui.date ? ' sel' : ''}${k === t ? ' today' : ''}${k > t ? ' future' : ''}" data-action="pick-day" data-date="${k}" aria-label="${d.toDateString()}"><span>${DOW[i]}</span><b>${d.getDate()}</b></button>`;
  }
  return `<nav class="week" id="week">${out}</nav>`;
}

function headerMain(title, withWeek = true) {
  return `<header class="top">
    <div class="bar">
      <div class="bar-l">
        <button class="sq" data-action="drawer" aria-label="Menu">${ic('menu')}</button>
        <button class="icbtn" data-action="view" data-view="reports" aria-label="Reports">${ic('chart')}</button>
      </div>
      <button class="title" data-action="go-today">${esc(title)}</button>
      <div class="bar-r">
        <button class="icbtn${timerActive() ? ' live' : ''}" data-action="view" data-view="timer" aria-label="Timer">${ic('stopwatch')}</button>
      </div>
    </div>
    ${withWeek ? weekStrip() : ''}
  </header>`;
}

function headerSimple(title, left = 'close', right = '') {
  return `<header class="top">
    <div class="bar">
      <div class="bar-l"><button class="icbtn" data-action="view" data-view="today" aria-label="Back">${ic(left)}</button></div>
      <div class="title">${esc(title)}</div>
      <div class="bar-r">${right}</div>
    </div>`;
}

function ringSvg(r) {
  const C = 94.25;
  return `<svg class="ringsvg" viewBox="0 0 38 38" aria-hidden="true"><circle cx="19" cy="19" r="15" stroke="#444" stroke-width="2.5" fill="none"/><circle cx="19" cy="19" r="15" stroke="var(--accent)" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-dasharray="${(clamp(r, 0, 1) * C).toFixed(2)} ${C}" transform="rotate(-90 19 19)"/></svg>`;
}

function section(id, title, icon, count, ratio, body) {
  const collapsed = !!state.collapsed[id];
  return `<section class="sec${collapsed ? ' collapsed' : ''}">
    <div class="sec-h" data-action="toggle-sec" data-sec="${id}" role="button" aria-expanded="${!collapsed}">
      ${ic(icon)}<span class="sec-t">${title}</span><span class="sec-n">${count}</span>
      <span class="ring">${ringSvg(ratio)}${ic('chevDown', 'chev')}</span>
    </div>
    <div class="sec-b">${body}</div>
  </section>`;
}

function habitRow(h, k) {
  const v = periodVal(h, k);
  const pct = clamp(v / h.goal * 100, 0, 100);
  const done = v >= h.goal;
  const streak = streakOf(h, k);
  const isCheck = h.goal === 1 && h.step === 1;
  const icon = done ? 'check' : isCheck ? 'check' : 'plus';
  return `<div class="hrow${done ? ' done' : ''}" style="--c:${h.color}" data-action="open-habit" data-id="${h.id}">
    <div class="hfill" style="width:${done ? 100 : pct}%"></div>
    <span class="pill" style="background:${h.color}">${esc(h.name)}</span>
    <span class="badge" title="Streak">${streak}${ic('flame', done ? 'lit' : '')}</span>
    <span class="hval">${fmtNum(v)} / ${fmtNum(h.goal)} ${esc(h.unit)}${h.period === 'week' ? '<small>this week</small>' : ''}</span>
    <button class="hbtn" style="--p:${pct.toFixed(1)}" data-action="inc" data-id="${h.id}" aria-label="Log ${esc(h.name)}"><span>${ic(icon)}</span></button>
  </div>`;
}

function quitRow(h) {
  const ms = quitElapsed(h);
  const [a, b] = fmtQuit(ms);
  return `<div class="hrow quit" style="--c:${h.color}" data-action="open-quit" data-id="${h.id}">
    <div class="hfill" data-qfill="${h.id}" style="width:${quitPct(ms).toFixed(2)}%"></div>
    <span class="pill" style="background:${h.color}">${esc(h.name)}</span>
    <span class="badge only">${ic('ban')}</span>
    <span class="hval" data-qtime="${h.id}">${a}${b ? '<br>' + b : ''}</span>
    <button class="hbtn" data-action="relapse" data-id="${h.id}" aria-label="Reset ${esc(h.name)}"><span>${ic('reset')}</span></button>
  </div>`;
}

function todoRow(td) {
  const t = todayKey();
  let when = '';
  if (td.time) when = fmtTime(td.time);
  else if (td.date === t) when = 'Today';
  else if (td.date && td.date > t) when = fmtShort(parseKey(td.date));
  if (!td.done && td.date && td.date < t) when = `<span class="late">${td.time ? fmtTime(td.time) + ' · ' : ''}${fmtShort(parseKey(td.date))}</span>`;
  const icons = (td.note ? ic('note') : '') + (td.flag ? `<span style="color:${td.color}">${ic('flag')}</span>` : '');
  return `<div class="todo${td.done ? ' done' : ''}" data-action="edit-todo" data-id="${td.id}">
    <span class="ticon" style="background:${td.color}">${ic('list')}</span>
    <span class="ttitle">${esc(td.title)}</span>
    <span class="tmeta">${when}${icons ? `<span class="ico">${icons}</span>` : ''}</span>
    <button class="tcheck" data-action="todo-toggle" data-id="${td.id}" aria-label="${td.done ? 'Mark not done' : 'Mark done'}">${ic('check')}</button>
  </div>`;
}

function emptyState() {
  return `<div class="empty">
    <h2>Start building better habits</h2>
    <p>Track counters like water or steps, run timers for habits you're quitting, and keep a to-do list — all saved on this device.</p>
    <div class="btns">
      <button class="btn primary" data-action="add-menu">${ic('plus')} Add your first habit</button>
      <button class="btn" data-action="load-sample">${ic('sparkle')} Try with sample data</button>
    </div>
  </div>`;
}

const fab = () => `<button class="fab" data-action="add-menu" aria-label="Add">${ic('plus')}</button>`;

function viewToday() {
  const k = ui.date;
  let html = headerMain(dayTitle(k)) + '<main>';
  if (!state.habits.length && !state.todos.length) return html + emptyState() + '</main>';

  const todos = todosFor(k);
  if (todos.length) {
    const open = todos.filter(t => !t.done).length;
    html += section('todo', 'To-Do List', 'list', open, (todos.length - open) / todos.length, todos.map(todoRow).join(''));
  }
  const daily = builds().filter(h => h.period !== 'week');
  if (daily.length) {
    const met = daily.filter(h => isMet(h, k)).length;
    html += section('daily', 'Daily Habits', 'habits', daily.length, met / daily.length, daily.map(h => habitRow(h, k)).join(''));
  }
  const weekly = builds().filter(h => h.period === 'week');
  if (weekly.length) {
    const met = weekly.filter(h => isMet(h, k)).length;
    html += section('weekly', 'Weekly Habits', 'habits', weekly.length, met / weekly.length, weekly.map(h => habitRow(h, k)).join(''));
  }
  const q = quits();
  if (q.length) html += section('quit', 'Quit Habits', 'ban', q.length, 1, q.map(quitRow).join(''));
  return html + '</main>' + fab();
}

function viewQuit() {
  const q = quits();
  let html = headerMain('Quit Habits', false) + '<main class="sec"><div class="sec-b" style="padding-top:8px">';
  html += q.length ? q.map(quitRow).join('') : `<div class="empty"><h2>No quit habits yet</h2><p>Track how long it's been since you last smoked, drank, vaped — anything.</p><div class="btns"><button class="btn primary" data-action="new-habit" data-type="quit">${ic('plus')} Add a quit habit</button></div></div>`;
  return html + '</div></main>' + fab();
}

/* Reports */
function reportRange() {
  const a = parseKey(ui.reportAnchor);
  if (ui.reportMode === 'week') { const s = startOfWeek(a); return { s, e: addDays(s, 6), label: `${fmtShort(s)} – ${fmtShort(addDays(s, 6))}` }; }
  if (ui.reportMode === 'month') { const s = new Date(a.getFullYear(), a.getMonth(), 1); return { s, e: new Date(a.getFullYear(), a.getMonth() + 1, 0), label: s.toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) }; }
  const s = new Date(a.getFullYear(), 0, 1);
  return { s, e: new Date(a.getFullYear(), 11, 31), label: String(a.getFullYear()) };
}

function reportCard(h, s, e, pct) {
  const t = todayKey(), rd = relapseDaysOf(h), mode = ui.reportMode;
  let cells = '';
  const lead = mode === 'week' ? 0 : s.getDay();
  for (let i = 0; i < lead; i++) cells += '<i class="c c-blank"></i>';
  for (let d = new Date(s), i = 0; d <= e; d = addDays(d, 1), i++) {
    const k = dkey(d), st = dayState(h, k, t, rd);
    if (mode === 'year') cells += `<i class="c c-${st}"></i>`;
    else if (mode === 'month') cells += `<i class="c c-${st}">${d.getDate()}</i>`;
    else {
      const val = h.type === 'quit' ? (st === 'met' ? '✓' : st === 'miss' ? '✕' : '') : (st === 'fut' || st === 'na' ? '' : fmtNum(getVal(h, k)));
      cells += `<div class="c c-${st}"><small>${DOW1[d.getDay()]}</small><b>${val}</b></div>`;
    }
  }
  return `<div class="rcard" style="--c:${h.color}" data-action="${h.type === 'quit' ? 'open-quit' : 'open-habit'}" data-id="${h.id}">
    <div class="rhead"><span class="dot">${ic(h.type === 'quit' ? 'ban' : 'check')}</span><span class="nm">${esc(h.name)} - ${esc(goalText(h))}</span><span class="pct">${pct == null ? '–' : pct + '%'}</span></div>
    <div class="grid ${mode}">${cells}</div>
  </div>`;
}

function viewReports() {
  const { s, e, label } = reportRange();
  const modes = [['week', 'Week'], ['month', 'Month'], ['year', 'Year']];
  let html = headerSimple('Habit Reports') + `
    <div class="rtools">
      <div class="seg">${modes.map(([m, l]) => `<button class="${ui.reportMode === m ? 'on' : ''}" data-action="rmode" data-mode="${m}">${l}</button>`).join('')}</div>
      <div class="rnav">
        <div class="lab">${esc(label)}</div>
        <button data-action="rnav" data-dir="-1" aria-label="Previous">${ic('chevLeft')}</button>
        <button class="today" data-action="rnav" data-dir="0">Today</button>
        <button data-action="rnav" data-dir="1" aria-label="Next">${ic('chevRight')}</button>
      </div>
    </div></header><main class="rlist">`;
  const rows = state.habits.map(h => ({ h, pct: completionPct(h, s, e) }))
    .sort((a, b) => (b.pct ?? -1) - (a.pct ?? -1));
  if (!rows.length) html += '<div class="empty"><h2>No data yet</h2><p>Add a habit and start logging to see your reports.</p></div>';
  html += rows.map(r => reportCard(r.h, s, e, r.pct)).join('');
  if (rows.length) html += `<div class="legend"><span><i class="c-met"></i>Goal met</span><span><i class="c-part"></i>Partial</span><span><i class="c-miss"></i>Missed / slipped</span></div>`;
  return html + '</main>';
}

/* Timer */
function timerFace() {
  const t = T(), ms = tElapsed();
  const kind = timerActive() ? t.kind : t.tab;
  if (kind === 'countdown') {
    const left = Math.max(0, t.duration - ms);
    return { text: fmtClock(Math.ceil(left / 1000) * 1000), frac: left / t.duration, sub: `${ic('stopwatch')} ${Math.round(t.duration / 60000)}m` };
  }
  const h = habitById(t.focusId);
  return { text: fmtClock(Math.floor(ms / 1000) * 1000), frac: (ms % 60000) / 60000, sub: h ? esc(h.name) : 'Stopwatch' };
}

function viewTimer() {
  const t = T(), active = timerActive(), tab = active ? t.kind : t.tab;
  const focusable = builds().filter(h => TIME_UNIT.test(h.unit));
  const f = timerFace();
  const R = 46, C = 2 * Math.PI * R;
  let btns;
  if (!active) btns = `<button class="btn light" data-action="t-start" style="max-width:260px;margin:0 auto">${ic('play')}<span>Start</span></button>`;
  else btns = `<button class="btn" data-action="t-stop">${ic('stop')}<span>Stop</span></button>` +
    (t.mode === 'running' ? `<button class="btn light" data-action="t-pause">${ic('pause')}<span>Pause</span></button>`
      : `<button class="btn light" data-action="t-resume">${ic('play')}<span>Resume</span></button>`);
  const presets = [5, 10, 15, 20, 25, 30, 45, 60, 90];
  const mins = Math.round(t.duration / 60000);
  return `<header class="top ttop">
      <div class="bar">
        <div class="bar-l"><button class="icbtn" data-action="view" data-view="today" aria-label="Back">${ic('chevLeft')}</button></div>
        <div class="title">Timer</div><div class="bar-r"></div>
      </div>
      <div class="tabs">
        <button class="${tab === 'stopwatch' ? 'on' : ''}" data-action="t-tab" data-tab="stopwatch">Stopwatch</button>
        <button class="${tab === 'countdown' ? 'on' : ''}" data-action="t-tab" data-tab="countdown">Countdown</button>
      </div>
    </header>
    <main>
      ${tab === 'countdown' ? `<div class="trow"><span class="lab">Completion Notification</span>
        <label class="switch"><input type="checkbox" id="t-notify" ${t.notify ? 'checked' : ''}><span></span></label></div>` : ''}
      <div class="trow"><span class="lab">Focus</span>
        <select id="t-focus" ${active ? 'disabled' : ''} aria-label="Focus habit">
          <option value="">None</option>
          ${focusable.map(h => `<option value="${h.id}" ${h.id === t.focusId ? 'selected' : ''}>${esc(h.name)}</option>`).join('')}
        </select></div>
      <div class="tstage">
        <div class="dial">
          <svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="${R}" fill="#000" stroke="#333" stroke-width="2"/>
            <circle id="t-ring" cx="50" cy="50" r="${R}" fill="none" stroke="var(--accent)" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="${C.toFixed(2)}" stroke-dashoffset="${(C * (1 - f.frac)).toFixed(2)}"/></svg>
          <div class="face"><b id="t-time">${f.text}</b><span>${f.sub}</span></div>
        </div>
        ${tab === 'countdown' && !active ? `<div class="adj">
          <button class="btn" data-action="t-adj" data-d="-5" aria-label="Minus 5 minutes">−5</button>
          <div class="chips">${presets.map(p => `<button class="chip${p === mins ? ' on' : ''}" data-action="t-set" data-m="${p}">${p}m</button>`).join('')}</div>
          <button class="btn" data-action="t-adj" data-d="5" aria-label="Plus 5 minutes">+5</button>
        </div>` : ''}
        <div class="tbtns">${btns}</div>
        ${!focusable.length ? `<p style="color:var(--muted);font-size:14px;text-align:center;margin:0">Tip: habits measured in <b>min</b> or <b>hours</b> can be picked as a Focus — timed sessions are added to them automatically.</p>` : ''}
      </div>
      <div class="tlog">${t.events.map(ev => `<div><span>${esc(fmtDateTime(ev.t))}</span><b>${ev.type} ${ic(ev.type === 'Pause' ? 'pause' : ev.type === 'Stop' || ev.type === 'Done' ? 'stop' : 'play')}</b></div>`).join('')}</div>
    </main>`;
}

/* Settings */
function viewSettings() {
  const list = state.habits.map((h, i) => `<div class="mrow">
      <span class="dot" style="background:${h.color}"></span>
      <span class="nm">${esc(h.name)} <span class="tag">· ${esc(goalText(h))}</span></span>
      <button data-action="move" data-id="${h.id}" data-d="-1" ${i === 0 ? 'disabled' : ''} aria-label="Move up">${ic('chevUp')}</button>
      <button data-action="move" data-id="${h.id}" data-d="1" ${i === state.habits.length - 1 ? 'disabled' : ''} aria-label="Move down">${ic('chevDown')}</button>
      <button data-action="edit-habit" data-id="${h.id}" aria-label="Edit">${ic('edit')}</button>
    </div>`).join('') || '<div class="card-text">No habits yet.</div>';
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  return headerSimple('Settings', 'chevLeft') + `</header><main class="plain">
    <h3>Habits</h3>${list}
    <div class="stack" style="margin-top:8px">
      <button class="btn block" data-action="new-habit" data-type="build">${ic('plus')} New habit</button>
      <button class="btn block" data-action="new-habit" data-type="quit">${ic('ban')} New quit habit</button>
    </div>
    <h3>Install</h3>
    <div class="card-text">${standalone ? 'Installed — you are running HabitApp from your home screen. 🎉' :
      '<b>iPhone / iPad:</b> open this page in Safari, tap the <b>Share</b> button, then <b>Add to Home Screen</b>.<br><b>Android:</b> tap the browser menu (⋮) and choose <b>Install app</b> or <b>Add to Home screen</b>.'}</div>
    ${ui.installEvt ? `<button class="btn primary block" style="margin-top:8px" data-action="install">${ic('install')} Install app</button>` : ''}
    <h3>Data</h3>
    <div class="stack">
      <button class="btn block" data-action="export">${ic('download')} Export backup (JSON)</button>
      <button class="btn block" data-action="import">${ic('upload')} Import backup</button>
      <button class="btn block" data-action="load-sample">${ic('sparkle')} Load sample data</button>
      <button class="btn block danger" data-action="wipe">${ic('trash')} Erase all data</button>
    </div>
    <p style="color:var(--dim);font-size:13px;text-align:center;margin:24px 0">Your data is stored only in this browser (localStorage). Export a backup before clearing site data or switching devices.</p>
  </main>`;
}

const VIEWS = { today: viewToday, quit: viewQuit, reports: viewReports, timer: viewTimer, settings: viewSettings };

function render() {
  const app = $('#app');
  app.innerHTML = VIEWS[ui.view]();
  const f = $('#t-focus'); if (f) f.onchange = () => { T().focusId = f.value; save(); render(); };
  const n = $('#t-notify'); if (n) n.onchange = () => { T().notify = n.checked; if (n.checked) askNotify(); save(); };
  renderDrawer();
}

function renderDrawer() {
  const items = [['today', 'home', 'Today'], ['quit', 'ban', 'Quit Habits'], ['reports', 'chart', 'Reports'], ['timer', 'stopwatch', 'Timer'], ['settings', 'gear', 'Settings']];
  $('.drawer-panel').innerHTML = `<div class="brand"><img src="icons/icon-192.png" alt="">HabitApp</div>` +
    items.map(([v, i, l]) => `<button class="${ui.view === v ? 'on' : ''}" data-action="view" data-view="${v}">${ic(i)}${l}</button>`).join('');
}

/* Live updates without a full re-render */
function tick() {
  if (todayKey() !== ui.today) {
    if (ui.date === ui.today) ui.date = todayKey();
    ui.today = todayKey();
    render();
    return;
  }
  const now = Date.now();
  $$('[data-qtime]').forEach(el => {
    const h = habitById(el.dataset.qtime); if (!h) return;
    const [a, b] = fmtQuit(quitElapsed(h, now));
    el.innerHTML = a + (b ? '<br>' + b : '');
  });
  $$('[data-qfill]').forEach(el => {
    const h = habitById(el.dataset.qfill); if (h) el.style.width = quitPct(quitElapsed(h, now)).toFixed(2) + '%';
  });
  const t = T();
  if (t.mode === 'running' && t.kind === 'countdown' && tElapsed() >= t.duration) { timerStop(true); return; }
  if (ui.view === 'timer') {
    const f = timerFace(), time = $('#t-time'), ring = $('#t-ring');
    if (time) time.textContent = f.text;
    if (ring) ring.setAttribute('stroke-dashoffset', (ring.getAttribute('stroke-dasharray') * (1 - f.frac)).toFixed(2));
  }
}

/* =========================================================
   Sheets (bottom modals)
   ========================================================= */
let sheetTick = null;
function openSheet(html, mount) {
  const root = $('#sheet-root');
  root.innerHTML = `<div class="sheet-bg" data-action="close-sheet"></div><div class="sheet" role="dialog" aria-modal="true"><div class="grab"></div>${html}</div>`;
  root.classList.add('open');
  document.body.classList.add('noscroll');
  if (mount) mount($('.sheet', root));
}
function closeSheet() {
  const root = $('#sheet-root');
  root.classList.remove('open'); root.innerHTML = '';
  document.body.classList.remove('noscroll');
  clearInterval(sheetTick); sheetTick = null;
}

function swatchesHtml(sel) {
  return `<div class="swatches">${COLORS.map(c => `<button type="button" class="sw${c === sel ? ' on' : ''}" data-c="${c}" style="background:${c}" aria-label="Color ${c}"></button>`).join('')}</div>`;
}
function bindSwatches(el, onPick) {
  $$('.sw', el).forEach(b => b.onclick = () => { $$('.sw', el).forEach(x => x.classList.toggle('on', x === b)); onPick(b.dataset.c); });
}

function openAddMenu() {
  openSheet(`<h2>Add</h2>
    <div class="menu-list">
      <button class="btn block" data-new="build">${ic('habits')} New habit</button>
      <button class="btn block" data-new="quit">${ic('ban')} New quit habit</button>
      <button class="btn block" data-new="todo">${ic('list')} New to-do</button>
    </div>
    <h3>Quick start</h3>
    <div class="chips">${TEMPLATES.build.map((t, i) => `<button class="chip tpl" style="background:${t.color}" data-tpl="build:${i}">${esc(t.name)}</button>`).join('')}</div>
    <div class="chips" style="margin-top:8px">${TEMPLATES.quit.map((t, i) => `<button class="chip tpl" style="background:${t.color}" data-tpl="quit:${i}">${esc(t.name)}</button>`).join('')}</div>`,
  el => {
    $$('[data-new]', el).forEach(b => b.onclick = () => b.dataset.new === 'todo' ? editTodo(null) : editHabit(null, b.dataset.new));
    $$('[data-tpl]', el).forEach(b => b.onclick = () => {
      const [type, i] = b.dataset.tpl.split(':');
      editHabit(null, type, TEMPLATES[type][i]);
    });
  });
}

function editHabit(h, type, tpl = {}) {
  const isNew = !h;
  const d = h ? { ...h } : {
    type, name: tpl.name || '', color: tpl.color || COLORS[state.habits.length % COLORS.length],
    goal: tpl.goal || 1, unit: tpl.unit || 'time', step: tpl.step || 1, period: 'day', startedAt: Date.now(),
  };
  const build = d.type === 'build';
  openSheet(`<h2>${isNew ? (build ? 'New Habit' : 'New Quit Habit') : 'Edit Habit'}</h2>
    <form class="form" id="hf" novalidate>
      <label>Name<input name="name" maxlength="40" value="${esc(d.name)}" placeholder="${build ? 'e.g. Drink Water' : 'e.g. Quit Smoking'}" autocomplete="off" required></label>
      <div class="lbl">Color</div>${swatchesHtml(d.color)}
      ${build ? `
        <div class="row2">
          <label>Daily goal<input name="goal" type="number" inputmode="decimal" min="0" step="any" value="${d.goal}"></label>
          <label>Unit<input name="unit" maxlength="16" value="${esc(d.unit)}" placeholder="cups, min, steps…"></label>
        </div>
        <div class="row2">
          <label>Each tap adds<input name="step" type="number" inputmode="decimal" min="0" step="any" value="${d.step}"></label>
          <label>Goal is per<select name="period"><option value="day"${d.period !== 'week' ? ' selected' : ''}>Day</option><option value="week"${d.period === 'week' ? ' selected' : ''}>Week</option></select></label>
        </div>` : `
        <label>${isNew ? 'Quit since' : 'Current streak started'}<input name="since" type="datetime-local" value="${toLocalInput(d.startedAt)}" max="${toLocalInput(Date.now())}"></label>`}
      <div class="actions">
        ${isNew ? '' : `<button type="button" class="btn danger" id="hdel">${ic('trash')} Delete</button>`}
        <button type="submit" class="btn primary">Save</button>
      </div>
    </form>`, el => {
    const f = $('#hf', el);
    if (build) {
      const goalLabel = () => { f.goal.parentElement.firstChild.textContent = f.period.value === 'week' ? 'Weekly goal' : 'Daily goal'; };
      f.period.onchange = goalLabel; goalLabel();
    }
    bindSwatches(el, c => d.color = c);
    if (isNew && !d.name) setTimeout(() => f.name.focus(), 250);
    f.onsubmit = e => {
      e.preventDefault();
      const name = f.name.value.trim();
      if (!name) { f.name.focus(); toast('Give your habit a name'); return; }
      d.name = name;
      if (build) {
        const goal = parseFloat(f.goal.value), step = parseFloat(f.step.value);
        if (!(goal > 0)) { toast('Goal must be more than 0'); f.goal.focus(); return; }
        d.goal = round2(goal); d.step = step > 0 ? round2(step) : 1;
        d.unit = f.unit.value.trim() || 'times'; d.period = f.period.value;
      } else {
        const since = f.since.value ? new Date(f.since.value).getTime() : Date.now();
        d.startedAt = Math.min(isNaN(since) ? Date.now() : since, Date.now());
      }
      if (isNew) {
        d.id = uid();
        d.createdAt = build ? todayKey() : dkey(new Date(d.startedAt));
        if (!build) { d.relapses = []; d.bestMs = 0; }
        state.habits.push(d);
      } else {
        if (!build && dkey(new Date(d.startedAt)) < d.createdAt) d.createdAt = dkey(new Date(d.startedAt));
        Object.assign(h, d);
      }
      save(); closeSheet(); render();
      toast(isNew ? `Added “${name}”` : 'Saved');
    };
    const del = $('#hdel', el);
    if (del) del.onclick = () => {
      if (!confirm(`Delete “${h.name}” and all its history?`)) return;
      state.habits = state.habits.filter(x => x.id !== h.id);
      delete state.logs[h.id];
      if (T().focusId === h.id) T().focusId = '';
      save(); closeSheet(); render(); toast('Deleted');
    };
  });
}

function openHabit(id) {
  const h = habitById(id); if (!h) return;
  const k = ui.date <= todayKey() ? ui.date : todayKey();
  openSheet(`<h2><span class="pill" style="background:${h.color};display:inline-block;max-width:100%">${esc(h.name)}</span></h2>
    <p class="sub">${esc(dayTitle(k))} · Goal ${esc(goalText(h))}</p>
    <div class="stepper">
      <button class="btn" data-d="-1" aria-label="Decrease">${ic('minus')}</button>
      <input id="hv" type="number" inputmode="decimal" min="0" step="any" aria-label="Value">
      <button class="btn" data-d="1" aria-label="Increase">${ic('plus')}</button>
    </div>
    <p class="sub" id="hwk" style="text-align:center;margin:0 0 10px"></p>
    <div class="actions">
      <button class="btn" id="hclr">Clear</button>
      <button class="btn primary" id="hfull">${ic('check')} Complete</button>
    </div>
    <div class="stats" id="hstats"></div>
    <div class="actions"><button class="btn" id="hedit">${ic('edit')} Edit habit</button><button class="btn" data-action="close-sheet">Done</button></div>`,
  el => {
    const input = $('#hv', el);
    const refresh = () => {
      input.value = getVal(h, k);
      $('#hwk', el).textContent = `${h.period === 'week' ? 'This week' : 'Today\'s total'}: ${fmtNum(periodVal(h, k))} / ${fmtNum(h.goal)} ${h.unit}${h.period !== 'week' ? '' : ''}`;
      const s = new Date(); const pct = completionPct(h, addDays(s, -29), s);
      $('#hstats', el).innerHTML = `<div class="stat"><b>${streakOf(h, todayKey())}</b><span>Current streak</span></div>
        <div class="stat"><b>${bestStreak(h)}</b><span>Best streak</span></div>
        <div class="stat"><b>${pct == null ? '–' : pct + '%'}</b><span>Last 30 days</span></div>`;
    };
    const set = v => { setVal(h, k, v); refresh(); render(); };
    $$('[data-d]', el).forEach(b => b.onclick = () => { vibrate(8); set(getVal(h, k) + h.step * Number(b.dataset.d)); });
    input.onchange = () => set(parseFloat(input.value) || 0);
    $('#hclr', el).onclick = () => set(0);
    $('#hfull', el).onclick = () => { const cur = getVal(h, k); set(cur + Math.max(0, h.goal - periodVal(h, k))); };
    $('#hedit', el).onclick = () => editHabit(h, h.type);
    refresh();
  });
}

function openQuit(id) {
  const h = habitById(id); if (!h) return;
  const rel = (h.relapses || []).slice().reverse();
  openSheet(`<h2><span class="pill" style="background:${h.color};display:inline-block;max-width:100%">${esc(h.name)}</span></h2>
    <p class="sub">Since ${esc(fmtDateTime(h.startedAt))}</p>
    <div class="bigtime" id="qt"></div>
    <p class="sub" id="qnext" style="text-align:center"></p>
    <div class="stats">
      <div class="stat"><b id="qbest"></b><span>Best streak</span></div>
      <div class="stat"><b>${rel.length}</b><span>Resets</span></div>
      <div class="stat"><b>${Math.max(0, Math.floor((Date.now() - parseKey(h.createdAt)) / DAY))}d</b><span>Tracked</span></div>
    </div>
    ${rel.length ? `<h3>Recent resets</h3><ul class="hist">${rel.slice(0, 6).map(r => `<li><span>${esc(fmtDateTime(r.at))}</span><span>after ${fmtSpan(r.streakMs)}</span></li>`).join('')}</ul>` : ''}
    <div class="actions" style="margin-top:16px"><button class="btn" id="qedit">${ic('edit')} Edit</button><button class="btn danger" id="qreset">${ic('reset')} Reset timer</button></div>`,
  el => {
    const upd = () => {
      const ms = quitElapsed(h);
      $('#qt', el).textContent = fmtQuit(ms).filter(Boolean).join(', ');
      $('#qbest', el).textContent = fmtSpan(quitBest(h));
      const next = MILESTONES.find(m => ms < m);
      $('#qnext', el).textContent = next ? `Next milestone: ${next / DAY} day${next === DAY ? '' : 's'} (${Math.floor(quitPct(ms))}%)` : 'All milestones reached!';
    };
    upd(); sheetTick = setInterval(upd, 1000);
    $('#qedit', el).onclick = () => editHabit(h, 'quit');
    $('#qreset', el).onclick = () => { if (relapse(h)) closeSheet(); };
  });
}

function relapse(h) {
  if (!confirm(`Reset the “${h.name}” timer? Your current streak (${fmtSpan(quitElapsed(h))}) will be saved to history.`)) return false;
  const now = Date.now(), ms = quitElapsed(h, now);
  h.bestMs = Math.max(h.bestMs || 0, ms);
  (h.relapses || (h.relapses = [])).push({ at: now, streakMs: ms });
  h.startedAt = now;
  save(); render(); vibrate(20);
  toast('Timer reset — you’ve got this 💪');
  return true;
}

function editTodo(td) {
  const isNew = !td;
  const d = td ? { ...td } : { title: '', date: ui.date >= todayKey() ? ui.date : todayKey(), time: '', color: COLORS[5], flag: false, note: '' };
  openSheet(`<h2>${isNew ? 'New To-Do' : 'Edit To-Do'}</h2>
    <form class="form" id="tf" novalidate>
      <label>Task<input name="title" maxlength="80" value="${esc(d.title)}" placeholder="e.g. Buy groceries" autocomplete="off"></label>
      <div class="row2">
        <label>Date<input name="date" type="date" value="${d.date || ''}"></label>
        <label>Time<input name="time" type="time" value="${d.time || ''}"></label>
      </div>
      <div class="lbl">Color</div>${swatchesHtml(d.color)}
      <label class="check-row"><input type="checkbox" name="flag" ${d.flag ? 'checked' : ''}> Flag as important</label>
      <label>Note<textarea name="note" maxlength="500" placeholder="Optional">${esc(d.note)}</textarea></label>
      <div class="actions">
        ${isNew ? '' : `<button type="button" class="btn danger" id="tdel">${ic('trash')} Delete</button>`}
        <button type="submit" class="btn primary">Save</button>
      </div>
    </form>`, el => {
    const f = $('#tf', el);
    bindSwatches(el, c => d.color = c);
    if (isNew) setTimeout(() => f.title.focus(), 250);
    f.onsubmit = e => {
      e.preventDefault();
      const title = f.title.value.trim();
      if (!title) { toast('Enter a task'); f.title.focus(); return; }
      Object.assign(d, { title, date: f.date.value || null, time: f.time.value || null, flag: f.flag.checked, note: f.note.value.trim() });
      if (isNew) state.todos.push({ id: uid(), done: false, doneOn: null, ...d });
      else Object.assign(td, d);
      save(); closeSheet(); render();
    };
    const del = $('#tdel', el);
    if (del) del.onclick = () => { state.todos = state.todos.filter(x => x.id !== td.id); save(); closeSheet(); render(); toast('Deleted'); };
  });
}

/* =========================================================
   Data: sample, export, import
   ========================================================= */
function loadSample() {
  if ((state.habits.length || state.todos.length) && !confirm('Replace your current data with sample data?')) return;
  const today = startOfDay(new Date()), now = Date.now(), t = todayKey();
  const start = dkey(addDays(today, -260));
  const mk = (name, color, goal, unit, step, period = 'day') => ({ id: uid(), type: 'build', name, color, goal, unit, step, period, createdAt: start });
  const plan = [
    [mk('Drink Water', '#a8d1f0', 8, 'cups', 1), .86, 6, 5],
    [mk('Steps', '#99d5c9', 10000, 'steps', 1000), .8, 6250, 22],
    [mk('Wake Up Early', '#f7d49b', 1, 'time', 1), .74, 1, 9],
    [mk('Stretch', '#c9b3e6', 2, 'times', 1), .74, 1, 4],
    [mk('Study', '#aab4de', 3, 'hours', 0.5), .65, 1.5, 3],
    [mk('Work Out', '#f4a7b0', 30, 'min', 5), .7, 35, 8],
    [mk('Read', '#e9a0b8', 200, 'pages', 10, 'week'), .84, 20, 0],
  ];
  const logs = {};
  plan.forEach(([h, rate, todayVal, streak]) => {
    const log = logs[h.id] = {};
    for (let i = 1; i <= 260; i++) {
      const k = dkey(addDays(today, -i)), r = Math.random();
      if (h.period === 'week') { if (Math.random() < .8) log[k] = Math.round((h.goal / 5.5) * (rate + Math.random() * .5) / h.step) * h.step || h.step; continue; }
      let v = 0;
      if (r < rate) v = h.goal + (Math.random() < .3 ? h.step * Math.ceil(Math.random() * 2) : 0);
      else if (r < rate + .12) v = Math.max(h.step, Math.round(h.goal * Math.random() / h.step) * h.step);
      if (i <= streak && v < h.goal) v = h.goal;
      if (i === streak + 1) v = 0;
      if (v >= h.goal && h.goal === 1) v = 1;
      if (v) log[k] = round2(v);
    }
    log[t] = todayVal;
  });
  const q = (name, color, sinceMs, resets) => {
    const relapses = [];
    let at = sinceMs;
    for (let i = 0; i < resets; i++) {
      const gap = (3 + Math.random() * 20) * DAY;
      relapses.unshift({ at: at, streakMs: gap });
      at -= gap;
    }
    return { id: uid(), type: 'quit', name, color, startedAt: sinceMs, relapses, bestMs: Math.max(0, ...relapses.map(r => r.streakMs)), createdAt: dkey(new Date(at)) };
  };
  const hours = h => h * 3600000;
  const quitHabits = [
    q('Quit Drinking', '#e9a0b8', now - DAY * 35 - hours(2.26), 3),
    q('Quit Smoking', '#a9b8bf', now - DAY * 70 - hours(15.5), 4),
    q('Quit Vaping', '#99d5c9', now - DAY * 8 - hours(3.85), 5),
    q('Limit Caffeine', '#c2b0a8', now - hours(10.72), 12),
  ];
  const todo = (title, color, time, flag, note = '') => ({ id: uid(), title, date: t, time, color, flag, note, done: false, doneOn: null });
  state = {
    ...defaultState(),
    habits: [...plan.map(p => p[0]), ...quitHabits],
    logs,
    todos: [
      todo('Buy groceries for next week', '#f4a7b0', null, true),
      todo('Schedule dentist appointment', '#aab4de', null, false),
      todo('Review monthly budget', '#c9b3e6', '15:00', true, 'Check subscriptions'),
      todo('Reply to urgent emails', '#aab4de', '20:30', false, 'Inbox zero!'),
    ],
    timer: T(),
  };
  save(); closeSheet(); ui.view = 'today'; ui.date = t; render();
  toast('Sample data loaded');
}

function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `habitapp-backup-${todayKey()}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  toast('Backup downloaded');
}

function importData() {
  const input = document.createElement('input');
  input.type = 'file'; input.accept = 'application/json,.json';
  input.onchange = async () => {
    const file = input.files[0]; if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (!data || !Array.isArray(data.habits) || typeof data.logs !== 'object') throw new Error('bad file');
      if (!confirm(`Import ${data.habits.length} habits? This replaces your current data.`)) return;
      state = Object.assign(defaultState(), data);
      state.timer = Object.assign(defaultTimer(), data.timer, { mode: 'idle', acc: 0 });
      state.todos = Array.isArray(state.todos) ? state.todos : [];
      save(); render(); toast('Backup imported');
    } catch (e) { toast('That file is not a valid HabitApp backup'); }
  };
  input.click();
}

/* =========================================================
   Events
   ========================================================= */
let toastTimer;
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg; el.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
}

function setDrawer(open) {
  $('#drawer').classList.toggle('open', open);
  $('#drawer').setAttribute('aria-hidden', String(!open));
}

function go(view) { ui.view = view; setDrawer(false); render(); window.scrollTo(0, 0); }

const ACTIONS = {
  'drawer': () => setDrawer(true),
  'drawer-close': () => setDrawer(false),
  'view': el => go(el.dataset.view),
  'go-today': () => { ui.date = todayKey(); ui.view = 'today'; render(); },
  'pick-day': el => { ui.date = el.dataset.date; render(); },
  'toggle-sec': el => { const id = el.dataset.sec; state.collapsed[id] = !state.collapsed[id]; save(); render(); },
  'inc': el => {
    const h = habitById(el.dataset.id); if (!h) return;
    if (ui.date > todayKey()) { toast("You can't log future days"); return; }
    const k = ui.date, cur = getVal(h, k);
    const isCheck = h.goal === 1 && h.step === 1;
    if (isCheck && periodVal(h, k) >= 1) setVal(h, k, 0);
    else setVal(h, k, cur + h.step);
    vibrate(10);
    render();
    if (periodVal(h, k) >= h.goal && periodVal(h, k) - h.step < h.goal) toast(`🔥 ${h.name} done!`);
  },
  'open-habit': el => openHabit(el.dataset.id),
  'open-quit': el => openQuit(el.dataset.id),
  'relapse': el => { const h = habitById(el.dataset.id); if (h) relapse(h); },
  'todo-toggle': el => {
    const td = state.todos.find(x => x.id === el.dataset.id); if (!td) return;
    td.done = !td.done;
    td.doneOn = td.done ? (ui.date <= todayKey() ? ui.date : todayKey()) : null;
    vibrate(10); save(); render();
  },
  'edit-todo': el => editTodo(state.todos.find(x => x.id === el.dataset.id)),
  'add-menu': () => openAddMenu(),
  'new-habit': el => editHabit(null, el.dataset.type),
  'edit-habit': el => { const h = habitById(el.dataset.id); if (h) editHabit(h, h.type); },
  'move': el => {
    const i = state.habits.findIndex(h => h.id === el.dataset.id), j = i + Number(el.dataset.d);
    if (i < 0 || j < 0 || j >= state.habits.length) return;
    [state.habits[i], state.habits[j]] = [state.habits[j], state.habits[i]];
    save(); render();
  },
  'close-sheet': () => closeSheet(),
  'load-sample': () => loadSample(),
  'export': () => exportData(),
  'import': () => importData(),
  'wipe': () => {
    if (!confirm('Erase ALL habits, history and to-dos from this device? This cannot be undone.')) return;
    state = defaultState(); save(); ui.view = 'today'; render(); toast('All data erased');
  },
  'install': async () => { const e = ui.installEvt; if (!e) return; e.prompt(); await e.userChoice; ui.installEvt = null; render(); },
  'rmode': el => { ui.reportMode = el.dataset.mode; render(); },
  'rnav': el => {
    const dir = Number(el.dataset.dir);
    if (!dir) ui.reportAnchor = todayKey();
    else {
      const a = parseKey(ui.reportAnchor);
      if (ui.reportMode === 'week') ui.reportAnchor = dkey(addDays(a, dir * 7));
      else if (ui.reportMode === 'month') ui.reportAnchor = dkey(new Date(a.getFullYear(), a.getMonth() + dir, 1));
      else ui.reportAnchor = dkey(new Date(a.getFullYear() + dir, 0, 1));
    }
    render();
  },
  't-tab': el => {
    if (timerActive()) { toast('Stop the current timer first'); return; }
    T().tab = el.dataset.tab; save(); render();
  },
  't-start': () => timerStart(),
  't-pause': () => timerPause(),
  't-resume': () => timerResume(),
  't-stop': () => timerStop(false),
  't-set': el => { T().duration = Number(el.dataset.m) * 60000; save(); render(); },
  't-adj': el => { T().duration = clamp(T().duration + Number(el.dataset.d) * 60000, 60000, 600 * 60000); save(); render(); },
};

document.addEventListener('click', e => {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const fn = ACTIONS[el.dataset.action];
  if (fn) { e.preventDefault(); fn(el); }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeSheet(); setDrawer(false); }
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.hrow, .todo, .sec-h, .rcard')) { e.preventDefault(); e.target.click(); }
});

/* Swipe the week strip to change weeks */
let touchX = null;
document.addEventListener('touchstart', e => { touchX = e.target.closest('#week') ? e.touches[0].clientX : null; }, { passive: true });
document.addEventListener('touchend', e => {
  if (touchX == null) return;
  const dx = e.changedTouches[0].clientX - touchX; touchX = null;
  if (Math.abs(dx) < 50) return;
  ui.date = dkey(addDays(parseKey(ui.date), dx < 0 ? 7 : -7));
  render();
}, { passive: true });

document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });
window.addEventListener('storage', e => { if (e.key === STORE_KEY) { state = load(); render(); } });
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); ui.installEvt = e; if (ui.view === 'settings') render(); });

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(err => console.warn('SW registration failed', err)));
}

/* Make rows keyboard-focusable */
new MutationObserver(() => $$('.hrow, .todo, .rcard').forEach(el => el.tabIndex = 0)).observe($('#app'), { childList: true });

render();
setInterval(tick, 500);
