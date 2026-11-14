// Development mechanics use synthetic nations and discover cards by the effects being tested.
const { test } = require('node:test'), assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const { fixtureEngine, neutralFx } = require('./fixtures');
const exportsForTests = {fxTest:'fx',drawTest:'drawAdvances',offerTest:'offerAdvances',tickWarTest:'tickWars',warEvalTest:'warEval',foesTest:'forecastFoes',settleTest:'settleYears',provincesTest:'tickProvinces',actTest:'act',reformTest:'reform',reignTest:'endReign'};
const engine = () => fixtureEngine(exportsForTests);
const json = x => JSON.stringify(x,(k,v)=>Object.prototype.toString.call(v)==='[object Set]'?[...v]:v);
const close = (a,b) => assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
const blank = s => Object.values(s.C).forEach(c=>{c.advances=[];c.ruler.fx=neutralFx();});
const grant = (c,id,grade=0,target=null) => c.advances.push({id,grade,target});
const cardFor = (C,key) => Object.keys(C.advances.cards).find(id=>C.advances.cards[id].effects.some(e=>e.fx===key));
const resolve = s => { while(s.pending)(s.pending.type==='heir'?s.chooseHeir:s.chooseAdvance)(0); };

test('every card applies all content strengths and its neutral non-targeted behavior',()=>{
  const {C,create}=engine(),s=create();blank(s);const c=s.C.A;
  for(const [id,d] of Object.entries(C.advances.cards)) for(let grade=0;grade<C.rarities.length;grade++){
    c.advances=[];grant(c,id,grade,'B');
    for(const e of d.effects){close(s.fxTest(c,e.fx,'B'),e.values[grade]);if(C.effects[e.fx].targeted)close(s.fxTest(c,e.fx,'C'),C.effects[e.fx].none);}
  }
});
test('opening ruler precedes development; invalid choices and rendering draws are inert',()=>{
  const {C,create}=engine(),s=create(7,{player:'A'});
  assert.equal(s.pending.type,'heir');assert.equal(s.C.A.advances.length,0);s.chooseHeir(0);
  assert.equal(s.pending.type,'advance');const before=json(s);
  for(const i of [-1,s.pending.options.length,NaN,0.5])assert.equal(s.chooseAdvance(i),false);
  s.step();assert.equal(json(s),before);
  assert.equal(s.chooseAdvance(0),true);assert.equal(s.chooseAdvance(0),false);
  assert.equal(s.nextAdvanceYear(),C.advances.years[1]);
});
test('heir and advance cards each spend their own rerolls',()=>{
  const {C,create}=engine(),s=create(7,{player:'A'});
  assert.equal(s.pending.type,'heir');
  for(let k=0;k<C.rules.rerolls.heir;k++)assert.equal(s.reroll(),true);
  assert.equal(s.reroll(),false);assert.equal(s.pending.type,'heir');s.chooseHeir(0);
  assert.equal(s.pending.type,'advance');assert.equal(s.rerolls.advance,C.rules.rerolls.advance);
  const n=s.pending.options.length,draws=[JSON.stringify(s.pending.options)];
  for(let k=0;k<C.rules.rerolls.advance;k++){assert.equal(s.reroll(),true);assert.equal(s.pending.type,'advance');assert.equal(s.pending.options.length,n);draws.push(JSON.stringify(s.pending.options));}
  assert.equal(s.reroll(),false);assert.ok(new Set(draws).size>1);
  assert.equal(s.chooseAdvance(0),true);assert.equal(s.rerolls.heir,0);
});
test('watch mode has no rerolls',()=>{const {create}=engine(),s=create(7);assert.equal(JSON.stringify(s.rerolls),'{"heir":0,"advance":0}');assert.equal(s.reroll(),false);});
test('offers use independent rarity rolls, categories, eligibility and the strongest available target',()=>{
  const {C,create}=engine(),s=create();blank(s);const c=s.C.E;c.rival='A';c.allies.clear();
  const counts=C.rarities.map(()=>0),n=2000;
  for(let i=0;i<n;i++){
    const offers=s.drawTest(c);assert.equal(offers.length,Object.keys(C.advances.categories).length);
    assert.equal(new Set(offers.map(a=>a.id)).size,offers.length);
    for(const a of offers){
      assert.deepEqual(Object.keys(a).sort(),['grade','id','target']);counts[a.grade]++;
      assert.notEqual(C.advances.cards[a.id].requires,'coast');
      if(a.target)assert.equal(a.target,'A');
    }
  }
  counts.forEach((count,g)=>{const p=C.rarities[g].odds,total=counts.reduce((n,v)=>n+v,0);assert.ok(Math.abs(count-total*p)<6*Math.sqrt(total*p*(1-p))+1);});
  c.allies.add('A');let targeted;for(let i=0;i<100&&!targeted;i++)targeted=s.drawTest(c).find(a=>a.target);
  assert.ok(targeted);assert.equal(targeted.target,'C');
  c.advances=Object.keys(C.advances.cards).map(id=>({id,grade:0,target:null}));assert.equal(s.drawTest(c).length,0);
});
test('stacks combine by registered neutral value and survive succession',()=>{
  const {C,create}=engine(),s=create();blank(s);const c=s.C.A;
  for(let grade=0;grade<C.rarities.length;grade++){
    c.advances=[];c.ruler.fx={...neutralFx(),fight:1.5,horizon:4};
    for(const id of Object.keys(C.advances.cards))grant(c,id,grade,'B');
    for(const [key,def] of Object.entries(C.effects)){
      let expected=c.ruler.fx[key];
      for(const a of c.advances)for(const e of C.advances.cards[a.id].effects)if(e.fx===key)expected=def.none===1?expected*e.values[grade]:expected+e.values[grade];
      close(s.fxTest(c,key,'B'),expected);
    }
  }
  const owned=json(c.advances);s.reignTest(c,'coup');assert.equal(json(c.advances),owned);
});
test('factory, reform and recruitment prices match the applied modifiers',()=>{
  const {C,create}=engine(),s=create();blank(s);const c=s.C.A;c.treasury=10000;
  const base=s.considerations(c).find(a=>a.type==='factory');assert.ok(base);
  grant(c,cardFor(C,'factoryCost'));const next=s.considerations(c).find(a=>a.type==='factory');close(next.cost/base.cost,s.fxTest(c,'factoryCost'));
  const r=next.r;let gold=c.treasury;s.actTest(c,next);close(gold-c.treasury,next.cost);assert.equal(r.build.type,'factory');
  grant(c,cardFor(C,'reformCost'));grant(c,cardFor(C,'reformCalm'));r.unrest=80;gold=c.treasury;
  s.actTest(c,{type:'reform'});close(gold-c.treasury,C.rules.reform.cost*s.fxTest(c,'reformCost'));close(r.unrest,Math.max(0,80-C.rules.reform.calm*s.fxTest(c,'reformCalm')));
  gold=c.treasury;const army=c.army;s.actTest(c,{type:'army',amt:10});close(c.army,army+10);close(gold-c.treasury,10*C.rules.price.recruit*s.fxTest(c,'recruit'));
});
test('foreign and general integration agree in forecasts and province progress',()=>{
  const {C,create}=engine(),s=create();blank(s);const c=s.C.A,r=s.regionsOf(c)[0];
  grant(c,cardFor(C,'integrate'));grant(c,cardFor(C,'integrateOther'));
  for(const foreign of [false,true])for(const core of [false,true]){
    r.culture=foreign?s.C.B.culture:c.culture;r.core=core?c.tag:'B';r.integ=0.1;
    const mult=s.fxTest(c,'integrate')*(foreign&&!core?s.fxTest(c,'integrateOther'):1);
    close(s.settleTest(r,c),(foreign&&!core?9:4)/mult);s.provincesTest();close(r.integ-0.1,(foreign&&!core?C.rules.integrate.other:C.rules.integrate.kin)*mult);
  }
});
test('targeted fighting reaches forecasts and battles, and excludes unavailable allies',()=>{
  const {C,create}=engine(),a=create(),b=create();blank(a);blank(b);const id=cardFor(C,'targetFight');
  for(const s of [a,b]){s.wars=[];for(const c of s.alive()){c.allies.clear();c.truce={};}s.C.C.army=60;s.C.B.army=50;s.C.C.ruler.bias=1;s.majors=[];const x=s.regionsOf(s.C.C)[0],y=s.regionsOf(s.C.B)[0];x.nb=[y.i];y.nb=[x.i];}
  grant(b.C.C,id,0,'B');close(b.strength(b.C.C)/a.strength(a.C.C),1);assert.ok(b.strength(b.C.C,'B')>a.strength(a.C.C,'B'));
  const goal=a.regionsOf(a.C.B)[0],x=a.warEvalTest(a.C.C,a.C.B,goal),y=b.warEvalTest(b.C.C,b.C.B,b.RB[goal.id]);assert.ok(y.pTrue>x.pTrue);
  for(const s of [a,b])s.wars=[{id:1,name:'Fixture war',att:['C'],def:['B'],goal:goal.id,quarters:0,score:0,battles:0,great:false}];
  a.tickWarTest();b.tickWarTest();assert.ok(b.C.C.army>=a.C.C.army);
  const s=create(),att=s.C.A,def=s.C.B,ally=s.C.C;def.allies.add(ally.tag);att.allies.clear();s.wars=[{att:['C'],def:['D']}];
  assert.ok(!s.foesTest(def,att).includes(ally.tag));s.wars=[];def.allies.clear();assert.ok(s.foesTest(def,att,ally).includes(ally.tag));
});
test('core-land strength is conditional for attacking, defending and unrelated cores',()=>{
  const {C,create}=engine(),id=cardFor(C,'homeFight');
  for(const core of ['A','B','D']){
    const a=create(),b=create();blank(a);blank(b);
    for(const s of [a,b]){s.wars=[];s.majors=[];s.C.A.allies.clear();s.C.B.allies.clear();s.C.A.truce={};s.C.B.truce={};s.C.A.army=100;s.C.B.army=50;s.C.A.ruler.bias=1;s.RB.p0.core=core;}
    grant(b.C[core==='B'?'B':'A'],id);
    const x=a.warEvalTest(a.C.A,a.C.B,a.RB.p0),y=b.warEvalTest(b.C.A,b.C.B,b.RB.p0);assert.ok(x&&y);
    if(core==='D')close(x.pTrue,y.pTrue);else if(core==='A')assert.ok(y.pTrue>x.pTrue);else assert.ok(y.pTrue<x.pTrue);
  }
});
test('scheduled delivery is once, preserves pending succession and has no retrospective grants',()=>{
  const {C,create}=engine(),s=create(3,{player:'A'});resolve(s);
  const year=C.advances.years[1];s.t=(year-C.rules.start)*C.rules.seasons.length;s.year=year;s.q=C.advances.season;
  s.pending={type:'heir',tag:'A',options:[{...s.C.A.ruler}],why:'',crisis:false};s.offerTest();assert.equal(s.pending.type,'heir');
  s.chooseHeir(0);assert.equal(s.pending.type,'advance');s.chooseAdvance(0);const counts=s.alive().map(c=>c.advances.length);s.offerTest();assert.deepEqual(s.alive().map(c=>c.advances.length),counts);
  s.year=year+1;s.offerTest();assert.deepEqual(s.alive().map(c=>c.advances.length),counts);
});
test('chooser, progress, owned cards and Almanac render without changing state',()=>{
  const {ctx,C,create,geo}=engine(),s=create(7,{player:'A'});s.chooseHeir(0);ctx.S=s;ctx.GEO=geo;
  const els={},el=()=>({innerHTML:'',textContent:'',style:{},dataset:{},classList:{add(){},remove(){},contains(){return false;}},querySelector(){return {focus(){}};},querySelectorAll(){return [];},addEventListener(){},focus(){}});
  ctx.$=id=>els[id]||=el();ctx.document={querySelectorAll:()=>[]};
  vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/ui/registry.js'),'utf8')+'\nlet selected="A";const fmt=v=>Math.round(v).toLocaleString("en");const nameSpan=t=>S.C[t].name;\n'+fs.readFileSync(path.join(__dirname,'../src/ui/panel.js'),'utf8')+fs.readFileSync(path.join(__dirname,'../src/ui/almanac.js'),'utf8'),ctx);
  let before=json(s);for(let i=0;i<3;i++)vm.runInContext('showAdvance();renderAdvanceProgress();SECTIONS.advances.render();',ctx);assert.equal(json(s),before);
  s.chooseAdvance(0);before=json(s);vm.runInContext('renderNation();renderNation();',ctx);assert.equal(json(s),before);
  assert.doesNotMatch(els.side.innerHTML,/undefined|NaN|\{[\w.|]+\}/);assert.ok(els.side.innerHTML.includes(C.advances.cards[s.C.A.advances[0].id].name));
  s.C.A.alive=false;s.C.A.ruler=null;before=json(s);vm.runInContext('renderNation();renderNation();',ctx);assert.equal(json(s),before);
  assert.ok(els.side.innerHTML.includes('no longer on the map'));assert.doesNotMatch(els.side.innerHTML,/undefined|NaN|\{[\w.|]+\}/);
});
test('complete watch and player worlds end at the armistice with unique scheduled acquisitions',()=>{
  const {C,create}=engine();
  for(const player of [null,'A','C']){
    const s=create(7,player?{player}:{}),awards=[],eligible=[],seen=new Set();let n=0;
    while(!s.over){assert.ok(n++<700);
      if (player && s.phase === 'season' && !seen.has(s.t)) {
        seen.add(s.t);
        if (s.q === C.advances.season && C.advances.years.includes(s.year) && s.C[player].alive) eligible.push(s.year);
      }
      if(s.pending){if(s.pending.type==='heir')s.chooseHeir(0);else{awards.push(s.pending.year);s.chooseAdvance(0);}}else s.step();
      for(const c of s.alive()){assert.ok(Number.isFinite(c.treasury)&&Number.isFinite(s.strength(c)));assert.equal(new Set(c.advances.map(a=>a.id)).size,c.advances.length);}}
    assert.equal(s.year,C.rules.end.year);assert.equal(s.q,C.rules.end.season);assert.equal(s.nextAdvanceYear(),null);
    if(player)assert.deepEqual(awards,eligible);
  }
});
