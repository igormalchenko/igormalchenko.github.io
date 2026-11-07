
// ---------- wiring ----------
$('next').onclick = () => step(1);
$('auto').onclick = () => timer ? stopAuto() : startAuto();
$('pips').innerHTML = SPEEDS.map((ms, k) => `<button class="pip" data-s="${k}" title="Speed ${k + 1}: ${ms >= 1000 ? ms / 1000 + ' s' : 'under a second'} a season" aria-label="Speed ${k + 1}"><i style="height:${8 + k * 4}px"></i></button>`).join('');
$('pips').onclick = e => { const p = e.target.closest('.pip'); if (p) setSpeed(+p.dataset.s); };
$('slower').onclick = () => setSpeed(speed - 1);
$('faster').onclick = () => setSpeed(speed + 1);
setSpeed(speed);
$('new').onclick = () => newWorld(Math.floor(Math.random() * 99999));
$('again').onclick = () => newWorld(Math.floor(Math.random() * 99999));
$('help').onclick = () => $('helpModal').classList.add('on');
$('toggle').onclick = () => { $('panel').classList.toggle('closed'); render(); };
document.querySelectorAll('.modal').forEach(m => m.addEventListener('click', e => { if (e.target === m || e.target.hasAttribute('data-close')) m.classList.remove('on'); }));
document.querySelectorAll('.tab').forEach(t => t.onclick = () => showTab(t.dataset.p));
$('chips').addEventListener('click', e => { const b = e.target.closest('.chip'); if (!b) return; FILTERS[b.dataset.f].on ^= 1; renderChips(); renderLog(); });
document.addEventListener('click', e => { if (e.target.closest('#map')) return; const pv = e.target.closest('[data-prov]'); if (pv) { selectProvince(+pv.dataset.prov); return; } const n = e.target.closest('[data-tag]'); if (n) { $('endModal').classList.remove('on'); select(n.dataset.tag); } });
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'SELECT' || (e.target.tagName === 'BUTTON' && e.key === ' ')) return;
  if (e.key === 'n' || e.key === ' ') { e.preventDefault(); if (!S.over) step(1); }
  if (e.key === 'p') { timer ? stopAuto() : startAuto(); }
  if (e.key === '+' || e.key === '=') setSpeed(speed + 1);
  if (e.key === '-' || e.key === '_') setSpeed(speed - 1);
  if (e.key === 'Escape') { const open = [...document.querySelectorAll('.modal.on')]; if (open.length) open.forEach(m => m.classList.remove('on')); else deselect(); }
});
// hover: province plus a card for its country
const tip = $('tip');
$('gCells').addEventListener('mousemove', e => {
  const p = e.target.closest('.cell'); if (!p) return;
  const r = S.regions[+p.dataset.i]; const c = S.C[r.owner];
  const inc = S.sumInc(S.regionIncome(r));
  const rank = S.alive().sort((a, b) => S.score(b) - S.score(a)).indexOf(c) + 1;
  const war = S.warOf(c);
  tip.innerHTML = `<div class="hd"><span class="fl" style="background:${c.color}"></span><b>${c.name}</b><span class="muted" style="margin-left:auto">#${rank} · ${ic('gold')}${fmt(S.score(c))}/yr</span></div>
    <div class="tipr">${ic('ruler')}${c.ruler.name}${c.ruler.trait ? ` ${emblem(c.ruler.trait)}<span class="muted">${S.TRAITS[c.ruler.trait].label}</span>` : ''}</div>
    ${war ? `<div style="color:var(--war)">${ic('war')}${war.name}</div>` : ''}${S.inCrisis(c) ? '<div style="color:#b9a3d6">Civil war</div>' : ''}
    <hr><b>${r.name}</b> <span class="muted">${r.culture}</span><br>
    ${ic('pop')}${r.pop.toFixed(1)}m ${ic('factory')}${r.fac}${r.fort ? ' ' + ic('fort') : ''}${r.coast ? ' ' + ic('trade') : ''} ${ic('gold')}${(inc * 4).toFixed(1)} gold/yr<br>
    <span style="color:${r.unrest >= 65 ? '#e0453a' : r.unrest >= 40 ? '#e3933c' : 'var(--muted)'}">${ic('unrest')}Unrest ${Math.round(r.unrest)}</span>${r.integ < 1 ? ` · ${ic('settle')}<span style="color:var(--revolt)">integrated ${Math.round(r.integ * 100)}%</span>` : ''}
    ${r.occ ? `<br><span style="color:var(--war)">Occupied by ${S.C[r.occ].name}</span>` : ''}${r.core !== r.owner && S.C[r.core] && S.C[r.core].alive ? `<br><span class="muted">${S.C[r.core].name} wants it back</span>` : ''}`;
  const box = $('mapwrap').getBoundingClientRect();
  let x = e.clientX - box.left + 14, y = e.clientY - box.top + 14;
  if (x > box.width - 265) x -= 280; if (y > box.height - 200) y -= 200;
  tip.style.left = x + 'px'; tip.style.top = y + 'px'; tip.style.display = 'block';
});
$('gCells').addEventListener('mouseleave', () => tip.style.display = 'none');
$('gCells').addEventListener('click', e => { const p = e.target.closest('.cell'); if (p) selectProvince(+p.dataset.i); });
// click the sea (or anything that isn't a province) to clear the selection; Escape does the same
function deselect(){ if (selected == null && selProv == null) return; selected = null; selProv = null; tip.style.display = 'none';
  $('nation').innerHTML = '<div class="empty">Click a province or a country\'s name to see its ruler, budget and forecasts.</div>';
  const on = document.querySelector('.pane.on').id; if (on === 'nation' || on === 'province') showTab('chron'); else render(); }
