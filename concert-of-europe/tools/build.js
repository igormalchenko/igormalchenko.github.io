// Assembles the single-file game: index.html at the project root, so GitHub Pages serves it as is. Run: npm run build
// The content (content/*.json) goes in first as one CONTENT constant; the simulation and the interface read it from there.
// In the HTML template, {{path|format}} is filled in from the content the same way the game fills its own text (src/text.js).
const fs = require('fs'), path = require('path'), vm = require('vm');
const content = require('./content');
const r = p => fs.readFileSync(path.join(__dirname, '..', p), 'utf8');
const sim = content.source() + r('src/text.js') + '\n' + r('src/data.js') + '\nconst GEO = ' + r('map/geo.json') + ';\n' + r('src/sim.js');
const ui = ['src/ui/registry.js', 'src/ui/map.js', 'src/ui/panel.js', 'src/ui/almanac.js', 'src/ui/main.js'].map(r).join('\n');
// the template's own numbers, from the content
const ctx = {}; vm.createContext(ctx); vm.runInContext(content.source() + r('src/text.js') + '\nthis.say = say; this.CONTENT = CONTENT;', ctx);
const tpl = r('src/ui/index.template.html').replace(/\{\{([^}]+)\}\}/g, (_, t) => ctx.say(`{${t}}`, ctx.CONTENT));
const html = tpl.replace('/*SIM*/', () => sim).replace('/*UI*/', () => ui);
fs.writeFileSync(path.join(__dirname, '../index.html'), html);
console.log(`index.html written (${Math.round(html.length / 1024)} KB)`);
