function renderChips(){
  $('chips').innerHTML = Object.entries(FILTERS).map(([k, f]) => `<button class="chip ${f.on ? 'on' : ''}" data-f="${k}" aria-pressed="${!!f.on}">${ic(f.icon)}${f.label}</button>`).join('');
}
function logHtml(items, limit = 400){
  let html = '', y = null, count = 0;
  for (let i = items.length - 1; i >= 0 && count < limit; i--, count++) {
    const l = items[i];
    if (l.y !== y) { y = l.y; html += `<div class="yr">${y}</div>`; }
    html += `<div class="ev ${l.t}"><span class="evi">${ic(TYPE_IC[l.t])}</span><div><span class="when">${S.SEASONS[l.q]}</span>${decorate(l.h)}</div></div>`;
  }
  return html;
}
function renderLog(){
  const allowed = new Set(Object.values(FILTERS).filter(f => f.on).flatMap(f => f.types));
  $('log').innerHTML = logHtml(S.log.filter(l => allowed.has(l.t))) || '<div class="empty">Nothing to show with these filters.</div>';
}
const statTile = (icon, value, color) => `<div class="stat">${ic(icon, 'lg')}<div><small>${nm(icon)}</small><b${color ? ` style="color:${color}"` : ''}>${value}</b></div></div>`;
const emblem = t => t ? `<svg class="emb" viewBox="-8 -8 16 16" role="img" aria-label="${TRAITS[t].label}"><title>${TRAITS[t].label}</title>${EMB_BADGE}${EMB[t]}</svg>` : '';

// ---------- the player's choices ----------
// one line of character per heir, then what it does in the game
const HEIR_VIBE = {
  warmonger: 'Wants to bathe in the blood of his enemies.',
  builder: 'Talks of nothing but coal, iron and railways.',
  paranoid: 'Sleeps with a pistol and trusts no neighbour.',
  revanchist: 'Has sworn to take back every acre ever lost.',
  spendthrift: 'Wants wine, opera and a new palace every spring.',
  reformer: 'Reads the liberal papers, and agrees with them.',
  prudent: 'Patient and careful; rules for his grandchildren.',
  bold: 'A gambler at cards, in love and in war.',
};
const HEIR_FX = { prudent: 'Counts gains far ahead and shies away from risky wars', bold: 'Wants results fast and fears no loss' };
function showHeir(){
  const p = S.pending, c = S.C[p.tag];
  const card = (r, i) => { const yrs = Math.round(8 + r.pat * 22);
    return `<button class="heir" data-i="${i}">
      <div class="hh">${r.trait ? emblem(r.trait) : ic('ruler', 'lg')}<b>${r.name}</b></div>
      <p class="vibe">${HEIR_VIBE[r.slot]}</p>
      <p class="fx">${r.trait ? S.TRAITS[r.trait].desc : HEIR_FX[r.slot]}.</p>
      <div class="tags"><span>${ic('patience')}plans ${yrs} years ahead</span><span>${ic('risk')}${r.risk > 0.6 ? 'gambler' : r.risk < 0.4 ? 'cautious' : 'measured'}</span></div>
    </button>`; };
  $('heirTitle').innerHTML = p.opening ? `Who rules ${c.name} in 1836?` : `${p.old} is dead`;
  $('heirSub').textContent = p.opening ? 'Pick your ruler. The ministers run everything else.' : 'Who rules next?';
  $('heirCards').innerHTML = p.options.map(card).join('');
  $('heirModal').classList.add('on');
  $('heirCards').querySelector('.heir').focus();
}
function showStart(){
  const cs = S.alive().slice().sort((a, b) => S.score(b) - S.score(a));
  const big = ['GBR', 'FRA', 'PRU', 'AUS', 'RUS', 'TUR'];
  const btn = c => `<button class="pick" data-play="${c.tag}"><span class="fl" style="background:${c.color}"></span>${c.name}</button>`;
  $('startBody').innerHTML = `<h3>Great powers</h3><div class="picks">${cs.filter(c => big.includes(c.tag)).map(btn).join('')}</div>
    <h3>Smaller nations <span class="muted" style="font:12px var(--body)">harder</span></h3><div class="picks">${cs.filter(c => !big.includes(c.tag)).map(btn).join('')}</div>`;
  $('startModal').classList.add('on');
}

