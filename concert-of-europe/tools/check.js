// Keeps the game consistent with its content (content/*.json) and the registry. Runs before every build; any problem stops the build.
//  1. Every icon the code asks for exists in the registry.
//  2. No drawing is made outside the registry (no shapes with hand-typed coordinates in other UI files).
//  3. No browser title tooltips (they pop up late, on top of the instant ones): use data-tip and data-desc.
//  4. No visible text (code, template or content) uses a word the registry says to avoid (e.g. "treasury" instead of "Gold").
//  5. Content refers only to things that exist: every province, nation, people, ambition and drawing it names.
//  6. Every template in the content fills in (no unknown {path} or format), and states no hand-typed number.
//  7. Engine and content match both ways: every number the engine reads exists, and every number in the content is read.
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
const structural = require('./validate').validateContent(require('./content').load());
if (structural.length) { console.error('Content validation failed:\n  ' + structural.join('\n  ')); process.exit(1); }
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const ctx = {}; vm.createContext(ctx);
vm.runInContext(require('./content').source() + read('src/text.js') + read('src/ui/registry.js') + '\nthis.REG = REG; this.WORDS = WORDS; this.DRAW = DRAW; this.EMB = EMB; this.CONTENT = CONTENT; this.say = say; this.maps = [TYPE_IC, OPT_IC, MARK_IC, WORD_IC];', ctx);
const REG = ctx.REG, problems = [];
const rule2Files = ['src/sim.js','src/data.js','src/text.js','src/ui/map.js','src/ui/panel.js','src/ui/almanac.js','src/ui/main.js','map/build-map.js'];
rule2Files.forEach(f => problems.push(...require('./check-rule2').checkSource(read(f), f)));
const lineOf = (src, i) => src.slice(0, i).split('\n').length;

// ---- 0: every source file parses (a syntax error would otherwise only show in the browser) ----
['src/text.js', 'src/data.js', 'src/sim.js', 'src/ui/registry.js', 'src/ui/map.js', 'src/ui/panel.js', 'src/ui/almanac.js', 'src/ui/main.js'].forEach(f => {
  try { new vm.Script(read(f), { filename: f }); } catch (e) { problems.push(`${f}: ${e.message}`); } });

