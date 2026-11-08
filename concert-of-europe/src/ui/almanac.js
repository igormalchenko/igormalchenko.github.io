// ---------- the Almanac: every piece of content in the game, read live from CONTENT ----------
// Nothing here is written by hand: every name, number and sentence comes from content/*.json, filled in by
// the same say() and quirkDesc() the game uses, so what the Almanac shows is what the engine runs on.
// Each entry ends with its raw data, so a wrong number can be traced to its file and key.
const AL = { section: 'rulers', q: '' };
const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const raw = (file, key, v) => `<details class="raw"><summary>content/${file}.json${key != null ? ` · ${esc(key)}` : ''}</summary><pre>${esc(JSON.stringify(v, null, 1))}</pre></details>`;
const swatch = color => `<span class="sw" style="background:${color}"></span>`;
const provName = id => CONTENT.provinces[id] ? CONTENT.provinces[id].name : `<b style="color:var(--war)">${esc(id)}?</b>`;
const nationName = tag => CONTENT.nations[tag] ? CONTENT.nations[tag].name : tag;
const pctOf = p => `${Math.round(p * 1000) / 10}%`;
const yearly = p => `${pctOf(p)} a year`;
const listOf = xs => xs.join(', ');
const entry = (title, body, rawHtml, opts = {}) => `<div class="al-e"${opts.style ? ` style="${opts.style}"` : ''}>
  <div class="al-h">${opts.lead || ''}<div><b class="al-t">${title}</b>${opts.sub ? `<span class="muted"> ${opts.sub}</span>` : ''}</div></div>${body}${rawHtml}</div>`;
const facts = rows => `<dl class="al-f">${rows.filter(r => r && r[1] !== '' && r[1] != null).map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>`;
// a quirk's numbers, each named by content/effects.json
const numbers = (fx = {}, temper = {}) => facts([
  ...Object.entries(fx).map(([k, v]) => [CONTENT.effects[k] || `<b style="color:var(--war)">${k}: not in effects.json</b>`, v === true ? 'yes' : Array.isArray(v) ? v.join(' to ') : v]),
  ...Object.entries(temper).map(([k, v]) => [`Fixed ${{ pat: 'patience', bias: 'judgment', thrift: 'thrift' }[k]}`, v])]);
// sample words for the parts of a sentence that are only known in a running world
const SAMPLE = { a: '<i>a nation</i>', b: '<i>another nation</i>', nation: '<i>a nation</i>', nations: '<i>three nations</i>', province: '<i>a province</i>',
  people: '<i>a people</i>', era: '<i>a new way of war</i>', find: '<i>coal is found</i>', pretext: '<i>a pretext</i>', gold: '<i>some</i>', war: '<i>war</i>' };

