const fs=require('fs'),vm=require('vm'),assert=require('assert');const ctx={URLSearchParams};vm.createContext(ctx);vm.runInContext(fs.readFileSync('src/teampass-api.js','utf8'),ctx);const api=ctx.TP_API;
const expected=['authorize','authorizeToken','itemFindByUrl','itemGet','itemsInFolders','itemCreate','itemUpdate','writableFolders','listFolders','folderCreate'];
assert.deepEqual(Object.keys(api.endpoints).sort(),expected.sort(),'endpoint inventory complete');
for(const name of expected){assert(api.endpoints[name],`${name}: path missing`);assert(api.methods[name],`${name}: HTTP method missing`);assert.equal(api.route(name).includes('undefined'),false,`${name}: invalid route`)}
assert.equal(api.route('itemGet',{id:1506}),'item/get?id=1506');
assert.equal(api.route('itemFindByUrl',{url:'https://example.test/a?b=1'}),'item/findByUrl?url=https%3A%2F%2Fexample.test%2Fa%3Fb%3D1');
assert.equal(api.url('https://tp.example/','item/get?id=1'),'https://tp.example/api/index.php/item/get?id=1');
assert.deepEqual(api.unwrapList({items:[{id:1}]}),[{id:1}]);assert.equal(api.unwrapObject({item:{id:2}}).id,2);
const auth=api.authorizeBody({authMode:'password',apiKey:'k',login:'u',password:'p'});assert.deepEqual(JSON.parse(JSON.stringify(auth)),{apikey:'k',login:'u',password:'p'});
const token=api.authorizeBody({authMode:'token',login:'u',pat:'a'.repeat(64)});assert.equal(token.token.length,64);
const create=api.itemCreateBody({label:' X ',folder_id:9,password:'p',login:'u',url:'https://x'});for(const key of ['label','folder_id','password','login','email','url','description','icon','fields'])assert(key in create,`create payload field ${key}`);
const update=api.itemUpdateBody({id:7,label:'X',password:'p',folder_id:9});for(const key of ['id','label','password','folder_id'])assert(key in update,`update payload field ${key}`);
const folder=api.folderCreateBody({title:' F ',parent_id:1,complexity:38});for(const key of ['title','parent_id','complexity','icon','icon_selected','access_rights'])assert(key in folder,`folder payload field ${key}`);
for(const [cap,names] of Object.entries(api.capabilities)){assert(names.length,`${cap}: empty`);for(const name of names)assert(expected.includes(name),`${cap}: unknown ${name}`)}
console.log(`API contract tests: PASS (${expected.length} endpoints, ${Object.keys(api.capabilities).length} capabilities)`);