// left strip: one nation at a glance (the selected one, else the leader)
function renderSide(){
  const c = S.player ? S.C[S.player] : S.C[selected] && S.C[selected].alive ? S.C[selected] : S.C[S.leader] || S.alive()[0]; if (!c) return;
  const ranked = S.alive().sort((a, b) => S.score(b) - S.score(a)), rank = ranked.indexOf(c) + 1;
  const now = S.score(c), H = S.history, ago = H.length > 1 ? H[H.length - 2].p[c.tag] : null;
  const vals = H.map(h => h.p[c.tag]).filter(v => v != null).concat(now);
  const W = 180, Hh = 38, mx = Math.max(...vals), mn = Math.min(...vals), span = Math.max(1, mx - mn);
  const pts = vals.map((v, i) => `${(vals.length > 1 ? i / (vals.length - 1) * W : W).toFixed(1)},${(Hh - 3 - (v - mn) / span * (Hh - 6)).toFixed(1)}`).join(' ');
  const war = S.warOf(c), u = S.unrestOf(c);
  const row = (icon, v, color) => `<div class="row"><span>${ic(icon)}${nm(icon)}</span><span${color ? ` style="color:${color}"` : ''}>${v}</span></div>`;
  const d = ago != null ? Math.round(now - ago) : 0;
  $('side').innerHTML = `
    <div><div class="who">${S.player ? (c.alive ? 'You' : 'You · gone from the map') : c.tag === selected ? 'Selected' : 'Leading'}</div>
      <div class="nm"><span class="fl" style="background:${c.color}"></span>${nameSpan(c.tag)}</div>
      <div class="rl">${ic('ruler')}${c.ruler.name} ${emblem(c.ruler.trait)}</div></div>
    <div class="inc"><b>${fmt(now)}</b><span>${nm('goldYear').toLowerCase()}</span>
      <div class="sub"><span>#${rank} of ${ranked.length}</span><span style="color:${d > 0 ? 'var(--peace)' : d < 0 ? '#e08070' : 'inherit'}">${d > 0 ? '+' : d < 0 ? '−' : '±'}${Math.abs(d)} on last year</span></div>
      <svg class="spark" viewBox="0 0 ${W} ${Hh}" preserveAspectRatio="none" aria-hidden="true"><polyline points="${pts}" fill="none" stroke="${c.color}" stroke-width="1.6" vector-effect="non-scaling-stroke"/></svg></div>
    ${war ? `<div class="war">${ic('war')}${war.name}</div>` : ''}
    <div class="rows">
      ${row('gold', fmt(c.treasury), c.treasury < 0 ? 'var(--war)' : '')}
      ${row('army', fmt(c.army) + 'k')}
      ${row('factory', S.facOf(c))}
      ${row('province', S.regionsOf(c).length)}
      ${u >= 30 ? row('unrest', Math.round(u), u >= 65 ? '#e0453a' : '#e3933c') : ''}
    </div>`;
}

