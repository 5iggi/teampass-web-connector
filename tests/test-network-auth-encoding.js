const assert = require('assert');
function decodeEntity(v){return String(v).replace(/&#39;|&#039;|&apos;/gi,"'").replace(/&quot;/gi,'"').replace(/&amp;/gi,'&')}
function repair(v){const value=decodeEntity(v);if(!/[\u00c2\u00c3\u00e2\u00f0]/.test(value))return value;const m={'€':0x80,'’':0x92,'“':0x93,'”':0x94,'–':0x96,'—':0x97,'™':0x99};try{return new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from([...value],c=>m[c]??c.codePointAt(0)))}catch{return value}}
assert.equal(repair('Siggi&#039;s KnowledgeSpace'),"Siggi's KnowledgeSpace");
assert.equal(repair('Siggiâ€™s KnowledgeSpace'),'Siggi’s KnowledgeSpace');
assert.equal(repair('GeschÃ¼tzter Bereich'),'Geschützter Bereich');
assert.equal(repair('DokuWiki htaccess-Login'),'DokuWiki htaccess-Login');
console.log('Network auth encoding tests: PASS (4 assertions)');
