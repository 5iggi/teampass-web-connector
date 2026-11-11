const fs=require('fs'),vm=require('vm'),assert=require('assert');const ctx={globalThis:{}};vm.createContext(ctx);vm.runInContext(fs.readFileSync('src/field-policy.js','utf8'),ctx);const p=ctx.globalThis.TP_FIELD_POLICY;
const login={hasPassword:false,hasTextarea:false,contactFieldCount:1,actionText:'Weiter Continue Next Sign in',formAction:'https://login.example.test/auth',loginContext:true};
for(const meta of [
 {type:'email',name:'username',id:'login-username',autocomplete:'username webauthn',placeholder:'E-Mail-Adresse',ariaLabel:'',testId:''},
 {type:'email',name:'email',id:'loginEmail',autocomplete:'email',placeholder:'E-Mail-Adresse',ariaLabel:'E-Mail-Adresse',testId:''},
 {type:'text',name:'login',id:'identifierId',autocomplete:'',placeholder:'E-Mail oder Mobilfunknummer',ariaLabel:'',testId:''},
 {type:'tel',name:'username',id:'login-mobile',autocomplete:'username',placeholder:'Mobilfunknummer',ariaLabel:'',testId:''}
])assert.equal(p.allowUsername(meta,login),true,JSON.stringify(meta));
assert.equal(p.allowUsername({type:'search',name:'q',id:'search',autocomplete:'',placeholder:'Suche',ariaLabel:'',testId:''},login),false);
assert.ok(p.negative.test('contact email message'));console.log('Two-step login policy: PASS (6 assertions)');