function renderPowers(){
  const cs = S.alive().sort((a, b) => S.score(b) - S.score(a));
  const lead = cs[0];
  const board = (icon, title, val, f) => { const top = cs.slice().sort((a, b) => val(b) - val(a)).slice(0, 3);
    return `<div class="board"><small>${ic(icon)}${title}</small>${top.map((c, i) => `<div><span>${i + 1}. ${nameSpan(c.tag)}</span><span>${f(val(c))}</span></div>`).join('')}</div>`; };
  const boards = `<div class="leader">${ic('leader', 'lg')}<div>Leading: ${nameSpan(lead.tag)}<br><span>${fmt(S.score(lead))} gold a year</span></div></div><div class="boards">
    ${board('army', 'Largest army', c => c.army, v => fmt(v) + 'k')}
    ${board('factory', 'Most factories', c => S.facOf(c), v => v)}
    ${board('province', 'Most provinces', c => S.regionsOf(c).length, v => v)}
    ${board('gold', 'Most gold', c => c.treasury, v => fmt(v))}</div>`;
  const uni = S.unifyProgress().map(u => {
    const pct = u.done ? 100 : Math.min(100, u.n / u.need * 100);
    const who = u.done ? `${nameSpan(u.done.tag)} proclaimed` : u.lead ? `${nameSpan(u.lead.tag)} holds ${u.n} of ${u.need} needed` : `<span class="muted">no ${u.cul} state to lead it</span>`;
    return `<div class="uni"><div class="row"><b>${ic('dream')}${u.title}</b><span class="muted">${who}</span></div><div class="barx"><i style="width:${pct}%;background:${u.done ? 'var(--peace)' : 'var(--brass)'}"></i></div></div>`;
  }).join('');
  const top = cs.slice(0, 8).map(c => c.tag);
  const H = S.history; const W = 360, Hh = 150, pad = { l: 30, r: 8, t: 8, b: 18 };
  const y0 = H[0].y, y1 = Math.max(H[H.length - 1].y, y0 + 10);
  let maxP = 10; H.forEach(h => top.forEach(t => { if (h.p[t] > maxP) maxP = h.p[t]; }));
  const niceMax = Math.ceil(maxP / 50) * 50;
  const X = y => pad.l + (y - y0) / (y1 - y0) * (W - pad.l - pad.r), Y = v => Hh - pad.b - v / niceMax * (Hh - pad.t - pad.b);
  let svg = `<svg class="chart" viewBox="0 0 ${W} ${Hh}" width="100%">`;
  for (let k = 0; k <= 4; k++) { const v = niceMax * k / 4; svg += `<line x1="${pad.l}" x2="${W - pad.r}" y1="${Y(v)}" y2="${Y(v)}" stroke="#262d36"/><text x="${pad.l - 4}" y="${Y(v) + 3}" text-anchor="end">${Math.round(v)}</text>`; }
  for (let yy = Math.ceil(y0 / 20) * 20; yy <= y1; yy += 20) svg += `<text x="${X(yy)}" y="${Hh - 4}" text-anchor="middle">${yy}</text>`;
  top.forEach(t => { const pts = H.filter(h => h.p[t] != null).map(h => `${X(h.y).toFixed(1)},${Y(h.p[t]).toFixed(1)}`); if (!pts.length) return;
    const c = S.C[t]; const last = pts[pts.length - 1].split(',');
    svg += `<polyline points="${pts.join(' ')}" fill="none" stroke="${c.color}" stroke-width="${t === selected ? 2.8 : 1.6}" stroke-linejoin="round"/><circle cx="${last[0]}" cy="${last[1]}" r="2.6" fill="${c.color}"/>`; });
  svg += '</svg>';
  const rows = cs.map((c, i) => `<tr class="click" data-tag="${c.tag}"><td>${i + 1}</td><td><span class="sw" style="background:${c.color};margin-right:6px"></span>${c.name}</td>
    <td><b>${fmt(S.score(c))}</b></td><td>${S.regionsOf(c).length}</td><td>${S.facOf(c)}</td><td>${fmt(c.army)}</td><td style="color:${S.unrestOf(c) >= 40 ? 'var(--revolt)' : 'inherit'}">${Math.round(S.unrestOf(c))}</td></tr>`).join('');
  $('powers').innerHTML = `${boards}
    <h3>${ic('goldYear')}${nm('goldYear')}</h3><div class="muted" style="font-size:12px">The race every nation is running. Today's top eight.</div>${svg}
    <table><thead><tr><th>#</th><th>Nation</th><th>${ic('goldYear')}</th><th>${ic('province')}</th><th>${ic('factory')}</th><th>${ic('army')}</th><th>${ic('unrest')}</th></tr></thead><tbody>${rows}</tbody></table>
    <h3 style="margin-top:14px">${ic('dream')}${nm('dream')}s</h3>${uni}`;
}

