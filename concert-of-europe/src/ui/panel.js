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
// one figure in the nation's row of six: its icon over its number
const fig = (icon, value, color) => `<div class="fig" ${tipOf(icon)}>${ic(icon)}<b${color ? ` style="color:${color}"` : ''}>${value}</b></div>`;
const statTile = (icon, value, color) => `<div class="stat" ${tipOf(icon)}>${ic(icon, 'lg')}<b${color ? ` style="color:${color}"` : ''}>${value}</b></div>`;
// a ruler's trait as a badge ringed in his rarity; hover names him and says what he does
const emblem = r => r && r.trait ? `<svg class="emb" viewBox="-8 -8 16 16" role="img" aria-label="${TRAITS[r.trait].label}" ${tipAttr(`${r.name} (${TIER[r.grade].name})`, S.traitDesc(r) + '.')}>${embBadge(r.grade)}${EMB[TRAITS[r.trait].emblem]}</svg>` : '';

// ---------- the player's choices ----------
// one heir per card: who he is (the title he will be known by), his character in a line, what he does
const cap1 = t => t.charAt(0).toUpperCase() + t.slice(1);
const nm2 = k => WORDS[k].name;
function showHeir(){
  const p = S.pending, c = S.C[p.tag];
  $('rerolls').hidden = false;
  // one line per effect: the main bonus, the flat bonus from Rare up, the malus
  const fxLine = e => `<p class="fx fx-${e.slot}">${iconize(e.text)}</p>`;
  const card = (r, i) => { const g = r.grade;
    return `<button class="heir ${tierClass(g)}" data-i="${i}" style="${tierStyle(g)};animation-delay:${i * 90}ms">
      <span class="key">${i + 1}</span>
      <span class="rar" ${tipOf('rarity')}>${TIER[g].name}</span>
      ${emblem(r)}
      <b class="ttl">${TRAITS[r.trait].label}</b><span class="who">${r.given}</span>
      <p class="vibe">${TRAITS[r.trait].vibe}</p>
      ${r.effects.map(fxLine).join('')}
    </button>`; };
  const why = p.why ? p.why.replace(/<[^>]*>/g, '') : '';
  $('heirTitle').textContent = p.opening ? `Who rules ${c.name} in ${p.year}?` : `Who rules ${c.name} now?`;
  $('heirSub').textContent = p.opening ? 'Pick a ruler. The ministers run everything else.'
    : `${why}${p.crisis ? ' Rival claimants will fight whoever you pick.' : ''}`;
  $('heirCards').innerHTML = p.options.map(card).join('');
  // three free rerolls a game; the fourth will be for sale (no payment yet)
  const left = S.rerolls;
  $('reroll').textContent = left > 0 ? `${nm2('reroll')} (${left} left)` : `${nm2('reroll')} · $${RULES.price.reroll}`;
  $('reroll').disabled = false; $('reroll').classList.remove('nope'); $('rerollNote').textContent = '';
  Object.assign($('reroll').dataset, { tip: WORDS.reroll.name, desc: WORDS.reroll.desc });
  $('heirModal').classList.add('on');
  $('heirCards').querySelector('.heir').focus();
}
function advanceLines(a){
  return advanceEffects(a, a.target ? S.C[a.target].name : '').map(e => e.text);
}
function showAdvance(){
  const p = S.pending, c = S.C[p.tag];
  $('heirTitle').innerHTML = ic('advance') + say(CONTENT.advances.choiceTitle, { nation: c.name });
  $('heirSub').textContent = CONTENT.advances.choiceInstructions;
  $('rerolls').hidden = true;
  $('heirCards').innerHTML = p.options.map((a, i) => {
    const d = CONTENT.advances.cards[a.id], r = TIER[a.grade];
    return `<button class="heir development ${tierClass(a.grade)}" data-i="${i}" style="${tierStyle(a.grade)};animation-delay:${i * 90}ms">
      <span class="key">${i + 1}</span><span class="rar">${r.name}</span>
      ${ic(d.icon, 'advance-art')}<b class="ttl">${d.name}</b><span class="who">${CONTENT.advances.categories[d.category].name}</span>
      ${advanceLines(a).map((text, j) => `<p class="fx ${j ? 'fx-flat' : 'fx-main'}">${iconize(text)}</p>`).join('')}
    </button>`;
  }).join('');
  $('heirModal').classList.add('on'); $('heirCards').querySelector('.heir').focus();
}
function renderAdvanceProgress(){
  const year = S.nextAdvanceYear(), box = $('advanceProgress');
  if (year == null) { box.innerHTML = S.over || !S.player || S.C[S.player].alive ? ic('advance') + say(CONTENT.advances.completeText) : ''; return; }
  const years = CONTENT.advances.years, prev = years[years.indexOf(year) - 1] ?? RULES.start;
  const due = (year - RULES.start) * SEASONS.length + CONTENT.advances.season;
  const remaining = Math.max(0, due - S.t), span = (year - prev) * SEASONS.length || 1;
  const text = say(CONTENT.advances.progressText, { year, season: SEASONS[CONTENT.advances.season], remaining });
  box.innerHTML = `<span>${ic('advance')}${text}</span><progress max="${span}" value="${span - remaining}" aria-label="${text}"></progress>`;
}
// a temperament as the word the panel shows (content/temperaments.json)
const temperTag = (k, v) => { const t = CONTENT.temperaments[k]; return v > t.high[0] ? t.high[1] : v < t.low[0] ? t.low[1] : t.mid; };
// a nation's ambition: a short label, what it takes (for hover text), and how it stands now
function ambitionDesc(a){
  return say(CONTENT.ambitionKinds[a.kind].desc, a);
}
function ambitionText(c){
  const a = S.ambitionOf(c);
  const K = CONTENT.ambitionKinds;
  const what = a.kind === 'richest' ? `${K.richest.name}${a.rank ? ` (#${a.rank} of ${a.of})` : ''}`
    : a.kind === 'unite' ? `${a.title}${a.by ? `, proclaimed by ${S.C[a.by].name}` : ` (${a.proclaimed ? 'proclaimed, ' : ''}${a.n} of ${a.need})`}` : K.survive.name;
  return { a, what, color: a.state === 'met' ? 'var(--peace)' : a.state === 'lost' ? 'var(--war)' : 'inherit' };
}
function showStart(){
  $('startIntro').innerHTML = iconize(say('Pick a nation and meet its ambition by {rules.end.season|season} {rules.end.year}. You choose its rulers and permanent {concepts.advance.name|lower} cards, and each ruler decides how the nation is run during his reign. When it ends, you pick the next from {rules.heirs|word} heirs.'));
  const cs = S.alive().slice().sort((a, b) => S.score(b) - S.score(a));
  const of = k => cs.filter(c => S.ambitionOf(c).kind === k);
  const AM = CONTENT.ambitionKinds;
  // one nation: its colour and its name, largest first; hover says what its ambition asks
  const row = c => `<button class="t-n" data-play="${c.tag}" ${tipAttr(c.name, ambitionDesc(S.ambitionOf(c)))}><span class="fl" style="background:${c.color}"></span>${c.name}</button>`;
  // the unions as races: one per union, its nations largest first, the biggest races first
  const races = new Map();
  of('unite').forEach(c => { const t = S.ambitionOf(c).title; if (!races.has(t)) races.set(t, []); races.get(t).push(c); });
  const raceList = [...races].sort((x, y) => y[1].reduce((s, c) => s + S.score(c), 0) - x[1].reduce((s, c) => s + S.score(c), 0));
  const col = (k, who, body) => `<section class="t-col"><h3>${AM[k].heading}</h3><p class="who">${iconize(who)}</p>${body}</section>`;
  $('startBody').innerHTML =
    col('richest', say('The most gold a year among the great powers in {rules.end.year}.'), of('richest').map(c => row(c)).join('')) +
    col('unite', say('Be the first of its nations to proclaim the union, and still hold it in {rules.end.year}.'), `<div class="t-races">${raceList.map(([t, ns]) => `<div class="t-race"><div class="rt">${t}</div>${ns.map(c => row(c)).join('')}</div>`).join('')}</div>`) +
    col('survive', say('Still be on the map in {rules.end.year}.') + ` ${cap1(AM.survive.aside)}.`, of('survive').map(c => row(c)).join(''));
  $('startSeed').textContent = `World #${S.seed}`;
  $('startModal').classList.add('on');
}

function renderPowers(){
  const cs = S.alive().sort((a, b) => S.score(b) - S.score(a));
  const lead = cs[0];
  const uni = S.unionProgress().map(u => {
    const pct = u.done ? 100 : Math.min(100, u.n / u.need * 100);
    const who = u.done ? `${nameSpan(u.done.tag)} proclaimed` : u.lead ? `${nameSpan(u.lead.tag)} holds ${u.n} of ${u.need} needed` : `<span class="muted">no ${u.peoples} nation to lead it</span>`;
    return `<div class="uni"><div class="row"><b>${ic('proclaim')}${u.title}</b><span class="muted">${who}</span></div><div class="barx"><i style="width:${pct}%;background:${u.done ? 'var(--peace)' : 'var(--brass)'}"></i></div></div>`;
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
    <td><b>${fmt(S.score(c))}</b></td><td>${S.regionsOf(c).length}</td><td>${S.facOf(c)}</td><td>${fmt(c.army)}</td><td style="color:${S.unrestOf(c) >= UNREST.restless ? 'var(--revolt)' : 'inherit'}">${Math.round(S.unrestOf(c))}</td></tr>`).join('');
  $('powers').innerHTML = `<h3>${nm('goldYear')}</h3>${svg}
    <table><thead><tr><th>#</th><th>Nation</th><th>${ic('goldYear')}</th><th>${ic('province')}</th><th>${ic('factory')}</th><th>${ic('army')}</th><th>${ic('unrest')}</th></tr></thead><tbody>${rows}</tbody></table>
    <h3 style="margin-top:14px">${CONTENT.ambitionKinds.unite.heading}</h3>${uni}`;
}

// the left column: one nation in full. The selected one, else yours, else the leader.
let allBudget = false, allProvs = false, shownNation = null;
const PROVS_SHOWN = 6;
function focusNation(){ return S.C[selected] && S.C[selected].alive ? S.C[selected] : S.player ? S.C[S.player] : S.C[S.leader] || S.alive()[0]; }
function renderNation(){
  const c = focusNation(); const box = $('side'); if (!c) return;
  if (c.tag !== shownNation) { shownNation = c.tag; box.scrollTop = 0; }
  if (!c.alive) {
    const ambition = ambitionText(c);
    box.innerHTML = `<header class="crest"><h2>${c.name}</h2></header><p class="muted">This nation is no longer on the map.</p><div class="lg"><span>${ic('ambition')}${nm('ambition')}</span><span style="color:var(--war)">${ambition.what}</span></div>`;
    return;
  }
  const rs = S.regionsOf(c), war = S.warOf(c);
  const ranked = S.alive().sort((a, b) => S.score(b) - S.score(a)), rank = ranked.indexOf(c) + 1;
  // gold a year and its whole history as a sparkline; rank and the change on last year on hover
  const now = S.score(c), Hs = S.history, ago = Hs.length > 1 ? Hs[Hs.length - 2].p[c.tag] : null;
  const vals = Hs.map(h => h.p[c.tag]).filter(v => v != null).concat(now);
  const W = 280, Hh = 34, mx = Math.max(...vals), mn = Math.min(...vals), span = Math.max(1, mx - mn);
  const pts = vals.map((v, i) => `${(vals.length > 1 ? i / (vals.length - 1) * W : W).toFixed(1)},${(Hh - 3 - (v - mn) / span * (Hh - 6)).toFixed(1)}`).join(' ');
  const d = ago != null ? Math.round(now - ago) : 0;
  const scoreTip = tipAttr(`${nm('goldYear')}: #${rank} of ${ranked.length}`, `${d > 0 ? '+' : d < 0 ? '−' : '±'}${Math.abs(d)} on last year. ${REG.goldYear.desc}`);
  const lg = c.ledger;
  const sp = lg.spent;
  const net = lg.tax + lg.fac + lg.trade - lg.upkeep - sp.build - sp.army - sp.reform + lg.other;
  const lost = `Already reduced by ${lg.lostWork.toFixed(1)} for men in the army, who aren't working, and ${lg.lostAdmin.toFixed(1)} for running ${rs.length} provinces.`;
  const line = (icon, k, v, cls = '', tip = '') => `<div class="lg ${cls}"${tip ? ' ' + tipAttr(k, tip) : ''}><span>${icon ? ic(icon) : ''}${k}</span><span style="color:${v > 0 ? 'var(--peace)' : v < 0 ? '#e08070' : 'inherit'}">${v >= 0 ? '+' : '−'}${Math.abs(v).toFixed(1)}</span></div>`;
  const H = S.horizon(c);
  // this season: what the ministers did, one sentence each; under way: what is still running, with how long it has left
  const did = c.didThisSeason;
  const act = (icon, text, when = '', color = '') => `<div class="act"${color ? ` style="color:${color}"` : ''}>${ic(icon)}<span>${text}</span>${when ? `<span class="when">${when}</span>` : ''}</div>`;
  const now1 = did.length ? did.map(d => act(OPT_IC[d.type], d.label)).join('') : act('save', 'Saving gold');
  const startedNow = new Set(did.filter(d => d.r != null).map(d => d.r));
  const left = n => `${n} season${n > 1 ? 's' : ''} left`;
  const running = [
    war ? act('war', war.name, '', 'var(--war)') : '',
    S.inCrisis(c) ? `<div class="act" style="color:#c9b3e6" ${tipOf('civilWar')}>${ic('civilWar')}<span>${nm('civilWar')}</span></div>` : '',
    ...rs.filter(x => x.build && !startedNow.has(x.i)).map(x => act(x.build.type === 'factory' ? 'factory' : 'fort', `${x.build.type === 'factory' ? 'Building a factory in' : 'Fortifying'} ${x.name}`, left(x.build.left))),
    ...rs.filter(x => x.integ < 1).map(x => act('settle', x.name, `${Math.round(x.integ * 100)}% ${nm('settle').toLowerCase()}`)),
  ].join('');
  const amb = ambitionText(c);
  // provinces, richest first: gold a year on the right, a bar in the nation's colour behind, what stands there as marks, unrest only when it matters
  const pv = new Map(rs.map(x => [x, S.sumInc(S.regionIncome(x)) * 4]));
  const byGold = [...rs].sort((x, y) => pv.get(y) - pv.get(x)), topV = Math.max(0.1, ...pv.values());
  const prov = x => { const u = Math.round(x.unrest), v = pv.get(x);
    const facs = x.fac > 4 ? `${ic('factory')}<span class="pn-x">×${x.fac}</span>` : ic('factory').repeat(x.fac);
    const restless = u >= UNREST.restless ? `<span style="color:${u >= UNREST.uprising ? '#e0453a' : '#e3933c'}">${ic('unrest')}${u}</span>` : '';
    return `<div class="prov click" data-prov="${x.i}" style="--w:${Math.max(0, v / topV * 100).toFixed(1)}%">
      <span class="pn">${x.name}${x.culture !== c.culture && !c.acc.has(x.culture) ? ` <span class="muted">${peopleName(x.culture)}</span>` : ''}</span>
      <span class="pf">${facs}</span><span class="pk">${x.fort ? ic('fort') : ''}${x.build ? ic('build') : ''}${x.integ < 1 ? ic('settle') : ''}${x.occ ? ic('occupied') : ''}</span><span class="pu">${restless}</span>
      <span class="pv">${v.toFixed(1)}</span></div>`; };
  const r = c.ruler;
  const back = S.player && c.tag !== S.player && S.C[S.player].alive ? `<button class="btn back" data-tag="${S.player}">← ${S.C[S.player].name}</button>` : '';
  const unrest = Math.round(S.unrestOf(c)), shown = allProvs ? byGold : byGold.slice(0, PROVS_SHOWN);
  box.innerHTML = `${back}
    <header class="crest" style="--tc:${TIER[r.grade].color}">
      <div class="nation-head"><div class="flag" style="background:${c.color}"></div><h2>${c.name}</h2>${S.leader === c.tag ? ic('leader', 'lg') : ''}</div>
      <div class="inc" ${scoreTip}><div class="num">${ic('goldYear', 'lg')}<b>${fmt(now)}</b><span>#${rank}</span></div>
        <svg class="spark" viewBox="0 0 ${W} ${Hh}" preserveAspectRatio="none" aria-hidden="true"><polyline points="${pts}" fill="none" stroke="${c.color}" stroke-width="1.6" vector-effect="non-scaling-stroke"/></svg></div>
      <div class="reign">${emblem(r)}<div>
        <span class="rar">${TIER[r.grade].name}</span>
        <b ${tipAttr(`${nm('ruler')} since ${r.since}`, REG.ruler.desc)} style="color:${TIER[r.grade].color}">${r.name}</b>
        <div class="pers">
          <span ${tipAttr(nm('patience'), `${REG.patience.desc} This one plans ${H} years ahead.`)}>${ic('patience')}${temperTag('patience', r.pat)}</span>
          <span ${tipOf('judgment')}>${ic('judgment')}${temperTag('judgment', r.bias)}</span>
          <span ${tipOf('thrift')}>${ic('thrift')}${temperTag('thrift', S.thriftOf(c))}</span></div></div></div>
      <div class="figs">
        ${fig('gold', fmt(c.treasury), c.treasury < 0 ? 'var(--war)' : '')}
        ${fig('army', fmt(c.army) + 'k')}
        ${fig('factory', S.facOf(c))}
        ${fig('pop', S.popOf(c).toFixed(1) + 'm')}
        ${fig('unrest', unrest, S.unrestOf(c) >= UNREST.restless ? 'var(--revolt)' : '')}
        ${fig('province', rs.length)}
      </div>
    </header>
    ${c.advances.length ? `<div class="advance-row">${c.advances.map(a => {
      const d = CONTENT.advances.cards[a.id], r = TIER[a.grade];
      return `<span class="advance-badge" style="--tc:${r.color}" ${tipAttr(`${d.name} (${r.name})`, advanceLines(a).join('. '))}>${ic(d.icon)}</span>`;
    }).join('')}</div>` : ''}
    <div class="ledger">
      <div class="lg" ${tipAttr(nm('ambition'), ambitionDesc(amb.a))}><span>${ic('ambition')}${nm('ambition')}</span><span style="color:${amb.color}">${amb.what}</span></div>
      <div class="lg" ${tipOf('rival')}><span>${ic('rival')}${nm('rival')}</span><span>${c.rival && S.C[c.rival].alive ? nameSpan(c.rival) : '<span class="muted">none</span>'}</span></div>
      <div class="lg" ${tipOf('ally')}><span>${ic('ally')}${nm('ally')}</span><span>${c.allies.size ? [...c.allies].map(nameSpan).join(', ') : '<span class="muted">none</span>'}</span></div>
      ${c.guarantee && S.year < c.guarantee.until ? `<div class="lg" ${tipOf('guarantee')}><span>${nm2('guarantee')}</span><span>${nameSpan(c.guarantee.by)}</span></div>` : ''}
    </div>
    <h3>This season</h3>
    <div class="acts">${now1}</div>
    ${running ? `<div class="sub">Under way</div><div class="acts dim">${running}</div>` : ''}
    <h3>Budget</h3>
    <div class="ledger">
      ${allBudget ? `${line('taxes', nm('taxes'), lg.tax, '', lost)}${line('factory', nm('factory'), lg.fac, '', lost)}${line('trade', war ? nm('trade') + ' (blockaded)' : nm('trade'), lg.trade)}${line('upkeep', nm('upkeep'), -lg.upkeep)}
      ${sp.build ? line('build', nm('build'), -sp.build) : ''}${sp.army ? line('army', nm('army'), -sp.army) : ''}${sp.reform ? line('reform', nm('reform'), -sp.reform) : ''}${lg.other ? line('event', 'Other changes', lg.other) : ''}` : ''}
      ${line('gold', nm('gold'), net, allBudget ? 'net' : 'net only')}
    </div>
    <button class="btn more" id="allBudget" aria-expanded="${allBudget}">${allBudget ? 'Hide the budget' : 'Show the budget'}</button>
    <h3 class="hcol">Provinces${ic('goldYear')}</h3><div class="provs" style="--nc:${c.color}">${shown.map(prov).join('') || '<span class="muted">none</span>'}</div>
    ${rs.length > PROVS_SHOWN ? `<button class="btn more" id="allProvs" aria-expanded="${allProvs}">${allProvs ? 'Show fewer' : `All ${rs.length} provinces`}</button>` : ''}`;
}

function renderProvince(){
  const box = $('province');
  if (selProv == null) { box.innerHTML = '<div class="empty">Click a province on the map.</div>'; return; }
  const r = S.regions[selProv], c = S.C[r.owner];
  const inc = S.regionIncome(r), yr = S.sumInc(inc) * 4;
  const u = Math.round(r.unrest);
  const claims = S.alive().filter(o => o !== c && S.claim(o, r) > 0).map(o => {
    const why = r.core === o.tag ? 'lost province' : o.culture === r.culture || o.acc.has(r.culture) ? `same people (${peopleName(r.culture)})` : `for ${S.theTitle(S.claimedUnion(o))}`;
    return `<div>${nameSpan(o.tag)} <span class="muted">${why}</span></div>`; }).join('');
  const nb = r.nb.map(j => { const x = S.regions[j]; const sea = GEO.naval.some(([a, b]) => (a === r.i && b === j) || (b === r.i && a === j));
    return `<span class="nbx click" data-prov="${j}">${sea ? ic('sea') : ''}${x.name} <span class="sw" style="background:${S.C[x.owner].color}"></span></span>`; }).join('');
  const pat = `data-p="${r.i}"`;   // the chronicle marks every province it names (Rn in sim.js)
  const hist = logHtml(S.log.filter(l => l.h.includes(pat)), 60);
  const foreign = !S.isAccepted(c, r.culture);
  box.innerHTML = `
    <div class="nation-head"><div class="flag" style="background:${c.color}"></div><div><h2>${r.name}</h2>
      <div class="muted" style="font-size:12px">Held by ${nameSpan(c.tag)}${r.coast ? ` · ${ic('trade')}${nm('trade')}` : ''}</div></div></div>
    <div class="stats">
      ${statTile('pop', r.pop.toFixed(1) + 'm')}
      ${statTile('factory', r.fac + (r.build && r.build.type === 'factory' ? ' +1' : ''))}
      ${statTile('fort', r.fort ? 'yes' : r.build && r.build.type === 'fort' ? 'building' : 'no')}
      ${statTile('goldYear', yr.toFixed(1), r.occ ? 'var(--war)' : '')}
      ${statTile('unrest', u, u >= UNREST.uprising ? '#e0453a' : u >= UNREST.restless ? '#e3933c' : '')}
      ${statTile('settle', Math.round(r.integ * 100) + '%', r.integ < 1 ? 'var(--revolt)' : '')}
    </div>
    <h3>Where its gold comes from</h3>
    <div class="ledger">
      <div class="lg"><span>${ic('taxes')}${nm('taxes')}</span><span>${(inc.tax * 4).toFixed(1)}</span></div>
      <div class="lg"><span>${ic('factory')}${nm('factory')}</span><span>${(inc.fac * 4).toFixed(1)}</span></div>
      <div class="lg"><span>${ic('trade')}${nm('trade')}</span><span>${(inc.trade * 4).toFixed(1)}</span></div>
      <div class="lgnote">${r.integ < 1 ? `${ic('settle')}Newly conquered: pays ${Math.round(S.paysWhile(r.integ) * 100)}% until fully integrated. ` : ''}${ic('culture')}${peopleName(r.culture)} · ${foreign ? 'restless minority' : 'content'}.${r.occ ? ` ${ic('occupied')}<span style="color:var(--war)">Occupied by ${S.C[r.occ].name}: pays nothing until freed (normally ${(S.sumInc(S.regionIncome(r, c, { ignoreOcc: true })) * 4).toFixed(1)} a year).</span>` : ''}${r.build ? ` ${ic('build')}Building a ${r.build.type === 'factory' ? 'factory' : 'fortress'}, ${r.build.left} season${r.build.left > 1 ? 's' : ''} left.` : ''}</div>
    </div>
    ${claims ? `<h3>${nm('claim')}</h3><div class="claims">${claims}</div>` : ''}
    <h3>Neighbours</h3><div class="nbs">${nb}</div>
    ${hist ? `<h3>What happened here</h3>${hist}` : ''}`;
}

function showEnd(){
  const cs = S.alive().sort((a, b) => S.score(b) - S.score(a));
  const born = Object.values(S.C).filter(c => c.born > RULES.start && c.alive && !c.restored);
  const restored = Object.values(S.C).filter(c => c.restored && c.alive);
  const dead = Object.values(S.C).filter(c => !c.alive);
  const rows = cs.slice(0, 8).map((c, i) => { const d = S.regionsOf(c).length - c.startRegions;
    return `<tr><td>${i + 1}</td><td>${nameSpan(c.tag)}</td><td><b>${fmt(S.score(c))}</b></td><td>${S.regionsOf(c).length} <span style="color:${d > 0 ? 'var(--peace)' : d < 0 ? 'var(--war)' : 'var(--muted)'}">(${d > 0 ? '+' : ''}${d})</span></td><td>${S.facOf(c)}</td><td>${fmt(c.army)}</td></tr>`; }).join('');
  const me = S.player && S.C[S.player];
  const rich = cs.filter(c => S.ambitionOf(c).kind === 'richest')[0];
  const met = k => cs.filter(c => { const a = S.ambitionOf(c); return a.kind === k && a.state === 'met'; });
  const united = met('unite'), survivors = met('survive');
  const mine = me && ambitionText(me);
  $('endTitle').innerHTML = me ? (mine.a.state === 'met' ? `${me.name} meets its ambition` : `${me.name} falls short`) : rich ? `${rich.name} is the richest great power` : 'The armistice';
  $('endBody').innerHTML = `${me ? `<p>${ic('ambition')}Your ambition: <span style="color:${mine.color}">${mine.what}</span>. ${ambitionDesc(mine.a)}</p>` : ''}
    <p>The armistice of ${S.year}. ${rich ? `${nameSpan(rich.tag)} is the richest great power, with ${ic('goldYear')}${fmt(S.score(rich))} gold a year under ${rich.ruler.name}. ` : ''}${united.length ? `${ic('ambition')}Peoples united: ${united.map(c => nameSpan(c.tag)).join(', ')}. ` : 'No united people outlives the war. '}${survivors.length ? `Survived: ${survivors.map(c => nameSpan(c.tag)).join(', ')}.` : ''}</p>
    <table><thead><tr><th>#</th><th>Nation</th><th>${ic('goldYear')}</th><th>${ic('province')}</th><th>${ic('factory')}</th><th>${ic('army')}</th></tr></thead><tbody>${rows}</tbody></table>
    <p style="margin-top:12px">${ic('war')}${S.stats.wars} wars · ${ic('war')}${S.stats.battles} battles · ${ic('uprising')}${S.stats.revolts} uprisings · ${ic('dead')}${Math.round(S.stats.dead || 0)} million dead in the fighting · ${ic('ruler')}${S.stats.rulers} changes of ruler</p>
    <p>${born.length ? `Born in an uprising: ${born.map(c => nameSpan(c.tag)).join(', ')}. ` : ''}${restored.length ? `Restored by an uprising: ${restored.map(c => nameSpan(c.tag)).join(', ')}. ` : ''}${dead.length ? `Gone from the map: ${dead.map(c => c.name).join(', ')}.` : ''}</p>`;
  $('endModal').classList.add('on');
}
