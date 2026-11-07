// Keeps the interface consistent with src/ui/registry.js. Runs before every build; any problem stops the build.
//  1. Every icon the code asks for exists in the registry.
//  2. No drawing is made outside the registry (no shapes with hand-typed coordinates in other UI files).
//  3. No browser title tooltips (they pop up late, on top of the instant ones): use data-tip and data-desc.
//  4. No visible text uses a word the registry says to avoid (e.g. "treasury" instead of "Gold").
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const ctx = {}; vm.createContext(ctx);
vm.runInContext(read('src/ui/registry.js') + '\nthis.REG = REG; this.WORDS = WORDS; this.maps = [TYPE_IC, OPT_IC, MARK_IC];', ctx);
const REG = ctx.REG, problems = [];
const lineOf = (src, i) => src.slice(0, i).split('\n').length;

// ---- 1 and 2: icons ----
const UI = ['src/ui/map.js', 'src/ui/panel.js', 'src/ui/main.js'];
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
const tpl = read('src/ui/index.template.html').replace(/<(style|script)[\s\S]*?<\/\1>/g, m => m.replace(/[^\n]/g, ''));
tpl.split('\n').forEach((l, n) => checkText('src/ui/index.template.html', visible(l), n + 1));

if (problems.length) { console.error(`Consistency check failed (${problems.length}):\n  ` + problems.join('\n  ')); process.exit(1); }
console.log(`Consistency check passed: ${Object.keys(REG).length} concepts in the registry.`);
