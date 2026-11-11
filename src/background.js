const api = globalThis.browser ?? globalThis.chrome;
const DEFAULTS = { serverUrl:'',login:'',apiKey:'',authMode:'password',pat:'',autoSavePrompt:false,showPendingBadge:true,collapseFolders:true,itemUrlTemplate:'/index.php?page=items&group={folder_id}&id={id}',clipboardClearSeconds:30,passwordLength:20,httpAuthEnabled:true,autoCacheEnabled:true,cacheRefreshMinutes:15,vaultLockMinutes:15,folderSearchDepth:0,flexibleChooser:false,autoFillCredentials:false,submitAfterSelection:false,urlMatchMode:'site' };

function pcall(fn, ...args) {
  const result = fn(...args);
  if (result && typeof result.then === 'function') return result;
  return new Promise((resolve, reject) => {
    fn(...args, value => {
      const err = chrome.runtime.lastError;
      if (err) reject(new Error(err.message)); else resolve(value);
    });
  });
}
const storageGet = keys => pcall(api.storage.local.get.bind(api.storage.local), keys);
const storageSet = obj => pcall(api.storage.local.set.bind(api.storage.local), obj);

const secureSession=api.storage.session||{_m:{},async get(d){return Object.fromEntries(Object.entries(d).map(([k,v])=>[k,k in this._m?this._m[k]:v]))},async set(o){Object.assign(this._m,o)},async remove(k){for(const x of Array.isArray(k)?k:[k])delete this._m[x]}};
const activeVaultUi=new Set();
async function touchVaultActivity(){const cfg={...DEFAULTS,...await storageGet(DEFAULTS)},state=await secureSession.get({vaultSecrets:null});if(!state.vaultSecrets)return false;await secureSession.set({vaultLastActivity:Date.now()});if(api.alarms&&Number(cfg.vaultLockMinutes)>0)api.alarms.create('vaultAutoLock',{delayInMinutes:Number(cfg.vaultLockMinutes)});return true;}
async function handleVaultAutoLock(){const cfg={...DEFAULTS,...await storageGet(DEFAULTS)},state=await secureSession.get({vaultSecrets:null,vaultLastActivity:0});if(!state.vaultSecrets)return;if(activeVaultUi.size){await touchVaultActivity();return}const idle=Date.now()-(state.vaultLastActivity||0),limit=Math.max(0,Number(cfg.vaultLockMinutes))*60000;if(limit>0&&idle>=limit)await lockVault();else if(limit>0&&api.alarms)api.alarms.create('vaultAutoLock',{delayInMinutes:Math.max(1,(limit-idle)/60000)});}
const enc=new TextEncoder(),dec=new TextDecoder();
const b64=a=>btoa(String.fromCharCode(...new Uint8Array(a))),unb64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
async function deriveVaultKey(passphrase,salt,iterations=600000){const material=await crypto.subtle.importKey('raw',enc.encode(passphrase),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',hash:'SHA-256',salt,iterations},material,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);}
async function encryptVault(passphrase,secrets){const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12)),iterations=600000,key=await deriveVaultKey(passphrase,salt,iterations),cipher=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,enc.encode(JSON.stringify(secrets)));return{version:1,kdf:'PBKDF2-SHA256',iterations,salt:b64(salt),iv:b64(iv),ciphertext:b64(cipher)}}
async function decryptVault(passphrase,vault){const key=await deriveVaultKey(passphrase,unb64(vault.salt),vault.iterations||600000),plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(vault.iv)},key,unb64(vault.ciphertext));return JSON.parse(dec.decode(plain));}
async function vaultState(){const local=await storageGet({encryptedVault:null,apiKey:'',password:'',pat:''}),session=await secureSession.get({vaultSecrets:null,vaultUnlockedAt:0});return{configured:Boolean(local.encryptedVault),locked:Boolean(local.encryptedVault&&!session.vaultSecrets),legacyPlaintext:Boolean(local.apiKey||local.password||local.pat),unlockedAt:session.vaultUnlockedAt||0};}
async function lockVault(){await secureSession.remove(['vaultSecrets','vaultUnlockedAt','vaultLastActivity']);await secureSession.remove(['httpAuthCache','httpAuthCacheBuiltAt','httpAuthFailedFolders']);await storageSet({jwt:''});if(api.alarms){await pcall(api.alarms.clear.bind(api.alarms),'vaultAutoLock').catch(()=>{});}if(api.action){await pcall(api.action.setBadgeText.bind(api.action),{text:'L'}).catch(()=>{});await pcall(api.action.setBadgeBackgroundColor.bind(api.action),{color:'var(--tp-border)'}).catch(()=>{});}return true;}
async function unlockVault(passphrase){const local=await storageGet({encryptedVault:null});if(!local.encryptedVault)throw new Error('Noch kein verschlüsselter Tresor eingerichtet.');let secrets;try{secrets=await decryptVault(passphrase,local.encryptedVault)}catch{throw new Error('Lokale Master-Passphrase ist falsch.')}await secureSession.set({vaultSecrets:secrets,vaultUnlockedAt:Date.now(),vaultLastActivity:Date.now()});const cfg={...DEFAULTS,...await storageGet(DEFAULTS)};if(api.alarms&&cfg.vaultLockMinutes>0)api.alarms.create('vaultAutoLock',{delayInMinutes:Number(cfg.vaultLockMinutes)});if(api.action)await pcall(api.action.setBadgeText.bind(api.action),{text:''}).catch(()=>{});await authorize({...cfg,...secrets});if(cfg.autoCacheEnabled)await secureSession.set({httpAuthAutoSync:{ok:true,time:Date.now(),result:{mode:'targeted-live-search',reason:'full-scan-not-required'}}});return true;}
async function configureVault(passphrase,secrets){if(!passphrase||passphrase.length<8)throw new Error('Die lokale Master-Passphrase muss mindestens 8 Zeichen lang sein.');const encryptedVault=await encryptVault(passphrase,secrets);await storageSet({encryptedVault,apiKey:'',password:'',pat:'',jwt:''});await secureSession.set({vaultSecrets:secrets,vaultUnlockedAt:Date.now(),vaultLastActivity:Date.now()});return encryptedVault;}

