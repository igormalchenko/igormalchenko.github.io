// ===================== TEXT FROM CONTENT =====================
// Every sentence that states a number takes it from content/, never types it. A template says
// {path|format|format}: the path is looked up in the context, then in the whole content (so any text can
// name any entry, as {provinces.kie.name} or {rules.start}), `a/b` divides two paths, and each format turns
// the value into words. say() refuses a path that doesn't exist and anything left in braces, so a renamed
// entry or a typo breaks the build instead of printing "undefined" or "{pop|nonsense}".
const NUMBER_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve',
  'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const near = (x, y) => Math.abs(x - y) < 1e-9;
function numberWord(n){
  if (n !== Math.round(n) || n < 0 || n > 99) return String(n);
  return n < 20 ? NUMBER_WORDS[n] : TENS[Math.floor(n / 10)] + (n % 10 ? '-' + NUMBER_WORDS[n % 10] : '');
}
const FRACTIONS = [[0.5, 'half'], [0.25, 'a quarter'], [0.75, 'three quarters'], [1 / 3, 'a third'], [0.2, 'a fifth'], [0.1, 'a tenth'], [0.05, 'one in twenty']];
// how many times something is multiplied, in words: twice, three times, half again, nearly twice
function timesWord(x){
  if (near(x, 1.5)) return 'half again';
  if (near(x, 2)) return 'twice';
  if (near(x, Math.round(x))) return `${numberWord(Math.round(x))} times`;
  if (near(x * 2, Math.round(x * 2))) return `${numberWord(Math.floor(x))} and a half times`;
  const up = Math.ceil(x); if (up - x <= 0.25) return `nearly ${timesWord(up)}`;
  return `${x} times`;
}
const pct = x => `${Math.round(x * 100)}%`;
const FORMATS = {
  // value to value
  inv: x => 1 - x,                                             // 0.75 kept → 0.25 lost
  thrift: x => Math.pow(3, (x - 0.5) * 2),                     // a thrift temper → how dear he holds gold (see thriftOf)
  horizon: (x, ctx) => Math.round(ctx.rules.horizon.min + x * ctx.rules.horizon.span),   // a patience → years planned ahead
  // value to words
  word: x => numberWord(x),
  Word: x => { const w = numberWord(x); return w.charAt(0).toUpperCase() + w.slice(1); },
  pct,
  up: x => pct(x - 1),                                         // 1.4 → 40% (more)
  down: x => pct(1 - x),                                       // 0.7 → 30% (less)
  frac: x => { const f = FRACTIONS.find(([v]) => Math.abs(v - x) < 1e-9); return f ? f[1] : pct(x); },
  times: timesWord,
  harder: x => x < 2 ? `${pct(x - 1)} harder` : `${timesWord(x)} as hard`,
  x: x => near(x, 2) ? 'double' : near(x, 3) ? 'triple' : `${timesWord(x)} over`,
  xs: x => near(x, 2) ? 'doubles' : near(x, 3) ? 'triples' : `multiplies by ${x}`,
  span: x => near(x, 10) ? 'a decade' : `${numberWord(x)} years`,  // years
  season: x => CONTENT.rules.seasons[x].toLowerCase(),         // a season's number → its name in a sentence
  list: xs => xs.length > 1 ? xs.slice(0, -1).join(', ') + ' and ' + xs[xs.length - 1] : xs.join(''),
  points: x => `${Math.round(x * 100)} points`,                // 0.25 → 25 points (of a chance)
  signed: x => x < 0 ? `−${Math.abs(x)}` : `+${x}`,             // −5, +20
  abs: x => Math.abs(x),
  s: x => x === 1 ? '' : 's',                                  // province{v|s}
  ies: x => x === 1 ? 'y' : 'ies',                             // factor{v|ies}
  years: x => { const y = x / 4; return `${numberWord(y)} year${y === 1 ? '' : 's'}`; },   // seasons as years
  people: x => peopleName(x),                                   // a people's id → its name
  nation: x => CONTENT.nations[x] ? CONTENT.nations[x].name : x,                // a nation's tag → its name
  place: x => { const nm = id => CONTENT.provinces[id] ? CONTENT.provinces[id].name : id;   // a province id (or a list) → its name
    const xs = [].concat(x).map(nm); return xs.length > 1 ? xs.slice(0, -1).join(', ') + ' and ' + xs[xs.length - 1] : xs.join(''); },
};
// a people's name from its id (content/peoples.json)
const peopleName = p => CONTENT.peoples[p] ? CONTENT.peoples[p].name : p;
function lookup(path, ctx){
  let v = ctx; for (const k of path.split('.')) { if (v == null || !(k in Object(v))) throw new Error(`say: no "${path}"`); v = v[k]; }
  return v;
}
function say(tpl, ctx = {}){
  const c = Object.assign({}, CONTENT, ctx);
  const out = tpl.replace(/\{([\w.\/]+)((?:\|\w+)*)\}/g, (_, path, fmts) => {
    // an entry's own field wins (a union's own `provinces` list), but a path it doesn't have is looked up in the content
    let v = path.split('/').map(p => { try { return lookup(p, c); } catch (e) { return lookup(p, CONTENT); } }).reduce((a, b) => a / b);
    fmts.split('|').slice(1).forEach(f => { if (!FORMATS[f]) throw new Error(`say: no format "${f}"`); v = FORMATS[f](v, c); });
    return String(v);
  });
  const left = tpl.replace(/\{([\w.\/]+)((?:\|\w+)*)\}/g, '').match(/\{[^{}]*\}/);
  if (left) throw new Error(`say: "${left[0]}" is not a placeholder`);
  return out;
}
