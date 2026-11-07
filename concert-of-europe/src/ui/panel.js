function renderChips(){
  $('chips').innerHTML = Object.entries(FILTERS).map(([k, f]) => `<button class="chip ${f.on ? 'on' : ''}" data-f="${k}" aria-pressed="${!!f.on}">${ic(f.icon)}${f.label}</button>`).join('');
}
function logHtml(items, limit = 400){
  let html = '', y = null, q = null, count = 0;
  for (let i = items.length - 1; i >= 0 && count < limit; i--, count++) {
    const l = items[i];
    if (l.y !== y) { y = l.y; q = null; html += `<div class="yr">${y}</div>`; }
    if (l.q !== q) { q = l.q; html += `<div class="sea">${S.SEASONS[q]}</div>`; }
    html += `<div class="ev ${l.t}"><span class="evi">${ic(TYPE_IC[l.t])}</span><div>${l.h}</div></div>`;
  }
  return html;
}
function renderLog(){
  const allowed = new Set(Object.values(FILTERS).filter(f => f.on).flatMap(f => f.types));
  $('log').innerHTML = logHtml(S.log.filter(l => allowed.has(l.t))) || '<div class="empty">Nothing to show with these filters.</div>';
}
const statTile = (icon, value, color) => `<div class="stat" ${tipOf(icon)}>${ic(icon, 'lg')}<b${color ? ` style="color:${color}"` : ''}>${value}</b></div>`;
// a ruler's quirk as a badge; hover names it and says what it does for this ruler
const emblem = r => r && r.trait ? `<svg class="emb" viewBox="-8 -8 16 16" role="img" aria-label="${TRAITS[r.trait].label}" ${tipAttr(TRAITS[r.trait].label, S.traitDesc(r) + '.')}>${embBadge(TRAITS[r.trait].tier)}${EMB[r.trait]}</svg>` : '';

// ---------- the player's choices ----------
// one heir per card: who he is (the title he will be known by), his character in a line, what he does
const cap1 = t => t.charAt(0).toUpperCase() + t.slice(1);
const nm2 = k => WORDS[k].name;
function showHeir(){
  const p = S.pending, c = S.C[p.tag];
  const card = (r, i) => { const t = TRAITS[r.trait].tier;
    return `<button class="heir tier${t}" data-i="${i}" style="--tc:${TIER[t].color};animation-delay:${i * 90}ms">
      <span class="key">${i + 1}</span>
      <span class="rar" ${tipOf('rarity')}>${TIER[t].name}</span>
      ${emblem(r)}
      <b class="ttl">${cap1(TRAITS[r.trait].epi)}</b><span class="who">${r.given}</span>
      <p class="vibe">${TRAITS[r.trait].vibe}</p>
      <p class="fx">${iconize(S.traitDesc(r))}.</p>
    </button>`; };
  const why = p.why ? p.why.replace(/<[^>]*>/g, '') : '';
  $('heirTitle').textContent = p.opening ? `Who rules ${c.name} in 1836?` : `Who rules ${c.name} now?`;
  $('heirSub').textContent = p.opening ? 'Pick a ruler. The ministers run everything else.'
    : `${why}${p.crisis ? ' Rival claimants will fight whoever you pick.' : ''}`;
  $('heirCards').innerHTML = p.options.map(card).join('');
  // three free rerolls a game; the fourth will be for sale (no payment yet)
  const left = S.rerolls || 0;
  $('reroll').textContent = left > 0 ? `${nm2('reroll')} (${left} left)` : `${nm2('reroll')} · $1.99`;
  $('reroll').disabled = false; $('rerollNote').textContent = '';
  Object.assign($('reroll').dataset, { tip: WORDS.reroll.name, desc: WORDS.reroll.desc });
  $('heirModal').classList.add('on');
  $('heirCards').querySelector('.heir').focus();
}
function showStart(){
  $('startIntro').innerHTML = `<p>${iconize('Europe, 1836 to 1918. Every nation is after one thing: the most gold a year when the Great War ends.')}</p>
    <p>${iconize('Pick a nation to rule. You never give orders: each time the throne passes, you choose the next ruler from three heirs, and the ministers run the nation the way he sees the world. Choose well, and it prospers. Or just watch.')}</p>`;
  const cs = S.alive().slice().sort((a, b) => S.score(b) - S.score(a));
  const big = ['GBR', 'FRA', 'PRU', 'AUS', 'RUS', 'TUR'];
  const btn = c => `<button class="pick" data-play="${c.tag}"><span class="fl" style="background:${c.color}"></span>${c.name}</button>`;
  $('startBody').innerHTML = `<h3>Great powers</h3><div class="picks">${cs.filter(c => big.includes(c.tag)).map(btn).join('')}</div>
    <h3>Smaller nations <span class="muted" style="font:12px var(--body)">harder</span></h3><div class="picks">${cs.filter(c => !big.includes(c.tag)).map(btn).join('')}</div>`;
  $('startModal').classList.add('on');
}

