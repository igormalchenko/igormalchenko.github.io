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
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const ctx = {}; vm.createContext(ctx);
vm.runInContext(require('./content').source() + read('src/text.js') + read('src/ui/registry.js') + '\nthis.REG = REG; this.WORDS = WORDS; this.DRAW = DRAW; this.EMB = EMB; this.CONTENT = CONTENT; this.say = say; this.maps = [TYPE_IC, OPT_IC, MARK_IC, WORD_IC];', ctx);
const REG = ctx.REG, problems = [];
const lineOf = (src, i) => src.slice(0, i).split('\n').length;

// ---- 0: every source file parses (a syntax error would otherwise only show in the browser) ----
['src/text.js', 'src/data.js', 'src/sim.js', 'src/ui/registry.js', 'src/ui/map.js', 'src/ui/panel.js', 'src/ui/almanac.js', 'src/ui/main.js'].forEach(f => {
  try { new vm.Script(read(f), { filename: f }); } catch (e) { problems.push(`${f}: ${e.message}`); } });

// ---- 1 and 2: icons ----
const UI = ['src/ui/map.js', 'src/ui/panel.js', 'src/ui/almanac.js', 'src/ui/main.js'];
ctx.maps.forEach(m => Object.values(m).forEach(k => { if (!REG[k]) problems.push(`registry.js: icon map points at "${k}", which is not in REG`); }));
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
  if (n.starts && !Object.values(C.provinces).some(p => p.owner === t)) bad(w, 'starts on the map but holds no province');
  if (!n.starts && ['army', 'allies', 'relations'].some(k => k in n)) bad(w, 'a nation born in an uprising gets its army and relations from rules.json newNation, not its own entry'); });
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
['famine', 'compromise'].forEach(k => prov(`events.json ${k}`, C.events[k].province)); C.events.serfdom.provinces.forEach(x => prov('events.json serfdom', x));
['compromise', 'serfdom'].forEach(k => nation(`events.json ${k}`, C.events[k].nation));
C.events.awakening.peoples.forEach(p => people('events.json awakening', p)); people('events.json shevchenko', C.events.shevchenko.people); people('events.json compromise', C.events.compromise.people);
{ const odds = C.rarities.reduce((s, r) => s + r.odds, 0); if (Math.abs(odds - 1) > 1e-9) bad('rarities.json', `odds add up to ${odds}, not 1`); }
Object.entries(C.concepts).forEach(([k, c]) => { if (!c.word && !ctx.DRAW[k]) problems.push(`src/ui/registry.js: concept "${k}" has no drawing in DRAW`); });
Object.keys(ctx.DRAW).forEach(k => { if (!C.concepts[k] || C.concepts[k].word) problems.push(`src/ui/registry.js: drawing for "${k}", which is not a concept with an icon in concepts.json`); });
if (C.eras.filter(e => e.start).length !== 1) bad('eras.json', 'exactly one way of war must be marked start');

// ---- 6: templates ----
// every placeholder a template may use, besides its own fields: the words a running world fills in
const RUNTIME = ['friend', 'culture', 'landmark', 'mood', 'a', 'b', 'nation', 'nations', 'province', 'people', 'era', 'find', 'pretext', 'gold', 'war', 'the', 'title', 'need', 'n', 'by', 'count'];
const probe = Object.fromEntries(RUNTIME.map(k => [k, 'X']));
const TEXT_FIELDS = ['desc', 'text', 'rattleText', 'warText', 'proclaimText', 'joinText', 'vibe', 'fx', 'who', 'name', 'label', 'epi', 'heading', 'aside'];
function template(where, tpl, own){
  if (typeof tpl !== 'string') return;
  try { ctx.say(tpl, Object.assign({}, own, probe, own)); } catch (e) { bad(where, `${e.message} in "${tpl.slice(0, 70)}"`); }
  const typed = tpl.replace(/\{[^}]*\}/g, '').match(/\d+/);
  if (typed) bad(where, `the number ${typed[0]} is typed into the text; put it in the data and write {its.path} ("${tpl.slice(0, 70)}")`);
}
const own = {};
Object.entries(C).forEach(([file, data]) => {
  if (!data || typeof data !== 'object' || Array.isArray(data) && file !== 'eras') return;
  Object.entries(data).forEach(([id, e]) => { if (!e || typeof e !== 'object') return;
    TEXT_FIELDS.forEach(f => template(`${file}.json ${id}.${f}`, e[f], Object.assign({}, e, own[file] ? own[file](e) : {}))); });
});

