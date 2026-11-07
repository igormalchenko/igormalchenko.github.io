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
const statTile = (icon, label, value, color) => `<div class="stat">${ic(icon, 'lg')}<div><small>${label}</small><b${color ? ` style="color:${color}"` : ''}>${value}</b></div></div>`;
const emblem = t => t ? `<svg class="emb" viewBox="-8 -8 16 16" role="img" aria-label="${TRAITS[t].label}"><title>${TRAITS[t].label}</title><circle r="7" fill="#1a1f26" stroke="#c9a45c" stroke-width="1"/>${EMB[t]}</svg>` : '';

function renderPowers(){
  const cs = S.alive().sort((a, b) => S.score(b) - S.score(a));
  const lead = cs[0];
  const board = (icon, title, val, f) => { const top = cs.slice().sort((a, b) => val(b) - val(a)).slice(0, 3);
    return `<div class="board"><small>${ic(icon)}${title}</small>${top.map((c, i) => `<div><span>${i + 1}. ${nameSpan(c.tag)}</span><span>${f(val(c))}</span></div>`).join('')}</div>`; };
  const boards = `<div class="leader">${ic('score', 'lg')}<div>Leading: ${nameSpan(lead.tag)}<br><span>${fmt(S.score(lead))} gold a year</span></div></div><div class="boards">
    ${board('army', 'Largest army', c => c.army, v => fmt(v) + 'k')}
    ${board('factory', 'Most factories', c => S.facOf(c), v => v)}
    ${board('province', 'Most provinces', c => S.regionsOf(c).length, v => v)}
    ${board('gold', 'Fullest treasury', c => c.treasury, v => fmt(v))}</div>`;
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
    <h3>${ic('score')}Score: income per year</h3><div class="muted" style="font-size:12px">The race every nation is running. Today's top eight.</div>${svg}
    <table><thead><tr><th>#</th><th>Nation</th><th title="Score: gold a year">${ic('score')}</th><th title="Provinces">${ic('province')}</th><th title="Factories">${ic('factory')}</th><th title="Army (thousands)">${ic('army')}</th><th title="Unrest">${ic('unrest')}</th></tr></thead><tbody>${rows}</tbody></table>
    <h3 style="margin-top:14px">${ic('dream')}National dreams</h3>${uni}`;
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
      <div class="muted" style="font-size:12px">${c.alive ? `${ic('score')}${fmt(S.score(c))} a year · rank ${S.alive().sort((a, b) => S.score(b) - S.score(a)).indexOf(c) + 1} of ${S.alive().length}` : 'Gone from the map'}${war ? ` · ${ic('war')}<em>${war.name}</em>` : ''}</div></div></div>
    <div class="rulercard"><div class="rname">${ic('ruler', 'lg')}<div><small>Ruler since ${c.ruler.since}</small><b>${c.ruler.name}</b></div>${emblem(c.ruler.trait)}</div>
      ${c.ruler.trait ? `<div class="trait"><b>${S.TRAITS[c.ruler.trait].label}.</b> ${S.TRAITS[c.ruler.trait].desc}.</div>` : ''}
      <div class="pers">
        <span title="How many years ahead this ruler counts gains and costs">${ic('patience')}Patience</span><div class="barx"><i style="width:${Math.round(c.ruler.pat * 100)}%"></i></div><span class="muted">${H} yrs</span>
        <span title="How much a possible loss scares this ruler">${ic('risk')}Risk</span><div class="barx"><i style="width:${Math.round(c.ruler.risk * 100)}%"></i></div><span class="muted">${c.ruler.risk > 0.6 ? 'gambler' : c.ruler.risk < 0.4 ? 'cautious' : 'measured'}</span>
        <span title="Whether this ruler sees his odds of winning a war as better or worse than they are">${ic('judgment')}Judgment</span><div class="barx mid"><i style="left:${50 + Math.min(0, c.ruler.bias) * 50}%;width:${Math.abs(c.ruler.bias) * 50}%"></i></div><span class="muted">${c.ruler.bias > 0.15 ? 'overconfident' : c.ruler.bias < -0.15 ? 'underconfident' : 'clear-eyed'}</span>
      </div>${S.inCrisis(c) ? `<div class="trait" style="color:#c9b3e6">${ic('revolt')}Civil war: the army fights at half strength.</div>` : ''}</div>
    <div class="stats">
      ${statTile('gold', 'Treasury', fmt(c.treasury), c.treasury < 0 ? 'var(--war)' : '')}
      ${statTile('army', 'Army', fmt(c.army) + 'k')}
      ${statTile('factory', 'Factories', S.facOf(c))}
      ${statTile('pop', 'People', S.popOf(c).toFixed(1) + 'm')}
      ${statTile('unrest', 'Unrest', Math.round(S.unrestOf(c)), S.unrestOf(c) >= 40 ? 'var(--revolt)' : '')}
      ${statTile('province', 'Provinces', rs.length)}
    </div>
    ${dreams.length ? `<div class="dreamline">${ic('dream')}Dreams of <b>${dreams.map(d => d.title).join('</b> and <b>')}</b></div>` : ''}
    <h3>${ic('gold')}Last season's budget</h3>
    <div class="ledger">
      ${line('pop', 'Taxes', lg.tax)}${line('factory', 'Factory output', lg.fac)}${line('trade', war ? 'Sea trade (blockaded)' : 'Sea trade', lg.trade)}${line('upkeep', 'Army upkeep', -lg.upkeep)}
      ${lg.waste ? line('waste', 'Court extravagance', -lg.waste) : ''}${sp.build ? line('build', 'Construction', -sp.build) : ''}${sp.army ? line('army', 'Recruiting', -sp.army) : ''}${sp.reform ? line('reform', 'Reforms', -sp.reform) : ''}
      ${line('gold', 'Net', net, 'net')}
      <div class="lgnote">Taxes and output above are already reduced by ${ic('army')}${lg.lostWork.toFixed(1)} (soldiers aren't working) and ${ic('province')}${lg.lostAdmin.toFixed(1)} (running ${rs.length} provinces).</div>
    </div>
    <h3>${ic('judgment')}Forecasts${c.thoughtsWhen ? ` <span class="muted" style="font:12px var(--body)">${c.thoughtsWhen}, gold over ${H} years</span>` : ''}</h3>
    <div class="think">${(c.thoughts || []).length ? c.thoughts.map(t => `<div class="th ${t.chosen ? 'chosen' : ''}"><div class="row"><b>${ic(OPT_IC[t.type])}${t.label}${t.chosen ? '<span class="tag">DONE</span>' : ''}</b><span style="color:${t.ev > 0 ? 'var(--peace)' : t.ev < 0 ? '#e08070' : 'var(--muted)'}">${t.ev > 0 ? '+' : ''}${t.ev}</span></div><div class="why">${t.why}</div><div class="barx"><i style="width:${Math.abs(t.ev) / maxEv * 100}%;background:${t.ev >= 0 ? 'var(--peace)' : '#c0675b'}"></i></div></div>`).join('')
      : '<div class="muted">No decisions yet. Advance a season.</div>'}</div>
    <h3>${ic('province')}Provinces</h3><div class="provs"><div class="prov head"><span>Province</span><span>Buildings</span><span>Unrest</span></div>${rs.map(prov).join('') || '<span class="muted">none</span>'}</div>
    <h3>${ic('ally')}Friends and enemies</h3>
    <div style="font-size:12.5px;margin-bottom:8px">${ic('rival')}Biggest threat: ${c.rival && S.C[c.rival].alive ? nameSpan(c.rival) : '<span class="muted">none</span>'}<br>${ic('ally')}Allies: ${c.allies.size ? [...c.allies].map(nameSpan).join(', ') : '<span class="muted">none</span>'}${c.guarantee && S.year < c.guarantee.until ? ` <span class="muted">(${S.C[c.guarantee.by].name} guarantees its independence)</span>` : ''}</div>
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
    const why = r.core === o.tag ? 'lost province' : o.culture === r.culture || o.acc.has(r.culture) ? `same people (${r.culture})` : S.dreamsOf(o).some(d => d.pset.has(r.id)) ? `dream of ${S.dreamsOf(o).find(d => d.pset.has(r.id)).title}` : 'national programme';
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
      ${statTile('pop', 'People', r.pop.toFixed(1) + 'm')}
      ${statTile('factory', 'Factories', r.fac + (r.build && r.build.type === 'factory' ? ' +1' : ''))}
      ${statTile('fort', 'Fortress', r.fort ? 'yes' : r.build && r.build.type === 'fort' ? 'building' : 'no')}
      ${statTile('gold', 'Gold a year', yr.toFixed(1), r.occ ? 'var(--war)' : '')}
      ${statTile('unrest', 'Unrest', u, u >= 65 ? '#e0453a' : u >= 40 ? '#e3933c' : '')}
      ${statTile('settle', 'Integrated', Math.round(r.integ * 100) + '%', r.integ < 1 ? 'var(--revolt)' : '')}
    </div>
    <h3>${ic('gold')}Where its gold comes from</h3>
    <div class="ledger">
      <div class="lg"><span>${ic('pop')}Taxes</span><span>${(inc.tax * 4).toFixed(1)}</span></div>
      <div class="lg"><span>${ic('factory')}Factory output</span><span>${(inc.fac * 4).toFixed(1)}</span></div>
      <div class="lg"><span>${ic('trade')}Sea trade</span><span>${(inc.trade * 4).toFixed(1)}</span></div>
      <div class="lgnote">${r.integ < 1 ? `${ic('settle')}Newly conquered: pays ${Math.round((0.1 + 0.9 * r.integ) * 100)}% until fully integrated. ` : ''}${ic('culture')}${r.culture}-speaking${foreign ? `, a restless minority under ${c.name}` : `, content under ${c.name}`}.${r.occ ? ` ${ic('occupied')}<span style="color:var(--war)">Occupied by ${S.C[r.occ].name}: pays nothing until freed (normally ${(S.sumInc(S.regionIncome(r, c, { ignoreOcc: true })) * 4).toFixed(1)} a year).</span>` : ''}${r.build ? ` ${ic('build')}Building a ${r.build.type === 'factory' ? 'factory' : 'fortress'}, ${r.build.left} season${r.build.left > 1 ? 's' : ''} left.` : ''}</div>
    </div>
    <h3>${ic('rival')}Who wants it</h3><div class="claims">${claims || '<span class="muted">No one has a claim.</span>'}</div>
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
  $('endTitle').innerHTML = `${cs[0].name} wins`;
  $('endBody').innerHTML = `<p>The armistice of ${S.year}. ${nameSpan(cs[0].tag)} ends the age with the largest income in Europe, ${ic('score')}${fmt(S.score(cs[0]))} gold a year, under ${cs[0].ruler.name}.</p>
    <table><thead><tr><th>#</th><th>Nation</th><th>${ic('score')}</th><th>${ic('province')}</th><th>${ic('factory')}</th><th>${ic('army')}</th></tr></thead><tbody>${rows}</tbody></table>
    <p style="margin-top:12px">${ic('war')}${S.stats.wars} wars · ${ic('rival')}${S.stats.battles} battles · ${ic('revolt')}${S.stats.revolts} uprisings · ${ic('dead')}${Math.round(S.stats.dead || 0)} million dead in the fighting · ${ic('ruler')}${S.stats.rulers} changes of ruler</p>
    <p>${S.DREAMS.filter(d => d.done).length ? `${ic('dream')}Dreams fulfilled: ${S.DREAMS.filter(d => d.done).map(d => d.title).join(', ')}. ` : ''}${born.length ? `Born in revolution: ${born.map(c => nameSpan(c.tag)).join(', ')}. ` : ''}${restored.length ? `Restored by revolution: ${restored.map(c => nameSpan(c.tag)).join(', ')}. ` : ''}${dead.length ? `Gone from the map: ${dead.map(c => c.name).join(', ')}.` : ''}</p>`;
  $('endModal').classList.add('on');
}
