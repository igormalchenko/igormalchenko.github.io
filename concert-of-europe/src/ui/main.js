
// ---------- wiring ----------
$('pips').innerHTML = SPEEDS.map((ms, k) => `<button class="pip" data-s="${k}" data-tip="Speed ${k + 1}: ${ms >= 1000 ? ms / 1000 + ' s' : 'under a second'} a season" aria-label="Speed ${k + 1}"><i style="height:${8 + k * 4}px"></i></button>`).join('');
$('pips').onclick = e => { const p = e.target.closest('.pip'); if (p) setSpeed(+p.dataset.s); };
$('slower').onclick = () => setSpeed(speed - 1);
$('faster').onclick = () => setSpeed(speed + 1);
setSpeed(speed);
const freshWorld = () => { newWorld(Math.floor(Math.random() * 99999)); showStart(); };
$('auto').onclick = () => S.over ? freshWorld() : timer ? stopAuto() : startAuto();
$('reworld').onclick = freshWorld;
$('seed').onclick = () => { if (S.over) { freshWorld(); return; } stopAuto(); $('newModal').classList.add('on'); $('abandon').focus(); };
$('abandon').onclick = () => { $('newModal').classList.remove('on'); freshWorld(); };
$('again').onclick = freshWorld;
$('watch').onclick = () => $('startModal').classList.remove('on');
$('startBody').addEventListener('click', e => { const b = e.target.closest('[data-play]'); if (!b) return; e.stopPropagation(); $('startModal').classList.remove('on'); newWorld(S.seed, b.dataset.play); });
$('reroll').onclick = () => {
  if (S.rerollHeirs()) { showHeir(); return; }
  // out of free rerolls: the paid one isn't built yet, so the button shakes and says so
  const b = $('reroll'); $('rerollNote').textContent = 'Coming soon';
  b.classList.remove('nope'); void b.offsetWidth; b.classList.add('nope');
};
$('heirCards').addEventListener('click', e => { const b = e.target.closest('.heir'); if (!b) return; S.chooseHeir(+b.dataset.i); $('heirModal').classList.remove('on'); render(); startAuto(); });
$('help').onclick = () => $('helpModal').classList.add('on');
$('toggle').innerHTML = ic('panel');
$('toggle').onclick = () => { $('panel').classList.toggle('closed'); render(); };
document.querySelectorAll('.modal:not(.sticky)').forEach(m => m.addEventListener('click', e => { if (e.target === m || e.target.hasAttribute('data-close')) m.classList.remove('on'); }));
document.querySelectorAll('.tab').forEach(t => t.onclick = () => showTab(t.dataset.p));
$('chips').addEventListener('click', e => { const b = e.target.closest('.chip'); if (!b) return; FILTERS[b.dataset.f].on ^= 1; renderChips(); renderLog(); });
$('side').addEventListener('click', e => { if (e.target.closest('#allForecasts')) { allForecasts = !allForecasts; renderNation(); } });
document.addEventListener('click', e => { if (e.target.closest('#map')) return; const pv = e.target.closest('[data-prov]'); if (pv) { selectProvince(+pv.dataset.prov); return; } const n = e.target.closest('[data-tag]'); if (n) { $('endModal').classList.remove('on'); select(n.dataset.tag); } });
document.addEventListener('keyup', e => { if (e.key === ' ' && e.target.tagName === 'BUTTON' && !e.target.closest('.modal')) e.preventDefault(); });
document.addEventListener('keydown', e => {
  if ((e.target.tagName === 'SELECT' || e.target.tagName === 'INPUT') && e.key !== 'Escape') return;
  // Space is play/pause everywhere outside dialogs, even with a button focused
  if (e.key === ' ' && e.target.tagName === 'BUTTON' && e.target.closest('.modal')) return;
  // 1, 2, 3 pick the heir on that card
  if (S.pending && S.pending.type === 'heir' && $('heirModal').classList.contains('on') && /^[1-3]$/.test(e.key)) { const b = $('heirCards').querySelector(`.heir[data-i="${+e.key - 1}"]`); if (b) b.click(); return; }
  if (S.pending && S.pending.type === 'heir' && $('heirModal').classList.contains('on') && (e.key === 'r' || e.key === 'R')) { if (!$('reroll').disabled) $('reroll').click(); return; }
  if (S.pending) return;
  if (e.key === ' ' || e.key === 'p' || e.key === 'P') { e.preventDefault(); if (document.querySelector('.modal.on')) return; timer ? stopAuto() : startAuto(); }
  if ((e.key === 'a' || e.key === 'A') && !document.querySelector('.modal.on')) { e.preventDefault(); openAlmanac(); return; }
  if (e.key === '+' || e.key === '=') setSpeed(speed + 1);
  if (e.key === '-' || e.key === '_') setSpeed(speed - 1);
  if (e.key === 'Escape') { const open = [...document.querySelectorAll('.modal.on:not(.sticky)')]; if (open.length) open.forEach(m => m.classList.remove('on')); else deselect(); }
});
// hover: province plus a card for its country
const tip = $('tip');
$('gCells').addEventListener('mousemove', e => {
  const p = e.target.closest('.cell'); if (!p) return;
  const r = S.regions[+p.dataset.i]; const c = S.C[r.owner];
  const inc = S.sumInc(S.regionIncome(r));
  const rank = S.alive().sort((a, b) => S.score(b) - S.score(a)).indexOf(c) + 1;
  const war = S.warOf(c);
  tip.innerHTML = `<div class="hd"><span class="fl" style="background:${c.color}"></span><b>${c.name}</b><span class="muted" style="margin-left:auto">#${rank} · ${ic('goldYear')}${fmt(S.score(c))} a year</span></div>
    <div class="tipr">${ic('ruler')}${c.ruler.name}${c.ruler.trait ? ` ${emblem(c.ruler)}<span class="muted">${S.TRAITS[c.ruler.trait].label}</span>` : ''}</div>
    ${war ? `<div style="color:var(--war)">${ic('war')}${war.name}</div>` : ''}${S.inCrisis(c) ? `<div style="color:#b9a3d6">${ic('civilWar')}${nm('civilWar')}</div>` : ''}
    <hr><b>${r.name}</b> <span class="muted">${r.culture}</span><br>
    ${ic('pop')}${r.pop.toFixed(1)}m ${ic('factory')}${r.fac}${r.fort ? ' ' + ic('fort') : ''}${r.coast ? ' ' + ic('trade') : ''} ${ic('goldYear')}${(inc * 4).toFixed(1)} gold a year<br>
    <span style="color:${r.unrest >= UNREST.uprising ? '#e0453a' : r.unrest >= UNREST.restless ? '#e3933c' : 'var(--muted)'}">${ic('unrest')}${nm('unrest')} ${Math.round(r.unrest)}</span>${r.integ < 1 ? ` · ${ic('settle')}<span style="color:var(--revolt)">${nm('settle')} ${Math.round(r.integ * 100)}%</span>` : ''}
    ${r.landmark ? `<br>${ic('landmark')}${r.landmark}` : ''}${r.occ ? `<br><span style="color:var(--war)">${ic('occupied')}${nm('occupied')} by ${S.C[r.occ].name}</span>` : ''}${r.core !== r.owner && S.C[r.core] && S.C[r.core].alive ? `<br><span class="muted">${S.C[r.core].name} wants it back</span>` : ''}`;
  const box = $('mapwrap').getBoundingClientRect();
  let x = e.clientX - box.left + 14, y = e.clientY - box.top + 14;
  if (x > box.width - 265) x -= 280; if (y > box.height - 200) y -= 200;
  tip.style.left = x + 'px'; tip.style.top = y + 'px'; tip.style.display = 'block';
});
$('gCells').addEventListener('mouseleave', () => tip.style.display = 'none');
$('gCells').addEventListener('click', e => { const p = e.target.closest('.cell'); if (p) selectProvince(+p.dataset.i); });
// click the sea (or anything that isn't a province) to clear the selection; Escape does the same
function deselect(){ if (selected == null && selProv == null) return; selected = null; selProv = null; tip.style.display = 'none';
  const on = document.querySelector('.pane.on').id; if (on === 'province') showTab('chron'); else render(); }