// rulers: a trait has a main bonus and a malus with a small, medium and big value, and a flat bonus with a small and a medium one
// (or a small one and, at Legendary, an effect of its own); every effect is described in effects.json
Object.entries(C.rulers).forEach(([t, q]) => { const w = `rulers.json ${t}`;
  ['label', 'vibe', 'main', 'flat', 'malus'].forEach(k => { if (q[k] == null) bad(w, `has no "${k}"`); });
  if (!ctx.EMB[t]) problems.push(`src/ui/registry.js: ruler "${t}" has no emblem in EMB`);
  ['main', 'flat', 'malus'].forEach(sl => { const e = q[sl]; if (!e) return;
    const want = sl === 'flat' ? (e.big ? 1 : 2) : 3;
    if (!Array.isArray(e.values) || e.values.length !== want) bad(w, `${sl} needs ${want} value${want > 1 ? 's' : ''}`);
    [e, e.big].filter(Boolean).forEach(x => { if (!C.effects[x.fx]) bad(w, `${sl}: no effect "${x.fx}" in effects.json`);
      (x.values || [x.value]).forEach(v => template(`${w} ${sl}`, x.text, { v })); }); });
  if (q.main.fx === q.malus.fx) bad(w, 'its main bonus and malus are the same effect'); });
{ const mains = {}; Object.entries(C.rulers).forEach(([t, q]) => { if (mains[q.main.fx]) bad(`rulers.json ${t}`, `shares its main bonus (${q.main.fx}) with ${mains[q.main.fx]}`); mains[q.main.fx] = t; }); }
Object.keys(ctx.EMB).forEach(t => { if (!C.rulers[t]) problems.push(`src/ui/registry.js: emblem for "${t}", which is not in rulers.json`); });
const fxOfTrait = q => ['main', 'flat', 'malus'].flatMap(sl => [q[sl].fx, q[sl].big && q[sl].big.fx]).filter(Boolean);
Object.keys(C.effects).forEach(k => { if (!Object.values(C.rulers).some(q => fxOfTrait(q).includes(k))) bad('effects.json', `"${k}" is used by no ruler`); });
C.rarities.forEach((r, g) => { const w = `rarities.json ${r.name}`;
  ['main', 'malus'].forEach(k => { if (![0, 1, 2].includes(r[k])) bad(w, `${k} must be 0, 1 or 2 (small, medium, big)`); });
  if (![null, 0, 1].includes(r.flat)) bad(w, 'flat must be null, 0 or 1 (none, small, medium)'); });
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
  const un = /\bUNREST\.(\w+)/g;   // the interface's shorthand for RULES.unrest
  while ((m = un.exec(src))) { if (!(m[1] in C.rules.unrest)) problems.push(`${f}:${lineOf(src, m.index)}: UNREST.${m[1]} is not in rules.json`); else used.add('rules.unrest.' + m[1]); }
  const ev = /\bEV\.(\w+)/g;
  while ((m = ev.exec(src))) { if (!C.events[m[1]]) problems.push(`${f}:${lineOf(src, m.index)}: EV.${m[1]} is not in events.json`); else used.add('events.' + m[1]); }
});
Object.keys(C.effects).forEach(k => { if (!used.has('fx.' + k)) bad('effects.json', `"${k}" is read nowhere: the engine never applies it`); });
// every rule is read by the engine, the interface or a template ({rules.x} in any content text or {{rules.x}} in the HTML)
const textAll = JSON.stringify(C) + read('src/ui/index.template.html') + SRC.map(([, s]) => s).join('');
(function leaves(o, pre){ Object.entries(o).forEach(([k, v]) => { const p = pre + k;
  if (v && typeof v === 'object' && !Array.isArray(v)) return leaves(v, p + '.');
  if (!used.has(p) && !textAll.includes('{' + p) && !textAll.includes('{{' + p)) bad('rules.json', `${p.slice(6)} is read nowhere`); }); })(C.rules, 'rules.');
Object.keys(C.events).forEach(k => { if (!used.has('events.' + k)) bad('events.json', `event "${k}" is never run by the engine`); });

if (problems.length) { console.error(`Consistency check failed (${problems.length}):\n  ` + problems.join('\n  ')); process.exit(1); }
console.log(`Consistency check passed: ${Object.keys(REG).length} concepts in the registry.`);
