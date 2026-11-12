// Synthetic mechanic fixtures. Local IDs and geography deliberately have no identity in shipping content.
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const { load } = require('./content'), { simSource } = require('./load');
function fixtureData(){
  const C = load(), proto = Object.values(C.nations)[0], fallback = Object.values(C.ambitions).find(a => a.fallback), rich = Object.values(C.ambitions).find(a => a.kind === 'richest');
  C.ambitions = { staying:{...fallback}, earning:{...rich} };
  C.peoples = {}; C.nations = {};
  for (const [i,tag] of ['A','B','C','D','E'].entries()) {
    const people = 'people' + tag; C.peoples[people] = {name:'People '+tag,names:['Alex','Morgan','Robin']};
    C.nations[tag] = { ...proto, name:'Realm '+tag,adj:'Realm '+tag,pre:'Realm '+tag,people,accepts:[],allies:[],relations:{},army:30-i*3,
      ambition:i<3?'earning':'staying',starts:true,noAnnex:false,namePool:'people',rulerNames:[],factoryMultiplier:1 };
  }
  const owners = ['B','A','C','B','B','B','B','B','B','D','C','A','E'];
  C.provinces = Object.fromEntries(owners.map((owner,i) => ['p'+i,{name:'Province '+i,lon:i,lat:50,owner,people:C.nations[owner].people,pop:i===0||i===1||i===2||i===10?10:4,industry:2}]));
  // Keep catalogue references available to UI prose, but run only lifecycle messages in mechanic fixtures.
  for (const e of Object.values(C.events)) if (!['opening','closing'].includes(e.phase)) {
    e.schedule.from = C.rules.end.year + 1; e.schedule.to = C.rules.end.year + 2;
  }
  C.map = {land:[],sea:[],cuts:[]};
  const regions = owners.map((owner,i) => ({coast:i===12?0:1,nb:[],ax:i*10,ay:0,area:100,d:''}));
  const link=(a,b)=>{regions[a].nb.push(b);regions[b].nb.push(a);};
  link(1,2); link(10,2); link(12,1); link(12,2);
  const geo = {regions,naval:[[1,2]],navalPts:[],navalPaths:[],borders:[]};
  return {C,geo};
}
function fixtureEngine(exports = {}){
  const {C,geo} = fixtureData(), ctx = {}; vm.createContext(ctx);
  const extra = Object.entries(exports).map(([key,value]) => `${key}:${value}`).join(',');
  const source = simSource(C).replace('\n  return S;\n}', `\n  Object.assign(S, {${extra}});\n  return S;\n}`);
  vm.runInContext(source+'\nthis.createSim=createSim;this.CONTENT=CONTENT;',ctx);
  return {ctx,C:ctx.CONTENT,geo,create:(seed=1,opts={})=>ctx.createSim(seed,geo,opts)};
}
const neutralFx = () => Object.fromEntries(Object.entries(load().effects).map(([k,e]) => [k,e.none]));
module.exports = { fixtureData, fixtureEngine, neutralFx };
