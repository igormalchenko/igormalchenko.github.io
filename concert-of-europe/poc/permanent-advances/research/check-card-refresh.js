// Paired checks at identical states: only the selected advance differs.
const assert = require('node:assert/strict'), fs=require('node:fs'), path=require('node:path');
const {createSim,CONTENT,say}=require('../tools/load')();
function setup(seed,tag,stress=false){const s=createSim(seed,{player:tag});s.chooseHeir(0);if(stress){s.C[tag].treasury=100;s.regionsOf(s.C[tag]).forEach(r=>r.unrest=55);}return s;}
function grant(s,card){const c=s.C[s.player],a=card?{...card,fx:{...card.fx}}:{id:'control',name:'Control',fx:{},effect:'No bonus'};
 if(a.targetFight){const tags=new Set(s.regionsOf(c).flatMap(r=>r.nb.map(i=>s.regions[i].owner)));const targets=[...tags].map(t=>s.C[t]).filter(o=>o!==c&&o.alive&&!c.allies.has(o.tag)).sort((a,b)=>(a.tag===c.rival?-1:b.tag===c.rival?1:s.strength(b)-s.strength(a)));if(!targets.length)return false;a.target=targets[0].tag;}
 a.effect=say(a.effect,{...a,nation:a.target?s.C[a.target].name:''});s.pending={type:'advance',tag:c.tag,options:[a]};assert.ok(s.chooseAdvance(0));return true;}
function forecasts(s){return new Map(s.considerations(s.C[s.player]).map(a=>[`${a.type}:${a.r?.i??''}:${a.o?.tag??''}:${a.amt??''}`,a.ev]));}
const cases=[];for(const seed of [7,41])for(const tag of ['FRA','PRU','POR'])cases.push({seed,tag});cases.push({seed:7,tag:'FRA',stress:true},{seed:41,tag:'POR',stress:true});
const report=[];
const requested=process.argv[2];
for(const card of CONTENT.advances.cards.filter(a=>!requested||a.id===requested)){let changedForecasts=0,changedActions=0,checked=0;const examples=[];
 for(const {seed,tag,stress} of cases){
  const a=setup(seed,tag,stress),b=setup(seed,tag,stress);grant(a,null);if(!grant(b,card))continue;checked++;
  const af=forecasts(a),bf=forecasts(b);if(af.size!==bf.size||[...af].some(([k,v])=>bf.get(k)!==v))changedForecasts++;
  a.step();b.step();const before=a.C[tag].didThisSeason.map(x=>x.label),after=b.C[tag].didThisSeason.map(x=>x.label);
  if(JSON.stringify(before)!==JSON.stringify(after)){changedActions++;if(examples.length<2)examples.push({seed,tag,stress:!!stress,before,after});}
 }
 const row={id:card.id,name:card.name,checked,changedForecasts,changedActions,examples};report.push(row);console.log(JSON.stringify(row));
}
if(requested){
 const prior=JSON.parse(fs.readFileSync(path.join(__dirname,'card-refresh-check.json'),'utf8'));
 const merged=new Map(prior.map(r=>[r.id,r]));for(const r of report)merged.set(r.id,r);
 report.splice(0,report.length,...CONTENT.advances.cards.map(a=>merged.get(a.id)).filter(Boolean));
 assert.equal(report.length,CONTENT.advances.cards.length,'Missing card coverage');
}
fs.writeFileSync(path.join(__dirname,'card-refresh-check.json'),JSON.stringify(report,null,2)+'\n');
const inert=report.filter(r=>!r.changedForecasts);assert.equal(inert.length,0,'Cards without forecast effects: '+inert.map(x=>x.id).join(', '));
console.log(`All ${report.length} cards changed a forecast in at least one tested state; ${report.filter(r=>r.changedActions).length} also changed actual next-season actions.`);
