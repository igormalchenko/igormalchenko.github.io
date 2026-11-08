// ---------- the Almanac: every piece of content in the game, read live from CONTENT ----------
// Nothing here is written by hand: every name, number and sentence comes from content/*.json, filled in by
// the same say() and traitEffects() the game uses, so what the Almanac shows is what the engine runs on.
const AL = { section: 'rulers', q: '' };
const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const swatch = color => `<span class="sw" style="background:${color}"></span>`;
const provName = id => CONTENT.provinces[id] ? CONTENT.provinces[id].name : `<b style="color:var(--war)">${esc(id)}?</b>`;
const nationName = tag => CONTENT.nations[tag] ? CONTENT.nations[tag].name : tag;
// an ambition's name: a union's title, or its kind's name (Richest great power, Survive)
const ambitionName = id => { const a = CONTENT.ambitions[id]; return a.title || CONTENT.ambitionKinds[a.kind].name; };
const pctOf = p => `${Math.round(p * 1000) / 10}%`;
const yearly = p => `${pctOf(p)} a year`;
const listOf = xs => xs.join(', ');
const entry = (title, body, opts) => { opts = opts || {}; return `<div class="al-e"${opts.style ? ` style="${opts.style}"` : ''}>
  <div class="al-h">${opts.lead || ''}<div><b class="al-t">${title}</b>${opts.sub ? `<span class="muted"> ${opts.sub}</span>` : ''}</div></div>${body}</div>`; };
const facts = rows => `<dl class="al-f">${rows.filter(r => r && r[1] !== '' && r[1] != null).map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>`;
// sample words for the parts of a sentence that are only known in a running world
const SAMPLE = { a: '<i>a nation</i>', b: '<i>another nation</i>', nation: '<i>a nation</i>', nations: '<i>three nations</i>', province: '<i>a province</i>',
  people: '<i>a people</i>', era: '<i>a new way of war</i>', find: '<i>coal is found</i>', pretext: '<i>a pretext</i>', gold: '<i>some</i>', war: '<i>war</i>' };