$('map').addEventListener('click', e => { if (!e.target.closest('.cell')) deselect(); });

// instant tooltips from data-tip (a name) and data-desc (one line under it). The browser's own title
// tooltips wait a second and then pop up on top of this one, so the interface never uses them.
const qtip = document.createElement('div'); qtip.className = 'qtip'; document.body.appendChild(qtip);
const qName = document.createElement('b'), qDesc = document.createElement('div'); qDesc.className = 'd'; qtip.append(qName, qDesc);
document.addEventListener('mousemove', e => {
  let el = e.target.closest && e.target.closest('[data-tip]');
  // an icon inside a labelled cell or row: the wider label says more
  const up = el && el.tagName.toLowerCase() === 'svg' && el.parentElement && el.parentElement.closest('[data-tip]');
  if (up) el = up;
  if (!el) { qtip.style.display = 'none'; return; }
  qName.textContent = el.dataset.tip; qDesc.textContent = el.dataset.desc || ''; qDesc.hidden = !el.dataset.desc;
  qtip.style.display = 'block';
  const w = qtip.offsetWidth, h = qtip.offsetHeight;
  let x = e.clientX + 12, y = e.clientY + 16;
  if (x + w > innerWidth - 8) x = e.clientX - w - 8; if (y + h > innerHeight - 8) y = e.clientY - h - 10;
  qtip.style.left = Math.max(8, x) + 'px'; qtip.style.top = Math.max(8, y) + 'px';
});
document.addEventListener('mouseleave', () => qtip.style.display = 'none');
document.addEventListener('mousedown', () => qtip.style.display = 'none');