const SECTIONS = {
  rulers: { name: 'Rulers', file: 'rulers', count: () => Object.keys(CONTENT.rulers).length, render(){
    return CONTENT.rarities.map((rar, i) => { const tier = i + 1, ids = Object.keys(CONTENT.rulers).filter(t => CONTENT.rulers[t].tier === tier);
      const offered = ids.filter(t => CONTENT.rulers[t].card !== false);
      return `<h3 class="al-g" style="color:${rar.color}">${rar.name} <span class="muted">${pctOf(rar.odds)} of heirs · ${offered.length} on cards</span></h3>
        ${raw('rarities', i, rar)}${ids.map(t => { const q = CONTENT.rulers[t], card = q.card !== false;
          return entry(q.label, `<p class="vibe">${q.vibe}</p><p>${iconize(quirkDesc(t, { friend: '<i>a great power</i>', culture: '<i>a people</i>', landmark: '<i>a landmark</i>', mood: '' }))}.</p>
            ${facts([['Chance per heir', card ? `1 in ${Math.round(offered.length / rar.odds)}` : 'never on a card']])}${numbers(q.fx, q.temper)}`,
          raw('rulers', t, q), { sub: q.epi, lead: `<svg class="emb" viewBox="-8 -8 16 16">${embBadge(tier)}${EMB[t] || ''}</svg>`, style: `--tc:${rar.color}` }); }).join('')}`; }).join(''); } },
  nations: { name: 'Nations of ' + CONTENT.rules.start, file: 'nations', count: () => Object.keys(CONTENT.nations).length, render(){
    return Object.entries(CONTENT.nations).map(([tag, n]) => { const live = S && S.C[tag];
      const amb = live && live.ambition ? (live.ambition.kind === 'dream' ? CONTENT.dreams[live.ambition.dream].title : CONTENT.ambitions[live.ambition.kind].name) : '';
      return entry(n.name, facts([
        ['People', n.people + (n.accepts ? ` (also accepts ${listOf(n.accepts)})` : '')],
        ['Ambition', amb], ['Army', `${n.army}k`], ['Leans to war', n.hawk], ['Patience', n.patience],
        ['Provinces', listOf(Object.entries(CONTENT.provinces).filter(([, p]) => p.owner === tag).map(([, p]) => p.name))],
        ['Programme', n.programme ? listOf(n.programme.map(provName)) : ''],
        ['Allies', n.allies ? listOf(n.allies.map(nationName)) : ''],
        ['Relations', n.relations ? listOf(Object.entries(n.relations).map(([o, v]) => `${nationName(o)} ${v > 0 ? '+' : ''}${v}`)) : ''],
        ['Rulers', n.federal ? n.federal : listOf(n.rulerNames || (CONTENT.peoples[n.people].names || CONTENT.peoples.German.names))],
        ['In this world', live ? (live.alive ? (live.name !== n.name ? `now ${live.name}` : 'on the map') : 'gone from the map') : ''],
      ]), raw('nations', tag, n), { sub: `${n.adj}${n.unifier ? ' · unifier' : ''}`, lead: swatch(n.color) }); }).join(''); } },
  breakaways: { name: 'Breakaway nations', file: 'breakaways', count: () => Object.keys(CONTENT.breakaways).length, render(){
    return `<p class="muted">The nation a people forms when it rises and wins, unless its own fallen state of ${CONTENT.rules.start} comes back.</p>` +
      Object.entries(CONTENT.breakaways).map(([people, b]) => { const n = b.restores ? CONTENT.nations[b.restores] : b;
        return entry(n.name, facts([['Formed by', `the ${people} people`], ['Restores', b.restores ? `${nationName(b.restores)} of ${CONTENT.rules.start}` : ''],
          ['Programme', b.programme ? listOf(b.programme.map(provName)) : '']]), raw('breakaways', people, b), { sub: n.adj, lead: swatch(n.color) }); }).join(''); } },
  peoples: { name: 'Peoples', file: 'peoples', count: () => Object.keys(CONTENT.peoples).length, render(){
    return Object.entries(CONTENT.peoples).map(([p, d]) => { const home = Object.values(CONTENT.provinces).filter(x => x.people === p);
      const dreams = Object.values(CONTENT.dreams).filter(x => x.cultures.includes(p)).map(x => x.title);
      return entry(p, facts([['Lives in', listOf(home.map(x => x.name)) || '<span class="muted">no province of its own</span>'],
        ['People', `${Math.round(home.reduce((s, x) => s + x.pop, 0) * 10) / 10}m in ${CONTENT.rules.start}`],
        ['Ruler names', d.names ? listOf(d.names) : '<span class="muted">none: borrows the German ones</span>'],
        ['Dreams of', listOf(dreams)], ['Rises as', CONTENT.breakaways[p] ? (CONTENT.breakaways[p].restores ? nationName(CONTENT.breakaways[p].restores) : CONTENT.breakaways[p].name) : ''],
        ['Can awaken', CONTENT.events.awakening.peoples.includes(p) || CONTENT.events.shevchenko.people === p ? 'yes' : '']]), raw('peoples', p, d)); }).join(''); } },
  dreams: { name: 'National dreams', file: 'dreams', count: () => Object.keys(CONTENT.dreams).length, render(){
    const prog = S ? Object.fromEntries(S.unifyProgress().map(u => [u.id, u])) : {};
    return Object.entries(CONTENT.dreams).map(([id, d]) => { const u = prog[id];
      return entry(d.title, `${d.note ? `<p class="vibe">${d.note}</p>` : ''}${facts([['People', listOf(d.cultures)], ['Led by', d.leaders ? listOf(d.leaders.map(nationName)) : 'any nation of its people'],
        ['To proclaim', `hold ${d.need} of ${d.provinces.length} provinces, from ${d.from}`], ['Provinces', listOf(d.provinces.map(provName))],
        ['In this world', u ? (u.done ? `proclaimed by ${u.done.name}` : u.lead ? `${u.lead.name} holds ${u.n} of ${u.need}` : 'no one to lead it') : '']])}`,
        raw('dreams', id, d), { sub: d.adj, lead: ic('dream') }); }).join(''); } },
  ambitions: { name: 'Ambitions', file: 'ambitions', count: () => Object.keys(CONTENT.ambitions).length, render(){
    const sample = { the: 'the ', title: '<i>its dream</i>', need: '<i>enough</i>' };
    return Object.entries(CONTENT.ambitions).map(([k, a]) => entry(a.name, `<p>${say(a.desc, sample)}</p>${facts([['Who has it', say(a.who)],
      ['A province of its own dream is worth', a.own != null ? `${a.own}× its gold a year` : ''], ['A province of another dream of its people', a.other != null ? `${a.other}×` : ''],
      ['Every expected loss counts', a.losses != null ? `${a.losses}×` : '']])}`, raw('ambitions', k, a), { lead: ic('ambition') })).join(''); } },
  provinces: { name: 'Provinces', file: 'provinces', count: () => Object.keys(CONTENT.provinces).length, render(){
    const ids = Object.keys(CONTENT.provinces), sea = CONTENT.map.seaCrossings;
    return `<table class="al-tab"><thead><tr><th>Province</th><th>${WORDS.nation.name} in ${CONTENT.rules.start}</th><th>${ic('culture')}</th><th>${ic('pop')}</th><th>${ic('factory')}</th><th>${ic('trade')}</th><th>${ic('sea')}</th></tr></thead><tbody>${
      ids.map((id, i) => { const p = CONTENT.provinces[id], g = GEO.regions[i];
        return `<tr class="al-e"><td>${p.name} <span class="muted">${id}</span></td><td>${nationName(p.owner)}</td><td>${p.people}</td><td>${p.pop}m</td><td>${p.industry}</td><td>${g && g.coast ? 'coast' : ''}</td>
          <td>${listOf(sea.filter(x => x.includes(id)).map(x => provName(x[0] === id ? x[1] : x[0])))}</td></tr>`; }).join('')}</tbody></table>${raw('provinces', null, CONTENT.provinces)}${raw('map', null, CONTENT.map)}`; } },
  events: { name: 'Events', file: 'events', count: () => Object.keys(CONTENT.events).length, render(){
    return Object.entries(CONTENT.events).map(([id, e]) => { const when = e.year ? `${['Winter', 'Spring', 'Summer', 'Autumn'][e.season]} ${e.year}`
        : e.years ? `${e.years[0]} to ${e.years[1]}` : e.from ? `from ${e.from}` : e.every ? `at least ${e.every} years after the last` : e.season != null ? `${['winter', 'spring', 'summer', 'autumn'][e.season]}s` : '';
      const lines = ['text', 'rattleText', 'warText'].filter(k => e[k]).map(k => `<p>${say(e[k], Object.assign({}, SAMPLE, e, { province: e.province ? `<i>${provName(e.province)}</i>` : SAMPLE.province, people: e.people || SAMPLE.people, nations: SAMPLE.nations, find: e.finds ? e.finds[0] : SAMPLE.find, pretext: e.pretexts ? e.pretexts[0] : SAMPLE.pretext, nation: e.nation ? `<i>${nationName(e.nation)}</i>` : SAMPLE.nation }))}</p>`).join('');
      return entry(e.name, lines + facts([['When', when], ['Chance', e.chance != null ? yearly(e.chance) : ''], ['Peoples', e.peoples ? listOf(e.peoples) : '']]), raw('events', id, e), { lead: ic('event') }); }).join(''); } },
  eras: { name: 'Ways of war', file: 'eras', count: () => CONTENT.eras.length, render(){
    return CONTENT.eras.map((e, i) => entry(e.name, facts([['Defender fights', `${e.def}× as hard`], ['A fortress stops an advance', pctOf(e.fort)], ['Begins', e.start ? `in ${CONTENT.rules.start}` : 'with a military revolution']]),
      raw('eras', i, e), { lead: ic('war') })).join(''); } },
  landmarks: { name: 'Landmarks', file: 'landmarks', count: () => Object.keys(CONTENT.landmarks).length, render(){
    return `<p class="muted">Raised by a ${CONTENT.rulers.architect.label} ${say('{works|years}', CONTENT.rulers.architect.fx)} into his reign.</p>` +
      Object.entries(CONTENT.landmarks).map(([id, l]) => entry(l.name.charAt(0).toUpperCase() + l.name.slice(1), `<p>${say(l.fx, l)}.</p>`, raw('landmarks', id, l), { lead: ic('landmark') })).join(''); } },
  concepts: { name: 'Concepts', file: 'concepts', count: () => Object.keys(CONTENT.concepts).length, render(){
    return Object.entries(CONTENT.concepts).map(([k, c]) => entry(c.name, `<p>${esc(say(c.desc))}</p>${facts([['Never called', c.avoid ? listOf(c.avoid.map(w => `“${w}”`)) : '']])}`,
      raw('concepts', k, c), { lead: REG[k] ? ic(k) : '<span class="al-noic"></span>' })).join(''); } },
  effects: { name: 'Ruler effects', file: 'effects', count: () => Object.keys(CONTENT.effects).length, render(){
    return Object.entries(CONTENT.effects).map(([k, d]) => { const who = Object.entries(CONTENT.rulers).filter(([, q]) => q.fx && k in q.fx);
      return entry(d, facts([['Key', `<code>${k}</code>`], ['Rulers', listOf(who.map(([, q]) => `${q.label} ${q.fx[k] === true ? '' : `(${Array.isArray(q.fx[k]) ? q.fx[k].join(' to ') : q.fx[k]})`}`))]]), ''); }).join('') + raw('effects', null, CONTENT.effects); } },
  rules: { name: 'Rules', file: 'rules', count: () => Object.keys(CONTENT.rules).length, render(){
    const rows = (o, pre = '') => Object.entries(o).flatMap(([k, v]) => v && typeof v === 'object' && !Array.isArray(v) ? rows(v, pre + k + '.') : [[`<code>${pre}${k}</code>`, Array.isArray(v) ? v.join(' to ') : esc(v)]]);
    return entry('The rules of the age', facts(rows(CONTENT.rules)), raw('rules', null, CONTENT.rules)); } },
};

