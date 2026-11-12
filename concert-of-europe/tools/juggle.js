// Content-only compatibility checks. Every mutation and generated file stays in a disposable copy.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),{execFile}=require('node:child_process'),{promisify}=require('node:util');
const run=promisify(execFile),root=path.join(__dirname,'..'),load=()=>require('./content').load(),base=fs.mkdtempSync(path.join(os.tmpdir(),'concert-juggle-'));
const rename=(C,old,id,except=[])=>{
  const visit=(x,key='')=>typeof x==='string'?(except.includes(key)?x:x.replace(new RegExp('\\b'+old+'\\b','g'),id)):Array.isArray(x)?x.map(v=>visit(v,key)):x&&typeof x==='object'?Object.fromEntries(Object.entries(x).map(([k,v])=>[k===old?id:k,visit(v,k)])):x;
  return visit(C);
};
const cases=[
 ['rename starting nation',C=>rename(C,Object.keys(C.nations).find(t=>C.nations[t].starts),'fixtureStart')],
 ['rename uprising nation',C=>rename(C,Object.keys(C.nations).find(t=>!C.nations[t].starts),'fixtureBorn')],
 ['rename trait and retain its artwork',C=>rename(C,Object.keys(C.rulers)[0],'fixtureTrait',['emblem'])],
 ['rename union',C=>rename(C,Object.keys(C.ambitions).find(id=>C.ambitions[id].kind==='unite'),'fixtureUnion')],
 ['rename fallback ambition',C=>{const old=Object.keys(C.ambitions).find(id=>C.ambitions[id].fallback);C.ambitions.fixtureFallback=C.ambitions[old];delete C.ambitions[old];Object.values(C.nations).forEach(n=>{if(n.ambition===old)n.ambition='fixtureFallback';});return C;}],
 ['add event from an existing operation',C=>{const e=structuredClone(Object.values(C.events).find(e=>e.operation==='apply'&&e.target.mode==='random'&&e.effects.unrest));e.name='Fixture disturbance';C.events.fixtureEvent=e;return C;}],
 ['add trait using registered effects and artwork',C=>{const donor=structuredClone(Object.values(C.rulers)[0]),used=new Set(Object.values(C.rulers).map(t=>t.main[0].fx));const id=Object.keys(C.effects).find(id=>C.effects[id].none===1&&!C.effects[id].targeted&&!used.has(id)&&!donor.flat.some(e=>e.fx===id)&&donor.malus[0].fx!==id);donor.label='Fixture character';donor.main=[1.1,1.2,1.3].map(value=>({fx:id,value,text:'Changes its multiplier to {v|times}',news:''}));C.rulers.fixtureCharacter=donor;return C;}],
 ['add an uprising nation',C=>{const donor=structuredClone(Object.values(C.nations).find(n=>!n.starts)),people=Object.keys(C.peoples).find(p=>!Object.values(C.nations).some(n=>!n.starts&&n.people===p));donor.name='Fixture realm';donor.adj='Fixture';donor.pre='Fixture';donor.people=people;donor.ambition=Object.keys(C.ambitions).find(id=>C.ambitions[id].fallback);C.nations.fixtureRealm=donor;return C;}],
 ['add a union',C=>{const tag=Object.keys(C.nations).find(t=>!C.nations[t].starts),n=C.nations[tag],a=structuredClone(Object.values(C.ambitions).find(a=>a.kind==='unite'));a.title='Fixture union';a.adj='Fixture';a.pre='Fixture';a.peoples=[n.people];a.provinces=Object.keys(C.provinces).filter(id=>C.provinces[id].people===n.people);a.need=1;a.note='';C.ambitions.fixtureNewUnion=a;n.ambition='fixtureNewUnion';return C;}],
 ['delete an ordinary event',C=>{const id=Object.keys(C.events).find(id=>C.events[id].operation==='apply'&&C.events[id].target.kind==='pair');delete C.events[id];return C;}],
 ['swap rarity records',C=>{[C.rarities[0],C.rarities[1]]=[C.rarities[1],C.rarities[0]];return C;}],
 ['rename a province used by a map cut',C=>rename(C,C.map.cuts[0].to,'fixtureProvince'),true],
 ['reject empty sovereign names',C=>{const n=Object.values(C.nations)[0];n.namePool='nation';n.rulerNames=[];return C;},false,'ruler names'],
 ['reject an exhausted military-era deck',C=>{C.eras=C.eras.slice(0,2);return C;},false,'candidate'],
 ['reject opening diplomacy with an unborn nation',C=>{Object.values(C.nations).find(n=>n.starts).allies.push(Object.keys(C.nations).find(t=>!C.nations[t].starts));return C;},false,'opening diplomacy'],
 ['reject a missing closing settlement',C=>{for(const [id,e]of Object.entries(C.events))if(e.phase==='closing')delete C.events[id];return C;},false,'closing settlement'],
];
async function trial([name,mutate,map=false,rejection='']){
 const dir=path.join(base,name.replace(/\W+/g,'-'));fs.mkdirSync(dir);
 for(const p of ['src','tools','content','map','assets'])fs.cpSync(path.join(root,p),path.join(dir,p),{recursive:true});
 for(const p of ['package.json','package-lock.json'])fs.copyFileSync(path.join(root,p),path.join(dir,p));
 const C=mutate(load());for(const [file,v]of Object.entries(C))fs.writeFileSync(path.join(dir,'content',file+'.json'),JSON.stringify(v));
 if(map){let deps=path.join(root,'node_modules');if(!fs.existsSync(deps))throw new Error('Map juggle needs the installed map dependencies');fs.symlinkSync(fs.realpathSync(deps),path.join(dir,'node_modules'),'dir');await run(process.execPath,['map/build-map.js'],{cwd:dir,maxBuffer:4e6});}
 const result={name};
 for(const [label,args]of [['build',['run','build']],['chronicle',['run','chronicle','--','1']]]){
  try{const out=await run('npm',args,{cwd:dir,maxBuffer:8e6,timeout:180000});fs.writeFileSync(path.join(dir,label+'.log'),out.stdout+out.stderr);result[label]=0;if(rejection)throw new Error(`${name}: ${label} accepted invalid content`);if(label==='chronicle'&&/\bundefined\b|\bNaN\b/.test(out.stdout))throw new Error(`${name}: bad chronicle output`);}
  catch(e){if(!rejection||!Number.isInteger(e.code)||!String(e.stdout||'').concat(e.stderr||'').includes(rejection))throw e;result[label]=e.code;fs.writeFileSync(path.join(dir,label+'.log'),String(e.stdout||'')+(e.stderr||''));}
 }
 console.log(`${name}: ${rejection?'clear validation rejection':'build and chronicle passed'}`);return result;
}
(async()=>{
 const queue=[...cases],results=[];
 await Promise.all(Array.from({length:2},async()=>{while(queue.length){const item=queue.shift();try{results.push(await trial(item));}catch(e){results.push({name:item[0],error:e.message});console.error(item[0]+': '+(e.stdout||e.message));console.error(e.stderr||'');}}}));
 fs.writeFileSync(path.join(base,'results.json'),JSON.stringify(results,null,2));console.log(`Results and logs: ${base}`);
 if(results.some(r=>r.error))process.exitCode=1;
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
