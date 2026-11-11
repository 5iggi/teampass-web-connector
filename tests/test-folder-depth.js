const fs=require('fs'),vm=require('vm'),assert=require('assert');
const source=fs.readFileSync('src/background.js','utf8');
const start=source.indexOf('function folderChildren');const end=source.indexOf('\nasync function fetchItemsForFolderBatch',start);assert(start>=0&&end>start);
const ctx={};vm.createContext(ctx);vm.runInContext(source.slice(start,end),ctx);
const tree=[{id:1,title:'Import',childrens:[{id:2,title:'Siggi',childrens:[{id:3,title:'Internet',childrens:[{id:4,title:'Webhosting',childrens:[]}]}]}]}];
const flat=ctx.flattenFolderTree(tree);assert.equal(flat.length,4);assert.equal(flat[3].level,4);assert.equal(flat[3].path,'Import » Siggi » Internet » Webhosting');
const merged=ctx.mergeFolders([{id:4,title:'Webhosting',parent_id:3,level:1,can_create:1}],flat);const web=merged.find(x=>x.id===4);assert.equal(web.level,4);assert.equal(web.path,'Import » Siggi » Internet » Webhosting');
console.log('Folder depth tests: PASS (4 levels and full path)');
