const $ = id => document.getElementById(id);
const svgNS = 'http://www.w3.org/2000/svg';
let S, timer = null, selected = null;
const FILTERS = { war:{on:1,label:'Wars',icon:'war',types:['war','peace']}, diplo:{on:1,label:'Diplomacy',icon:'ally',types:['diplo']},
  nations:{on:1,label:'Revolts & dreams',icon:'revolt',types:['unify','revolt']}, rulers:{on:1,label:'Rulers',icon:'ruler',types:['ruler']},
  event:{on:1,label:'Events',icon:'event',types:['event']}, econ:{on:0,label:'Construction',icon:'factory',types:['econ']} };
let selProv = null;
function el(tag, attrs, parent){ const e = document.createElementNS(svgNS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
const fmt = v => Math.round(v).toLocaleString('en');
const A = i => [GEO.regions[i].ax, GEO.regions[i].ay];
const nameSpan = t => { const c = S.C[t]; return `<b class="cn" data-tag="${t}" style="--c:${c.color}">${c.name}</b>`; };
const dur = q => q < 4 ? `${q} season${q === 1 ? '' : 's'}` : `${(q / 4).toFixed(q % 4 ? 1 : 0)} yr`;

// ---------- glyphs (SVG strings centred on 0,0) ----------
const INK = '#f3efe4', DARK = '#111';
const G = {
  factory: `<path d="M-4.5 3.5V-.5l2.6-1.6V-.5l2.6-1.6V-.5V-4.5h1.8v8z" fill="${INK}" stroke="${DARK}" stroke-width=".7" stroke-linejoin="round"/>`,
  build: `<path d="M-4.5 3.5V-.5l2.6-1.6V-.5l2.6-1.6V-.5V-4.5h1.8v8z" fill="none" stroke="${INK}" stroke-width=".8" stroke-dasharray="1.4 1"/>`,
  fort: `<path d="M-3.5 3.5V-1.5h-1v-3h2v1.2h1.5v-1.2h2v1.2h1.5v-1.2h2v3h-1v5z" fill="#2a2f36" stroke="${INK}" stroke-width=".8" stroke-linejoin="round"/>`,
  buildfort: `<path d="M-3.5 3.5V-1.5h-1v-3h2v1.2h1.5v-1.2h2v1.2h1.5v-1.2h2v3h-1v5z" fill="none" stroke="${INK}" stroke-width=".8" stroke-dasharray="1.4 1"/>`,
  flame: c => `<path d="M-3.2 .6V-2.4a.9.9 0 011.8 0v-.9a.9.9 0 011.8 0v.3a.9.9 0 011.8 0v.8a.9.9 0 011.7.3V1c0 1.7-1.2 2.7-2.9 2.7h-.4v1.4h-2.4V3.2c-.7-.5-1.4-1.4-1.4-2.6z" fill="${c}" stroke="${DARK}" stroke-width=".7" stroke-linejoin="round"/>`,
  battle: `<g stroke-linecap="round"><path d="M-5 -5L5 5M5 -5L-5 5" stroke="${DARK}" stroke-width="4"/><path d="M-5 -5L5 5M5 -5L-5 5" stroke="#fff" stroke-width="1.8"/></g>`,
  revolt: `<path d="M0 -7L1.8 -2.4 6.6 -2.2 2.8 .9 4.2 5.6 0 2.9 -4.2 5.6 -2.8 .9 -6.6 -2.2 -1.8 -2.4z" fill="#e0453a" stroke="${DARK}" stroke-width=".8"/>`,
  boom: `<path d="M0 -6L4 0L0 6L-4 0z" fill="#f2c94c" stroke="${DARK}" stroke-width=".8"/><path d="M0 -3.4L2.2 0L0 3.4L-2.2 0z" fill="#fff6c9"/>`,
  crown: `<path d="M-6 3L-6.5 -3.5L-3 -.5L0 -5L3 -.5L6.5 -3.5L6 3z" fill="#c9a45c" stroke="${DARK}" stroke-width=".8" stroke-linejoin="round"/>`,
  coup: `<path d="M-6 3L-6.5 -3.5L-3 -.5L0 -5L3 -.5L6.5 -3.5L6 3z" fill="#b9a3d6" stroke="${DARK}" stroke-width=".8" stroke-linejoin="round"/><path d="M-7 4L7 -5" stroke="${DARK}" stroke-width="2.2"/><path d="M-7 4L7 -5" stroke="#e0453a" stroke-width="1.2"/>`,
};
G.crisis = G.coup;
G.ruin = `<path d="M-5 4V0l2.6-1.5V0l1.8-1 1.2 3.5 1.6-3.8.8 1.2V-4.5h2V4z" fill="#8a8f99" stroke="${DARK}" stroke-width=".8" stroke-linejoin="round"/><path d="M1 -5l1.4 1.8-1.6 1.2" stroke="#e0453a" stroke-width="1.1" fill="none"/>`;
const EMB = { // ruler quirk emblems, drawn inside a badge
  warmonger: `<path d="M-2.6 2.6L2.8 -2.8M-2.4 -.2L.2 2.4M-3.2 3.2l1-1" stroke="${INK}" stroke-width="1.2" stroke-linecap="round"/>`,
  builder: `<path d="M-2.6 2.8L.8 -.6" stroke="${INK}" stroke-width="1.2" stroke-linecap="round"/><path d="M-.6 -2.8l2.2 -.6 1.6 1.6-.6 2.2z" fill="${INK}"/>`,
  paranoid: `<path d="M-3.4 0Q0 -3 3.4 0Q0 3 -3.4 0z" fill="none" stroke="${INK}" stroke-width="1"/><circle r="1.1" fill="${INK}"/>`,
  revanchist: `<path d="M0 -3.4C1.7 -1.2 2.5 0 1.8 1.7C1.3 3 -1.3 3 -1.8 1.7C-2.4 .2 -.9 -.8 0 -3.4z" fill="#e3933c"/>`,
  spendthrift: `<circle r="2.8" fill="none" stroke="#f2c94c" stroke-width="1"/><path d="M0 -1.6v3.2" stroke="#f2c94c" stroke-width="1"/>`,
  reformer: `<path d="M-2.4 -3h4.8v6h-4.8z" fill="none" stroke="${INK}" stroke-width=".9"/><path d="M-1.4 -1.2h2.8M-1.4 .4h2.8M-1.4 2h1.8" stroke="${INK}" stroke-width=".7"/>`,
  incompetent: `<text y="2.6" text-anchor="middle" font-size="7" font-family="IBM Plex Mono" fill="${INK}">?</text>`,
};
// position on the outer group, animate the inner one (animating the outer would override its position)
const at = (x, y, inner, extra = '', fresh = false) => `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)})" ${extra}>${fresh ? `<g class="fresh">${inner}</g>` : inner}</g>`;

// ---------- static map ----------
const cellEls = [], borderEls = [];
(function buildMap(){
  el('path', { d: GEO.land, fill: '#2a2f35', stroke: '#3a414a', 'stroke-width': .6 }, $('gLand'));
  GEO.regions.forEach((g, i) => { const p = el('path', { d: g.d, class: 'cell', stroke: 'rgba(10,12,15,.4)', 'stroke-width': .6, 'stroke-linejoin': 'round' }, $('gCells')); p.dataset.i = i; cellEls.push(p); });
  GEO.borders.forEach(b => borderEls.push({ b, l: el('path', { d: b.d, fill: 'none', stroke: '#0b0e11', 'stroke-width': 1.7, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, $('gBorders')) }));
  GEO.naval.forEach(([a, b], k) => { const pp = GEO.navalPts[k] || [A(a), A(b)]; el('line', { x1: pp[0][0], y1: pp[0][1], x2: pp[1][0], y2: pp[1][1], stroke: '#9fb1c2', 'stroke-dasharray': '2 3', 'stroke-width': 1, opacity: .45 }, $('gNaval')); });
})();
const occPatterns = new Set();
function occPattern(tag){
  const id = 'occ-' + tag;
  if (!occPatterns.has(id)) { const p = el('pattern', { id, width: 8, height: 8, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, document.querySelector('#map defs'));
    el('rect', { width: 4, height: 8, fill: S.C[tag].color }, p); el('rect', { x: 4, width: .8, height: 8, fill: 'rgba(0,0,0,.35)' }, p); occPatterns.add(id); }
  return `url(#${id})`;
}

function newWorld(seed, player){
  stopAuto();
  S = createSim(seed, GEO, { player });
  selected = player || null;
  $('seed').textContent = 'World #' + seed;
  selProv = null;
  $('nation').innerHTML = '<div class="empty">Click a country\'s name anywhere, or a province on the map, to see its ruler, budget and forecasts.</div>';
  $('endModal').classList.remove('on');
  render(); checkPending();
}
function render(){
  $('year').textContent = S.year; $('season').textContent = S.over ? 'Peace' : S.SEASONS[S.q];
  ['next', 'auto'].forEach(id => $(id).disabled = S.over || !!S.pending);
  renderMap(); renderOverlays(); renderSide();
  if (!$('panel').classList.contains('closed')) { const on = document.querySelector('.pane.on').id;
    if (on === 'chron') renderLog(); else if (on === 'powers') renderPowers(); else if (on === 'nation') { if (selected) renderNation(); } else renderProvince(); }
}

function renderMap(){
  S.regions.forEach((r, i) => { const p = cellEls[i]; p.setAttribute('fill', S.C[r.owner].color); p.style.opacity = selected && r.owner !== selected ? .45 : 1; });
  borderEls.forEach(({ b, l }) => { l.style.display = S.regions[b.a].owner === S.regions[b.b].owner ? 'none' : ''; });
  let occ = '', settle = '', goals = '', icons = '', marks = '', labels = '';
  S.regions.forEach((r, i) => {
    if (r.integ < 1) settle += `<path d="${GEO.regions[i].d}" fill="url(#settle)" opacity="${(0.35 + 0.65 * (1 - r.integ)).toFixed(2)}"/>`;
    if (r.occ) occ += `<path class="occ" d="${GEO.regions[i].d}" fill="${occPattern(r.occ)}" opacity=".9"/>`;
  });
  S.wars.forEach(w => { goals += `<path class="goal" d="${GEO.regions[S.RB[w.goal].i].d}"/>`; });
  // province icons: chimney with count, tower, construction, unrest flame
  S.regions.forEach(r => {
    const [cx, cy] = A(r.i);
    const items = [];
    if (r.fac) items.push({ g: G.factory, n: r.fac, w: r.fac > 1 ? 15 : 10 });
    if (r.build) items.push({ g: r.build.type === 'factory' ? G.build : G.buildfort, w: 10 });
    if (r.fort) items.push({ g: G.fort, w: 10 });
    if (r.unrest >= 40) items.push({ g: G.flame(r.unrest >= 65 ? '#e0453a' : '#e3933c'), w: 9, hot: r.unrest >= 65 });
    let x = cx - items.reduce((s, it) => s + it.w, 0) / 2;
    const y = cy + 7;
    items.forEach(it => {
      icons += at(x + 5, y, it.g, it.hot ? 'class="hot"' : '');
      if (it.n > 1) icons += `<text x="${(x + 10.5).toFixed(1)}" y="${(y + 3).toFixed(1)}" font-size="7.5" font-family="IBM Plex Mono" font-weight="600" fill="${INK}" stroke="${DARK}" stroke-width="2" paint-order="stroke">${it.n}</text>`;
      x += it.w;
    });
  });
  // event markers that fade over a few seasons
  const shown = new Set();
  S.regions.forEach(r => { if (r.battle > 0) { const [cx, cy] = A(r.i); marks += at(cx, cy - 6, G.battle, '', r.battle === 2); shown.add(r.i); } });
  S.marks.filter(m => S.t - m.t <= 4).forEach(m => {
    const [cx, cy] = A(m.i); const age = S.t - m.t; const off = shown.has(m.i) ? 12 : 0; shown.add(m.i);
    marks += at(cx + off, cy - 8, G[m.type] || G.boom, `opacity="${(1 - age / 5).toFixed(2)}"`, age === 0);
  });
  // front lines: borders where the two sides of a war hold land face to face
  let fronts = '';
  S.wars.forEach(w => { const side = r => { const h = r.occ || r.owner; return w.att.includes(h) ? 1 : w.def.includes(h) ? 2 : 0; };
    GEO.borders.forEach(b => { const sa = side(S.regions[b.a]), sb = side(S.regions[b.b]); if (sa && sb && sa !== sb) fronts += `<path class="front" d="${b.d}"/>`; }); });
  // army badges at the capitals of countries at war
  S.alive().filter(c => S.warOf(c)).forEach(c => { const cap = S.capitalOf(c); if (!cap) return; const [cx, cy] = A(cap.i);
    const t = fmt(c.army) + 'k'; const w = 13 + t.length * 5;
    marks += `<g transform="translate(${(cx + 6).toFixed(1)},${(cy - 20).toFixed(1)})"><rect x="0" y="-7" width="${w}" height="13" rx="3" fill="rgba(20,24,30,.92)" stroke="${c.color}" stroke-width="1.2"/><g transform="translate(6.5,-.5) scale(.62)">${'<path d="M-5.5 2.5C-5.5 -2.5 -3 -5 0 -5s5.5 2.5 5.5 7.5z" fill="#c9675c" stroke="#5e221c"/><path d="M-6.5 2.5h13v2h-13z" fill="#9c4a41"/>'}</g><text x="12" y="3" font-size="8.5" font-family="IBM Plex Mono" font-weight="600" fill="${INK}">${t}</text></g>`; });
  // capitals, names, ruler emblems, leader crown
  S.alive().forEach(c => {
    const rs = S.regionsOf(c); if (!rs.length) return;
    const cap = S.capitalOf(c);
    icons += `<circle cx="${A(cap.i)[0]}" cy="${A(cap.i)[1]}" r="2.6" fill="${INK}" stroke="${DARK}" stroke-width="1.1"/>`;
    let x = 0, y = 0, w = 0;
    rs.forEach(r => { const k = Math.sqrt(GEO.regions[r.i].area); x += A(r.i)[0] * k; y += A(r.i)[1] * k; w += k; });
    x /= w; y /= w;
    let near = null, nd = Infinity; S.regions.forEach(r => { const d = (A(r.i)[0] - x) ** 2 + (A(r.i)[1] - y) ** 2; if (d < nd) { nd = d; near = r; } });
    if (near.owner !== c.tag) { const big = rs.slice().sort((a, b) => GEO.regions[b.i].area - GEO.regions[a.i].area)[0]; [x, y] = A(big.i); }
    const n = rs.length, fs = n === 1 ? 10 : Math.min(24, 11 + Math.sqrt(n) * 3.2);
    const name = n === 1 && c.name.length > 13 ? c.name.split(' ').pop() : c.name;
    const ly = y - (n === 1 ? 9 : 13);
    labels += `<text class="lbl" x="${x.toFixed(1)}" y="${ly.toFixed(1)}" font-size="${fs.toFixed(1)}">${name}</text>`;
    const half = name.length * fs * 0.27;
    if (S.inCrisis(c)) labels += at(x - half - 9, ly - 1, G.coup);
    if (S.leader === c.tag) labels += at(x, ly - fs * 0.62 - 5, G.crown);
  });
  $('gFront').innerHTML = fronts; $('gOcc').innerHTML = occ; $('gSettle').innerHTML = settle; $('gGoals').innerHTML = goals; $('gIcons').innerHTML = icons; $('gMarks').innerHTML = marks; $('gLabels').innerHTML = labels;
}

// Europe-wide conditions, each with what it does in one short line
function globalChips(){
  const e = S.era, d = Math.round((e.def - 1) * 100);
  const battle = d > 0 ? `Defenders ${d}% stronger` : d < 0 ? `Attackers ${-d}% stronger` : 'Even battles';
  const chip = (k, name, fx) => `<div class="chip2"><span class="k">${k}</span>${name}<div class="fx">${fx}</div></div>`;
  let h = chip('Warfare', e.name, `${ic('war')}${battle} · ${ic('fort')}Forts stop ${Math.round(e.fort * 100)}% of advances`);
  if (S.railBoom > S.year) h += chip('Boom', 'Railway mania', `${ic('factory')}Factories 30% cheaper · until ${S.railBoom}`);
  if (S.depression > S.t) h += chip('Crisis', 'The Panic', `${ic('income')}All income down 20% · ${dur(S.depression - S.t)} left`);
  return h;
}
function renderOverlays(){
  const lead = S.leader && S.C[S.leader];
  // the left strip already shows the leader when nothing is selected
  const leadShown = getComputedStyle($('side')).display !== 'none' && !S.player && !(S.C[selected] && S.C[selected].alive);
  $('tl').innerHTML = (lead && !leadShown ? `<div class="chip2 lead"><span class="k">Leading</span>${nameSpan(lead.tag)} <b>${fmt(S.score(lead))}</b> <span class="muted">gold a year</span></div>` : '')
    + globalChips();
  const crises = S.alive().filter(c => S.inCrisis(c)).map(c => `<div class="wchip crisis"><div class="t">Civil war in ${c.name}<span>${dur(c.crisis.until - S.t)}</span></div><div class="s"><div>Army at half strength</div></div></div>`).join('');
  const wars = S.wars.map(w => {
    const s = w.score, left = s >= 0 ? 50 : 50 + s / 2, wid = Math.abs(s) / 2;
    const col = s >= 0 ? S.C[w.att[0]].color : S.C[w.def[0]].color;
    const held = side => S.regions.filter(r => r.occ && side.includes(r.occ)).length;
    return `<div class="wchip"><div class="t">${w.name}<span>${dur(w.quarters)}</span></div>
      <div class="s"><div>${w.att.map(nameSpan).join(', ')}</div><div style="text-align:right">${w.def.map(nameSpan).join(', ')}</div></div>
      <div class="wsbar"><i style="left:${left}%;width:${wid}%;background:${col}"></i></div>
      <div class="s"><div>occupies ${held(w.att)} prov.</div><div style="text-align:right">occupies ${held(w.def)} prov.</div></div></div>`;
  }).join('');
  $('bl').innerHTML = crises + wars;
}

function showTab(id){
  if ($('panel').classList.contains('closed')) $('panel').classList.remove('closed');
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('on', t.dataset.p === id));
  document.querySelectorAll('.pane').forEach(p => p.classList.toggle('on', p.id === id));
  render();
}
function select(tag){ selected = tag; showTab('nation'); }
function selectProvince(i){ selProv = i; selected = S.regions[i].owner; showTab('province'); }
function step(n = 1){ for (let i = 0; i < n && !S.over && !S.pending; i++) S.step(); render(); if (S.over) { stopAuto(); showEnd(); } checkPending(); }
// a choice for the player stops the clock until it is made
function checkPending(){ if (!S.pending) return; stopAuto(); if (S.pending.type === 'heir') showHeir(); }
// speeds: seconds a season, slowest first; changing speed keeps the time already waited
const SPEEDS = [3000, 1500, 700, 250, 40]; let speed = 1, lastTick = 0;
function stopAuto(){ if (timer) clearTimeout(timer); timer = null; $('auto').textContent = 'Play'; }
function schedule(){ clearTimeout(timer); timer = setTimeout(tick, Math.max(0, SPEEDS[speed] - (performance.now() - lastTick))); }
function tick(){ lastTick = performance.now(); step(1); if (timer && !S.over) schedule(); }
function startAuto(){ if (S.pending || S.over) return; stopAuto(); $('auto').textContent = 'Pause'; lastTick = -Infinity; schedule(); }
function setSpeed(i){ speed = Math.max(0, Math.min(SPEEDS.length - 1, i));
  document.querySelectorAll('.pip').forEach((p, k) => { p.classList.toggle('on', k <= speed); p.setAttribute('aria-pressed', k === speed); });
  if (timer) schedule(); }