function renderNation(){
  const c = S.C[selected]; const box = $('nation'); if (!c) return;
  const rs = S.regionsOf(c), war = S.warOf(c);
  const lg = c.ledger || { tax: 0, fac: 0, trade: 0, upkeep: 0, lostWork: 0, lostAdmin: 0, waste: 0, spent: {} };
  const sp = lg.spent || {};
  const net = lg.tax + lg.fac + lg.trade - lg.upkeep - (lg.waste || 0) - (sp.build || 0) - (sp.army || 0) - (sp.reform || 0);
  const line = (icon, k, v, cls = '') => `<div class="lg ${cls}"><span>${icon ? ic(icon) : ''}${k}</span><span style="color:${v > 0 ? 'var(--peace)' : v < 0 ? '#e08070' : 'inherit'}">${v >= 0 ? '+' : '−'}${Math.abs(v).toFixed(1)}</span></div>`;
  const rel = S.alive().filter(o => o !== c).map(o => [o, S.rel(c.tag, o.tag)]).sort((a, b) => b[1] - a[1]);
  const relRow = ([o, v]) => `<div>${nameSpan(o.tag)}<span style="color:${v >= 0 ? 'var(--peace)' : 'var(--war)'}">${v > 0 ? '+' : ''}${Math.round(v)}</span></div>`;
  const maxEv = Math.max(1, ...(c.thoughts || []).map(t => Math.abs(t.ev)));
  const H = S.horizon(c);
  const dreams = S.dreamsOf(c);
  const prov = r => { const u = Math.round(r.unrest);
    return `<div class="prov click" data-prov="${r.i}"><span>${r.name}${r.culture !== c.culture && !c.acc.has(r.culture) ? ` <span class="muted">${r.culture}</span>` : ''}${r.integ < 1 ? ` ${ic('settle')}` : ''}${r.occ ? ` ${ic('occupied')}` : ''}</span>
      <span>${r.fac ? `${ic('factory')}${r.fac}` : ''}${r.fort ? ic('fort') : ''}${r.build ? ic('build') : ''}</span><span class="un" style="color:${u >= 65 ? '#e0453a' : u >= 40 ? '#e3933c' : 'var(--muted)'}">${u >= 40 ? ic('unrest') : ''}${u}</span></div>`; };
  box.innerHTML = `
    <div class="nation-head"><div class="flag" style="background:${c.color}"></div><div><h2>${c.name}</h2>
      <div class="muted" style="font-size:12px">${c.alive ? `${ic('goldYear')}${fmt(S.score(c))} gold a year · rank ${S.alive().sort((a, b) => S.score(b) - S.score(a)).indexOf(c) + 1} of ${S.alive().length}` : 'Gone from the map'}${war ? ` · ${ic('war')}<em>${war.name}</em>` : ''}</div></div></div>
    <div class="rulercard"><div class="rname">${ic('ruler', 'lg')}<div><small>${nm('ruler')} since ${c.ruler.since}</small><b>${c.ruler.name}</b></div>${emblem(c.ruler.trait)}</div>
      ${c.ruler.trait ? `<div class="trait"><b>${S.TRAITS[c.ruler.trait].label}.</b> ${S.TRAITS[c.ruler.trait].desc}.</div>` : ''}
      <div class="pers">
        <span title="${REG.patience.desc}">${ic('patience')}${nm('patience')}</span><div class="barx"><i style="width:${Math.round(c.ruler.pat * 100)}%"></i></div><span class="muted">${H} yrs</span>
        <span title="${REG.risk.desc}">${ic('risk')}${nm('risk')}</span><div class="barx"><i style="width:${Math.round(c.ruler.risk * 100)}%"></i></div><span class="muted">${c.ruler.risk > 0.6 ? 'gambler' : c.ruler.risk < 0.4 ? 'cautious' : 'measured'}</span>
        <span title="${REG.judgment.desc}">${ic('judgment')}${nm('judgment')}</span><div class="barx mid"><i style="left:${50 + Math.min(0, c.ruler.bias) * 50}%;width:${Math.abs(c.ruler.bias) * 50}%"></i></div><span class="muted">${c.ruler.bias > 0.15 ? 'overconfident' : c.ruler.bias < -0.15 ? 'underconfident' : 'clear-eyed'}</span>
      </div>${S.inCrisis(c) ? `<div class="trait" style="color:#c9b3e6">${ic('civilWar')}${nm('civilWar')}: the army fights at half strength.</div>` : ''}</div>
    <div class="stats">
      ${statTile('gold', fmt(c.treasury), c.treasury < 0 ? 'var(--war)' : '')}
      ${statTile('army', fmt(c.army) + 'k')}
      ${statTile('factory', S.facOf(c))}
      ${statTile('pop', S.popOf(c).toFixed(1) + 'm')}
      ${statTile('unrest', Math.round(S.unrestOf(c)), S.unrestOf(c) >= 40 ? 'var(--revolt)' : '')}
      ${statTile('province', rs.length)}
    </div>
    ${dreams.length ? `<div class="dreamline">${ic('dream')}Dreams of <b>${dreams.map(d => d.title).join('</b> and <b>')}</b></div>` : ''}
    <h3>${ic('gold')}Last season's budget</h3>
    <div class="ledger">
      ${line('taxes', nm('taxes'), lg.tax)}${line('factory', 'Factory output', lg.fac)}${line('trade', war ? nm('trade') + ' (blockaded)' : nm('trade'), lg.trade)}${line('upkeep', nm('upkeep'), -lg.upkeep)}
      ${lg.waste ? line('waste', nm('waste'), -lg.waste) : ''}${sp.build ? line('build', nm('build'), -sp.build) : ''}${sp.army ? line('army', 'Recruiting', -sp.army) : ''}${sp.reform ? line('reform', nm('reform'), -sp.reform) : ''}
      ${line('gold', 'Net', net, 'net')}
      <div class="lgnote">Taxes and output above are already reduced by ${ic('army')}${lg.lostWork.toFixed(1)} (men in the army aren't working) and ${ic('province')}${lg.lostAdmin.toFixed(1)} (running ${rs.length} provinces).</div>
    </div>
    <h3>${ic('forecast')}${nm('forecast')}${c.thoughtsWhen ? ` <span class="muted" style="font:12px var(--body)">${c.thoughtsWhen}, gold over ${H} years</span>` : ''}</h3>
    <div class="think">${(c.thoughts || []).length ? c.thoughts.map(t => `<div class="th ${t.chosen ? 'chosen' : ''}"><div class="row"><b>${ic(OPT_IC[t.type])}${t.label}${t.chosen ? '<span class="tag">Done</span>' : ''}</b><span style="color:${t.ev > 0 ? 'var(--peace)' : t.ev < 0 ? '#e08070' : 'var(--muted)'}">${t.ev > 0 ? '+' : ''}${t.ev}</span></div><div class="why">${t.why}</div><div class="barx"><i style="width:${Math.abs(t.ev) / maxEv * 100}%;background:${t.ev >= 0 ? 'var(--peace)' : '#c0675b'}"></i></div></div>`).join('')
      : '<div class="muted">No decisions yet. Advance a season.</div>'}</div>
    <h3>${ic('province')}Provinces</h3><div class="provs"><div class="prov head"><span>Province</span><span>Buildings</span><span>Unrest</span></div>${rs.map(prov).join('') || '<span class="muted">none</span>'}</div>
    <h3>${ic('ally')}Friends and enemies</h3>
    <div style="font-size:12.5px;margin-bottom:8px">${ic('rival')}${nm('rival')}: ${c.rival && S.C[c.rival].alive ? nameSpan(c.rival) : '<span class="muted">none</span>'}<br>${ic('ally')}Allies: ${c.allies.size ? [...c.allies].map(nameSpan).join(', ') : '<span class="muted">none</span>'}${c.guarantee && S.year < c.guarantee.until ? ` <span class="muted">(${S.C[c.guarantee.by].name} guarantees its independence)</span>` : ''}</div>
    <div class="rels"><div class="muted">Friendliest</div><div class="muted">Most hostile</div>
      ${rel.slice(0, 4).map((x, i) => relRow(x) + (rel[rel.length - 1 - i] ? relRow(rel[rel.length - 1 - i]) : '<div></div>')).join('')}</div>`;
}

