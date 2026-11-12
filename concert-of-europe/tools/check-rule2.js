// A small lexical scan, not an AST proof. Strings/comments are masked before checking executable writes.
function codeOnly(source){
  const out=source.split('');let i=0;
  const blank=(a,b)=>{for(let j=a;j<b;j++)if(out[j]!=='\n')out[j]=' ';};
  function code(nested=false){let depth=0;
    while(i<source.length){const c=source[i],n=source[i+1];
      if(c==='/'&&n==='/'){const a=i;i=source.indexOf('\n',i);if(i<0)i=source.length;blank(a,i);continue;}
      if(c==='/'&&n==='*'){const a=i,b=source.indexOf('*/',i+2);i=b<0?source.length:b+2;blank(a,i);continue;}
      if(c==='"'||c==="'"){const a=i,q=c;i++;while(i<source.length&&source[i]!==q){if(source[i]==='\\')i++;i++;}i++;blank(a,i);continue;}
      if(c==='`'){const a=i++;blank(a,i);while(i<source.length&&source[i]!=='`'){
        if(source[i]==='\\'){blank(i,i+2);i+=2;continue;}
        if(source[i]==='$'&&source[i+1]==='{'){blank(i,i+2);i+=2;code(true);continue;}
        blank(i,i+1);i++;
      }blank(i,i+1);i++;continue;}
      if(c==='{' )depth++;if(c==='}'){if(nested&&!depth){blank(i,i+1);i++;return;}depth--;}
      i++;
    }
  }code();return out.join('');
}
function checkSource(source,file){
  const errors=[],code=codeOnly(source),line=i=>source.slice(0,i).split('\n').length,functions=[];
  for(const m of code.matchAll(/\bfunction\s+(\w+)\s*\([^)]*\)\s*\{/g)){
    const start=m.index+m[0].length;let end=start,depth=1;
    while(end<code.length&&depth){if(code[end]==='{')depth++;if(code[end]==='}')depth--;end++;}
    functions.push({name:m[1],start,end});
  }
  const owners=[[/\.treasury\s*(?:[+*/-])?=(?!=)/g,['changeGold']],[/\.unrest\s*(?:[+*/-])?=(?!=)/g,['setUnrest']],
    [/\.owner\s*=(?!=)/g,['setProvinceOwner']],[/\.ruler\s*=(?!=)/g,['appointRuler']],
    [/\.alive\s*=(?!=)/g,['birthNations','killIfEmpty']],[/\bS\.wars\s*=(?!=)/g,['closeWar']],[/\bS\.wars\.push\(/g,['declareWar']]];
  if(file==='src/sim.js')for(const [pattern,allowed]of owners)for(const m of code.matchAll(pattern)){
    const owner=functions.filter(f=>m.index>=f.start&&m.index<f.end).sort((a,b)=>a.end-a.start-(b.end-b.start))[0];
    if(!owner||!allowed.includes(owner.name))errors.push(`${file}:${line(m.index)}: protected state write must go through ${allowed.join('/')}`);
  }
  // Fixed table access is forbidden regardless of whether that spelling still exists after a rename.
  for(const m of code.matchAll(/\b(?:EV|NATIONS|COUNTRIES|AMBITIONS|RB|TIER|RARITY)\.([A-Za-z]\w*)|\bS\.C\.([A-Za-z]\w*)|\bCONTENT\.(?:nations|peoples|provinces|rulers|events|ambitions)\.([A-Za-z]\w*)/g)) {
    if (/^(?:TIER|RARITY)\.length$/.test(m[0])) continue;
    errors.push(`${file}:${line(m.index)}: code names a content entry: ${m[0]}`);
  }
  // Bracket string access and identity comparisons need the original strings; comments have been masked.
  const literal=/(?:\b(?:EV|NATIONS|COUNTRIES|AMBITIONS|RB|TIER|RARITY)|\bS\.C)\s*\[\s*(['"])[^'"\n]+\1\s*\]|\.(?:tag|owner|core|culture|trait)\s*={2,3}\s*(['"])[^'"\n]+\2/g;
  for(const m of source.matchAll(literal))if(code[m.index]!==' ')errors.push(`${file}:${line(m.index)}: literal content identity; use a record field or dynamic reference`);
  return errors;
}
module.exports={codeOnly,checkSource};
