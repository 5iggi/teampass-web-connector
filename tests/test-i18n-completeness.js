const fs=require('fs'),assert=require('assert');
const de=JSON.parse(fs.readFileSync('src/_locales/de/messages.json','utf8'));
const en=JSON.parse(fs.readFileSync('src/_locales/en/messages.json','utf8'));
assert.deepEqual(Object.keys(de).sort(),Object.keys(en).sort(),'locale key sets differ');
for(const file of ['content.js','popup.js','options.js','network-auth.js']){
 const s=fs.readFileSync('src/'+file,'utf8');
 for(const m of s.matchAll(/(?<![A-Za-z0-9_.])(?:tpI18n\.)?t\('([A-Za-z0-9_]+)'/g))assert(en[m[1]],`${file}: missing locale key ${m[1]}`);
}
const content=fs.readFileSync('src/content.js','utf8');
for(const literal of ['Aktuell erkannte Zugangsdaten übernehmen','Ordner filtern','Alle aufklappen','Alle zuklappen','Name des neuen Unterordners:','Speichere …'])assert(!content.includes(literal),`hard-coded German UI literal: ${literal}`);
console.log(`i18n completeness: PASS (${Object.keys(en).length} keys)`);
