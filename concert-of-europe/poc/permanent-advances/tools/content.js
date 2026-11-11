// The game's content: every file in content/*.json, as one object keyed by file name (content/rulers.json → CONTENT.rulers).
// The build, the headless tools and the map builder all load it from here, so they all see the same data.
//   node tools/content.js --format   rewrites every file in the house layout (anything that fits on a line stays on one line)
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '..', 'content');
const files = () => fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort();
function load(){
  const out = {};
  files().forEach(f => {
    const k = f.replace(/\.json$/, '');
    try { out[k] = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); }
    catch (e) { throw new Error(`content/${f}: ${e.message}`); }
  });
  return out;
}
// the JavaScript the game is built with: one constant every other file reads
const source = () => `const CONTENT = ${JSON.stringify(load())};\n`;

// house layout: one line per value when it fits, nested otherwise
const flat = v => v === null || typeof v !== 'object' ? JSON.stringify(v)
  : Array.isArray(v) ? `[${v.map(flat).join(', ')}]` : `{${Object.entries(v).map(([k, x]) => `${JSON.stringify(k)}: ${flat(x)}`).join(', ')}}`;
function format(v, ind = '', lead = 0){
  const one = flat(v);
  if (ind.length + lead + one.length <= 140 || v === null || typeof v !== 'object') return one;
  const inner = ind + '  ';
  if (Array.isArray(v)) return `[\n${v.map(x => inner + format(x, inner)).join(',\n')}\n${ind}]`;
  return `{\n${Object.entries(v).map(([k, x]) => `${inner}${JSON.stringify(k)}: ${format(x, inner, k.length + 4)}`).join(',\n')}\n${ind}}`;
}
if (require.main === module && process.argv.includes('--format')) {
  files().forEach(f => { const p = path.join(dir, f); fs.writeFileSync(p, format(JSON.parse(fs.readFileSync(p, 'utf8'))) + '\n'); });
  console.log(`formatted ${files().length} files`);
}
module.exports = { load, source, format, dir };
