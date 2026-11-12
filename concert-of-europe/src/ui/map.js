const $ = id => document.getElementById(id);
const svgNS = 'http://www.w3.org/2000/svg';
let S, timer = null, selected = null;
const FILTERS = { war:{on:1,label:'Wars',icon:'war',types:['war','peace']}, diplo:{on:1,label:'Diplomacy',icon:'ally',types:['diplo']},
  nations:{on:1,label:'Uprisings & unions',icon:'uprising',types:['unify','revolt']}, rulers:{on:1,label:'Rulers',icon:'ruler',types:['ruler']},
  event:{on:1,label:'Events',icon:'event',types:['event']}, econ:{on:0,label:'Construction',icon:'build',types:['econ']} };
let selProv = null;
function el(tag, attrs, parent){ const e = document.createElementNS(svgNS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
const fmt = v => Math.round(v).toLocaleString('en');
const A = i => [GEO.regions[i].ax, GEO.regions[i].ay];
const nameSpan = t => { const c = S.C[t]; return `<b class="cn" data-tag="${t}" style="--c:${c.color}">${c.name}</b>`; };
const dur = q => q < 4 ? `${q} season${q === 1 ? '' : 's'}` : `${(q / 4).toFixed(q % 4 ? 1 : 0)} yr`;

// position on the outer group, animate the inner one (animating the outer would override its position)
const at = (x, y, inner, extra = '', fresh = false) => `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)})" ${extra}>${fresh ? `<g class="fresh">${inner}</g>` : inner}</g>`;

// ---------- static map ----------
const cellEls = [], borderEls = [];
(function buildMap(){
  el('path', { d: GEO.land, fill: '#2a2f35', stroke: '#3a414a', 'stroke-width': .6 }, $('gLand'));
  GEO.regions.forEach((g, i) => { const p = el('path', { d: g.d, class: 'cell', stroke: 'rgba(10,12,15,.4)', 'stroke-width': .6, 'stroke-linejoin': 'round' }, $('gCells')); p.dataset.i = i; cellEls.push(p); });
  GEO.borders.forEach(b => borderEls.push({ b, l: el('path', { d: b.d, fill: 'none', stroke: '#0b0e11', 'stroke-width': 1.7, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, $('gBorders')) }));
  GEO.naval.forEach(([a, b], k) => { const pp = GEO.navalPts[k] || [A(a), A(b)], d = GEO.navalPaths?.[k] || `M${pp[0].join(',')}L${pp[1].join(',')}`; el('path', { d, fill: 'none', stroke: '#9fb1c2', 'stroke-dasharray': '2 3', 'stroke-width': 1, opacity: .45 }, $('gNaval')); });
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
  $('endModal').classList.remove('on');
  render(); checkPending();
}
function render(){
  $('year').textContent = S.year; $('season').textContent = S.over ? 'Peace' : S.SEASONS[S.q];
  $('auto').disabled = !!S.pending; autoLabel(); renderAdvanceProgress();
  renderMap(); renderOverlays(); renderNation();
  if (!$('panel').classList.contains('closed')) { const on = document.querySelector('.pane.on').id;
    if (on === 'chron') renderLog(); else if (on === 'powers') renderPowers(); else renderProvince(); }
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
  // province icons (factories with count, fortress, construction, unrest) only on the nation you are
  // looking at: the selected one, else your own. The rest of the map stays clean.
  const focus = selected || S.player;
  S.regions.forEach(r => {
    if (r.owner !== focus) return;
    const [cx, cy] = A(r.i);
    const items = [];
    if (r.fac) items.push({ g: glyph('factory'), n: r.fac, w: r.fac > 1 ? 15 : 10 });
    if (r.build) items.push({ g: glyph(r.build.type === 'factory' ? 'buildFactory' : 'buildFort'), w: 10 });
    if (r.fort) items.push({ g: glyph('fort'), w: 10 });
    if (r.unrest >= UNREST.restless) items.push({ g: glyph('unrest', r.unrest >= UNREST.uprising ? UNREST_HOT : UNREST_WARM), w: 9, hot: r.unrest >= UNREST.uprising });
    let x = cx - items.reduce((s, it) => s + it.w, 0) / 2;
    const y = cy + 7;
    items.forEach(it => {
      icons += at(x + 5, y, it.g, it.hot ? 'class="hot"' : '');
      if (it.n > 1) icons += `<text x="${(x + 10.5).toFixed(1)}" y="${(y + 3).toFixed(1)}" font-size="7.5" font-family="IBM Plex Sans" font-weight="600" fill="${INK}" stroke="${DARK}" stroke-width="2" paint-order="stroke">${it.n}</text>`;
      x += it.w;
    });
  });
  // event markers that fade over a few seasons
  const shown = new Set();
  S.regions.forEach(r => { if (r.battle > 0) { const [cx, cy] = A(r.i); marks += at(cx, cy - 6, glyph('battle'), '', r.battle === 2); shown.add(r.i); } });
  S.marks.filter(m => S.t - m.t <= 4).forEach(m => {
    const [cx, cy] = A(m.i); const age = S.t - m.t; const off = shown.has(m.i) ? 12 : 0; shown.add(m.i);
    marks += at(cx + off, cy - 8, glyph(MARK_IC[m.type] || 'event'), `opacity="${(1 - age / 5).toFixed(2)}"`, age === 0);
  });
  // front lines: borders where the two sides of a war hold land face to face
  let fronts = '';
  S.wars.forEach(w => { const side = r => { const h = r.occ || r.owner; return w.att.includes(h) ? 1 : w.def.includes(h) ? 2 : 0; };
    GEO.borders.forEach(b => { const sa = side(S.regions[b.a]), sb = side(S.regions[b.b]); if (sa && sb && sa !== sb) fronts += `<path class="front" d="${b.d}"/>`; }); });
  // army badges at the capitals of nations at war
  S.alive().filter(c => S.warOf(c)).forEach(c => { const cap = S.capitalOf(c); if (!cap) return; const [cx, cy] = A(cap.i);
    const t = fmt(c.army) + 'k'; const w = 13 + t.length * 5;
    marks += `<g transform="translate(${(cx + 6).toFixed(1)},${(cy - 20).toFixed(1)})"><rect x="0" y="-7" width="${w}" height="13" rx="3" fill="rgba(20,24,30,.92)" stroke="${c.color}" stroke-width="1.2"/><g transform="translate(6.5,-.5)">${glyph('army')}</g><text x="12" y="3" font-size="8.5" font-family="IBM Plex Sans" font-weight="600" fill="${INK}">${t}</text></g>`; });
  // capitals, names, ruler emblems, leader crown
  S.alive().forEach(c => {
    const rs = S.regionsOf(c); if (!rs.length) return;
    const cap = S.capitalOf(c);
    icons += at(A(cap.i)[0], A(cap.i)[1], REG.capital.draw);
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
    if (S.inCrisis(c)) labels += at(x - half - 9, ly - 1, glyph('civilWar'));
    if (S.leader === c.tag) labels += at(x, ly - fs * 0.62 - 5, glyph('leader'));
  });
  $('gFront').innerHTML = fronts; $('gOcc').innerHTML = occ; $('gSettle').innerHTML = settle; $('gGoals').innerHTML = goals; $('gIcons').innerHTML = icons; $('gMarks').innerHTML = marks; $('gLabels').innerHTML = labels;
}

// Europe-wide conditions: a name on the map, what it does on hover
function globalChips(){
  const e = S.era, d = Math.round((e.def - 1) * 100);
  const battle = d > 0 ? `Defenders ${d}% stronger` : d < 0 ? `Attackers ${-d}% stronger` : 'Even battles';
  const chip = (icon, name, fx) => `<div class="chip2" ${tipAttr(name, fx)}>${ic(icon)}${name}</div>`;
  let h = chip('war', e.name, `${battle}. Fortresses stop ${Math.round(e.fort * 100)}% of advances.`);
  for (const m of S.activeModifiers()) h += chip(m.icon, m.name, say(m.text, { ...m, remaining: m.until - S.t }));
  return h;
}
function renderOverlays(){
  $('tl').innerHTML = globalChips();
  const crises = S.alive().filter(c => S.inCrisis(c)).map(c => `<div class="wchip crisis" ${tipOf('civilWar')}><div class="t">${ic('civilWar')}Civil war in ${c.name}<span>${dur(c.crisis.until - S.t)}</span></div></div>`).join('');
  const wars = S.wars.map(w => {
    const s = w.score, left = s >= 0 ? 50 - s / 2 : 50, wid = Math.abs(s) / 2;
    const col = s >= 0 ? S.C[w.att[0]].color : S.C[w.def[0]].color;
    const held = (side, other) => S.regions.filter(r => side.includes(r.occ) && other.includes(r.owner)).length;
    const names = side => side.map(t => S.C[t].name).join(', ');
    return `<div class="wchip" ${tipAttr(w.name, `${names(w.att)} occupy ${held(w.att, w.def)} provinces; ${names(w.def)} occupy ${held(w.def, w.att)}. The bar leans toward whoever is winning.`)}><div class="t">${w.name}<span>${dur(w.quarters)}</span></div>
      <div class="s"><div>${w.att.map(nameSpan).join(', ')}</div><div style="text-align:right">${w.def.map(nameSpan).join(', ')}</div></div>
      <div class="wsbar"><i style="left:${left}%;width:${wid}%;background:${col}"></i></div></div>`;
  }).join('');
  $('bl').innerHTML = crises + wars;
}

function showTab(id){
  if ($('panel').classList.contains('closed')) $('panel').classList.remove('closed');
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('on', t.dataset.p === id));
  document.querySelectorAll('.pane').forEach(p => p.classList.toggle('on', p.id === id));
  render();
}
function select(tag){ selected = tag; render(); }
function selectProvince(i){ selProv = i; selected = S.regions[i].owner; showTab('province'); }
function step(n = 1){ for (let i = 0; i < n && !S.over && !S.pending; i++) S.step(); render(); if (S.over) { stopAuto(); showEnd(); } checkPending(); }
// a choice for the player stops the clock until it is made
function checkPending(){ if (!S.pending) return; stopAuto(); if (S.pending.type === 'heir') showHeir(); else if (S.pending.type === 'advance') showAdvance(); }
// speeds: seconds a season, slowest first; changing speed keeps the time already waited
const SPEEDS = [3000, 1500, 700, 250, 40]; let speed = 1, lastTick = 0;
function stopAuto(){ if (timer) clearTimeout(timer); timer = null; autoLabel(); }
// once the war is over the play button starts the next game
function autoLabel(){ const a = $('auto'); a.textContent = S && S.over ? 'New world' : timer ? 'Pause' : 'Play'; a.dataset.tip = S && S.over ? 'Start a new world' : 'Play or pause (Space)'; }
function schedule(){ clearTimeout(timer); timer = setTimeout(tick, Math.max(0, SPEEDS[speed] - (performance.now() - lastTick))); }
function tick(){ lastTick = performance.now(); step(1); if (timer && !S.over) schedule(); }
function startAuto(){ if (S.pending || S.over) return; stopAuto(); $('auto').textContent = 'Pause'; lastTick = -Infinity; schedule(); }
function setSpeed(i){ speed = Math.max(0, Math.min(SPEEDS.length - 1, i));
  document.querySelectorAll('.pip').forEach((p, k) => { p.classList.toggle('on', k <= speed); p.setAttribute('aria-pressed', k === speed); });
  if (timer) schedule(); }