function renderProvince(){
  const box = $('province');
  if (selProv == null) { box.innerHTML = '<div class="empty">Click a province on the map.</div>'; return; }
  const r = S.regions[selProv], c = S.C[r.owner];
  const inc = S.regionIncome(r), yr = S.sumInc(inc) * 4;
  const u = Math.round(r.unrest);
  const claims = S.alive().filter(o => o !== c && S.claim(o, r) > 0).map(o => {
    const why = r.core === o.tag ? 'lost province' : o.culture === r.culture || o.acc.has(r.culture) ? `same people (${r.culture})` : S.dreamsOf(o).some(d => d.pset.has(r.id)) ? `dream of ${S.dreamsOf(o).find(d => d.pset.has(r.id)).title}` : `${ic('programme')}national programme`;
    return `<div>${nameSpan(o.tag)} <span class="muted">${why}</span></div>`; }).join('');
  const nb = r.nb.map(j => { const x = S.regions[j]; const sea = GEO.naval.some(([a, b]) => (a === r.i && b === j) || (b === r.i && a === j));
    return `<span class="nbx click" data-prov="${j}">${sea ? ic('sea') : ''}${x.name} <span class="sw" style="background:${S.C[x.owner].color}"></span></span>`; }).join('');
  const pat = `<i>${r.name}</i>`;
  const hist = logHtml(S.log.filter(l => l.h.includes(pat)), 60);
  const foreign = !S.isAccepted(c, r.culture);
  box.innerHTML = `
    <div class="nation-head"><div class="flag" style="background:${c.color}"></div><div><h2>${r.name}</h2>
      <div class="muted" style="font-size:12px">Held by ${nameSpan(c.tag)}${r.coast ? ` · ${ic('trade')}seaport` : ''}</div></div></div>
    <div class="stats">
      ${statTile('pop', r.pop.toFixed(1) + 'm')}
      ${statTile('factory', r.fac + (r.build && r.build.type === 'factory' ? ' +1' : ''))}
      ${statTile('fort', r.fort ? 'yes' : r.build && r.build.type === 'fort' ? 'building' : 'no')}
      ${statTile('goldYear', yr.toFixed(1), r.occ ? 'var(--war)' : '')}
      ${statTile('unrest', u, u >= 65 ? '#e0453a' : u >= 40 ? '#e3933c' : '')}
      ${statTile('settle', Math.round(r.integ * 100) + '%', r.integ < 1 ? 'var(--revolt)' : '')}
    </div>
    <h3>${ic('gold')}Where its gold comes from</h3>
    <div class="ledger">
      <div class="lg"><span>${ic('taxes')}${nm('taxes')}</span><span>${(inc.tax * 4).toFixed(1)}</span></div>
      <div class="lg"><span>${ic('factory')}Factory output</span><span>${(inc.fac * 4).toFixed(1)}</span></div>
      <div class="lg"><span>${ic('trade')}${nm('trade')}</span><span>${(inc.trade * 4).toFixed(1)}</span></div>
      <div class="lgnote">${r.integ < 1 ? `${ic('settle')}Newly conquered: pays ${Math.round((0.1 + 0.9 * r.integ) * 100)}% until fully integrated. ` : ''}${ic('culture')}${r.culture}-speaking${foreign ? `, a restless minority under ${c.name}` : `, content under ${c.name}`}.${r.occ ? ` ${ic('occupied')}<span style="color:var(--war)">Occupied by ${S.C[r.occ].name}: pays nothing until freed (normally ${(S.sumInc(S.regionIncome(r, c, { ignoreOcc: true })) * 4).toFixed(1)} a year).</span>` : ''}${r.build ? ` ${ic('build')}Building a ${r.build.type === 'factory' ? 'factory' : 'fortress'}, ${r.build.left} season${r.build.left > 1 ? 's' : ''} left.` : ''}</div>
    </div>
    <h3>${ic('claim')}${nm('claim')}</h3><div class="claims">${claims || '<span class="muted">No one has a claim.</span>'}</div>
    <h3>${ic('province')}Neighbours</h3><div class="nbs">${nb}</div>
    <h3>${ic('event')}What happened here</h3>${hist || '<div class="muted">Nothing yet.</div>'}`;
}

