// Loads the simulation for Node scripts exactly as the browser sees it (content + text.js + data.js + map + sim.js in one scope).
const fs = require('fs'), path = require('path'), vm = require('vm');
const content = require('./content');
const root = path.join(__dirname, '..');
// the simulation's source, in the order the game is built (tools/build.js uses the same)
const SIM_FILES = ['src/text.js', 'src/data.js', 'src/sim.js'];
const simSource = () => content.source() + SIM_FILES.map(f => fs.readFileSync(path.join(root, f), 'utf8')).join('\n');
module.exports = function load(){
  const ctx = {}; vm.createContext(ctx);
  vm.runInContext(simSource() + '\nthis.createSim = createSim; this.REGIONS = REGIONS; this.CONTENT = CONTENT; this.say = say;', ctx);
  const GEO = JSON.parse(fs.readFileSync(path.join(root, 'map/geo.json'), 'utf8'));
  return { createSim: (seed, opts) => ctx.createSim(seed, GEO, opts), GEO, REGIONS: ctx.REGIONS, CONTENT: ctx.CONTENT, say: ctx.say };
};
module.exports.simSource = simSource;