function normalizeServer(value) {
  const url = new URL(value);
  if (url.protocol !== 'https:') throw new Error('Aus Sicherheitsgründen ist ausschließlich HTTPS erlaubt.');
  return url.origin + url.pathname.replace(/\/$/, '');
}
async function settings() { const local={...DEFAULTS,...(await storageGet(DEFAULTS))};const session=await secureSession.get({vaultSecrets:null});if((await storageGet({encryptedVault:null})).encryptedVault&&!session.vaultSecrets)throw new Error('Die Erweiterung ist gesperrt. Bitte zuerst entsperren.');return{...local,...(session.vaultSecrets||{})}; }
// Central request gate. Queue entries contain metadata only; never credentials, JWTs, request bodies or password-bearing closures.
const apiGate={pending:[],active:false,blockedUntil:0,lastStarted:0,sequence:0,
 acquire(meta={}){const descriptor={id:crypto.randomUUID?.()||String(Math.random()),operation:String(meta.operation||'api'),priority:Number(meta.priority||50),category:String(meta.category||'interactive'),queuedAt:Date.now(),sequence:this.sequence++};return new Promise(resolve=>{this.pending.push({descriptor,resolve});this.pump()})},
 async pump(){if(this.active||!this.pending.length)return;this.pending.sort((a,b)=>b.descriptor.priority-a.descriptor.priority||a.descriptor.sequence-b.descriptor.sequence);const next=this.pending.shift();this.active=true;const spacing=next.descriptor.category==='interactive'?25:400,wait=Math.max(0,this.blockedUntil-Date.now(),spacing-(Date.now()-this.lastStarted));if(wait)await new Promise(r=>setTimeout(r,wait));this.lastStarted=Date.now();let released=false;next.resolve({descriptor:next.descriptor,release:()=>{if(released)return;released=true;this.active=false;queueMicrotask(()=>this.pump())}})},
 noteRateLimit(error){const seconds=rateLimitSeconds(error);if(seconds)this.blockedUntil=Math.max(this.blockedUntil,Date.now()+seconds*1000+750);return seconds},
 status(){return{pending:this.pending.length,active:this.active,blockedUntil:this.blockedUntil}}
};
async function requestDirect(path, options = {}, retry = true) {await touchVaultActivity();
  const cfg = await settings();
  const base = normalizeServer(cfg.serverUrl);
  let token = (await storageGet({jwt: ''})).jwt;
  if (!token) token = await authorize(cfg);
  const headers = {...(options.headers || {}), Authorization: `Bearer ${token}`};
  if (options.body) headers['Content-Type'] = 'application/json';
  const response = await fetch(TP_API.url(base, path), {...options, headers});
  if (response.status === 401 && retry) {
    token = await authorize(cfg);
    return requestDirect(path, options, false);
  }
  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : {}; } catch { data = {message: text}; }
  if (!response.ok) throw new Error(data.message || data.error || `HTTP ${response.status}`);
  return data;
}
async function request(path,options={},retry=true,meta={}){const ticket=await apiGate.acquire(meta);try{return await requestDirect(path,options,retry)}catch(error){apiGate.noteRateLimit(error);throw error}finally{ticket.release()}}

async function authorize(cfg = null) {
  cfg ||= await settings();
  const base = normalizeServer(cfg.serverUrl);
  let endpointName = 'authorize';
  if(cfg.authMode==='token'){endpointName='authorizeToken';if(!/^[a-f0-9]{64}$/.test(cfg.pat||''))throw new Error('Der persönliche Zugriffstoken muss aus 64 hexadezimalen Zeichen bestehen.');}
  else if(!cfg.apiKey||!cfg.password)throw new Error('API-Schlüssel und Kennwort fehlen.');
  const body=TP_API.authorizeBody(cfg);
  const endpoint=TP_API.route(endpointName);const response = await fetch(TP_API.url(base, endpoint), {method:TP_API.methods[endpointName], headers:{'Content-Type':'application/json'}, body:JSON.stringify(body)});
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.token) throw new Error(data.message || data.error || `Anmeldung fehlgeschlagen (HTTP ${response.status})`);
  await storageSet({jwt: data.token, serverVersion: data.teampass_version || ''});
  return data.token;
}

function unwrapItems(data){return TP_API.unwrapList(data);}
function normalizeItem(data, fallback = {}) {
  const item=TP_API.unwrapObject(data);
  return {
    ...fallback,
    ...item,
    id: item.id ?? item.item_id ?? fallback.id,
    label: item.label ?? item.title ?? item.name ?? fallback.label ?? '',
    login: item.login ?? item.username ?? item.user ?? fallback.login ?? '',
    email: item.email ?? fallback.email ?? '',
    pwd: item.pwd ?? item.password ?? item.secret ?? '',
    url: item.url ?? item.website ?? item.link ?? fallback.url ?? '',
    path: item.path ?? item.folder_path ?? fallback.path ?? '',
    folder_label: item.folder_label ?? item.folder ?? fallback.folder_label ?? ''
  };
}

