// Loads the simulation for Node scripts exactly as the browser sees it (content + text.js + data.js + map + sim.js in one scope).
const fs = require('fs'), path = require('path'), vm = require('vm');
const content = require('./content');
const root = path.join(__dirname, '..');
// the simulation's source, in the order the game is built (tools/build.js uses the same)
const SIM_FILES = ['src/text.js', 'src/data.js', 'src/sim.js'];
const simSource = (data = content.load()) => `const CONTENT = ${JSON.stringify(data)};\n` + SIM_FILES.map(f => fs.readFileSync(path.join(root, f), 'utf8')).join('\n');
module.exports = function load(){
  const data=content.load(); require('./validate').assertContent(data);
  const ctx = {}; vm.createContext(ctx);
  vm.runInContext(simSource(data) + '\nthis.createSim = createSim; this.REGIONS = REGIONS; this.CONTENT = CONTENT; this.say = say;', ctx);
  const GEO = JSON.parse(fs.readFileSync(path.join(root, 'map/geo.json'), 'utf8'));
  require('./validate').assertGeometry(data,GEO);
  return { createSim: (seed, opts) => ctx.createSim(seed, GEO, opts), GEO, REGIONS: ctx.REGIONS, CONTENT: ctx.CONTENT, say: ctx.say };
};
module.exports.simSource = simSource;