const SECTIONS = {
  rulers: { name: 'Rulers', file: 'rulers', count: () => Object.keys(CONTENT.rulers).length, render(){
    const odds = CONTENT.rarities.map(r => `${r.name} ${pctOf(r.odds)}`).join(', ');
    return `<p class="muted">Every heir is a rarity and a trait. Of every heir in Europe: ${odds}; then any trait, all equally likely. A card never shows one trait twice.</p>` +
      Object.entries(CONTENT.rulers).map(([t, q]) => entry(q.label, `<p class="vibe">${q.vibe}</p>${facts(CONTENT.rarities.map((rar, g) => [`<span style="color:${rar.color}">${rar.name}</span>`,
        traitEffects(t, g).map(e => iconize(e.text)).join('<br>')]))}`, { lead: `<svg class="emb" viewBox="-8 -8 16 16">${embBadge(0)}${EMB[t] || ''}</svg>` })).join(''); } },
  nations: { name: 'Nations', file: 'nations', count: () => Object.keys(CONTENT.nations).length, render(){
    return Object.entries(CONTENT.nations).map(([tag, n]) => { const live = S && S.C[tag];
      const amb = ambitionName(n.ambition) + (live && live.ambition && live.ambition.id !== n.ambition ? ` (in this world: ${ambitionName(live.ambition.id)})` : '');
      const rises = Object.keys(CONTENT.peoples).filter(p => risesAs(p) === tag);
      return entry(n.name, facts([
        ['Begins', n.starts ? `on the map in ${CONTENT.rules.start}` : 'born in an uprising'],
        ['People', peopleName(n.people) + (n.accepts ? ` (also accepts ${listOf(n.accepts.map(peopleName))})` : '')],
        ['Ambition', amb], ['Army', n.army != null ? `${n.army}k` : ''], ['Leans to war', n.hawk], ['Patience', n.patience],
        ['Provinces', listOf(Object.entries(CONTENT.provinces).filter(([, p]) => p.owner === tag).map(([, p]) => p.name))],
        ['Rises from', rises.length ? `an uprising of the ${listOf(rises.map(peopleName))} people` : ''],
        ['Allies', n.allies ? listOf(n.allies.map(nationName)) : ''],
        ['Relations', n.relations ? listOf(Object.entries(n.relations).map(([o, v]) => `${nationName(o)} ${v > 0 ? '+' : ''}${v}`)) : ''],
        ['Ruler names', listOf(n.rulerNames || CONTENT.peoples[n.people].names || [])],
        ['In this world', live ? (live.alive ? (live.name !== n.name ? `now ${live.name}` : 'on the map') : 'gone from the map') : S && !n.starts ? 'not yet born' : ''],
      ]), { sub: n.adj, lead: swatch(n.color) }); }).join(''); } },
  peoples: { name: 'Peoples', file: 'peoples', count: () => Object.keys(CONTENT.peoples).length, render(){
    return Object.entries(CONTENT.peoples).map(([p, d]) => { const home = Object.values(CONTENT.provinces).filter(x => x.people === p);
      const unions = Object.values(CONTENT.ambitions).filter(x => x.peoples && x.peoples.includes(p)).map(x => x.title);
      return entry(d.name, facts([['Lives in', listOf(home.map(x => x.name)) || '<span class="muted">no province of its own</span>'],
        ['People', `${Math.round(home.reduce((s, x) => s + x.pop, 0) * 10) / 10}m in ${CONTENT.rules.start}`],
        ['Ruler names', d.names ? listOf(d.names) : ''],
        ['Unites in', listOf(unions)], ['Rises as', risesAs(p) ? nationName(risesAs(p)) : '<span class="muted">no nation: its rebels find no allies</span>'],
        ['Can awaken', CONTENT.events.awakening.peoples.includes(p) || CONTENT.events.shevchenko.people === p ? 'yes' : '']])); }).join(''); } },
  ambitions: { name: 'Ambitions', count: () => Object.keys(CONTENT.ambitions).length, render(){
    const prog = S ? Object.fromEntries(S.unionProgress().map(u => [u.id, u])) : {};
    const holders = id => listOf(Object.values(CONTENT.nations).filter(n => n.ambition === id).map(n => n.name));
    return Object.entries(CONTENT.ambitionKinds).map(([kind, k]) => {
      const ids = Object.keys(CONTENT.ambitions).filter(id => CONTENT.ambitions[id].kind === kind);
      const head = `<p>${say(k.desc, { the: '', title: '<i>the new nation</i>', need: '<i>enough</i>' })}</p><p class="vibe">${say(k.who)}</p>${facts([
        ['A province of its people is worth', k.worth != null ? `${k.worth}× its gold a year` : ''], ['Every expected loss counts', k.losses != null ? `${k.losses}×` : '']])}`;
      if (kind !== 'unite') return entry(k.name, head + facts([['Held by', holders(ids[0])]]), { lead: ic('ambition') });
      return entry(k.name, head, { lead: ic('ambition') }) + ids.map(id => { const d = CONTENT.ambitions[id], u = prog[id];
        return entry(d.title, `${d.note ? `<p class="vibe">${d.note}</p>` : ''}${facts([['Held by', holders(id)], ['People', listOf(d.peoples.map(peopleName))],
          ['To proclaim', `hold ${d.need} of ${d.provinces.length} provinces, from ${d.from}`], ['Provinces', listOf(d.provinces.map(provName))],
          ['In this world', u ? (u.done ? `proclaimed by ${u.done.name}` : u.lead ? `${u.lead.name} holds ${u.n} of ${u.need}` : 'no one left to unite it') : '']])}`,
          { sub: d.adj, lead: ic('proclaim') }); }).join(''); }).join(''); } },
  provinces: { name: 'Provinces', file: 'provinces', count: () => Object.keys(CONTENT.provinces).length, render(){
    // sea crossings as the map has them (map/geo.json), which is what the game plays on
    const ids = Object.keys(CONTENT.provinces), sea = GEO.naval.map(([a, b]) => [ids[a], ids[b]]);
    return `<table class="al-tab"><thead><tr><th>Province</th><th>${WORDS.nation.name} in ${CONTENT.rules.start}</th><th>${ic('culture')}</th><th>${ic('pop')}</th><th>${ic('factory')}</th><th>${ic('trade')}</th><th>${ic('sea')}</th></tr></thead><tbody>${
      ids.map((id, i) => { const p = CONTENT.provinces[id], g = GEO.regions[i];
        return `<tr class="al-e"><td>${p.name}</td><td>${nationName(p.owner)}</td><td>${peopleName(p.people)}</td><td>${p.pop}m</td><td>${p.industry}</td><td>${g && g.coast ? 'coast' : ''}</td>
          <td>${listOf(sea.filter(x => x.includes(id)).map(x => provName(x[0] === id ? x[1] : x[0])))}</td></tr>`; }).join('')}</tbody></table>`; } },
  events: { name: 'Events', file: 'events', count: () => Object.keys(CONTENT.events).length, render(){
    return Object.entries(CONTENT.events).map(([id, e]) => { const when = e.year ? `${['Winter', 'Spring', 'Summer', 'Autumn'][e.season]} ${e.year}`
        : e.years ? `${e.years[0]} to ${e.years[1]}` : e.from ? `from ${e.from}` : e.every ? `at least ${e.every} years after the last` : e.season != null ? `${['winter', 'spring', 'summer', 'autumn'][e.season]}s` : '';
      const lines = ['text', 'rattleText', 'warText'].filter(k => e[k]).map(k => `<p>${say(e[k], Object.assign({}, SAMPLE, e, { province: e.province ? `<i>${provName(e.province)}</i>` : SAMPLE.province, people: e.people || (e.peoples ? e.peoples[0] : SAMPLE.people), nations: typeof e.nations === 'number' ? `<i>${numberWord(e.nations)} nations</i>` : SAMPLE.nations, count: Object.values(CONTENT.nations).filter(n => n.starts).length, find: e.finds ? e.finds[0] : SAMPLE.find, pretext: e.pretexts ? e.pretexts[0] : SAMPLE.pretext, nation: e.nation ? `<i>${nationName(e.nation)}</i>` : SAMPLE.nation }))}</p>`).join('');
      return entry(e.name, lines + facts([['When', when], ['Chance', e.chance != null ? yearly(e.chance) : ''], ['Peoples', e.peoples ? listOf(e.peoples.map(peopleName)) : '']]), { lead: ic('event') }); }).join(''); } },
  eras: { name: 'Ways of war', file: 'eras', count: () => CONTENT.eras.length, render(){
    return CONTENT.eras.map((e, i) => entry(e.name, facts([['Defender fights', `${e.def}× as hard`], ['A fortress stops an advance', pctOf(e.fort)], ['Begins', e.start ? `in ${CONTENT.rules.start}` : 'with a military revolution']]), { lead: ic('war') })).join(''); } },
  concepts: { name: 'Concepts', file: 'concepts', count: () => Object.keys(CONTENT.concepts).length, render(){
    return Object.entries(CONTENT.concepts).map(([k, c]) => entry(c.name, `<p>${esc(say(c.desc))}</p>`, { lead: REG[k] ? ic(k) : '<span class="al-noic"></span>' })).join(''); } },
  effects: { name: 'Ruler effects', file: 'effects', count: () => Object.keys(CONTENT.effects).length, render(){
    const slots = { main: 'main bonus', flat: 'flat bonus', malus: 'malus' };
    return Object.entries(CONTENT.effects).map(([k, d]) => entry(d.desc, facts([['Rulers', listOf(Object.entries(CONTENT.rulers).flatMap(([, q]) =>
      Object.keys(slots).filter(sl => q[sl].fx === k || (q[sl].big && q[sl].big.fx === k)).map(sl => `${q.label} (${slots[sl]})`)))]]))).join(''); } },
  rules: { name: 'Rules', file: 'rules', count: () => Object.values(CONTENT.rulebook).flat().length, render(){
    return Object.entries(CONTENT.rulebook).map(([group, lines]) => entry(group, lines.map(l => `<p>${iconize(say(l))}</p>`).join(''))).join(''); } },
};

function renderAlmanac(){
  $('alNav').innerHTML = Object.entries(SECTIONS).map(([k, s]) => `<button class="al-n ${k === AL.section ? 'on' : ''}" data-al="${k}">${s.name}<span class="muted">${s.count()}</span></button>`).join('');
  const s = SECTIONS[AL.section];
  let body;
  try { body = s.render(); } catch (e) { body = `<p style="color:var(--war)">This page can't be shown: ${esc(e.message)}</p>`; }
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