function candidatesFromUrl(raw) {
  if (typeof raw !== 'string' || !raw.trim()) return [];
  let u;
  try { u = new URL(raw); } catch { return []; }
  if (!['http:', 'https:'].includes(u.protocol)) return [];
  const cleanPath = u.pathname && u.pathname !== '/' ? u.pathname : '';
  const parts=u.hostname.split('.');const parent=parts.length>2?parts.slice(-2).join('.'):u.hostname;const values = [u.origin + cleanPath, u.origin, u.hostname, parent, `https://${parent}`, `http://${parent}`];
  return [...new Set(values.filter(Boolean))];
}
const MULTI_LABEL_SUFFIXES=new Set(['co.uk','org.uk','gov.uk','ac.uk','com.au','net.au','org.au','co.nz','com.br','com.mx','co.jp','co.kr','com.sg','com.tr','com.cn','com.hk','co.za']);
function registrableDomain(host){const parts=String(host||'').toLowerCase().replace(/^\.+|\.+$/g,'').split('.').filter(Boolean);if(parts.length<=2)return parts.join('.');const suffix=parts.slice(-2).join('.');return MULTI_LABEL_SUFFIXES.has(suffix)?parts.slice(-3).join('.'):parts.slice(-2).join('.');}
function normalizedUrl(raw){const u=new URL(raw);const path=(u.pathname||'/').replace(/\/+$/,'')||'/';return `${u.protocol}//${u.host}${path==='/'?'':path}`;}
function itemUrlMatches(a,b,mode='site'){try{const x=new URL(a),y=new URL(b);if(mode==='exact')return normalizedUrl(a)===normalizedUrl(b);if(mode==='host')return x.hostname.toLowerCase()===y.hostname.toLowerCase();return registrableDomain(x.hostname)===registrableDomain(y.hostname)}catch{return false}}
function searchStages(raw,mode='site'){const u=new URL(raw),exact=normalizedUrl(raw),origin=u.origin,values=[exact];if(mode!=='exact'&&origin!==exact)values.push(origin);if(mode==='site'){const site=registrableDomain(u.hostname);values.push(`https://${site}`,site);}return[...new Set(values)];}
const urlSearchFlights=new Map();
function urlSearchKey(raw){try{const u=new URL(raw);return `${u.protocol}//${u.host}${u.pathname.replace(/\/+$/,'')||'/'}`}catch{return String(raw||'')}}
async function cachedUrlSearch(raw){const state=await secureSession.get({urlSearchCache:{}}),entry=state.urlSearchCache?.[urlSearchKey(raw)];if(!entry)return null;const ttl=entry.items?.length?300000:15000;return Date.now()-entry.time<ttl?entry.items:null;}
async function storeUrlSearch(raw,items){const state=await secureSession.get({urlSearchCache:{}}),cache=state.urlSearchCache||{};cache[urlSearchKey(raw)]={time:Date.now(),items};for(const [key,value] of Object.entries(cache))if(Date.now()-Number(value?.time||0)>5*60000)delete cache[key];await secureSession.set({urlSearchCache:cache});}
function searchErrorInfo(error){const message=String(error?.message||error||'TeamPass-Suche fehlgeschlagen.'),retryAfter=rateLimitSeconds(error);if(retryAfter)return{code:'rate-limit',message,retryAfter};if(/401|unauthor|anmeldung|token/i.test(message))return{code:'unauthorized',message,retryAfter:0};if(/network|fetch|timeout|timed out/i.test(message))return{code:'network',message,retryAfter:0};return{code:'server',message,retryAfter:0};}
async function findForUrlLive(raw) {
  let cfg;try{cfg={...DEFAULTS,...await storageGet(DEFAULTS)};new URL(raw)}catch{return []}
  const found=new Map();
  const search=async value=>{const response=await request(TP_API.route('itemFindByUrl',{url:value}),{},true,{priority:98,operation:'item.findByUrl',category:'interactive'});for(const row of unwrapItems(response)){const record=normalizeItem(row);if(record.id!=null)found.set(String(record.id),record)}};
  // Controlled fallback: exact URL -> same server -> registrable main domain.
  for(const value of searchStages(raw,cfg.urlMatchMode||'site')){await search(value);if(found.size)break;}
  if(!found.size)for(const row of await cachedHttpMatches(raw))if(row?.id!=null&&itemUrlMatches(row.url,raw,cfg.urlMatchMode||'site'))found.set(String(row.id),normalizeItem(row));
  const rows=[...found.values()],detailState=await secureSession.get({itemDetailCache:{}}),detailCache=detailState.itemDetailCache||{};
  const details=await Promise.all(rows.map(async row=>{if((row.login||row.email)&&row.pwd)return row;const cached=detailCache[String(row.id)];if(cached&&Date.now()-cached.time<300000)return normalizeItem(cached.item,row);const response=await request(TP_API.route('itemGet',{id:row.id}),{},true,{priority:97,operation:'item.getForFill',category:'interactive'});const item=normalizeItem(response,row);detailCache[String(row.id)]={time:Date.now(),item};return item;}));
  await secureSession.set({itemDetailCache:detailCache});
  const filtered=details.filter(item=>itemUrlMatches(item.url,raw,cfg.urlMatchMode||'site'));await storeUrlSearch(raw,filtered);return filtered;
}
async function findForUrl(raw,{preferCache=false}={}){
  const cached=await cachedUrlSearch(raw);if(preferCache&&cached?.length)return cached;
  const key=urlSearchKey(raw);if(urlSearchFlights.has(key))return urlSearchFlights.get(key);
  const flight=findForUrlLive(raw).finally(()=>urlSearchFlights.delete(key));urlSearchFlights.set(key,flight);
  try{return await flight}catch(error){if(cached)return cached;throw error}
}
function folderChildren(node){return node?.childrens||node?.children||node?.folders||node?.nodes||[];}
function extractFolderRoots(data){
  if(Array.isArray(data))return data;
  for(const key of ['folders','items','data','results','result']){
    const value=data?.[key];
    if(Array.isArray(value))return value;
    if(value&&typeof value==='object'){
      for(const nested of ['folders','items','data','results','result'])if(Array.isArray(value[nested]))return value[nested];
    }
  }
  return [];
}
function flattenFolderTree(nodes,out=[],parentId=0,depth=1,path=[]){
  for(const raw of Array.isArray(nodes)?nodes:[]){
    if(!raw||raw.isVisible===false)continue;
    const id=Number(raw.id??raw.folder_id),label=raw.label||raw.title||raw.name||`Ordner ${id}`;
    const explicitParent=Number(raw.parent_id??raw.parentId??parentId??0);
    const explicitLevel=Number(raw.level??raw.depth??raw.nlevel);
    const level=Number.isFinite(explicitLevel)&&explicitLevel>0?explicitLevel:depth;
    const folder={...raw,id,parent_id:explicitParent,level,label,path:[...path,label].join(' » ')};
    if(Number.isFinite(id))out.push(folder);
    flattenFolderTree(folderChildren(raw),out,Number.isFinite(id)?id:explicitParent,level+1,[...path,label]);
  }
  return out;
}
function mergeFolders(...lists){
  const map=new Map();
  for(const list of lists)for(const raw of list||[]){const id=Number(raw.id??raw.folder_id);if(!Number.isFinite(id))continue;map.set(id,{...(map.get(id)||{}),...raw,id});}
  const resolve=(f,seen=new Set())=>{if(f._resolved)return f;if(seen.has(f.id))return f;seen.add(f.id);const parent=map.get(Number(f.parent_id||0));if(parent){resolve(parent,seen);f.level=Number(f.level)>1?Number(f.level):Number(parent.level||1)+1;f.path=f.path||`${parent.path||parent.label} » ${f.label}`;}else{f.level=Number(f.level||1);f.path=f.path||f.label;}f._resolved=true;return f;};
  return [...map.values()].map(f=>resolve(f));
}
function deepFolderList(data){
  const out=[],seen=new Set();
  const walk=value=>{
    if(Array.isArray(value)){for(const item of value)walk(item);return;}
    if(!value||typeof value!=='object')return;
    const id=Number(value.id??value.folder_id??value.id_tree);
    if(Number.isFinite(id)&&!seen.has(id)){seen.add(id);out.push(value);}
    for(const key of ['folders','items','data','results','result','childrens','children','nodes'])if(value[key]!=null)walk(value[key]);
  };
  walk(data);return out;
}
function permissionFlag(value,defaultValue=false){
  if(value==null||value==='')return defaultValue;
  if(value===true||value===1)return true;
  if(value===false||value===0)return false;
  const text=String(value).trim().toLowerCase();
  if(['1','true','yes','y','write','w','rw','edit','create'].includes(text))return true;
  if(['0','false','no','n','read','r','ro','readonly'].includes(text))return false;
  return defaultValue;
}
let folderInventoryFlight=null;
function rateLimitSeconds(error){const m=String(error?.message||error||'').match(/retry in\s+(\d+)\s*seconds?/i);return m?Number(m[1]):0;}
async function folderInventory(force=false){
 const cached=(await secureSession.get({folderInventoryCache:null})).folderInventoryCache;
 if(!force&&cached?.folders?.length&&Date.now()-cached.time<600000)return{...cached,fromCache:true};
 if(folderInventoryFlight)return folderInventoryFlight;
 folderInventoryFlight=(async()=>{
  try{
   const wr=await request(TP_API.route('writableFolders'));
   const writableRaw=deepFolderList(wr),writableIds=new Set(writableRaw.map(f=>Number(f.id??f.folder_id??f.id_tree)).filter(Number.isFinite));
   const writable=writableRaw.map(f=>({...f,id:Number(f.id??f.folder_id??f.id_tree),label:f.label||f.title||f.name||`Ordner ${f.id??f.folder_id??f.id_tree}`,_writable:true}));
   let tree=[],treeError='';
   try{tree=flattenFolderTree(extractFolderRoots(await request(TP_API.route('listFolders'))))}catch(e){treeError=e?.message||String(e)}
   const folders=mergeFolders(tree,writable).map(f=>({...f,_writable:writableIds.has(Number(f.id))||f._writable===true}));
   const result={folders,time:Date.now(),retryAfter:0,treeError};if(folders.length)await secureSession.set({folderInventoryCache:result});return result;
  }catch(error){const retryAfter=rateLimitSeconds(error);if(cached?.folders?.length)return{...cached,fromCache:true,stale:true,retryAfter,error:error.message};return{folders:[],time:0,retryAfter,error:error.message};}
 })();try{return await folderInventoryFlight}finally{folderInventoryFlight=null}
}
async function readableFolders(){return(await folderInventory()).folders;}
async function allReadableFolderIds(){
  const cfg={...DEFAULTS,...await storageGet(DEFAULTS)},maxDepth=Math.max(0,Number(cfg.folderSearchDepth||0));
  return (await readableFolders()).filter(f=>!maxDepth||Number(f.level||1)<=maxDepth).map(f=>Number(f.id)).filter(Number.isFinite);
}
async function fetchItemsForFolderBatch(ids,stats){if(!ids.length)return[];try{const response=await request(TP_API.route('itemsInFolders',{folders:JSON.stringify(ids)}),{},true,{priority:5,operation:'httpAuth.itemsInFolders',category:'background'});stats.successfulFolders.push(...ids);return unwrapItems(response).map(normalizeItem)}catch(error){if(ids.length===1){stats.failedFolders.push({id:ids[0],error:error.message});return[]}const mid=Math.ceil(ids.length/2);return[...(await fetchItemsForFolderBatch(ids.slice(0,mid),stats)),...(await fetchItemsForFolderBatch(ids.slice(mid),stats))]}}
async function allItemsWithStats(){const ids=await allReadableFolderIds(),stats={folderIds:ids.length,successfulFolders:[],failedFolders:[]},found=new Map;for(let i=0;i<ids.length;i+=20){for(const row of await fetchItemsForFolderBatch(ids.slice(i,i+20),stats)){if(row.id!=null)found.set(String(row.id),row)}}return{items:[...found.values()],stats}}
async function allItems(){return(await allItemsWithStats()).items;}


