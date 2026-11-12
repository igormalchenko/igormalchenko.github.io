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
  return errors;
}
function assertContent(C){
  const errors = validateContent(C);
  if (errors.length) throw new Error(`Content validation failed:\n  ${errors.join('\n  ')}`);
}
module.exports = { validateContent, assertContent };
