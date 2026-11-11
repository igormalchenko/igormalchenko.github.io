// Read-only diagnostic: instruments an in-memory copy; never writes game sources.
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
let source = require('../tools/load').simSource();
source = source.replace('if (p < 0.5) return null;', 'if (p < 0.5 && !S.__allowLowOdds) return null;');
source = source.replace('return { ev, p, pTrue, yearly, cost: losses + disruption };', 'return { ev, p, pTrue, yearly, cost: losses + disruption, gain, lose, losses, disruption, infamyCost, H, years, ratio };');
source = source.replace('  return S;\n}', '  S.__debug = { fx, goldValue, quality, warEval, freshConsiderations, mySide, neighborsOf, borderRegions, upkeepOf };\n  return S;\n}');
const ctx = {}; vm.createContext(ctx);vm.runInContext(source+'\nthis.createSim = createSim; this.CONTENT = CONTENT;',ctx);
const geo = JSON.parse(fs.readFileSync(path.join(root,'map/geo.json'),'utf8')), rules=ctx.CONTENT.rules;
function create(seed,tag){const s=ctx.createSim(seed,geo,{player:tag});s.chooseHeir(0);return s;}
function clearPending(s){while(s.pending){if(s.pending.type==='heir')s.chooseHeir(0);else{s.pending.options=[{id:'control'+s.advanceCount,name:'Control',effect:'No bonus',fx:{}}];s.chooseAdvance(0);}}}
function armyParts(s,delta){
 const c=s.C[s.player], d=s.__debug;d.freshConsiderations(c);
 const h=s.horizon(c),gv=d.goldValue(c),inc=s.income(c)*4,wf=s.workforce(c),gwW=Math.max(0,Math.min(1,(s.year-1888)/24));
 const majors=s.majors.filter(t=>t!==c.tag).map(t=>s.strength(s.C[t]));const ref=majors.length?majors.reduce((a,b)=>a+b,0)/majors.length:1;
 const gwLoss=x=>gwW*inc*6*(1-d.mySide(c,x)/(d.mySide(c,x)+ref));
 const defensive=s.riskOf(c).total-s.riskOf(c,delta).total, futureWar=gwLoss(0)-gwLoss(delta);
 const workers=(inc/Math.max(0.01,wf))*(wf-s.workforce(c,c.army+delta))*0.85*h;
 const maintenance=d.upkeepOf(c,delta)*4*gv*h;
 const recruitment=delta>0?delta*rules.price.recruit*d.fx(c,'recruit')*gv:0;
 const wartime=s.warOf(c)?30+delta:0;
 return {delta,defensive,futureWar,workers,maintenance,recruitment,wartime,total:defensive+futureWar-workers-maintenance-recruitment+wartime};
}
function wars(s){
 const c=s.C[s.player],d=s.__debug;
 s.__allowLowOdds=true;
 try{return d.borderRegions(c).filter(r=>s.C[r.owner].alive).map(r=>{
  const o=s.C[r.owner],e=d.warEval(c,o,r);
  return {target:o.tag,province:r.name,blocked:c.allies.has(o.tag)?'alliance':(c.truce[o.tag]||0)>s.year?'truce':!e?'other':null,...e};
 }).sort((a,b)=>(b.ev??-Infinity)-(a.ev??-Infinity));}finally{s.__allowLowOdds=false;}
}
const variants={baseline:{},mobilisation:{recruit:0.6},logistics:{upkeep:0.65},artillery:{fight:1.25},medicine:{bleed:0.65},freeRecruitment:{recruit:0},freeRecruitmentAndUpkeep:{recruit:0,upkeep:0},combinedMilitary:{recruit:0.6,upkeep:0.65,fight:1.25,bleed:0.65}};
function inspect(s,label){
 const c=s.C[s.player],saved=c.advances, out={label,seed:s.seed,nation:c.tag,year:s.year,leader:c.ruler.trait,horizon:s.horizon(c),army:c.army,gold:c.treasury,income:s.income(c)*4,variants:{}};
 for(const [name,fx]of Object.entries(variants)){
  c.advances=[...saved,{id:name,fx}];const actions=s.__debug.freshConsiderations(c);
  const step=Math.max(5,c.army*0.15,s.popOf(c)*0.5);
  const parts=[step,step*2.5].map(x=>armyParts(s,x));
  const best=actions.find(a=>a.type==='army');if(best)assert.ok(parts.some(p=>Math.round(p.total)===best.ev),'Breakdown must match actual recruitment score');
  out.variants[name]={armyOptions:parts,affordableRecruitment:best&&{amount:best.amt,score:best.ev},bestAction:{label:actions[0].label,score:actions[0].ev},wars:wars(s)};
 }
 c.advances=saved;s.__debug.freshConsiderations(c);
 // Is there a conquest opportunity after increasing army size that recruitment never credits?
 const base=c.army;out.preparation=[];
 for(const extra of [Math.max(5,base*0.15,s.popOf(c)*0.5),20,40,80]){
  c.advances=[...saved,{id:'mobilisation',fx:{recruit:0.6}}];
  const parts=armyParts(s,extra);c.army=base+extra;s.__debug.freshConsiderations(c);const best=wars(s).find(w=>!w.blocked&&w.p>=0.55);
  out.preparation.push({extra,recruitmentScore:parts.total,upfront:extra*rules.price.recruit*s.__debug.fx(c,'recruit'),affordable:c.treasury>=extra*rules.price.recruit*s.__debug.fx(c,'recruit')+5,bestWar:best});c.army=base;
 }
 c.advances=saved;s.__debug.freshConsiderations(c);return out;
}
const output={opening:[],snapshots:[]};
for(const seed of [7,41])for(const tag of ['FRA','PRU','POR']){
 const s=create(seed,tag),row=inspect(s,'opening');output.opening.push(row);
 console.log(JSON.stringify({seed,tag,leader:row.leader,H:row.horizon,gold:row.gold,baseline:row.variants.baseline.armyOptions[0],discount:row.variants.mobilisation.armyOptions[0],free:row.variants.freeRecruitment.armyOptions[0],freeBoth:row.variants.freeRecruitmentAndUpkeep.armyOptions[0],bestWar:row.variants.baseline.wars[0],preparation:row.preparation.filter(x=>x.bestWar?.ev>0)}));
}
fs.writeFileSync(path.join(__dirname,'military-diagnostics.json'),JSON.stringify(output,null,2));
const s=create(7,'FRA');clearPending(s);
for(const target of [1860,1888,1900]){
 while(!s.over&&s.year<target){clearPending(s);s.step();}
 clearPending(s);const row=inspect(s,'later-state');output.snapshots.push(row);
 console.log('SNAPSHOT '+JSON.stringify({year:row.year,H:row.horizon,army:row.army,baseline:row.variants.baseline.armyOptions[0],discount:row.variants.mobilisation.armyOptions[0],bestWar:row.variants.baseline.wars[0]}));
 fs.writeFileSync(path.join(__dirname,'military-diagnostics.json'),JSON.stringify(output,null,2));
}
console.log('Diagnostics saved; game sources were not modified.');