const tpSession = api.storage.session || api.storage.local;
const tpPendingKey = id => `tp_pending_${id}`;
async function tpFolders(){const cfg={...DEFAULTS,...await storageGet(DEFAULTS)},maxDepth=Math.max(0,Number(cfg.folderSearchDepth||0)),inv=await folderInventory();const folders=inv.folders.filter(f=>{const ro=permissionFlag(f.is_readonly??f.read_only??f.readonly,false);return f._writable===true&&!ro&&(!maxDepth||Number(f.level||1)<=maxDepth)}).map(f=>({id:Number(f.id),label:f.label||`Ordner ${f.id}`,path:f.path||f.label,level:Number(f.level||1),parent_id:Number(f.parent_id||0),complexity:Number(f.complexity??f.password_complexity??f.min_password_strength??0)}));return{folders,retryAfter:inv.retryAfter||0,fromCache:Boolean(inv.fromCache),stale:Boolean(inv.stale),error:inv.error||'',treeError:inv.treeError||''};}
async function tpCreate(d){const body=TP_API.itemCreateBody(d);if(!body.label||!body.folder_id||!body.password)throw new Error('Titel, Zielordner und Passwort sind erforderlich.');return request(TP_API.route('itemCreate'),{method:TP_API.methods.itemCreate,headers:{'Idempotency-Key':crypto.randomUUID()},body:JSON.stringify(body)},true,{priority:100,operation:'item.create',category:'write'});}
async function tpUpdate(d){const body=TP_API.itemUpdateBody(d);return request(TP_API.route('itemUpdate'),{method:TP_API.methods.itemUpdate,body:JSON.stringify(body)},true,{priority:100,operation:'item.update',category:'write'});}
async function tpCreateFolder(d){const body=TP_API.folderCreateBody(d);const result=await request(TP_API.route('folderCreate'),{method:TP_API.methods.folderCreate,body:JSON.stringify(body)},true,{priority:100,operation:'folder.create',category:'write'});const id=Number(result?.newId||result?.id||result?.folder_id||result?.data?.newId||result?.data?.id||0);const state=await secureSession.get({folderInventoryCache:null});const cache=state.folderInventoryCache;const parent=cache?.folders?.find(f=>Number(f.id)===Number(d.parent_id));const created=id?{id,parent_id:Number(d.parent_id||0),label:String(d.title||''),path:[parent?.path||parent?.label,d.title].filter(Boolean).join(' » '),level:Number(parent?.level||0)+1,complexity:Number(d.complexity??parent?.complexity??0),_writable:true,can_create:1,is_readonly:0}:null;if(created&&cache?.folders){cache.folders=cache.folders.filter(f=>Number(f.id)!==id).concat(created);cache.time=Date.now();await secureSession.set({folderInventoryCache:cache});await storageSet({lastFolderId:id});}return{result,createdFolder:created};}