$('map').addEventListener('click', e => { if (!e.target.closest('.cell')) deselect(); });

// instant tooltips: the browser's own title tooltips wait about a second, so take their text over and show it at once
const qtip = document.createElement('div'); qtip.className = 'qtip'; document.body.appendChild(qtip);
function tipOf(el){
  if (el.hasAttribute('title')) { el.dataset.tip = el.getAttribute('title'); el.removeAttribute('title'); if (!el.hasAttribute('aria-label') && !el.textContent.trim()) el.setAttribute('aria-label', el.dataset.tip); }
  const t = el.querySelector(':scope > title'); if (t) { el.dataset.tip = t.textContent; t.remove(); }
  return el.dataset.tip;
}
document.addEventListener('mousemove', e => {
  let el = e.target.closest && e.target.closest('[title],[data-tip],svg:has(> title)');
  // an icon inside a labelled cell or row: the wider label says more
  const up = el && el.tagName.toLowerCase() === 'svg' && el.parentElement && el.parentElement.closest('[title],[data-tip]');
  if (up) el = up;
  const text = el && tipOf(el);
  if (!text) { qtip.style.display = 'none'; return; }
  qtip.textContent = text; qtip.style.display = 'block';
  const w = qtip.offsetWidth, h = qtip.offsetHeight;
  let x = e.clientX + 12, y = e.clientY + 16;
  if (x + w > innerWidth - 8) x = e.clientX - w - 8; if (y + h > innerHeight - 8) y = e.clientY - h - 10;
  qtip.style.left = Math.max(8, x) + 'px'; qtip.style.top = Math.max(8, y) + 'px';
});
document.addEventListener('mouseleave', () => qtip.style.display = 'none');
document.addEventListener('mousedown', () => qtip.style.display = 'none');

// legend in the help panel, drawn with the same glyphs as the map
(function legend(){
  const sv = (inner, w = 22) => `<svg width="${w}" height="18" viewBox="${-w / 2} -9 ${w} 18">${inner}</svg>`;
  const items = [
    [sv(G.factory + `<text x="5" y="3" font-size="7.5" font-family="IBM Plex Mono" font-weight="600" fill="${INK}" stroke="${DARK}" stroke-width="2" paint-order="stroke">3</text>`), 'Factories (number = how many)'],
    [sv(G.fort), 'Fortress'], [sv(G.build), 'Being built'],
    [sv(G.flame('#e3933c')), 'Unrest (40+)'], [sv(G.flame('#e0453a')), 'Close to revolt (65+)'],
    [sv(G.battle), 'Battle this season'], [sv(G.revolt), 'Uprising'], [sv(G.boom), 'Coal or railway boom'],
    [sv(G.coup), 'Coup or civil war'], [sv(G.crown), 'Leading nation / dream fulfilled'], [sv(G.ruin), 'Factory or fortress destroyed'],
    [sv(`<path d="M-9 0H9" stroke="#ff5a48" stroke-width="3" stroke-dasharray="4 2"/>`), 'Front line'],
    [sv(`<rect x="-9" y="-6" width="18" height="12" fill="#8a8f99"/><rect x="-9" y="-6" width="18" height="12" fill="url(#settle)"/>`), 'Newly conquered: pays little until integrated'],
    [sv(`<rect x="-9" y="-6" width="18" height="12" fill="none" stroke="#d65a4d" stroke-width="1.6" stroke-dasharray="4 2"/>`), 'War goal'],
    [sv(`<line x1="-9" y1="0" x2="9" y2="0" stroke="#9fb1c2" stroke-dasharray="2 3"/>`), 'Sea crossing'],
  ];
  const names = Object.entries(TRAITS).map(([k, t]) => [sv(`<circle r="6.3" fill="#1a1f26" stroke="#c9a45c"/>` + EMB[k]), `${t.label}: ${t.desc.toLowerCase()}`]);
  $('legend').innerHTML = items.concat(names).map(([g, t]) => `<div>${g}<span>${t}</span></div>`).join('');
})();

renderChips();
newWorld(1848);
