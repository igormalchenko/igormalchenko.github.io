// Structural checks shared by the build and headless tools. Return content locations, never VM errors.
function validateContent(C){
  const errors = [], bad = (where, message) => errors.push(`content/${where}: ${message}`);
  // Complete record schemas run first so later reference/prose checks never dereference malformed entries.
  const record = (v, shape, w) => {
    if (!v || typeof v !== 'object' || Array.isArray(v)) { bad(w, 'must be an object'); return; }
    for (const [key,type] of Object.entries(shape)) {
      const x = v[key];
      const valid = type === 'array' ? Array.isArray(x) : type === 'object' ? x && typeof x === 'object' && !Array.isArray(x) :
        type === 'nullableNumber' ? x === null || Number.isFinite(x) : type === 'number' ? Number.isFinite(x) : typeof x === type;
      if (!valid) bad(`${w}.${key}`, `required ${type} field`);
    }
    for (const key of Object.keys(v)) if (!(key in shape)) bad(`${w}.${key}`, 'unknown field');
  };
  const tables = {
    nations: { name:'string',adj:'string',pre:'string',color:'string',people:'string',accepts:'array',ambition:'string',hawk:'number',patience:'number',starts:'boolean',army:'number',relations:'object',allies:'array',noAnnex:'boolean',rulerNames:'array',namePool:'string',factoryMultiplier:'number' },
    peoples: { name:'string', names:'array' },
    provinces: { name:'string',lon:'number',lat:'number',owner:'string',people:'string',pop:'number',industry:'number' },
    ambitions: { kind:'string',title:'string',adj:'string',pre:'string',peoples:'array',need:'number',from:'number',provinces:'array',art:'string',note:'string',fallback:'boolean' },
    ambitionKinds: { name:'string',heading:'string',desc:'string',who:'string',worth:'number',losses:'number',proclaimText:'string',joinText:'string',aside:'string' },
    effects: { desc:'string',none:'number',targeted:'boolean' },
    concepts: { name:'string',desc:'string',word:'boolean',avoid:'array' },
    rulers: { label:'string',vibe:'string',emblem:'string',main:'array',flat:'array',malus:'array' },
    temperaments: { high:'array',low:'array',mid:'string' },
  };
  for (const [table,shape] of Object.entries(tables)) {
    if (!C[table] || typeof C[table] !== 'object' || Array.isArray(C[table])) { bad(`${table}.json`, 'must be a table'); continue; }
    for (const [id,v] of Object.entries(C[table])) {
      if (!/^[A-Za-z][A-Za-z0-9]*$/.test(id)) bad(`${table}.json ${id}`, 'ID must be an ASCII letter followed by letters/digits');
      record(v, shape, `${table}.json ${id}`);
    }
  }
  if (!Array.isArray(C.eras) || !Array.isArray(C.rarities)) bad('eras/rarities.json', 'must be arrays');
  else {
    C.eras.forEach((v,i) => record(v, {name:'string',def:'number',fort:'number',start:'boolean'}, `eras.json ${i}`));
    C.rarities.forEach((v,i) => record(v, {name:'string',color:'string',odds:'number',main:'number',malus:'number',ring:'number',glow:'number',pulse:'number',pulseSeconds:'number',sheen:'boolean',sample:'boolean',flat:'nullableNumber'}, `rarities.json ${i}`));
    // null is the explicit absence of a flat slot, not an omitted field.
  }
  record(C.map, {land:'array',sea:'array',cuts:'array'}, 'map.json');
  for (const table of ['events','advances']) if (!C[table] || typeof C[table] !== 'object' || Array.isArray(C[table])) bad(`${table}.json`, 'must be a table');
  if (!C.advances?.cards || typeof C.advances.cards !== 'object' || Array.isArray(C.advances.cards)) bad('advances.json.cards', 'must be a table');
  if (!C.rules || !Array.isArray(C.rules.seasons) || !C.rules.seasons.length) bad('rules.json.seasons', 'must be a nonempty array');
  if (errors.length) return errors;
  if (!Object.keys(C.provinces).length || !Object.values(C.nations).some(n => n.starts)) bad('nations/provinces.json', 'the starting world needs land and a starting nation');
  for (const [id,t] of Object.entries(C.rulers)) for (const slot of ['main','flat','malus']) {
    t[slot].forEach((e,i) => record(e, {fx:'string',value:'number',text:'string',news:'string'}, `rulers.json ${id}.${slot}.${i}`));
  }
  for (const [id,c] of Object.entries(C.advances.cards)) {
    record(c, {name:'string',category:'string',icon:'string',requires:'string',effects:'array'}, `advances.json ${id}`);
    if (Array.isArray(c.effects)) c.effects.forEach((e,i) => record(e, {fx:'string',values:'array',text:'string'}, `advances.json ${id}.effects.${i}`));
  }
  if (errors.length) return errors;
  const reference = (table,id,w) => { if (!Object.hasOwn(C[table],id)) bad(w, `unknown ${table} reference "${id}"`); };
  for (const [tag,n] of Object.entries(C.nations)) {
    const w=`nations.json ${tag}`; reference('peoples',n.people,w); reference('ambitions',n.ambition,w);
    n.accepts.forEach(id=>reference('peoples',id,w));
    n.allies.forEach(id=>reference('nations',id,w)); Object.keys(n.relations).forEach(id=>reference('nations',id,w));
    for (const value of Object.values(n.relations)) if (!Number.isFinite(value) || Math.abs(value)>100) bad(w,'relations must be finite values between minus and plus one hundred');
  }
  for (const [id,p] of Object.entries(C.provinces)) { reference('nations',p.owner,`provinces.json ${id}`); reference('peoples',p.people,`provinces.json ${id}`); }
  for (const [id,a] of Object.entries(C.ambitions)) { reference('ambitionKinds',a.kind,`ambitions.json ${id}`); a.peoples.forEach(p=>reference('peoples',p,`ambitions.json ${id}`)); a.provinces.forEach(p=>reference('provinces',p,`ambitions.json ${id}`)); }
  for (const [id,t] of Object.entries(C.rulers)) for (const slot of ['main','flat','malus']) for (const e of t[slot]) reference('effects',e.fx,`rulers.json ${id}.${slot}`);
  for (const [id,a] of Object.entries(C.advances.cards)) for (const e of a.effects) reference('effects',e.fx,`advances.json ${id}`);
  for (const kind of ['land','sea']) for (const [i,pair] of C.map[kind].entries()) {
    if (!Array.isArray(pair)||pair.length!==2) bad(`map.json ${kind}.${i}`,'must be a pair');
    else pair.forEach(id=>reference('provinces',id,`map.json ${kind}.${i}`));
  }
  if (errors.length) return errors;
  for (const [tag,n] of Object.entries(C.nations)) {
    if (!['people','nation'].includes(n.namePool)) bad(`nations.json ${tag}`, 'namePool must be people or nation');
    if (!n.starts && (n.army !== 0 || n.allies.length || Object.keys(n.relations).length)) bad(`nations.json ${tag}`, 'nonstarting army/diplomacy must carry neutral values');
    if (n.factoryMultiplier <= 0 || n.factoryMultiplier > 1) bad(`nations.json ${tag}`, 'factoryMultiplier must be greater than zero and at most one');
  }
  for (const [id,e] of Object.entries(C.effects)) if (![0,1].includes(e.none)) bad(`effects.json ${id}`, 'neutral value must be zero or one');
  if (C.rarities.filter(r => r.sample).length !== 1) bad('rarities.json', 'exactly one rarity must be the Almanac sample');
  const names = xs => Array.isArray(xs) && xs.length > 0 && xs.every(n => typeof n === 'string' && n.trim());
  for (const [tag, n] of Object.entries(C.nations)) {
    const w = `nations.json ${tag}`;
    const pool = n.namePool === 'people' ? C.peoples[n.people]?.names : n.rulerNames;
    if (!names(pool)) bad(w, 'effective ruler names must be a nonempty array of nonempty strings');
    for (const other of [...n.allies, ...Object.keys(n.relations)]) {
      if (n.starts && !C.nations[other]?.starts) bad(w, `opening diplomacy with ${other} requires a starting nation`);
    }
  }
  const fallback = Object.entries(C.ambitions).filter(([, a]) => a.fallback);
  if (fallback.length !== 1 || fallback[0][1].kind !== 'survive') bad('ambitions.json', 'exactly one survive ambition must be the fallback');
  if (C.eras.filter(e => e.start).length !== 1) bad('eras.json', 'exactly one way of war must start');
  if (C.eras.filter(e => !e.start).length < 2) bad('eras.json', 'military revolutions require at least two nonstarting ways of war so every transition has a candidate');
  for (const [i, cut] of C.map.cuts.entries()) {
    const before = errors.length;
    record(cut, {from:'string',to:'string',line:'array',close:'array'}, `map.json cuts.${i}`);
    if (errors.length !== before) continue;
    for (const key of ['from', 'to']) if (!Object.hasOwn(C.provinces,cut[key])) bad(`map.json cuts.${i}.${key}`, `no province "${cut[key]}"`);
    if (cut.from === cut.to) bad(`map.json cuts.${i}`, 'source and destination must differ');
    if (!Array.isArray(cut.line) || cut.line.length !== 2 || !Array.isArray(cut.close) || cut.close.length < 2 ||
        ![...cut.line, ...cut.close].every(p => Array.isArray(p) && p.length === 2 && p.every(Number.isFinite)))
      bad(`map.json cuts.${i}`, 'needs a two-point line and closing points with finite coordinates');
  }
  const exact = (v, fields, w) => {
    if (!v || typeof v !== 'object' || Array.isArray(v)) { bad(w, 'must be an object'); return false; }
    for (const k of fields) if (!(k in v)) bad(w, `missing field "${k}"`);
    for (const k of Object.keys(v)) if (!fields.includes(k)) bad(w, `unknown field "${k}"`);
    return fields.every(k => k in v);
  };
  const finite = (v, w, lo = -Infinity, hi = Infinity) => { if (!Number.isFinite(v) || v < lo || v > hi) bad(w, `must be finite and between ${lo} and ${hi}`); };
  const list = (v, table, w) => {
    if (!Array.isArray(v)) { bad(w, 'must be an array'); return false; }
    for (const id of v) if (!Object.hasOwn(table, id)) bad(w, `unknown reference "${id}"`);
    return true;
  };
  for (const [id, e] of Object.entries(C.events)) {
    const w = `events.json ${id}`;
    const before = errors.length;
    record(e, {name:'string',phase:'string',operation:'string',log:'string',schedule:'object',target:'object',effects:'object',crisis:'object',text:'string',effect:'string',rattleText:'string',warText:'string',finds:'array'}, w);
    if (errors.length !== before) continue;
    if (!e.name || !e.effect) bad(w, 'needs a name and an effect sentence');
    if (!['events','war','opening','closing'].includes(e.phase)) bad(w, `unknown phase "${e.phase}"`);
    if (!['apply','awaken','era','ultimatum','war','settle','message'].includes(e.operation)) bad(w, `unknown operation "${e.operation}"`);
    if (!['event','diplo','peace','war'].includes(e.log)) bad(w, `unknown log channel "${e.log}"`);
    const d = e.schedule, t = e.target, f = e.effects, k = e.crisis;
    const nestedBefore = errors.length;
    record(d, {from:'number',to:'number',season:'number',chance:'number',period:'number',once:'boolean',eraAge:'number',beforeRoll:'boolean'}, `${w}.schedule`);
    record(t, {kind:'string',mode:'string',nations:'array',provinces:'array',peoples:'array',count:'number',owned:'boolean',unoccupied:'boolean',unrestAbove:'number',unawakened:'boolean',foreign:'boolean',peace:'boolean',neighbors:'boolean',nonrival:'boolean'}, `${w}.target`);
    record(f, {pop:'number',unrest:'number',unrestSet:'number',gold:'number',factories:'number',relations:'number',people:'string',newName:'string',newAdj:'string',awake:'number',emancipate:'boolean',modifiers:'array'}, `${w}.effects`);
    record(k, {margin:'number',rattle:'number',backDown:'number',pay:'number',unrest:'number',relations:'number',pretexts:'array'}, `${w}.crisis`);
    if (errors.length !== nestedBefore) continue;
    finite(d.from, `${w}.schedule.from`); finite(d.to, `${w}.schedule.to`, d.from);
    finite(d.chance, `${w}.schedule.chance`, 0, 1); finite(d.eraAge, `${w}.schedule.eraAge`, 0);
    if (d.period === 0 && d.chance !== 1) bad(w, 'a scheduled event has neutral chance one; only random periods roll chance');
    if (![0,1,C.rules.seasons.length].includes(d.period)) bad(w, 'period must be zero (scheduled), one (seasonal), or the seasons per year');
    if (!Number.isInteger(d.season) || d.season < -1 || d.season >= C.rules.seasons.length) bad(w, 'unknown scheduled season');
    for (const key of ['once','beforeRoll']) if (typeof d[key] !== 'boolean') bad(`${w}.schedule.${key}`, 'must be boolean');
    for (const key of ['owned','unoccupied','unawakened','foreign','peace','neighbors','nonrival']) if (typeof t[key] !== 'boolean') bad(`${w}.target.${key}`, 'must be boolean');
    list(t.nations, C.nations, `${w}.target.nations`); list(t.provinces, C.provinces, `${w}.target.provinces`); list(t.peoples, C.peoples, `${w}.target.peoples`);
    const modes = { world: ['all'], province: ['fixed','random'], nation: ['fixed','all','random','sample'], people: ['fixed','random'], pair: ['rivals','sample','hostile'] };
    if (!modes[t.kind]?.includes(t.mode)) bad(w, `unsupported selector ${t.kind}/${t.mode}`);
    if (t.mode === 'fixed' && ['nation','province','people'].includes(t.kind) && !t[{ nation:'nations',province:'provinces',people:'peoples' }[t.kind]].length) bad(w, 'fixed selector needs at least one reference');
    if (t.kind === 'people' && (t.peoples.length === 0 || (t.mode === 'fixed' && t.peoples.length !== 1))) bad(w, 'people selector needs a nonempty pool; fixed selects exactly one');
    if (t.kind !== 'people' && t.peoples.length) bad(w, 'peoples are only read by a people selector');
    if (!(t.kind === 'nation' && t.mode === 'sample') && t.count !== 0) bad(w, 'count is only read by a nation sample');
    if (t.kind === 'nation' && t.mode === 'sample' && (!Number.isInteger(t.count) || t.count < 1)) bad(w, 'nation sample needs a positive integer count');
    if (['world','pair','people'].includes(t.kind) && (t.nations.length || t.provinces.length)) bad(w, 'this selector ignores nation/province reference lists');
    if (t.unoccupied && t.kind !== 'province') bad(w, 'unoccupied is only read by a province selector');
    if (t.unawakened && t.kind !== 'people') bad(w, 'unawakened requires a people selector');
    if ((t.peace || t.neighbors) && !(t.kind === 'pair' && t.mode === 'rivals')) bad(w, 'peace/neighbors require rival pairs');
    if (t.nonrival && t.kind !== 'pair') bad(w, 'nonrival requires a pair');
    if (t.owned && !['nation','province'].includes(t.kind)) bad(w, 'owned requires nation/province targets');
    finite(t.unrestAbove, `${w}.target.unrestAbove`, -1, 100);
    for (const key of ['pop','gold']) finite(f[key], `${w}.effects.${key}`, 0);
    for (const key of ['unrest','factories','relations','awake']) finite(f[key], `${w}.effects.${key}`);
    if (!Number.isInteger(f.factories) || f.factories < 0) bad(w, 'factories must be a nonnegative integer');
    finite(f.unrestSet, `${w}.effects.unrestSet`, -1, 100);
    if (f.people && !Object.hasOwn(C.peoples,f.people)) bad(w, `unknown accepted people "${f.people}"`);
    if (typeof f.emancipate !== 'boolean') bad(w, 'emancipate must be boolean');
    for (const key of ['people','newName','newAdj']) if (typeof f[key] !== 'string') bad(`${w}.effects.${key}`, 'must be a string');
    if (!Array.isArray(f.modifiers)) { bad(w, 'modifiers must be an array'); continue; }
    else for (const [i,m] of f.modifiers.entries()) {
      const p = `${w}.effects.modifiers.${i}`;
      if (!exact(m, ['fx','value','seasons','icon','text'], p)) continue;
      if (!['earns','factoryCost'].includes(m.fx)) bad(p, `unsupported global modifier "${m.fx}"`);
      finite(m.value, `${p}.value`, 0); finite(m.seasons, `${p}.seasons`, 1);
      if (!Number.isInteger(m.seasons)) bad(p, 'modifier duration must be a whole number of seasons');
      if (!Object.hasOwn(C.concepts,m.icon) || C.concepts[m.icon].word) bad(p, 'icon must name a drawn concept');
      if (typeof m.text !== 'string' || !m.text.includes('{value')) bad(p, 'modifier description must state {value}');
    }
    for (const key of ['margin','rattle','backDown','pay','unrest','relations']) finite(k[key], `${w}.crisis.${key}`);
    for (const key of ['rattle','backDown','pay']) finite(k[key], `${w}.crisis.${key}`, 0, 1);
    for (const [key, xs] of [['finds',e.finds],['pretexts',k.pretexts]]) if (!Array.isArray(xs) || xs.some(s => typeof s !== 'string' || !s)) bad(`${w}.${key}`, 'must be an array of nonempty strings');
    const neutral = { pop:1,unrest:0,unrestSet:-1,gold:1,factories:0,relations:0,people:'',newName:'',newAdj:'',awake:0,emancipate:false };
    if (e.operation !== 'apply') for (const key of Object.keys(neutral)) {
      if (e.operation === 'awaken' && key === 'awake') continue;
      if (f[key] !== neutral[key]) bad(w, `operation ${e.operation} does not apply effects.${key}`);
    }
    if (e.operation === 'apply' && f.awake) bad(w, 'awake requires the awaken operation');
    if (e.operation === 'apply' && f.relations !== 0 && t.kind !== 'pair') bad(w, 'relations require a pair selector');
    if (e.operation === 'apply' && t.kind === 'people' && (f.gold !== 1 || f.people || f.newName || f.newAdj || f.emancipate)) bad(w, 'a people selector has no nation target for nation effects');
    if (e.operation !== 'apply' && (f.modifiers.length || e.finds.length)) bad(w, 'only apply uses global modifiers/finds');
    if (e.operation !== 'ultimatum' && (Object.entries(k).some(([key,v]) => key !== 'pretexts' && v !== 0) || k.pretexts.length)) bad(w, 'crisis fields require the ultimatum operation');
    if (e.operation !== 'ultimatum' && (e.rattleText || e.warText)) bad(w, 'rattleText/warText require the ultimatum operation');
    if (['war','ultimatum'].includes(e.operation) && t.kind !== 'pair') bad(w, 'war and ultimatum operations require a pair');
    if (e.operation === 'ultimatum' && (!k.pretexts.length || !e.rattleText || !e.warText)) bad(w, 'ultimatum requires pretexts, rattleText and warText');
    if (e.operation === 'awaken' && t.kind !== 'people') bad(w, 'awaken requires people targets');
    // Non-neutral effects must be explained, not merely accepted by the interpreter.
    const prose = [e.text,e.effect,e.rattleText,e.warText].join(' ');
    for (const key of Object.keys(neutral)) if (!['emancipate','relations'].includes(key) && f[key] !== neutral[key] && !prose.includes('{effects.' + key))
      bad(w, `effects.${key} is not stated in its text/effect`);
    for (const [i,m] of f.modifiers.entries()) for (const key of ['value','seasons']) if (!prose.includes(`{effects.modifiers.${i}.${key}`)) bad(w, `modifier ${key} is not stated in its text/effect`);
  }
  // The terminal boundary must have a settlement policy even when its entry is renamed.
  if (Object.values(C.events).filter(e => e && e.phase === 'closing' && e.operation === 'settle').length !== 1)
    bad('events.json', 'exactly one closing settlement event is required by the armistice');
  return errors;
}
function assertContent(C){
  const errors = validateContent(C);
  if (errors.length) throw new Error(`Content validation failed:\n  ${errors.join('\n  ')}`);
}
function validateGeometry(C, geo){
  const errors=[],bad=message=>errors.push(`map/geo.json: ${message}; run npm run map`);
  const expected={provinces:Object.entries(C.provinces).map(([id,p])=>[id,p.lon,p.lat]),fixes:C.map};
  if (!geo || JSON.stringify(geo.built)!==JSON.stringify(expected)) bad('built from different provinces or map fixes');
  if (!geo || !Array.isArray(geo.regions) || geo.regions.length!==expected.provinces.length) {bad('province shape count does not match content');return errors;}
  const n=geo.regions.length;
  for (const [i,r] of geo.regions.entries()) {
    if (!r || !Array.isArray(r.nb) || r.nb.some(j=>!Number.isInteger(j)||j<0||j>=n||j===i)) {bad(`invalid neighbours for ${expected.provinces[i][0]}`);continue;}
    if (typeof r.d!=='string'||!r.d||!Number.isFinite(r.area)||r.area<=0||![r.ax,r.ay].every(Number.isFinite)||![0,1].includes(r.coast)) bad(`invalid shape for ${expected.provinces[i][0]}`);
    for (const j of r.nb) if (!geo.regions[j]?.nb?.includes(i)) bad(`asymmetric edge from ${expected.provinces[i][0]}`);
  }
  if (!Array.isArray(geo.naval)||!Array.isArray(geo.navalPts)||!Array.isArray(geo.navalPaths)) {bad('missing sea crossing arrays');return errors;}
  if (geo.navalPts.length!==geo.naval.length||geo.navalPaths.length!==geo.naval.length) bad('sea crossing arrays differ in length');
  for (const [i,pair] of geo.naval.entries()) {
    if (!Array.isArray(pair)||pair.length!==2||pair.some(j=>!Number.isInteger(j)||j<0||j>=n)||pair[0]===pair[1]) bad(`invalid sea crossing ${i}`);
    const points=geo.navalPts[i];
    if (!Array.isArray(points)||points.length!==2||points.some(p=>!Array.isArray(p)||p.length!==2||!p.every(Number.isFinite))||typeof geo.navalPaths[i]!=='string'||!geo.navalPaths[i]) bad(`invalid sea drawing ${i}`);
  }
  return errors;
}
function assertGeometry(C,geo){const errors=validateGeometry(C,geo);if(errors.length)throw new Error(errors.join('\n'));}
module.exports = { validateContent, assertContent, validateGeometry, assertGeometry };
