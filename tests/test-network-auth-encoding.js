const assert=require('assert');
const named={uuml:'ü',Uuml:'Ü',auml:'ä',Auml:'Ä',ouml:'ö',Ouml:'Ö',szlig:'ß',amp:'&',quot:'"',apos:"'",nbsp:'\u00a0'};
function decodeEntity(v){let value=String(v);for(let i=0;i<6;i++){const next=value.replace(/&#x([0-9a-f]+);/gi,(_,n)=>String.fromCodePoint(parseInt(n,16))).replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n))).replace(/&([a-z][a-z0-9]+);/gi,(m,n)=>Object.prototype.hasOwnProperty.call(named,n)?named[n]:m);if(next===value)break;value=next}return value}
function repair(v){const value=decodeEntity(v);if(!/[\u00c2\u00c3\u00e2\u00f0]/.test(value))return value;const m={'€':0x80,'’':0x92,'“':0x93,'”':0x94,'–':0x96,'—':0x97,'™':0x99};try{return new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from([...value],c=>m[c]??c.codePointAt(0)))}catch{return value}}
assert.equal(repair('Siggi&#039;s KnowledgeSpace'),"Siggi's KnowledgeSpace");
assert.equal(repair('Siggiâ€™s KnowledgeSpace'),'Siggi’s KnowledgeSpace');
assert.equal(repair('GeschÃ¼tzter Bereich'),'Geschützter Bereich');
assert.equal(repair('M&uuml;hle Edit-Bereich'),'Mühle Edit-Bereich');
assert.equal(repair('M&amp;uuml;hle Edit-Bereich'),'Mühle Edit-Bereich');
assert.equal(repair('Gr&#252;&szlig;e'),'Grüße');
console.log('Network auth encoding tests: PASS (6 assertions)');
