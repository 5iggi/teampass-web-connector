#!/usr/bin/env node
/* Read-only by default. Live mutation tests require --allow-write and TP_TEST_FOLDER_ID. */
const fs=require('fs'),vm=require('vm');const ctx={URLSearchParams};vm.createContext(ctx);vm.runInContext(fs.readFileSync(new URL('../src/teampass-api.js',`file://${__filename}`).pathname,'utf8'),ctx);const api=ctx.TP_API;
const args=new Set(process.argv.slice(2)),live=args.has('--live'),allowWrite=args.has('--allow-write');
const env=process.env,base=(env.TP_SERVER_URL||'').replace(/\/$/,''),login=env.TP_LOGIN||'',pat=env.TP_PAT||'',apiKey=env.TP_API_KEY||'',password=env.TP_PASSWORD||'',testUrl=env.TP_TEST_URL||base;
const result={schemaVersion:api.schemaVersion,supportedTeamPass:api.supportedTeamPass,mode:live?'live':'contract',tests:[],startedAt:new Date().toISOString()};
function add(name,ok,detail={}){result.tests.push({name,ok,...detail});console.log(`${ok?'PASS':'FAIL'} ${name}${detail.status?' HTTP '+detail.status:''}`)}
async function call(name,{params={},body}={}){const method=api.methods[name],url=api.url(base,api.route(name,params)),headers={'Content-Type':'application/json'};if(global.jwt)headers.Authorization=`Bearer ${global.jwt}`;const response=await fetch(url,{method,headers,body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(15000)});let data;try{data=await response.json()}catch{data={}}return{response,data,url}}
(async()=>{try{
 for(const name of Object.keys(api.endpoints))add(`contract:${name}`,Boolean(api.methods[name]&&api.route(name)),{method:api.methods[name],path:api.endpoints[name]});
 if(!live){result.ok=result.tests.every(x=>x.ok);return}
 if(!base||!login)throw new Error('TP_SERVER_URL and TP_LOGIN are required for --live');
 const authName=pat?'authorizeToken':'authorize',cfg={authMode:pat?'token':'password',login,pat,apiKey,password};let x=await call(authName,{body:api.authorizeBody(cfg)});global.jwt=x.data.token;add(`live:${authName}`,x.response.ok&&Boolean(global.jwt),{status:x.response.status,version:x.data.teampass_version||''});if(!global.jwt)throw new Error('Authorization failed');
 x=await call('writableFolders');const writable=api.unwrapList(x.data);add('live:writableFolders',x.response.ok&&Array.isArray(writable),{status:x.response.status,count:writable.length});
 x=await call('listFolders');add('live:listFolders',x.response.ok,{status:x.response.status,count:api.unwrapList(x.data).length});
 x=await call('itemFindByUrl',{params:{url:testUrl}});const found=api.unwrapList(x.data);add('live:itemFindByUrl',x.response.ok&&Array.isArray(found),{status:x.response.status,count:found.length});
 const firstId=env.TP_TEST_ITEM_ID||found[0]?.id||found[0]?.item_id;if(firstId){x=await call('itemGet',{params:{id:firstId}});add('live:itemGet',x.response.ok,{status:x.response.status,id:firstId})}else add('live:itemGet',true,{skipped:'No TP_TEST_ITEM_ID or URL result'});
 const folderIds=writable.slice(0,3).map(f=>Number(f.id)).filter(Number.isFinite);if(folderIds.length){x=await call('itemsInFolders',{params:{folders:JSON.stringify(folderIds)}});add('live:itemsInFolders',x.response.ok,{status:x.response.status,count:api.unwrapList(x.data).length})}else add('live:itemsInFolders',true,{skipped:'No readable folder IDs'});
 if(allowWrite){add('write-tests',false,{detail:'Mutation tests intentionally require a disposable TeamPass test environment; automatic create/update/delete cleanup is not enabled in this release.'})}
 }catch(e){add('runner',false,{error:e.message})}finally{result.finishedAt=new Date().toISOString();result.ok=result.tests.every(x=>x.ok);const out=env.TP_TEST_REPORT||'teampass-api-test-report.json';fs.writeFileSync(out,JSON.stringify(result,null,2));console.log(`Report: ${out}`);process.exitCode=result.ok?0:1}})();