function renderAlmanac(){
  $('alNav').innerHTML = Object.entries(SECTIONS).map(([k, s]) => `<button class="al-n ${k === AL.section ? 'on' : ''}" data-al="${k}">${s.name}<span class="muted">${s.count()}</span></button>`).join('');
  const s = SECTIONS[AL.section];
  let body;
  try { body = s.render(); } catch (e) { body = `<p style="color:var(--war)">content/${s.file}.json can't be shown: ${esc(e.message)}</p>`; }
  $('alBody').innerHTML = `<h3>${s.name}</h3>${body}`;
  filterAlmanac();
}
function filterAlmanac(){
  const q = AL.q.trim().toLowerCase();
  $('alBody').querySelectorAll('.al-e').forEach(e => { e.hidden = q && !e.textContent.toLowerCase().includes(q); });
}
function openAlmanac(){ renderAlmanac(); $('almanacModal').classList.add('on'); $('alSearch').focus(); }
$('almanac').innerHTML = ic('almanac');
$('almanac').onclick = openAlmanac;
$('alNav').addEventListener('click', e => { const b = e.target.closest('[data-al]'); if (!b) return; AL.section = b.dataset.al; renderAlmanac(); $('alBody').scrollTop = 0; });
$('alSearch').addEventListener('input', e => { AL.q = e.target.value; filterAlmanac(); });
