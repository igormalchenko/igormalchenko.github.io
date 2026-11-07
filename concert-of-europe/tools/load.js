// Loads the simulation for Node scripts exactly as the browser sees it (data.js + map + sim.js in one scope).
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
module.exports = function load(){
  const ctx = {}; vm.createContext(ctx);
  const code = fs.readFileSync(path.join(root, 'src/data.js'), 'utf8') + '\n' + fs.readFileSync(path.join(root, 'src/sim.js'), 'utf8')
    + '\nthis.createSim = createSim; this.REGIONS = REGIONS;';
  vm.runInContext(code, ctx);
  const GEO = JSON.parse(fs.readFileSync(path.join(root, 'map/geo.json'), 'utf8'));
  return { createSim: seed => ctx.createSim(seed, GEO), GEO, REGIONS: ctx.REGIONS };
};