function renderPowers(){
  const cs = S.alive().sort((a, b) => S.score(b) - S.score(a));
  const lead = cs[0];
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
  $('powers').innerHTML = `<h3>${nm('goldYear')}</h3>${svg}
    <table><thead><tr><th>#</th><th>Nation</th><th>${ic('goldYear')}</th><th>${ic('province')}</th><th>${ic('factory')}</th><th>${ic('army')}</th><th>${ic('unrest')}</th></tr></thead><tbody>${rows}</tbody></table>
    <h3 style="margin-top:14px">${nm('dream')}s</h3>${uni}`;
}

// the left column: one nation in full. The selected one, else yours, else the leader.
let allForecasts = false, shownNation = null;
function focusNation(){ return S.C[selected] && S.C[selected].alive ? S.C[selected] : S.player ? S.C[S.player] : S.C[S.leader] || S.alive()[0]; }
function renderNation(){
  const c = focusNation(); const box = $('side'); if (!c) return;
  if (c.tag !== shownNation) { shownNation = c.tag; box.scrollTop = 0; }
  const rs = S.regionsOf(c), war = S.warOf(c);
  const ranked = S.alive().sort((a, b) => S.score(b) - S.score(a)), rank = ranked.indexOf(c) + 1;
  // gold a year and its whole history as a sparkline; rank and the change on last year on hover
  const now = S.score(c), Hs = S.history, ago = Hs.length > 1 ? Hs[Hs.length - 2].p[c.tag] : null;
  const vals = Hs.map(h => h.p[c.tag]).filter(v => v != null).concat(now);
  const W = 280, Hh = 34, mx = Math.max(...vals), mn = Math.min(...vals), span = Math.max(1, mx - mn);
  const pts = vals.map((v, i) => `${(vals.length > 1 ? i / (vals.length - 1) * W : W).toFixed(1)},${(Hh - 3 - (v - mn) / span * (Hh - 6)).toFixed(1)}`).join(' ');
  const d = ago != null ? Math.round(now - ago) : 0;
  const scoreTip = tipAttr(`${nm('goldYear')}: #${rank} of ${ranked.length}`, `${d > 0 ? '+' : d < 0 ? '−' : '±'}${Math.abs(d)} on last year. ${REG.goldYear.desc}`);
  const lg = c.ledger || { tax: 0, fac: 0, trade: 0, upkeep: 0, lostWork: 0, lostAdmin: 0, waste: 0, spent: {} };
  const sp = lg.spent || {};
  const net = lg.tax + lg.fac + lg.trade - lg.upkeep - (lg.waste || 0) - (sp.build || 0) - (sp.army || 0) - (sp.reform || 0);
  const lost = `Already reduced by ${lg.lostWork.toFixed(1)} for men in the army, who aren't working, and ${lg.lostAdmin.toFixed(1)} for running ${rs.length} provinces.`;
  const line = (icon, k, v, cls = '', tip = '') => `<div class="lg ${cls}"${tip ? ' ' + tipAttr(k, tip) : ''}><span>${icon ? ic(icon) : ''}${k}</span><span style="color:${v > 0 ? 'var(--peace)' : v < 0 ? '#e08070' : 'inherit'}">${v >= 0 ? '+' : '−'}${Math.abs(v).toFixed(1)}</span></div>`;
  const H = S.horizon(c);
  const thoughts = c.thoughts || [], done = thoughts.filter(t => t.chosen);
  const evTip = tipAttr(nm('forecast'), `Gold over the ${H} years this ruler plans ahead, after costs.`);
  const thought = (t, mark) => `<div class="th ${mark && t.chosen ? 'chosen' : ''}"><div class="row"><b>${ic(OPT_IC[t.type])}${t.label}</b><span class="evn" ${evTip} style="color:${t.ev > 0 ? 'var(--peace)' : t.ev < 0 ? '#e08070' : 'var(--muted)'}">${t.ev > 0 ? '+' : ''}${t.ev}</span></div><div class="why">${t.why}</div></div>`;
  const dreams = S.dreamsOf(c);
  const prov = r => { const u = Math.round(r.unrest);
    return `<div class="prov click" data-prov="${r.i}"><span>${r.name}${r.culture !== c.culture && !c.acc.has(r.culture) ? ` <span class="muted">${r.culture}</span>` : ''}${r.integ < 1 ? ` ${ic('settle')}` : ''}${r.occ ? ` ${ic('occupied')}` : ''}</span>
      <span>${r.fac ? `${ic('factory')}${r.fac}` : ''}${r.fort ? ic('fort') : ''}${r.build ? ic('build') : ''}</span><span class="un" style="color:${u >= 65 ? '#e0453a' : u >= 40 ? '#e3933c' : 'var(--muted)'}">${u >= 40 ? ic('unrest') : ''}${u}</span></div>`; };
  const r = c.ruler;
  const back = S.player && c.tag !== S.player && S.C[S.player].alive ? `<button class="btn back" data-tag="${S.player}">← ${S.C[S.player].name}</button>` : '';
  box.innerHTML = `${back}
    <div class="nation-head"><div class="flag" style="background:${c.color}"></div><h2>${c.name}</h2>${S.leader === c.tag ? ic('leader', 'lg') : ''}</div>
    <div class="inc" ${scoreTip}><div class="num">${ic('goldYear', 'lg')}<b>${fmt(now)}</b><span>#${rank}</span></div>
      <svg class="spark" viewBox="0 0 ${W} ${Hh}" preserveAspectRatio="none" aria-hidden="true"><polyline points="${pts}" fill="none" stroke="${c.color}" stroke-width="1.6" vector-effect="non-scaling-stroke"/></svg></div>
    ${war ? `<div class="war">${ic('war')}${war.name}</div>` : ''}${S.inCrisis(c) ? `<div class="war" style="color:#c9b3e6" ${tipOf('civilWar')}>${ic('civilWar')}${nm('civilWar')}</div>` : ''}
    <div class="rulerline">${emblem(r)}<b ${tipAttr(`${nm('ruler')} since ${r.since}`, REG.ruler.desc)}>${r.name}</b></div>
    <div class="pers">
      <span ${tipAttr(nm('patience'), `${REG.patience.desc} This one plans ${H} years ahead.`)}>${ic('patience')}${r.pat > 0.6 ? 'far-sighted' : r.pat < 0.4 ? 'short-sighted' : 'steady'}</span>
      <span ${tipOf('risk')}>${ic('risk')}${r.risk > 0.6 ? 'gambler' : r.risk < 0.4 ? 'cautious' : 'measured'}</span>
      <span ${tipOf('judgment')}>${ic('judgment')}${r.bias > 0.15 ? 'overconfident' : r.bias < -0.15 ? 'underconfident' : 'clear-eyed'}</span></div>
    <div class="stats">
      ${statTile('gold', fmt(c.treasury), c.treasury < 0 ? 'var(--war)' : '')}
      ${statTile('army', fmt(c.army) + 'k')}
      ${statTile('factory', S.facOf(c))}
      ${statTile('pop', S.popOf(c).toFixed(1) + 'm')}
      ${statTile('unrest', Math.round(S.unrestOf(c)), S.unrestOf(c) >= 40 ? 'var(--revolt)' : '')}
      ${statTile('province', rs.length)}
    </div>
    <div class="ledger">
      <div class="lg" ${tipOf('rival')}><span>${ic('rival')}${nm('rival')}</span><span>${c.rival && S.C[c.rival].alive ? nameSpan(c.rival) : '<span class="muted">none</span>'}</span></div>
      <div class="lg" ${tipOf('ally')}><span>${ic('ally')}Allies</span><span>${c.allies.size ? [...c.allies].map(nameSpan).join(', ') : '<span class="muted">none</span>'}</span></div>
      ${c.guarantee && S.year < c.guarantee.until ? `<div class="lg"><span>Independence guaranteed by</span><span>${nameSpan(c.guarantee.by)}</span></div>` : ''}
      ${dreams.length ? `<div class="lg" ${tipOf('dream')}><span>${ic('dream')}Dreams of</span><span>${dreams.map(d => d.title).join(', ')}</span></div>` : ''}
    </div>
    <h3>What the ministers did</h3>
    <div class="think">${done.length ? done.map(t => thought(t, false)).join('') : '<div class="muted">No decisions yet. Advance a season.</div>'}</div>
    ${thoughts.length > done.length ? `<button class="btn more" id="allForecasts" aria-expanded="${allForecasts}">${allForecasts ? 'Hide forecasts' : `All ${thoughts.length} forecasts`}</button>
      ${allForecasts ? `<div class="think">${thoughts.map(t => thought(t, true)).join('')}</div>` : ''}` : ''}
    <h3>Budget</h3>
    <div class="ledger">
      ${line('taxes', nm('taxes'), lg.tax, '', lost)}${line('factory', 'Factory output', lg.fac, '', lost)}${line('trade', war ? nm('trade') + ' (blockaded)' : nm('trade'), lg.trade)}${line('upkeep', nm('upkeep'), -lg.upkeep)}
      ${lg.waste ? line('waste', nm('waste'), -lg.waste) : ''}${sp.build ? line('build', nm('build'), -sp.build) : ''}${sp.army ? line('army', 'Recruiting', -sp.army) : ''}${sp.reform ? line('reform', nm('reform'), -sp.reform) : ''}
      ${line('gold', 'Net', net, 'net')}
    </div>
    <h3>Provinces</h3><div class="provs">${rs.map(prov).join('') || '<span class="muted">none</span>'}</div>`;
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
    <h3>Where its gold comes from</h3>
    <div class="ledger">
      <div class="lg"><span>${ic('taxes')}${nm('taxes')}</span><span>${(inc.tax * 4).toFixed(1)}</span></div>
      <div class="lg"><span>${ic('factory')}Factory output</span><span>${(inc.fac * 4).toFixed(1)}</span></div>
      <div class="lg"><span>${ic('trade')}${nm('trade')}</span><span>${(inc.trade * 4).toFixed(1)}</span></div>
      <div class="lgnote">${r.integ < 1 ? `${ic('settle')}Newly conquered: pays ${Math.round((0.1 + 0.9 * r.integ) * 100)}% until fully integrated. ` : ''}${ic('culture')}${r.culture} · ${foreign ? 'restless minority' : 'content'}.${r.occ ? ` ${ic('occupied')}<span style="color:var(--war)">Occupied by ${S.C[r.occ].name}: pays nothing until freed (normally ${(S.sumInc(S.regionIncome(r, c, { ignoreOcc: true })) * 4).toFixed(1)} a year).</span>` : ''}${r.build ? ` ${ic('build')}Building a ${r.build.type === 'factory' ? 'factory' : 'fortress'}, ${r.build.left} season${r.build.left > 1 ? 's' : ''} left.` : ''}</div>
    </div>
    ${claims ? `<h3>${nm('claim')}</h3><div class="claims">${claims}</div>` : ''}
    <h3>Neighbours</h3><div class="nbs">${nb}</div>
    ${hist ? `<h3>What happened here</h3>${hist}` : ''}`;
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
