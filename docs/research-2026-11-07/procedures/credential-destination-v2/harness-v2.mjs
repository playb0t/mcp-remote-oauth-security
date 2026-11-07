
import {createServer} from 'node:http';
import {spawn} from 'node:child_process';
import {randomBytes,createHash} from 'node:crypto';
import {join,dirname,resolve,sep} from 'node:path';
import {existsSync,mkdirSync,mkdtempSync,writeFileSync,readFileSync,rmSync,realpathSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import oracle from './auth-destination-v2.cjs';
const procedureRoot=dirname(fileURLToPath(import.meta.url));
assert.equal(process.version,'v24.20.0','Use the recorded Node version');
assert.ok(process.env.MCP_SECURITY_RUNTIME_DIST&&process.env.MCP_SECURITY_OUTPUT,'Explicit verified runtime dist and fresh output required');
const root=resolve(process.env.MCP_SECURITY_OUTPUT),runtimeDist=resolve(process.env.MCP_SECURITY_RUNTIME_DIST);
assert.ok(!existsSync(root),'Output must be a fresh directory');mkdirSync(root,{recursive:true});
const node=process.execPath,bundle=join(runtimeDist,'chunk-EL3EX2HH.js'),cli=join(runtimeDist,'proxy.js');
for(const [file,wanted]of [[bundle,'98dff907124c7d353d6717dcb351383aaacb0a3a063cd4114cc64191e4550d26'],[cli,'63b850ea6e9c1717d26c081f5c8f13b9c56e15e46b4ccab739d66b309241fa61']])assert.equal(createHash('sha256').update(readFileSync(file)).digest('hex'),wanted);
const listen=s=>new Promise((ok,no)=>{s.once('error',no);s.listen(0,'127.0.0.1',()=>ok('http://127.0.0.1:'+s.address().port));});
const send=(s,o,status=200)=>s.writeHead(status,{'Content-Type':'application/json'}).end(JSON.stringify(o));
const save=(p,o)=>writeFileSync(p,JSON.stringify(o,null,2)+'\n');
async function run(c){
 const d=join(root,'runs',c.id);mkdirSync(d,{recursive:true});const state=mkdtempSync(join(d,'state-'));
 const secret=randomBytes(24).toString('hex'),rt=randomBytes(24).toString('hex'),dc=randomBytes(24).toString('hex'),at=randomBytes(24).toString('hex');
 const events=[];let a,b,resource;let child;let closedEvent=false;let captureErrors=0;let trustedPolicy,pinnedPolicyHash;
 const safe=handler=>(q,s)=>{Promise.resolve().then(()=>handler(q,s)).catch(()=>{captureErrors++;events.push({type:'observer_error',reason:'request_capture_failed'});s.destroy();});};
 const scheme=q=>q.headers.authorization?.startsWith('Basic ')?'Basic':q.headers.authorization?.startsWith('Bearer ')?'Bearer':q.headers.authorization?'Other':null;
 const receiver=(origin,q)=>{const target=new URL(q.url,origin);for(const key of [...target.searchParams.keys()])target.searchParams.set(key,'REDACTED');return origin+target.pathname+target.search;};
 const captureBody=async q=>{
  let raw='';for await(const x of q){raw+=x;if(Buffer.byteLength(raw)>16384)throw Error('fixture body limit');}
  const fields=Object.fromEntries(['client_secret','refresh_token','device_code','code','code_verifier','access_token'].map(k=>[k,false]));
  const params=new URLSearchParams();let observed=true;
  if(raw){
   if((q.headers['content-type']??'').includes('application/json')){
    try{const scan=(value,depth=0)=>{if(depth>16)throw Error('JSON depth');if(value&&typeof value==='object')for(const [k,x]of Object.entries(value)){if(Object.hasOwn(fields,k)&&x!==null&&x!=='')fields[k]=true;scan(x,depth+1);}};scan(JSON.parse(raw));}catch{observed=false;}
   }else if((q.headers['content-type']??'').includes('application/x-www-form-urlencoded')){
    for(const [k,x]of new URLSearchParams(raw)){params.append(k,x);if(Object.hasOwn(fields,k)&&x!=='')fields[k]=true;}
   }else observed=false;
  }
  return {raw,params,fields,observed};
 };
 const endpoint=(role)=>async(q,s)=>{
  const {params,fields,observed}=await captureBody(q),path=new URL(q.url,'http://fixture').pathname;
  const origin=role==='A'?a:b;
  const matches={client_auth:q.headers.authorization==='Basic '+Buffer.from('fixture-client:'+secret).toString('base64'),client_secret:params.get('client_secret')===secret,refresh_token:params.get('refresh_token')===rt,device_code:params.get('device_code')===dc,access_token:q.headers.authorization==='Bearer '+at};
  const ev={type:'request',context_id:'fixture-owner-A',address:receiver(origin,q),authorization_scheme:scheme(q),credential_observation_complete:observed,credential_fields:fields,fixture_matches:matches,role,path,method:q.method,secret_in_body:params.get('client_secret')===secret,refresh_in_body:params.get('refresh_token')===rt,device_in_body:params.get('device_code')===dc,authorization_present:!!q.headers.authorization,fixture_basic:q.headers.authorization==='Basic '+Buffer.from('fixture-client:'+secret).toString('base64'),grant:params.get('grant_type')};events.push(ev);
  const selected=c.selectB?b:a;
  if(path==='/prm'){send(s,{resource:resource,authorization_servers:[selected]});return;}
  if(path.startsWith('/.well-known/')){send(s,{issuer:selected,authorization_endpoint:selected+'/authorize',token_endpoint:selected+'/token',device_authorization_endpoint:selected+'/device',token_endpoint_auth_methods_supported:[c.method??'client_secret_post'],response_types_supported:['code'],grant_types_supported:['authorization_code','refresh_token','client_credentials','urn:ietf:params:oauth:grant-type:device_code']});return;}
  const redirectedPath=c.redirectStage==='device'?'/device':'/token';
  if(role==='A'&&path===redirectedPath&&c.redirect){
   const origin=c.cross?b:a;const destination=origin+'/receipt-'+(c.redirectStage??'token');events.push({type:'redirect',context_id:'fixture-owner-A',from:a+path,to:destination,status:c.redirect});s.writeHead(c.redirect,{Location:destination}).end();return;
  }
  if(path==='/device'||path==='/receipt-device'){
   send(s,{device_code:dc,user_code:'FIXTURE-ONLY',verification_uri:a+'/fixture-verification',interval:0,expires_in:2});return;
  }
  if(path==='/token'||path==='/receipt-token'){
   if(c.mode==='device'||c.mode==='cli-device'||c.success)send(s,{access_token:at,token_type:'Bearer',expires_in:3600});
   else send(s,{error:'invalid_request',error_description:'fixture terminal refusal'},400);
   return;
  }
  s.writeHead(404).end();
 };
 const sa=createServer(safe(endpoint('A'))),sb=createServer(safe(endpoint('B')));
 const sm=createServer(safe(async(q,s)=>{const {raw,fields,observed}=await captureBody(q);events.push({type:'request',context_id:'fixture-owner-A',address:receiver(new URL(resource).origin,q),role:'MCP',method:q.method,path:new URL(q.url,resource).pathname,authorization_present:!!q.headers.authorization,authorization_scheme:scheme(q),credential_observation_complete:observed,credential_fields:fields,fixture_matches:{client_auth:q.headers.authorization==='Basic '+Buffer.from('fixture-client:'+secret).toString('base64'),client_secret:raw.includes(secret),refresh_token:raw.includes(rt),device_code:raw.includes(dc),access_token:q.headers.authorization==='Bearer '+at},fixture_bearer:q.headers.authorization==='Bearer '+at});
 if(c.mode==='cli-device'&&q.headers.authorization==='Bearer '+at){
  if(q.method==='GET'){s.writeHead(405).end();return;}
  const msg=JSON.parse(raw);if(msg.id===undefined){s.writeHead(202).end();return;}
  send(s,{jsonrpc:'2.0',id:msg.id,result:{protocolVersion:msg.params?.protocolVersion??'2025-11-25',capabilities:{},serverInfo:{name:'own-fixture',version:'1'}}});return;
 }
 q.resume();s.writeHead(401,{'WWW-Authenticate':'Bearer resource_metadata="'+(c.selectB?b:a)+'/prm"'}).end();}));
 let stop;
 try{
  a=await listen(sa);b=await listen(sb);resource=(await listen(sm))+'/mcp';
  trustedPolicy={schema_version:2,id:'predeclared-'+c.id,context_id:'fixture-owner-A',expected_issuer:a,receivers:[
   ...['/token','/receipt-token'].map(path=>({issuer:a,address:a+path,kinds:['client_auth','client_secret','refresh_token','device_code','authorization_code','code_verifier'],methods:['POST']})),
   ...['/device','/receipt-device'].map(path=>({issuer:a,address:a+path,kinds:['client_auth','client_secret'],methods:['POST']})),
   {issuer:a,address:resource,kinds:['access_token'],methods:['GET','POST','DELETE']}
  ]};
  pinnedPolicyHash=oracle.policyHash(trustedPolicy);
  save(join(d,'POLICY.json'),trustedPolicy);
  save(join(d,'POLICY-BINDING.json'),{policy_sha256:pinnedPolicyHash,recorded_before_target:true,at:new Date().toISOString(),authority:'Supplied by trusted fixture controller/operator; not inferred from MCP discovery. Hash is integrity, not authentication.'});
  const cfg={mode:c.mode,method:c.method??'client_secret_post',owner:a,selected:c.selectB?b:a,resource,bundle,hash:createHash('sha256').update(c.id).digest('hex')};
  const env={PATH:dirname(node)+';'+process.env.PATH,SystemRoot:process.env.SystemRoot??process.env.SYSTEMROOT,USERPROFILE:state,TEMP:state,TMP:state,APPDATA:state,MCP_REMOTE_CONFIG_DIR:state,FIX_SECRET:secret,FIX_RT:rt,FIX_DC:dc,FIX_AT:at};
  let args;
  if(c.mode==='cli'||c.mode==='cli-device'){
   const info=join(state,'static.json');save(info,{client_id:'fixture-client',client_secret:secret,issuer:a,token_endpoint_auth_method:cfg.method});
   args=[cli,resource,'--transport','http-only',c.mode==='cli-device'?'--device-code':'--client-credentials','--static-oauth-client-info','@'+info];if(c.explicitToken)args.push('--token-endpoint',a+'/token');
  }else args=[join(procedureRoot,'driver.mjs'),JSON.stringify(cfg)];
  child=spawn(node,args,{env,cwd:root,windowsHide:true,stdio:['pipe','pipe','pipe']});
  let stdout='',stderr='';child.stdout.on('data',x=>stdout+=x);child.stderr.on('data',x=>stderr+=x);
  const close=new Promise(ok=>child.once('close',(code,signal)=>{closedEvent=true;ok({code,signal});}));
  if(c.mode==='cli'||c.mode==='cli-device'){
   child.stdin.write(JSON.stringify({jsonrpc:'2.0',id:1,method:'initialize',params:{protocolVersion:'2025-11-25',capabilities:{},clientInfo:{name:'own-wrapper-fixture',version:'1'}}})+'\n');
   const end=Date.now()+4000;while(!closedEvent&&Date.now()<end&&!(c.requireResource?events.some(x=>x.role==='MCP'&&x.fixture_bearer):events.some(x=>x.path?.startsWith('/token')||x.path?.startsWith('/receipt-'))))await new Promise(ok=>setTimeout(ok,25));
   await new Promise(ok=>setTimeout(ok,150));child.stdin.end();
  }
  stop=await Promise.race([close,new Promise(ok=>setTimeout(()=>ok(null),10000))]);
  if(!stop){child.kill();stop=await Promise.race([close,new Promise(ok=>setTimeout(()=>ok(null),3000))]);}
  assert.ok(stop&&closedEvent,'child close must be observed');
  for(const server of [sa,sb,sm]){server.closeAllConnections();if(server.listening)await new Promise(ok=>server.close(ok));}
  const line=stdout.split('\n').find(x=>x.startsWith('DRIVER_RESULT '));const driver=line?JSON.parse(line.slice(14)):null;
  const scenarioReached=oracle.scenarioObserved(c,events,driver);
  const coverage={target_started:typeof child.pid==='number',observation_complete:closedEvent&&captureErrors===0&&!sa.listening&&!sb.listening&&!sm.listening,stimulus_observed:scenarioReached&&events.some(x=>x.role==='MCP')&&events.some(x=>x.path==='/prm'||x.path?.startsWith('/.well-known/'))};
  const security=oracle.evaluate(trustedPolicy,events,coverage,pinnedPolicyHash);
  const sanitize=s=>[secret,rt,dc,at,Buffer.from('fixture-client:'+secret).toString('base64'),... [secret,rt,dc,at].map(encodeURIComponent)].reduce((x,v)=>x.split(v).join('[FIXTURE-CREDENTIAL]'),s);
  writeFileSync(join(d,'stdout.log'),sanitize(stdout));writeFileSync(join(d,'stderr.log'),sanitize(stderr));
  const result={case:c,security,coverage,scenario_postcondition_observed:scenarioReached,policy_sha256:pinnedPolicyHash,untrusted_discovery_issuer:c.selectB?b:a,expected_issuer:a,environment:{node:process.version,scope:'loopback-only',synthetic_credentials:true},origins:{A:a,B:b,MCP:resource},events,driver,child:stop,child_close_observed:closedEvent};
  save(join(d,'RESULT.json'),result);
  return result;
 }finally{
  if(child&&!closedEvent){child.kill();await new Promise(ok=>child.once('close',ok));}
  for(const s of [sa,sb,sm]){s.closeAllConnections();if(s.listening)await new Promise(ok=>s.close(ok));}
  const real=realpathSync(state),expected=realpathSync(d);assert.ok(real.startsWith(expected+sep)&&real.split(sep).at(-1).startsWith('state-'));rmSync(real,{recursive:true});
 }
}
const cases=JSON.parse(readFileSync(process.argv[2],'utf8'));const results=[];
for(const c of cases){const r=await run(c);results.push(r);console.log(JSON.stringify({id:c.id,security_verdict:r.security.verdict,violations:r.security.violations.length,expected:c.expected,expectation_met:r.security.verdict===c.expected,header_events:r.security.audit.filter(x=>x.authorization_present).map(x=>({recipient:x.recipient,scheme:x.authorization_scheme})),redirects:r.security.redirects}));}
save(join(root,'RESULTS-'+process.argv[2].split(/[\\/]/).at(-1)),results);