// ---- 1 and 2: icons ----
const UI = ['src/ui/map.js', 'src/ui/panel.js', 'src/ui/almanac.js', 'src/ui/main.js'];
ctx.maps.forEach(m => Object.values(m).forEach(k => { if (!REG[k]) problems.push(`registry.js: icon map points at "${k}", which is not in REG`); }));
// an event's map mark is drawn through the map's mark icons, so it must be one of them (or empty for none)
Object.entries(ctx.CONTENT.events).forEach(([id, e]) => { if (e.mark && !Object.hasOwn(ctx.maps[2], e.mark)) problems.push(`events.json ${id}: map mark "${e.mark}" is not a map mark (registry.js MARK_IC)`); });
const ICON_USE = /\b(?:ic|glyph|nm|statTile|row|line|board)\(\s*'([A-Za-z]+)'|\bREG\.([A-Za-z]+)|\bicon:\s*'([A-Za-z]+)'/g;
const DRAWN = /<(?:path|circle|ellipse|polygon|polyline|line)\b[^>]*\s(?:d|cx|x1|points)="-?[\d.M]/g;
UI.forEach(f => {
  const src = read(f); let m;
  while ((m = ICON_USE.exec(src))) { const k = m[1] || m[2] || m[3]; if (!REG[k]) problems.push(`${f}:${lineOf(src, m.index)}: unknown icon "${k}"`); }
  while ((m = DRAWN.exec(src))) problems.push(`${f}:${lineOf(src, m.index)}: a shape drawn outside the registry: ${m[0].slice(0, 40)}…`);
});

// ---- 3: no native tooltips ----
const NATIVE = /<title>|\stitle="/g;
[...UI, 'src/ui/registry.js'].forEach(f => { const src = read(f); let m;
  while ((m = NATIVE.exec(src))) problems.push(`${f}:${lineOf(src, m.index)}: a browser title tooltip; use data-tip (and data-desc) instead`); });
{ const t = read('src/ui/index.template.html'), body = t.slice(t.indexOf('</head>')); let m;
  while ((m = NATIVE.exec(body))) problems.push(`src/ui/index.template.html:${lineOf(t, t.indexOf('</head>') + m.index)}: a browser title tooltip; use data-tip instead`); }

// ---- 4: words ----
// the text inside JS string literals, with ${…} code removed (nested strings inside it are collected too)
function strings(src){
  const out = []; let i = 0;
  function code(stopAtBrace){
    let depth = 0;
    while (i < src.length) {
      const c = src[i], n = src[i + 1];
      if (c === '/' && n === '/') { i = src.indexOf('\n', i); if (i < 0) i = src.length; continue; }
      if (c === '/' && n === '*') { i = src.indexOf('*/', i) + 2; continue; }
      if (c === '/' && /[=(,:;!&|?{}\[\n]\s*$/.test(src.slice(Math.max(0, i - 20), i))) { // a regex literal
        i++; let cls = false; while (i < src.length && (src[i] !== '/' || cls)) { if (src[i] === '\\') i++; else if (src[i] === '[') cls = true; else if (src[i] === ']') cls = false; i++; } i++; continue; }
      if (c === "'" || c === '"') { const q = c; let s = ''; i++; while (i < src.length && src[i] !== q) { if (src[i] === '\\') { s += src[i + 1]; i += 2; } else s += src[i++]; } i++; out.push({ s, at: i }); continue; }
      if (c === '`') { i++; out.push({ s: tpl(), at: i }); continue; }
      if (stopAtBrace) { if (c === '{') depth++; if (c === '}') { if (!depth) { i++; return; } depth--; } }
      i++;
    }
  }
  function tpl(){
    let s = '';
    while (i < src.length && src[i] !== '`') {
      if (src[i] === '\\') { s += src[i + 1]; i += 2; continue; }
      if (src[i] === '$' && src[i + 1] === '{') { i += 2; code(true); s += ' '; continue; }
      s += src[i++];
    }
    i++; return s;
  }
  code(false);
  return out;
}
// visible text of an HTML fragment: text between tags plus title/aria-label/placeholder values
const visible = h => [...h.matchAll(/\b(?:title|aria-label|placeholder|data-tip|data-desc)="([^"]*)"/g)].map(m => m[1]).join(' · ') + ' ' + h.replace(/<[^>]*>/g, ' ').replace(/var\(--[^)]*\)/g, ' ');
const NAMED = { ...ctx.WORDS, ...REG };
const avoid = Object.entries(NAMED).flatMap(([k, e]) => (e.avoid || []).map(w => ({ k, w,
  re: new RegExp((/^\w/.test(w) ? '\\b' : '') + w.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&') + '\\b', 'i') })));
function checkText(file, text, line){
  avoid.forEach(({ k, w, re }) => { const m = text.match(re); if (m) problems.push(`${file}:${line}: "${m[0]}" in visible text; the registry calls it "${NAMED[k].name}"  ⟶  ${text.trim().replace(/\s+/g, ' ').slice(0, 90)}`); });
}
['src/sim.js', 'src/ui/registry.js', ...UI].forEach(f => {
  const src = read(f);
  strings(src).forEach(({ s, at }) => {
    if (/^[\w.\-#:%\/]*$/.test(s)) return; // keys, ids, colours: not prose
    checkText(f, visible(s), lineOf(src, at));
  });
});
// the content's own words: every string in content/*.json except the avoided words themselves, ids and colours
const C = ctx.CONTENT;
(function words(v, where){
  // proper names (the Papal States) are names, not words; placeholders are paths, not words
  if (typeof v === 'string') { if (!/^[\w.\-#]*$/.test(v) && !/^content\.(nations|provinces)\.[^.]+\.name$/.test(where)) checkText(where, visible(v.replace(/\{[^}]*\}/g, ' ')), 0); return; }
  if (v && typeof v === 'object') Object.entries(v).forEach(([k, x]) => { if (k !== 'avoid') words(x, `${where}.${k}`); });
})(C, 'content');
const tpl = read('src/ui/index.template.html').replace(/<(style|script)[\s\S]*?<\/\1>/g, m => m.replace(/[^\n]/g, ''));
tpl.split('\n').forEach((l, n) => checkText('src/ui/index.template.html', visible(l), n + 1));

// ---- 5: references inside the content ----
const bad = (where, what) => problems.push(`content/${where}: ${what}`);
const prov = (w, id) => { if (!C.provinces[id]) bad(w, `no province "${id}"`); };
const nation = (w, t) => { if (!C.nations[t]) bad(w, `no nation "${t}"`); };
const people = (w, p) => { if (!C.peoples[p]) bad(w, `no people "${p}" in peoples.json`); };
Object.entries(C.provinces).forEach(([id, p]) => { nation(`provinces.json ${id}`, p.owner); people(`provinces.json ${id}`, p.people);
  if (C.nations[p.owner] && !C.nations[p.owner].starts) bad(`provinces.json ${id}`, `${p.owner} is not on the map at the start, so it can't hold a province then`); });
['land', 'sea'].forEach(k => C.map[k].forEach(x => x.forEach(id => prov(`map.json ${k}`, id))));
// one table of nations: every one has the same fields, and says whether it is on the map at the start
const NATION_FIELDS = ['name', 'adj', 'color', 'people', 'ambition', 'hawk', 'patience', 'starts'];
Object.entries(C.nations).forEach(([t, n]) => { const w = `nations.json ${t}`; people(w, n.people); (n.accepts || []).forEach(p => people(w, p));
  NATION_FIELDS.forEach(k => { if (n[k] == null) bad(w, `has no "${k}"`); });
  if (typeof n.starts !== 'boolean') bad(w, '"starts" must be true or false');
  (n.allies || []).forEach(o => nation(w, o)); Object.keys(n.relations || {}).forEach(o => nation(w, o));
  if (n.starts && !Object.values(C.provinces).some(p => p.owner === t)) bad(w, 'starts on the map but holds no province'); });
// an uprising rises as its people's one nation that was not on the map at the start: two would be a tie
Object.keys(C.peoples).forEach(p => { const born = Object.keys(C.nations).filter(t => C.nations[t].people === p && !C.nations[t].starts);
  if (born.length > 1) bad('nations.json', `the ${p} people have ${born.length} nations born in uprisings (${born.join(', ')}); an uprising could rise as either`); });
const ambition = (w, id) => { if (!C.ambitions[id]) bad(w, `no ambition "${id}"`); };
Object.entries(C.nations).forEach(([t, n]) => ambition(`nations.json ${t}`, n.ambition));
Object.entries(C.ambitions).forEach(([id, d]) => { const w = `ambitions.json ${id}`;
  if (!C.ambitionKinds[d.kind]) bad(w, `no kind "${d.kind}" in ambitionKinds.json`);
  if (d.kind !== 'unite') return;
  d.peoples.forEach(p => people(w, p)); d.provinces.forEach(x => prov(w, x));
  if (d.need > d.provinces.length) bad(w, `needs ${d.need} of only ${d.provinces.length} provinces`);
  if (!Object.values(C.nations).some(n => n.ambition === id)) bad(w, 'no nation holds it'); });
Object.keys(C.ambitionKinds).forEach(k => { if (!Object.values(C.ambitions).some(a => a.kind === k)) bad('ambitionKinds.json', `no ambition is of kind "${k}"`); });
{ const odds = C.rarities.reduce((s, r) => s + r.odds, 0); if (Math.abs(odds - 1) > 1e-9) bad('rarities.json', `odds add up to ${odds}, not 1`); }
Object.entries(C.concepts).forEach(([k, c]) => { if (!c.word && !ctx.DRAW[k]) problems.push(`src/ui/registry.js: concept "${k}" has no drawing in DRAW`); });
Object.keys(ctx.DRAW).forEach(k => { if (!C.concepts[k] || C.concepts[k].word) problems.push(`src/ui/registry.js: drawing for "${k}", which is not a concept with an icon in concepts.json`); });
if (C.eras.filter(e => e.start).length !== 1) bad('eras.json', 'exactly one way of war must be marked start');

// Generated geography is checked identically by the build and headless loader.
problems.push(...require('./validate').validateGeometry(C, JSON.parse(read('map/geo.json'))));

// ---- 6: templates ----
// every placeholder a template may use, besides its own fields: the words a running world fills in
const RUNTIME = ['friend', 'culture', 'landmark', 'mood', 'a', 'b', 'nation', 'nations', 'province', 'people', 'era', 'find', 'pretext', 'gold', 'war', 'the', 'title', 'need', 'n', 'by', 'count', 'v', 'ruler', 'from', 'advance', 'season', 'year', 'remaining'];
// a runtime word that is also a content file (nations) is left to the content, so {nations.FRA.name} still checks
const probe = Object.fromEntries(RUNTIME.filter(k => !(k in C)).map(k => [k, 'X']));
function template(where, tpl, own){
  if (typeof tpl !== 'string') return;
  try { ctx.say(tpl, Object.assign({}, own, probe, own)); } catch (e) { bad(where, `${e.message} in "${tpl.slice(0, 70)}"`); }
  const typed = tpl.replace(/\{[^}]*\}/g, '').replace(/<[^>]*>/g, '').match(/\d+/);
  if (typed) bad(where, `the number ${typed[0]} is typed into the text; put it in the data and write {its.path} ("${tpl.slice(0, 70)}")`);
}
// every piece of prose anywhere in the content is a template: it must fill in, and type no number.
// Its own fields are its entry's and its parent object's (a ruler's effect text sees {v}).
const PROSE = v => typeof v === 'string' && !/^[\w.\-#]*$/.test(v);
const NOT_PROSE = new Set(['avoid', 'names', 'rulerNames']);   // lists of words, not sentences
function walkProse(v, where, entry, parent, key, fn){
  if (NOT_PROSE.has(key)) return;
  if (PROSE(v)) return fn(v, where, Object.assign({}, entry, parent), key);
  if (v && typeof v === 'object') Object.entries(v).forEach(([k, x]) => walkProse(x, `${where}.${k}`, entry, Array.isArray(v) ? parent : v, k, fn));
}
const eachProse = fn => Object.entries(C).forEach(([file, data]) => {
  if (!data || typeof data !== 'object') return;
  Object.entries(data).forEach(([id, e]) => walkProse(e, `${file}.json ${id}`, e && typeof e === 'object' ? e : {}, e && typeof e === 'object' ? e : {}, id, fn)); });
eachProse((tpl, where, own) => template(where, tpl, own));

// A trait's three slots share one record shape; a flat slot has two strengths, the others three.
Object.entries(C.rulers).forEach(([id, t]) => {
  const w = `rulers.json ${id}`;
  if (!ctx.EMB[t.emblem]) bad(w, `no drawing "${t.emblem}" in EMB`);
  for (const slot of ['main','flat','malus']) {
    const entries = t[slot], want = slot === 'flat' ? 2 : 3;
    if (entries.length !== want) bad(w, `${slot} needs ${want} strengths`);
    if (slot !== 'flat' && new Set(entries.map(e => e.fx)).size !== 1) bad(w, `${slot} must change one effect at every strength`);
    for (const e of entries) {
      if (!C.effects[e.fx]) bad(w, `${slot}: no effect "${e.fx}"`);
      else if (C.effects[e.fx].targeted) bad(w, 'a ruler effect cannot require a permanent advance target');
      template(`${w}.${slot}`, e.text, { v:e.value });
      if (e.fx === 'province' && !e.news) bad(w, 'a province grant requires a news template');
    }
  }
  if (t.main[0].fx === t.malus[0].fx || t.flat.some(e => [t.main[0].fx,t.malus[0].fx].includes(e.fx))) bad(w, 'two slots use the same effect');
});
{ const mains = new Map(); for (const [id,t] of Object.entries(C.rulers)) {
  const key = t.main[0].fx;
  if (mains.has(key)) bad(`rulers.json ${id}`, `shares its main bonus with ${mains.get(key)}`);
  mains.set(key,id);
} }
const fxOfTrait = t => ['main','flat','malus'].flatMap(slot => t[slot].map(e => e.fx));
Object.keys(C.effects).forEach(k => { if (!Object.values(C.rulers).some(t => fxOfTrait(t).includes(k)) && !Object.values(C.advances.cards).some(a => a.effects.some(e => e.fx === k))) bad('effects.json', `"${k}" is used by no ruler or advance`); });
C.rarities.forEach(r => {
  for (const k of ['main','malus']) if (![0,1,2].includes(r[k])) bad('rarities.json', `${k} must select a valid slot strength`);
  if (![null,0,1].includes(r.flat)) bad('rarities.json', 'flat must be null, zero or one');
});
// Permanent advances have their own five strength levels, independent of the ruler slot mapping.
{ const a = C.advances, ids = Object.keys(a.cards), categories = Object.keys(a.categories);
  if (C.rarities.length !== 5) bad('rarities.json', 'advances require five rarity tiers');
  if (!Array.isArray(a.years) || !a.years.length || a.years.some((y, i) => !Number.isInteger(y) || y < C.rules.start || y > C.rules.end.year || (i && y <= a.years[i - 1]))) bad('advances.json', 'years must be ordered unique game years');
  if (!Number.isInteger(a.season) || !C.rules.seasons[a.season]) bad('advances.json', 'unknown scheduled season');
  if (categories.length !== C.rules.heirs) bad('advances.json', 'one category per offered card is required');
  categories.forEach(k => { if (!a.categories[k].name || !REG[a.categories[k].icon]) bad('advances.json', `category ${k} needs a name and registered icon`); });
  if (!REG.advance || ctx.DRAW.advance.draw === ctx.DRAW.reform.draw) bad('concepts.json', 'development needs its own registered icon');
  const grants = new Set([...read('src/sim.js').matchAll(/\bv\('(\w+)'\)/g)].map(m => m[1]));
  const readFx = new Set([...read('src/sim.js').matchAll(/\bfx\(\s*[^,]+,\s*'(\w+)'/g)].map(m => m[1]));
  const advanceIcons = new Set();
  ids.forEach(id => { const d = a.cards[id], w = `advances.json ${id}`;
    if (!/^[a-z][a-zA-Z]*$/.test(id) || !d.name) bad(w, 'needs a stable ID and name');
    if (!categories.includes(d.category)) bad(w, `unknown category ${d.category}`);
    if (!REG[d.icon]) bad(w, `unknown icon ${d.icon}`);
    if (advanceIcons.has(d.icon)) bad(w, 'advance identities must use distinct registered icons');
    advanceIcons.add(d.icon);
    if (!['any', 'coast', 'border', 'target'].includes(d.requires) || !a.eligibility[d.requires]) bad(w, 'unknown or unexplained eligibility');
    if (!Array.isArray(d.effects) || d.effects.length < 1 || d.effects.length > 2) return bad(w, 'needs one or two permanent effects');
    if (new Set(d.effects.map(e => e.fx)).size !== d.effects.length) bad(w, 'duplicate effects');
    if (d.effects.some(e => C.effects[e.fx] && C.effects[e.fx].targeted) !== (d.requires === 'target')) bad(w, 'target eligibility and effect must agree');
    d.effects.forEach(e => {
      if (!C.effects[e.fx] || !readFx.has(e.fx) || grants.has(e.fx)) bad(w, `effect ${e.fx} must be a registered, applied permanent modifier`);
      if (!Array.isArray(e.values) || e.values.length !== C.rarities.length || e.values.some(v => !Number.isFinite(v) || v <= 0)) bad(w, 'needs five positive finite strength values');
      if (Array.isArray(e.values) && C.effects[e.fx]) e.values.forEach((v, g) => {
        const neutral = C.effects[e.fx].none, direction = Math.sign(e.values[0] - neutral);
        if (direction === 0 || Math.sign(v - neutral) !== direction || (g && direction * (v - e.values[g - 1]) <= 0)) bad(w, 'each rarity must strengthen the same bonus');
        template(w, e.text, { v, nation: 'X' });
        if (!e.text || !e.text.includes('{v')) bad(w, 'effect wording must state its value');
        if (C.effects[e.fx] && C.effects[e.fx].targeted && !e.text.includes('{nation}')) bad(w, 'targeted effect must name its target');
      });
    });
  });
  const book = JSON.stringify(C.rulebook.Development || []);
  for (const path of ['advances.years', 'advances.season', ...categories.map(k => `advances.categories.${k}.name`), ...C.rarities.flatMap((r, g) => [`rarities.${g}.name`, `rarities.${g}.odds`])])
    if (!book.includes('{' + path)) bad('rulebook.json', `development rules must explain ${path}`);
  // The prose is content; these required topics guard against accidentally dropping lifecycle/conditional explanations.
  for (const topic of ['pauses', 'randomly', 'multiply', 'planning years add', 'survive ruler', 'only once', 'non-ally', 'core land', 'no retrospective', 'final scheduled'])
    if (!book.toLowerCase().includes(topic)) bad('rulebook.json', `development explanation missing: ${topic}`);
}
// the rulebook: plain sentences for the Almanac, one or more for every rule
Object.entries(C.rulebook).forEach(([g, lines]) => lines.forEach((l, i) => template(`rulebook.json "${g}" ${i + 1}`, l, {})));
{ const book = JSON.stringify(C.rulebook);
  (function leaves(o, pre){ Object.entries(o).forEach(([k, v]) => { const p = pre + k;
    if (v && typeof v === 'object' && !Array.isArray(v)) return leaves(v, p + '.');
    if (!book.includes('{' + p + '|') && !book.includes('{' + p + '}') && !book.includes('{' + p + '/') && !book.includes('/' + p + '|') && !book.includes('{' + p + '.')) bad('rulebook.json', `no sentence explains ${p.slice(6)}`); }); })(C.rules, 'rules.'); }

// ---- 7: engine and content, both ways ----
const SRC = ['src/sim.js', 'src/data.js', ...UI, 'src/ui/registry.js'].map(f => [f, read(f)]);
const all = SRC.map(([, s]) => s).join('\n') + read('src/ui/index.template.html');
const used = new Set();   // "fx.<key>", "rules.<path>", "events.<id>"
SRC.forEach(([f, src]) => { let m;
  // every effect the engine reads exists, and is marked read
  const fe = /\b(?:fx|hasFx)\(\s*[^,]+,\s*'(\w+)'|\bv\('(\w+)'\)/g;
  while ((m = fe.exec(src))) { const k = m[1] || m[2]; if (!C.effects[k]) problems.push(`${f}:${lineOf(src, m.index)}: the effect "${k}" is not in effects.json`); else used.add('fx.' + k); }
  const rl = /\bRULES((?:\.\w+)+)/g;
  while ((m = rl.exec(src))) { let v = C.rules; const ks = m[1].slice(1).split('.'); for (const k of ks) { if (v == null || typeof v !== 'object' || !(k in v)) { problems.push(`${f}:${lineOf(src, m.index)}: RULES${m[1]} is not in rules.json`); break; } v = v[k]; used.add('rules.' + ks.slice(0, ks.indexOf(k) + 1).join('.')); } }
  // a short name for part of the rules (const UP = RULES.uprising, or `, WR = RULES.war` in a list) reads what follows it
  const aliases = [...src.matchAll(/\b([A-Z]\w*) = RULES((?:\.\w+)+)/g)];
  aliases.forEach(([, name, base]) => { const re = new RegExp(`\\b${name}((?:\\.\\w+)+)`, 'g'); let a;
    while ((a = re.exec(src))) { if (src.slice(a.index - 1, a.index) === '.') continue; let v = C.rules; const ks = (base + a[1]).slice(1).split('.'); let p = 'rules';
      for (const k of ks) { if (v == null || typeof v !== 'object' || !(k in v)) { if (!Array.isArray(v)) problems.push(`${f}:${lineOf(src, a.index)}: ${name}${a[1]} (RULES${base}${a[1]}) is not in rules.json`); break; } v = v[k]; p += '.' + k; used.add(p); } } });
  const un = /\bUNREST\.(\w+)/g;   // the interface's shorthand for RULES.unrest
  while ((m = un.exec(src))) { if (!(m[1] in C.rules.unrest)) problems.push(`${f}:${lineOf(src, m.index)}: UNREST.${m[1]} is not in rules.json`); else used.add('rules.unrest.' + m[1]); }
  const ev = /\bEV\.(\w+)/g;
  while ((m = ev.exec(src))) { if (!C.events[m[1]]) problems.push(`${f}:${lineOf(src, m.index)}: EV.${m[1]} is not in events.json`); else used.add('events.' + m[1]); }
});
Object.keys(C.effects).forEach(k => { if (!used.has('fx.' + k)) bad('effects.json', `"${k}" is read nowhere: the engine never applies it`); });
// every rule is read by the engine, the interface or a template ({rules.x} in any content text or {{rules.x}} in the HTML)
// (a sentence that only states a rule doesn't count: the engine or the interface has to act on it)
const html = read('src/ui/index.template.html');
(function leaves(o, pre){ Object.entries(o).forEach(([k, v]) => { const p = pre + k;
  if (v && typeof v === 'object' && !Array.isArray(v)) return leaves(v, p + '.');
  if (!used.has(p) && !html.includes('{{' + p)) bad('rules.json', `${p.slice(6)} is stated but read by no code`); }); })(C.rules, 'rules.');



// ---- 8: uniform event records are validated by tools/validate.js before evaluation ----
Object.entries(C.events).forEach(([id, e]) => {
  if (!e.effect) bad(`events.json ${id}`, 'needs an effect sentence');
});

// ---- 9: the shape of the content ----
{ const num = (w, v, lo, hi) => { if (typeof v !== 'number' || !(v >= lo && v <= hi)) bad(w, `${JSON.stringify(v)} should be a number from ${lo} to ${hi}`); };
  C.rarities.forEach(r => num(`rarities.json ${r.name} odds`, r.odds, 0, 1));
  Object.entries(C.peoples).forEach(([id, p]) => { if (typeof p.name !== 'string' || !p.name) bad(`peoples.json ${id}`, 'needs a name'); });
  Object.entries(C.nations).forEach(([t, n]) => { num(`nations.json ${t} hawk`, n.hawk, 0, 1); num(`nations.json ${t} patience`, n.patience, 0, 1);
    if (n.starts) num(`nations.json ${t} army`, n.army, 1, 1000);
    if (!(n.namePool === 'nation' ? n.rulerNames : C.peoples[n.people].names).length) bad(`nations.json ${t}`, `has no ruler names, and the ${n.people} people have none either`); });
  Object.entries(C.provinces).forEach(([id, p]) => { num(`provinces.json ${id} pop`, p.pop, 0.01, 100); num(`provinces.json ${id} industry`, p.industry, 0, C.rules.build.maxFactories);
    if (!Number.isInteger(p.industry)) bad(`provinces.json ${id}`, 'industry is a number of factories, a whole number'); });
  Object.entries(C.ambitions).forEach(([id, d]) => { if (d.provinces && new Set(d.provinces).size !== d.provinces.length) bad(`ambitions.json ${id}`, 'lists a province twice'); });
  Object.entries(C.effects).forEach(([k, d]) => { if (typeof d.none !== 'number') bad(`effects.json ${k}`, 'needs "none", the value that changes nothing'); if (!d.desc) bad(`effects.json ${k}`, 'needs "desc"'); if (typeof d.targeted !== 'boolean') bad(`effects.json ${k}`, 'targeted must be boolean'); });
  Object.entries(C.temperaments).forEach(([k, t]) => { ['high', 'low'].forEach(h => { if (!Array.isArray(t[h]) || typeof t[h][0] !== 'number' || typeof t[h][1] !== 'string') bad(`temperaments.json ${k}`, `"${h}" should be [threshold, word]`); });
    if (typeof t.mid !== 'string') bad(`temperaments.json ${k}`, '"mid" should be a word'); });
  if (C.rules.heirs > Object.keys(C.rulers).length) bad('rules.json', `heirs: a card can't show ${C.rules.heirs} different traits out of ${Object.keys(C.rulers).length}`);
  // a trait's three effects are different, and only the flat bonus is a one-time grant at coronation (read as v('x') in coronation)
  const sim = read('src/sim.js'), grants = new Set([...sim.matchAll(/\bv\('(\w+)'\)/g)].map(m => m[1]));
  Object.entries(C.rulers).forEach(([t,q]) => {
    for (const slot of ['main','flat','malus']) for (const e of q[slot])
      if (grants.has(e.fx) !== (slot === 'flat')) bad(`rulers.json ${t}`, `${slot} uses an effect from the wrong lifecycle stage: ${e.fx}`);
  }); }


// ---- 10: names come from the content ----
// The name of a province, nation, people, union, event, way of war, trait or rarity lives in its own entry. Anywhere else
// (content prose, the HTML template, any string in the code) it must be a placeholder or come from the data, so renaming
// the entry renames it everywhere. Event names are matched without a leading "The".
{ const NAMES = [];
  const nm = (n, what) => { if (n) NAMES.push({ n: n.replace(/^The /, ''), what }); };
  Object.entries(C.provinces).forEach(([id, p]) => nm(p.name, `province ${id}`));
  Object.entries(C.nations).forEach(([t, n]) => nm(n.name, `nation ${t}`));
  Object.entries(C.peoples).forEach(([id, p]) => nm(p.name, `people ${id}`));
  Object.entries(C.ambitions).forEach(([id, a]) => nm(a.title, `union ${id}`));
  Object.entries(C.events).forEach(([id, e]) => nm(e.name, `event ${id}`));
  C.eras.forEach((e, i) => nm(e.name, `way of war ${i}`));
  Object.entries(C.rulers).forEach(([t, q]) => nm(q.label, `trait ${t}`));
  C.rarities.forEach((r, i) => nm(r.name, `rarity ${i}`));
  Object.entries(C.advances.cards).forEach(([id, d]) => nm(d.name, `advance ${id}`));
  C.rules.seasons.forEach((x, i) => { nm(x, `season ${i}`); nm(x.toLowerCase(), `season ${i}`); });
  const esc = x => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const RE = new RegExp(`(?<![\\w-])(${NAMES.map(x => x.n).sort((a, b) => b.length - a.length).map(esc).join('|')})(?![\\w-])`, 'g');
  const whatOf = n => NAMES.filter(x => x.n === n).map(x => x.what).join(' / ');
  const hits = (text, where, hint) => { const t = text.replace(/\{[^}]*\}/g, ' '); let m; RE.lastIndex = 0;
    while ((m = RE.exec(t))) problems.push(`${where}: "${m[1]}" (${whatOf(m[1])}) is typed here; ${hint}`); };
  // content prose; the fields that define a name are where names live
  const NAME_FIELDS = new Set(['name', 'label', 'title', 'adj', 'pre', 'newName', 'newAdj']);
  eachProse((tpl, where, own, key) => { if (!NAME_FIELDS.has(key)) hits(tpl, `content/${where}`, 'write a placeholder such as {provinces.kie.name}'); });
  // the HTML template, outside its {{placeholders}}
  html.replace(/<(style|script)[\s\S]*?<\/\1>/g, m => m.replace(/[^\n]/g, '')).split('\n').forEach((l, n) => hits(visible(l.replace(/\{\{[^}]*\}\}/g, ' ')), `src/ui/index.template.html:${n + 1}`, 'write {{path}}'));
  // strings in the code: prose, and any string that is exactly a name (a label compared in code)
  ['src/sim.js', 'src/data.js', ...UI, 'src/ui/registry.js'].forEach(f => { const src = read(f);
    strings(src).forEach(({ s, at }) => { if (NAMES.some(x => x.n === s)) problems.push(`${f}:${lineOf(src, at)}: the string "${s}" is a content name; compare ids, not names`);
      else hits(visible(s), `${f}:${lineOf(src, at)}`, 'read it from CONTENT'); }); }); }

// ---- 11: no number typed into the interface's text ----
// A number the player reads comes from the content or the running world, never from a string in the code.
UI.concat(['src/ui/registry.js', 'src/sim.js']).forEach(f => { const src = read(f);
  strings(src).forEach(({ s, at }) => { if (/^[\w.\-#:%\/ ]*$/.test(s) && !/[a-z]{3}.*\d|\d.*[a-z]{3}/i.test(s)) return;
    if (/^(https?:|rgba?\(|rotate\(|translate\(|scale\(|url\()/.test(s.trim())) return;   // addresses and drawing, not text
    const t = visible(s).replace(/&#?\w+;/g, ' ');
    if (/^\s*[+−-]?\d+\s*$/.test(t)) return;   // a bare figure: a sample on the map key, "+1" beside a factory being built
    const m = t.match(/(?<![\w#.-])\d+(?:\.\d+)?%?(?![\w-])/);
    if (m) problems.push(`${f}:${lineOf(src, at)}: the number ${m[0]} is typed into visible text ("${t.trim().replace(/\s+/g, ' ').slice(0, 70)}")`); }); });

// ---- 12: every Almanac page renders, with nothing left unfilled ----
{ const el = () => ({ innerHTML: '', textContent: '', style: {}, dataset: {}, classList: { add(){}, remove(){}, toggle(){}, contains(){ return false; } }, addEventListener(){}, focus(){}, querySelectorAll(){ return []; } });
  const actx = { $: el, document: { getElementById: el, querySelectorAll: () => [] }, S: null, console }; vm.createContext(actx);
  try {
    vm.runInContext(require('./content').source() + read('src/text.js') + read('src/data.js') + 'const GEO = ' + read('map/geo.json') + ';\n' + read('src/sim.js') + read('src/ui/registry.js') +
      read('src/ui/almanac.js').replace(/\nconst AL = /, '\nvar S = null; const AL = ') + '\nthis.SECTIONS = SECTIONS; this.CONTENT = CONTENT; this.advanceEffects = advanceEffects;', actx);
    for (const world of [null, vm.runInContext('createSim(1,GEO)', actx)]) {
    actx.S = world;
    Object.entries(actx.SECTIONS).forEach(([k, s]) => { let h; try { h = s.render(); } catch (e) { problems.push(`src/ui/almanac.js: the ${s.name} page fails: ${e.message}`); return; }
      if (k === 'advances') {
        const plain = h.replace(/<[^>]*>/g, '').replace(/\s+/g, '');
        Object.entries(actx.CONTENT.advances.cards).forEach(([id, d]) => {
          if (!h.includes(d.name) || !h.includes(actx.CONTENT.advances.eligibility[d.requires])) problems.push(`Almanac: missing advance ${id} or its eligibility`);
          actx.CONTENT.rarities.forEach((r, grade) => actx.advanceEffects({ id, grade }, '<i>a nation</i>').forEach(e => {
            const expected = e.text.replace(/<[^>]*>/g, '').replace(/\s+/g, '');
            if (!plain.includes(expected)) problems.push(`Almanac: missing ${id} strength at ${r.name}`);
          }));
        });
        if ((h.match(/class="al-e"/g) || []).length !== Object.keys(actx.CONTENT.advances.cards).length) problems.push('Almanac: incomplete advance catalogue');
        for (const r of actx.CONTENT.rarities) if (!h.includes(r.name)) problems.push('Almanac: missing advance rarity');
      }
      const t = h.replace(/<[^>]*>/g, ' '), m = t.match(/\bundefined\b|\bNaN\b|\[object Object\]|\{[\w.|]+\}/);
      if (m) problems.push(`src/ui/almanac.js: the ${s.name} page shows "${m[0]}" (…${t.slice(Math.max(0, t.indexOf(m[0]) - 60), t.indexOf(m[0]) + 20).replace(/\s+/g, ' ')}…)`); });
    }
  } catch (e) { problems.push(`src/ui/almanac.js: can't load the Almanac to render it: ${e.message}`); } }

if (problems.length) { console.error(`Consistency check failed (${problems.length}):\n  ` + problems.join('\n  ')); process.exit(1); }
console.log(`Consistency check passed: ${Object.keys(REG).length} concepts in the registry.`);