function showEnd(){
  const cs = S.alive().sort((a, b) => S.score(b) - S.score(a));
  const born = Object.values(S.C).filter(c => c.born > 1836 && c.alive && !c.restored);
  const restored = Object.values(S.C).filter(c => c.restored && c.alive);
  const dead = Object.values(S.C).filter(c => !c.alive);
  const rows = cs.slice(0, 8).map((c, i) => { const d = S.regionsOf(c).length - c.startRegions;
    return `<tr><td>${i + 1}</td><td>${nameSpan(c.tag)}</td><td><b>${fmt(S.score(c))}</b></td><td>${S.regionsOf(c).length} <span style="color:${d > 0 ? 'var(--peace)' : d < 0 ? 'var(--war)' : 'var(--muted)'}">(${d > 0 ? '+' : ''}${d})</span></td><td>${S.facOf(c)}</td><td>${fmt(c.army)}</td></tr>`; }).join('');
  const me = S.player && S.C[S.player], myRank = me ? cs.indexOf(me) + 1 : 0;
  $('endTitle').innerHTML = me ? (myRank === 1 ? `${me.name} wins` : `${cs[0].name} wins; you finish ${myRank ? '#' + myRank : 'gone from the map'}`) : `${cs[0].name} wins`;
  $('endBody').innerHTML = `<p>The armistice of ${S.year}. ${nameSpan(cs[0].tag)} ends the age with the most gold a year in Europe, ${ic('goldYear')}${fmt(S.score(cs[0]))} gold a year, under ${cs[0].ruler.name}.</p>
    <table><thead><tr><th>#</th><th>Nation</th><th>${ic('goldYear')}</th><th>${ic('province')}</th><th>${ic('factory')}</th><th>${ic('army')}</th></tr></thead><tbody>${rows}</tbody></table>
    <p style="margin-top:12px">${ic('war')}${S.stats.wars} wars · ${ic('war')}${S.stats.battles} battles · ${ic('uprising')}${S.stats.revolts} uprisings · ${ic('dead')}${Math.round(S.stats.dead || 0)} million dead in the fighting · ${ic('ruler')}${S.stats.rulers} changes of ruler</p>
    <p>${S.DREAMS.filter(d => d.done).length ? `${ic('dream')}Dreams fulfilled: ${S.DREAMS.filter(d => d.done).map(d => d.title).join(', ')}. ` : ''}${born.length ? `Born in an uprising: ${born.map(c => nameSpan(c.tag)).join(', ')}. ` : ''}${restored.length ? `Restored by an uprising: ${restored.map(c => nameSpan(c.tag)).join(', ')}. ` : ''}${dead.length ? `Gone from the map: ${dead.map(c => c.name).join(', ')}.` : ''}</p>`;
  $('endModal').classList.add('on');
}
