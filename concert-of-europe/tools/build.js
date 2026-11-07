// Assembles the single-file game: index.html at the project root, so GitHub Pages serves it as is. Run: npm run build
const fs = require('fs'), path = require('path');
const r = p => fs.readFileSync(path.join(__dirname, '..', p), 'utf8');
const sim = r('src/data.js') + '\nconst GEO = ' + r('map/geo.json') + ';\n' + r('src/sim.js');
const ui = ['src/ui/icons.js', 'src/ui/map.js', 'src/ui/panel.js', 'src/ui/main.js'].map(r).join('\n');
const html = r('src/ui/index.template.html').replace('/*SIM*/', () => sim).replace('/*UI*/', () => ui);
fs.writeFileSync(path.join(__dirname, '../index.html'), html);
console.log(`index.html written (${Math.round(html.length / 1024)} KB)`);