async function tpStoreDraft(id,d){await pcall(tpSession.set.bind(tpSession),{[tpPendingKey(id)]:d});const c=await settings();if(c.showPendingBadge&&api.action){await pcall(api.action.setBadgeText.bind(api.action),{tabId:id,text:'!'});await pcall(api.action.setTitle.bind(api.action),{tabId:id,title:'TeamPass: Zugangsdaten erkannt'});try{await pcall(api.action.setIcon.bind(api.action),{tabId:id,path:{16:'icons/icon16-pending.png',32:'icons/icon32-pending.png',48:'icons/icon48-pending.png',128:'icons/icon128-pending.png'}})}catch{}}}
async function tpLoadDraft(id){const x=await pcall(tpSession.get.bind(tpSession),{[tpPendingKey(id)]:null});return x[tpPendingKey(id)];}
async function tpShowDraft(id){const d=await tpLoadDraft(id);if(!d)return false;const tab=await pcall(api.tabs.get.bind(api.tabs),id);if(!tab||!/^https?:\/\//i.test(tab.url||'')||tab.status==='unloaded')return false;try{await pcall(api.tabs.sendMessage.bind(api.tabs),id,{type:'showSavePrompt',draft:d});return true}catch{if(api.scripting?.executeScript){await pcall(api.scripting.executeScript.bind(api.scripting),{target:{tabId:id},files:['content.js']});await pcall(api.tabs.sendMessage.bind(api.tabs),id,{type:'showSavePrompt',draft:d});return true}return false}}
if(api.tabs?.onUpdated)api.tabs.onUpdated.addListener((id,info)=>{if(info.status==='complete')setTimeout(async()=>{const c=await settings();if(c.autoSavePrompt)tpShowDraft(id).catch(()=>{})},400)});


const httpAuthMemory={};const httpAuthSession=api.storage.session||{set:async o=>Object.assign(httpAuthMemory,o),get:async defaults=>Object.fromEntries(Object.entries(defaults).map(([k,v])=>[k,k in httpAuthMemory?httpAuthMemory[k]:v])),remove:async key=>{delete httpAuthMemory[key]}};
function canonicalAuthKeys(raw){try{const u=new URL(raw);const path=u.pathname.replace(/\/+$/,'')||'/';return [...new Set([`${u.protocol}//${u.host}${path}`,`${u.protocol}//${u.host}`,u.hostname])]}catch{return[]}}
function addItemToHttpCache(cache,raw){const it=normalizeItem(raw);if(!(it.login||it.email)||!it.pwd)return false;let added=false;for(const rawUrl of String(it.url||'').split(/[\n,;]/).map(x=>x.trim()).filter(Boolean)){for(const key of canonicalAuthKeys(rawUrl)){const list=cache[key]??=[];if(!list.some(x=>String(x.id)===String(it.id)))list.push({id:it.id,label:it.label,login:it.login||it.email,pwd:it.pwd,url:it.url,folder_id:it.folder_id||it.id_tree||it.folderId||0});added=true}}return added;}
async function buildHttpAuthCache(){const {items,stats}=await allItemsWithStats(),cache={};let usableItems=0;for(const raw of items){let it=raw;if(!it.pwd&&it.id!=null){try{it=normalizeItem(await request(TP_API.route('itemGet',{id:it.id}),{},true,{priority:4,operation:'httpAuth.itemGet',category:'background'}),it)}catch{continue}}if(addItemToHttpCache(cache,it))usableItems++}await pcall(httpAuthSession.set.bind(httpAuthSession),{httpAuthCache:cache,httpAuthCacheBuiltAt:Date.now(),httpAuthFailedFolders:stats.failedFolders});return{itemsScanned:items.length,usableItems,entries:Object.values(cache).reduce((n,x)=>n+x.length,0),keys:Object.keys(cache).length,folderIds:stats.folderIds,successfulFolders:stats.successfulFolders.length,failedFolders:stats.failedFolders};}

async function enrichHttpAuthCacheForUrl(raw){const live=await findForUrl(raw),state=await pcall(httpAuthSession.get.bind(httpAuthSession),{httpAuthCache:{}}),cache=state.httpAuthCache||{};let added=0;for(const item of live)if(addItemToHttpCache(cache,item))added++;await pcall(httpAuthSession.set.bind(httpAuthSession),{httpAuthCache:cache,httpAuthCacheBuiltAt:Date.now()});return{live,added,cached:await cachedHttpMatches(raw)};}

async function buildHttpAuthCacheReliable(){return buildHttpAuthCache();}
async function cachedHttpMatches(raw){const state=await pcall(httpAuthSession.get.bind(httpAuthSession),{httpAuthCache:{}});const cache=state.httpAuthCache||{},out=new Map;for(const key of canonicalAuthKeys(raw)){for(const it of cache[key]||[])out.set(String(it.id),it)}return[...out.values()]}

const httpAuthLog=[];
function logHttpAuth(entry){httpAuthLog.unshift({time:new Date().toISOString(),...entry});if(httpAuthLog.length>30)httpAuthLog.length=30;storageSet({httpAuthLog}).catch(()=>{});}
const networkAuthPending=new Map();
const networkAuthPorts=new Map();
async function finishNetworkAuth(requestId,result={}){const id=String(requestId),pending=networkAuthPending.get(id);if(!pending)return false;networkAuthPending.delete(id);if(pending.challengeKey)networkAuthByChallenge.delete(pending.challengeKey);clearTimeout(pending.timer);const port=networkAuthPorts.get(id);if(port){networkAuthPorts.delete(id);try{port.disconnect()}catch{}}pending.callback(result);if(pending.windowId!=null)setTimeout(()=>pcall(api.windows.remove.bind(api.windows),pending.windowId).catch(()=>{}),120);return true;}
async function openNetworkAuthSelector(details,matches,callback){const requestId=String(details.requestId),timer=setTimeout(()=>finishNetworkAuth(requestId,{}),180000);networkAuthPending.set(requestId,{callback,matches,details,timer,windowId:null,createdAt:Date.now()});const selectorUrl=api.runtime.getURL(`network-auth.html?requestId=${encodeURIComponent(requestId)}`);try{const win=await pcall(api.windows.create.bind(api.windows),{url:selectorUrl,type:'popup',width:640,height:560,focused:true});const pending=networkAuthPending.get(requestId);if(pending)pending.windowId=win.id;return true}catch(error){networkAuthPending.delete(requestId);clearTimeout(timer);callback({});logHttpAuth({url:details.url,status:'selector-error',error:error.message});return false}}
if(api.runtime?.onConnect)api.runtime.onConnect.addListener(port=>{if(!port.name.startsWith('network-auth:'))return;const id=port.name.slice('network-auth:'.length);networkAuthPorts.set(id,port);port.onDisconnect.addListener(()=>networkAuthPorts.delete(id));});
if(api.windows?.onRemoved)api.windows.onRemoved.addListener(windowId=>{for(const [id,p] of networkAuthPending)if(p.windowId===windowId&&!p.completing)finishNetworkAuth(id,{}).catch(()=>{})});
const networkAuthByChallenge=new Map();
const networkAuthSuppressed=new Map();
const authChallengeKey=d=>`${d.tabId}|${d.isProxy?'proxy':'server'}|${d.challenger?.host||''}|${d.challenger?.port||''}|${d.realm||''}`;
function suppressChallenge(key,ms){networkAuthSuppressed.set(key,Date.now()+ms);setTimeout(()=>{if((networkAuthSuppressed.get(key)||0)<=Date.now())networkAuthSuppressed.delete(key)},ms+250);}
function isChallengeSuppressed(key){const until=networkAuthSuppressed.get(key)||0;if(until>Date.now())return true;networkAuthSuppressed.delete(key);return false;}
if(api.webRequest?.onAuthRequired){api.webRequest.onAuthRequired.addListener((details,callback)=>{
  let claimed=false;const direct=value=>{if(claimed)return;claimed=true;callback(value||{})};
  (async()=>{
    const c=await settings();if(!c.httpAuthEnabled){logHttpAuth({url:details.url,status:'disabled'});return direct({})}const challengeKey=authChallengeKey(details);if(isChallengeSuppressed(challengeKey)){logHttpAuth({url:details.url,realm:details.realm||'',status:'cancel-suppressed'});return direct({cancel:true});}
    // Critical: never call TeamPass API here. A blocked HTTP-auth request has a short browser timeout.
    const matches=(await cachedHttpMatches(details.url)).filter(x=>x.login&&x.pwd);
    logHttpAuth({url:details.url,realm:details.realm||'',challenger:details.challenger?.host||'',matches:matches.length,status:'selector-opened-cache-only'});
    // ErrorDocument can trigger a second request. Keep one selector per tab/realm and release duplicates.
    const previous=networkAuthByChallenge.get(challengeKey);
    if(previous&&networkAuthPending.has(previous)){logHttpAuth({url:details.url,status:'duplicate-challenge-released'});return direct({})}
    claimed=true;
    const requestId=String(details.requestId);networkAuthByChallenge.set(challengeKey,requestId);
    await openNetworkAuthSelector(details,matches,callback);
    const pending=networkAuthPending.get(requestId);if(pending){pending.challengeKey=challengeKey;pending.originalTabId=details.tabId;}
  })().catch(error=>{logHttpAuth({url:details.url,status:'handler-error',error:error.message});direct({})});
},{urls:['http://*/*','https://*/*']},['asyncBlocking'])}


function scheduleCacheRefresh(cfg){if(!api.alarms)return;api.alarms.clear('httpAuthCacheRefresh').catch(()=>{});if(cfg.autoCacheEnabled&&Number(cfg.cacheRefreshMinutes)>0)api.alarms.create('httpAuthCacheRefresh',{periodInMinutes:Math.max(5,Number(cfg.cacheRefreshMinutes))});}
async function runAutomaticHttpAuthSync(trigger='alarm'){const cfg={...DEFAULTS,...await storageGet(DEFAULTS)},vs=await vaultState();if(!cfg.autoCacheEnabled||vs.locked)return secureSession.set({httpAuthAutoSync:{ok:false,time:Date.now(),error:'skipped:'+trigger}});try{const result=await buildHttpAuthCacheReliable();await secureSession.set({httpAuthAutoSync:{ok:true,time:Date.now(),trigger,result}});return result}catch(error){await secureSession.set({httpAuthAutoSync:{ok:false,time:Date.now(),trigger,error:error.message}});throw error}}
if(api.alarms)api.alarms.onAlarm.addListener(alarm=>{if(alarm.name==='vaultAutoLock')handleVaultAutoLock().catch(()=>{});if(alarm.name==='httpAuthCacheRefresh')secureSession.set({httpAuthAutoSync:{ok:true,time:Date.now(),result:{skipped:true,reason:'full-scan-disabled'}}}).catch(()=>{});});
api.runtime.onStartup?.addListener(async()=>{await lockVault();const cfg={...DEFAULTS,...await storageGet(DEFAULTS)};scheduleCacheRefresh(cfg);if(api.action)api.action.setBadgeText({text:'L'}).catch(()=>{});});


api.runtime.onConnect?.addListener(port=>{if(!port.name.startsWith('vault-ui:'))return;const token=`${port.name}:${Math.random()}`;activeVaultUi.add(token);touchVaultActivity().catch(()=>{});const ping=port.onMessage?.addListener(()=>touchVaultActivity().catch(()=>{}));port.onDisconnect.addListener(()=>{activeVaultUi.delete(token);touchVaultActivity().catch(()=>{})});});

async function refreshNetworkAuthMatches(requestId){const p=networkAuthPending.get(String(requestId));if(!p)throw new Error('Die HTTP-Authentifizierungsanfrage ist nicht mehr aktiv.');const vs=await vaultState();if(vs.locked)return{ok:true,locked:true,entries:[],cacheOnly:false};try{const live=await findForUrl(p.details.url),state=await pcall(httpAuthSession.get.bind(httpAuthSession),{httpAuthCache:{}}),cache=state.httpAuthCache||{};let added=0;for(const item of live)if(addItemToHttpCache(cache,item))added++;await pcall(httpAuthSession.set.bind(httpAuthSession),{httpAuthCache:cache,httpAuthCacheBuiltAt:Date.now()});p.matches=live.filter(x=>(x.login||x.email)&&(x.pwd||x.password)).map(normalizeItem);return{ok:true,locked:false,entries:p.matches.map((x,index)=>({index,id:x.id,label:x.label,login:x.login||x.email,url:x.url,folder_id:x.folder_id})),added,cacheOnly:false}}catch(error){const info=searchErrorInfo(error);return{ok:false,locked:false,error:info.message,errorCode:info.code,retryAfter:info.retryAfter,entries:[]}}}
api.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  const run = async () => {
    if (msg.type === 'saveSettings') {
      const incoming={...msg.settings};
      const supplied={apiKey:incoming.apiKey||'',password:incoming.password||'',pat:incoming.pat||'',authMode:incoming.authMode||'password'};
      const hasNewSecrets=Boolean(supplied.apiKey||supplied.password||supplied.pat);
      delete incoming.apiKey;delete incoming.password;delete incoming.pat;
      const next={...incoming,serverUrl:normalizeServer(incoming.serverUrl),jwt:''};
      await storageSet(next);
      const state=await vaultState();
      const active=(await secureSession.get({vaultSecrets:null})).vaultSecrets;
      if(msg.masterPassphrase){
        if(msg.masterPassphrase.length<8)throw new Error('Die lokale Master-Passphrase muss mindestens 8 Zeichen lang sein.');
        const merged={...(active||{}),...Object.fromEntries(Object.entries(supplied).filter(([key,value])=>key==='authMode'||value))};
        if(!(merged.apiKey||merged.pat||merged.password))throw new Error('API-Schlüssel und Kennwort fehlen.');
        await configureVault(msg.masterPassphrase,merged);
      }else if(!state.configured){
        throw new Error('Bitte eine lokale Master-Passphrase festlegen.');
      }else if(hasNewSecrets){
        if(!active)throw new Error('Zum Ändern der Zugangsdaten muss die Erweiterung entsperrt sein.');
        await secureSession.set({vaultSecrets:{...active,...Object.fromEntries(Object.entries(supplied).filter(([key,value])=>key==='authMode'||value))}});
      }
      // Deliberately no authorize() and no credential prompt on preference save.
      scheduleCacheRefresh(next);return{ok:true};
    }
    if (msg.type === 'testConnection') { const cfg = {...DEFAULTS, ...(await settings()), ...msg.settings}; await authorize(cfg); return {ok:true}; }
    if (msg.type === 'findForUrl') {const state=await secureSession.get({urlSearchCache:{}}),entry=state.urlSearchCache?.[urlSearchKey(msg.url)],ttl=entry?.items?.length?300000:15000,cached=entry&&Date.now()-entry.time<ttl?entry.items:null;if(cached){if(cached.length&&Date.now()-entry.time>30000)findForUrlLive(msg.url).catch(()=>{});return{ok:true,items:cached,fromCache:true};}try{return{ok:true,items:await findForUrl(msg.url)}}catch(error){const info=searchErrorInfo(error);return{ok:false,error:info.message,errorCode:info.code,retryAfter:info.retryAfter,queue:apiGate.status()};}}
    if (msg.type === 'allItems') return {ok:true, items: await allItems()};
      if (msg.type === 'getItem') {const state=await secureSession.get({itemDetailCache:{}}),hit=state.itemDetailCache?.[String(msg.id)];if(hit&&Date.now()-hit.time<300000)return{ok:true,item:hit.item,fromCache:true};const item=normalizeItem(await request(TP_API.route('itemGet',{id:msg.id}),{},true,{priority:99,operation:'item.get',category:'interactive'}));const cache=state.itemDetailCache||{};cache[String(msg.id)]={time:Date.now(),item};await secureSession.set({itemDetailCache:cache});return{ok:true,item};}
      
    if (msg.type === 'fill') {
      const payload = {type:'fill', item:msg.item};
      try {
        const answer = await pcall(api.tabs.sendMessage.bind(api.tabs), msg.tabId, payload);
        if (answer && answer.ok === false) throw new Error(answer.error || 'Ausfüllen fehlgeschlagen.');
        return answer || {ok:true};
      } catch (firstError) {
        const tab = await pcall(api.tabs.get.bind(api.tabs), msg.tabId);
        if (!tab || !/^https?:\/\//i.test(tab.url || '')) {
          throw new Error('Auf dieser Browserseite darf die Erweiterung keine Felder befüllen.');
        }
        if (!api.scripting || !api.scripting.executeScript) {
          throw new Error('Das Inhaltsskript ist auf dieser Seite nicht aktiv. Seite neu laden und erneut versuchen.');
        }
        await pcall(api.scripting.executeScript.bind(api.scripting), {target:{tabId:msg.tabId, allFrames:false}, files:['content.js']});
        const answer = await pcall(api.tabs.sendMessage.bind(api.tabs), msg.tabId, payload);
        if (answer && answer.ok === false) throw new Error(answer.error || 'Ausfüllen fehlgeschlagen.');
        return answer || {ok:true};
      }
    }
    if (msg.type === 'credentialsSubmitted') {await tpStoreDraft(sender.tab.id,msg.draft);const state=await vaultState();const c={...DEFAULTS,...await storageGet(DEFAULTS)};if(c.autoSavePrompt)setTimeout(()=>tpShowDraft(sender.tab.id).catch(()=>{}),700);return{ok:true,locked:state.locked};}
    if(msg.type==='writableFolders'){const result=await tpFolders();return{ok:true,...result};}
    if (msg.type === 'createItem') {const result=await tpCreate(msg.draft);await storageSet({lastFolderId:Number(msg.draft.folder_id)});const id=Number(result?.newId||result?.id||result?.item_id||result?.data?.newId||result?.data?.id||0);await storeUrlSearch(msg.draft.url,[normalizeItem({...msg.draft,id})]);return{ok:true,result};}
    if (msg.type === 'updateItem') {const result=await tpUpdate(msg.draft);if(msg.draft.folder_id)await storageSet({lastFolderId:Number(msg.draft.folder_id)});const c=await settings();return{ok:true,result};}
    if (msg.type === 'createFolder') {const made=await tpCreateFolder(msg.folder);return {ok:true,...made};}
    if (msg.type === 'lastFolder') return {ok:true,lastFolderId:Number((await storageGet({lastFolderId:0})).lastFolderId||0)};
    if (msg.type === 'findExisting') return {ok:true,items:await findForUrl(msg.url)};
    if (msg.type === 'httpAuthDiagnostics') return {ok:true,log:(await storageGet({httpAuthLog:[]})).httpAuthLog||[]};
    if (msg.type === 'httpAuthTest') {const before=await cachedHttpMatches(msg.url),result=await enrichHttpAuthCacheForUrl(msg.url);return{ok:true,items:result.live,cacheBefore:before.length,cacheAfter:result.cached.length,added:result.added};}
    if (msg.type === 'httpAuthCacheBuild') return {ok:true,result:await buildHttpAuthCacheReliable()};
    if (msg.type === 'httpAuthCacheEnrich') return {ok:true,result:await enrichHttpAuthCacheForUrl(msg.url)};
    if(msg.type==='httpAuthCacheStatus'){const x=await pcall(httpAuthSession.get.bind(httpAuthSession),{httpAuthCache:{},httpAuthCacheBuiltAt:0,httpAuthAutoSync:null});const keys=Object.keys(x.httpAuthCache||{}).length;return{ok:true,keys,builtAt:x.httpAuthCacheBuiltAt||0,mode:'targeted-live-search',manualFullSyncOptional:true,sync:x.httpAuthAutoSync||null,queue:apiGate.status()};}
    if (msg.type === 'networkAuthLoad') {const p=networkAuthPending.get(String(msg.requestId));if(!p)throw new Error('Die HTTP-Authentifizierungsanfrage ist nicht mehr aktiv.');const base={url:p.details.url,realm:p.details.realm||'',isProxy:Boolean(p.details.isProxy)};if(p.matches.length)return{ok:true,...base,locked:false,cacheOnly:true,entries:p.matches.map((x,index)=>({index,id:x.id,label:x.label,login:x.login||x.email,url:x.url,folder_id:x.folder_id}))};return{...base,...await refreshNetworkAuthMatches(msg.requestId)};}
    if (msg.type === 'networkAuthUnlock') {await unlockVault(String(msg.passphrase||''));return refreshNetworkAuthMatches(msg.requestId);}
    if (msg.type === 'networkAuthSelect') {const p=networkAuthPending.get(String(msg.requestId));if(!p)throw new Error('Die Anfrage ist abgelaufen.');let entry=p.matches[Number(msg.index)];if(!entry)throw new Error('Eintrag wurde nicht gefunden.');if(!(entry.pwd||entry.password)&&entry.id!=null)entry=normalizeItem(await request(TP_API.route('itemGet',{id:entry.id}),{},true,{priority:99,operation:'httpAuth.itemGetSelected',category:'interactive'}),entry);const username=entry.login||entry.email,password=entry.pwd||entry.password;if(!username||!password)throw new Error('Der TeamPass-Eintrag enthält keine vollständigen Zugangsdaten.');const pending=networkAuthPending.get(String(msg.requestId));if(pending)pending.completing=true;await finishNetworkAuth(String(msg.requestId),{authCredentials:{username,password}});return{ok:true};}
    if (msg.type === 'networkAuthCancel') {const pending=networkAuthPending.get(String(msg.requestId));if(pending){pending.completing=true;if(pending.challengeKey)suppressChallenge(pending.challengeKey,Number(msg.durationMs||30000));}await finishNetworkAuth(String(msg.requestId),{cancel:true});return{ok:true};}
    if (msg.type === 'networkAuthSuppressSession') {const pending=networkAuthPending.get(String(msg.requestId));if(pending){pending.completing=true;if(pending.challengeKey)suppressChallenge(pending.challengeKey,8*60*60*1000);}await finishNetworkAuth(String(msg.requestId),{cancel:true});return{ok:true};}
    if (msg.type === 'networkAuthManual') {const p=networkAuthPending.get(String(msg.requestId));if(!p)throw new Error('Die Anfrage ist abgelaufen.');const login=String(msg.login||''),password=String(msg.password||'');if(!login||!password)throw new Error('Benutzername und Passwort sind erforderlich.');const tabId=Number(p.originalTabId??p.details.tabId);const draft={label:p.details.realm||new URL(p.details.url).hostname,login,email:'',password,url:p.details.url,description:`HTTP-Basic-Zugang für ${p.details.realm||p.details.url}`};if(Number.isFinite(tabId)&&tabId>=0)await tpStoreDraft(tabId,draft);const pending2=networkAuthPending.get(String(msg.requestId));if(pending2)pending2.completing=true;await finishNetworkAuth(String(msg.requestId),{authCredentials:{username:login,password}});return{ok:true,savedForLater:true};}
    if(msg.type==='hasPendingDraft'){return{ok:true,has:Boolean(await tpLoadDraft(Number(msg.tabId)))}}
    if (msg.type === 'reopenSave') { const id=Number(msg.tabId); let d=await tpLoadDraft(id); if(!d){try{const c=await pcall(api.tabs.sendMessage.bind(api.tabs),id,{type:'captureNow'});d=c?.draft;if(d)await tpStoreDraft(id,d)}catch{}} if(!d){const tab=await pcall(api.tabs.get.bind(api.tabs),id);d={label:tab.title||new URL(tab.url).hostname,login:'',email:'',password:'',url:tab.url,description:''};await tpStoreDraft(id,d);} await tpShowDraft(id); return {ok:true}; }
    if (msg.type === 'clearDraft') { const id=sender.tab?.id??Number(msg.tabId);if(Number.isFinite(id)){await pcall(tpSession.remove.bind(tpSession),tpPendingKey(id));if(api.action){await pcall(api.action.setBadgeText.bind(api.action),{tabId:id,text:''});await pcall(api.action.setTitle.bind(api.action),{tabId:id,title:'TeamPass'});try{await pcall(api.action.setIcon.bind(api.action),{tabId:id,path:{16:'icons/icon16.png',32:'icons/icon32.png',48:'icons/icon48.png',128:'icons/icon128.png'}})}catch{}}}return {ok:true}; }
    if(msg.type==='pendingFillSet'){const tabId=sender.tab?.id??Number(msg.tabId);if(!Number.isFinite(tabId))throw new Error('Tab nicht verfügbar.');await secureSession.set({[`pendingFill_${tabId}`]:{item:msg.item,origin:msg.origin,createdAt:Date.now()}});await touchVaultActivity();return{ok:true};}
    if(msg.type==='pendingFillGet'){const tabId=sender.tab?.id??Number(msg.tabId);const key=`pendingFill_${tabId}`,x=await secureSession.get({[key]:null}),pending=x[key];if(pending&&Date.now()-pending.createdAt<5*60*1000)return{ok:true,pending};if(pending)await secureSession.remove(key);return{ok:true,pending:null};}
    if(msg.type==='pendingFillClear'){const tabId=sender.tab?.id??Number(msg.tabId);await secureSession.remove(`pendingFill_${tabId}`);return{ok:true};}
    if(msg.type==='vaultActivity'){await touchVaultActivity();return{ok:true};}
    if(msg.type==='apiSelfTest'){
      const tests=[],run=async(name,fn)=>{try{tests.push({name,ok:true,detail:await fn()})}catch(e){tests.push({name,ok:false,error:e.message})}};
      await run('authorize',async()=>{await authorize(await settings());return{message:'OK'}});
      let folders=[];await run('folderTree',async()=>{folders=await readableFolders();const deepest=folders.reduce((a,b)=>Number(b.level||0)>Number(a.level||0)?b:a,{level:0,path:''});const wanted=folders.find(f=>(f.path||'').toLowerCase().includes('import » siggi » internet » webhosting'));return{count:folders.length,maxDepth:Number(deepest.level||0),deepestPath:deepest.path||'',targetPathFound:Boolean(wanted),targetPath:wanted?.path||''}});
      await run('writableFolders',async()=>({count:unwrapItems(await request(TP_API.route('writableFolders'))).length}));
      await run('itemsInFolders',async()=>{const {items,stats}=await allItemsWithStats();return{folders:stats.folderIds,items:items.length,successfulFolders:stats.successfulFolders.length,failedFolders:stats.failedFolders}});
      return{ok:tests.every(x=>x.ok),report:{readOnly:true,schemaVersion:TP_API.schemaVersion,tests}};
    }
    if(msg.type==='vaultStatus')return{ok:true,state:await vaultState()};
    if(msg.type==='vaultUnlock'){await unlockVault(msg.passphrase);scheduleCacheRefresh(await settings());return{ok:true};}
    if(msg.type==='vaultLock'){await lockVault();return{ok:true};}
    if (msg.type === 'getSettings') {
      const cfg = {...DEFAULTS,...await storageGet(DEFAULTS)};
      return {ok:true, settings:{serverUrl:cfg.serverUrl,login:cfg.login,authMode:cfg.authMode,serverVersion:(await storageGet({serverVersion:''})).serverVersion,autoSavePrompt:cfg.autoSavePrompt,showPendingBadge:cfg.showPendingBadge,collapseFolders:cfg.collapseFolders,itemUrlTemplate:cfg.itemUrlTemplate,clipboardClearSeconds:cfg.clipboardClearSeconds,passwordLength:cfg.passwordLength,httpAuthEnabled:cfg.httpAuthEnabled,flexibleChooser:cfg.flexibleChooser,autoFillCredentials:cfg.autoFillCredentials,submitAfterSelection:cfg.submitAfterSelection,urlMatchMode:cfg.urlMatchMode||'site'}};
    }
    throw new Error('Unbekannte Nachricht.');
  };
  run().then(sendResponse).catch(e => sendResponse({ok:false,error:e.message}));
  return true;
});