// the map key, drawn from the registry exactly as the map draws it
(function legend(){
  const sv = inner => `<svg width="22" height="18" viewBox="-11 -9 22 18">${inner}</svg>`;
  const items = [
    [sv(glyph('factory') + `<text x="5" y="3" font-size="7.5" font-family="IBM Plex Sans" font-weight="600" fill="${INK}" stroke="${DARK}" stroke-width="2" paint-order="stroke">3</text>`), `${nm('factory')} (number = how many)`],
    [sv(glyph('fort')), nm('fort')], [sv(glyph('buildFactory')), nm('buildFactory')], [sv(glyph('buildFort')), nm('buildFort')],
    [sv(glyph('unrest', UNREST_WARM)), `${nm('unrest')} ${UNREST.restless}+`], [sv(glyph('unrest', UNREST_HOT)), `${nm('unrest')} ${UNREST.uprising}+: close to an uprising`],
    [sv(glyph('battle')), `${nm('battle')} this season`], [sv(glyph('uprising')), nm('uprising')], [sv(glyph('boom')), `${nm('boom')}: coal or railway`],
    [sv(glyph('civilWar')), nm('civilWar')], [sv(glyph('coup')), nm('coup')], [sv(glyph('leader')), nm('leader')], [sv(glyph('proclaim')), nm('proclaim')], [sv(glyph('ruin')), `${nm('ruin')}: factory or fortress destroyed`],
    [sv(REG.capital.draw), nm('capital')], [sv(glyph('landmark')), nm('landmark')],
    [sv(`<rect x="-10" y="-7" width="20" height="14" rx="3" fill="rgba(20,24,30,.92)" stroke="#c9a45c" stroke-width="1.2"/><g transform="translate(-4.5,0)">${glyph('army')}</g><text x="1" y="3" font-size="7" font-family="IBM Plex Sans" fill="${INK}">80</text>`), `${nm('army')} in thousands, at the capital in wartime`],
    [sv(REG.front.draw), nm('front')],
    [sv(`<rect x="-9" y="-6" width="18" height="12" fill="#8a8f99"/><rect x="-9" y="-6" width="18" height="12" fill="url(#settle)"/>`), `Not yet ${nm('settle').toLowerCase()}: pays little`],
    [sv(`<rect x="-9" y="-6" width="18" height="12" fill="#8a8f99"/><rect x="-9" y="-6" width="18" height="12" fill="url(#occ-key)"/>`), `${nm('occupied')}: striped in the occupier's colour`],
    [sv(REG.goal.draw), nm('goal')],
    [sv(REG.sea.draw), nm('sea')],
  ];
  $('legend').innerHTML = items.map(([g, t]) => `<div>${g}<span>${t}</span></div>`).join('');
})();

renderChips();
// a fixed scene for comparing screenshots: index.html#seed=1848&to=1884&play=FRA plays that world
// to that year (heirs are taken first in line) and skips the start screen
const scene = Object.fromEntries(new URLSearchParams(location.hash.slice(1)));
if (scene.seed || scene.to) {
  newWorld(+scene.seed || 1848, scene.play || undefined);
  const to = +scene.to || RULES.start;
  while (!S.over && S.year < to) { if (S.pending) S.chooseHeir(0); S.step(); }
  if (S.pending) S.chooseHeir(0);
  $('heirModal').classList.remove('on'); render();
} else { newWorld(1 + Math.floor(Math.random() * 99999)); showStart(); }
