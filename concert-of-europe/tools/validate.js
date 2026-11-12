// Structural checks shared by the build and headless tools. Return content locations, never VM errors.
function validateContent(C){
  const errors = [], bad = (where, message) => errors.push(`content/${where}: ${message}`);
  const names = xs => Array.isArray(xs) && xs.length > 0 && xs.every(n => typeof n === 'string' && n.trim());
  for (const [tag, n] of Object.entries(C.nations)) {
    const w = `nations.json ${tag}`;
    const pool = n.rulerNames === undefined ? C.peoples[n.people]?.names : n.rulerNames;
    if (!names(pool)) bad(w, 'effective ruler names must be a nonempty array of nonempty strings');
    for (const other of [...(n.allies || []), ...Object.keys(n.relations || {})]) {
      if (n.starts && !C.nations[other]?.starts) bad(w, `opening diplomacy with ${other} requires a starting nation`);
    }
  }
  const fallback = Object.entries(C.ambitions).filter(([, a]) => a.fallback);
  if (fallback.length !== 1 || fallback[0][1].kind !== 'survive') bad('ambitions.json', 'exactly one survive ambition must be the fallback');
  if (C.eras.filter(e => !e.start).length < 2) bad('eras.json', 'military revolutions require at least two nonstarting ways of war so every transition has a candidate');
  for (const [i, cut] of (C.map.cuts || []).entries()) {
    for (const key of ['from', 'to']) if (!C.provinces[cut[key]]) bad(`map.json cuts.${i}.${key}`, `no province "${cut[key]}"`);
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
    if (!exact(e, ['name','phase','operation','log','schedule','target','effects','crisis','text','effect','rattleText','warText','finds'], w)) continue;
    for (const k of ['name','text','effect','rattleText','warText']) if (typeof e[k] !== 'string') bad(`${w}.${k}`, 'must be text');
    if (!e.name || !e.effect) bad(w, 'needs a name and an effect sentence');
    if (!['events','war','opening','closing'].includes(e.phase)) bad(w, `unknown phase "${e.phase}"`);
    if (!['apply','awaken','era','ultimatum','war','settle','message'].includes(e.operation)) bad(w, `unknown operation "${e.operation}"`);
    if (!['event','diplo','peace','war'].includes(e.log)) bad(w, `unknown log channel "${e.log}"`);
    const d = e.schedule, t = e.target, f = e.effects, k = e.crisis;
    if (!exact(d, ['from','to','season','chance','period','once','eraAge','beforeRoll'], `${w}.schedule`) ||
        !exact(t, ['kind','mode','nations','provinces','peoples','count','owned','unoccupied','unrestAbove','unawakened','foreign','peace','neighbors','nonrival'], `${w}.target`) ||
        !exact(f, ['pop','unrest','unrestSet','gold','factories','relations','people','newName','newAdj','awake','emancipate','modifiers'], `${w}.effects`) ||
        !exact(k, ['margin','rattle','backDown','pay','unrest','relations','pretexts'], `${w}.crisis`)) continue;
    finite(d.from, `${w}.schedule.from`); finite(d.to, `${w}.schedule.to`, d.from);
    finite(d.chance, `${w}.schedule.chance`, 0, 1); finite(d.eraAge, `${w}.schedule.eraAge`, 0);
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
    if (t.kind !== 'nation' && t.count !== 0) bad(w, 'count is only read by a nation sample');
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
    finite(f.unrestSet, `${w}.effects.unrestSet`, -1, 100);
    if (f.people && !C.peoples[f.people]) bad(w, `unknown accepted people "${f.people}"`);
    if (typeof f.emancipate !== 'boolean') bad(w, 'emancipate must be boolean');
    for (const key of ['people','newName','newAdj']) if (typeof f[key] !== 'string') bad(`${w}.effects.${key}`, 'must be a string');
    if (!Array.isArray(f.modifiers)) bad(w, 'modifiers must be an array');
    else for (const [i,m] of f.modifiers.entries()) {
      const p = `${w}.effects.modifiers.${i}`;
      if (!exact(m, ['fx','value','seasons','icon','text'], p)) continue;
      if (!['earns','factoryCost'].includes(m.fx)) bad(p, `unsupported global modifier "${m.fx}"`);
      finite(m.value, `${p}.value`, 0); finite(m.seasons, `${p}.seasons`, 1);
      if (!C.concepts[m.icon] || C.concepts[m.icon].word) bad(p, 'icon must name a drawn concept');
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
    if (e.operation !== 'apply' && (f.modifiers.length || e.finds.length)) bad(w, 'only apply uses global modifiers/finds');
    if (e.operation !== 'ultimatum' && (Object.entries(k).some(([key,v]) => key !== 'pretexts' && v !== 0) || k.pretexts.length)) bad(w, 'crisis fields require the ultimatum operation');
    if (['war','ultimatum'].includes(e.operation) && t.kind !== 'pair') bad(w, 'war and ultimatum operations require a pair');
    if (e.operation === 'ultimatum' && (!k.pretexts.length || !e.rattleText || !e.warText)) bad(w, 'ultimatum requires pretexts, rattleText and warText');
    if (e.operation === 'awaken' && t.kind !== 'people') bad(w, 'awaken requires people targets');
    // Non-neutral effects must be explained, not merely accepted by the interpreter.
    const prose = [e.text,e.effect,e.rattleText,e.warText].join(' ');
    for (const key of Object.keys(neutral)) if (!['emancipate','relations'].includes(key) && f[key] !== neutral[key] && !prose.includes('{effects.' + key))
      bad(w, `effects.${key} is not stated in its text/effect`);
    for (const [i,m] of f.modifiers.entries()) for (const key of ['value','seasons']) if (!prose.includes(`{effects.modifiers.${i}.${key}`)) bad(w, `modifier ${key} is not stated in its text/effect`);
  }
  return errors;
}
function assertContent(C){
  const errors = validateContent(C);
  if (errors.length) throw new Error(`Content validation failed:\n  ${errors.join('\n  ')}`);
}
module.exports = { validateContent, assertContent };
