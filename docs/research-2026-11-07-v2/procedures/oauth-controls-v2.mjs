
import {createServer} from 'node:http';
import {spawn} from 'node:child_process';
import {randomBytes,createHash} from 'node:crypto';
import {join,dirname,resolve,sep} from 'node:path';
import {mkdirSync,mkdtempSync,writeFileSync,readFileSync,rmSync,realpathSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import oracle from './auth-destination-v2.cjs';
import settlement from './settle-trace-v2.cjs';
const sourceRoot=dirname(fileURLToPath(import.meta.url));
const version=process.argv[3],runtime=resolve(process.argv[4]),root=resolve(process.argv[5]);
assert.ok(version&&process.argv[4]&&process.argv[5],'cases/version/runtime/output required');
const node=process.execPath,cli=join(runtime,'proxy.js');
const packageData=JSON.parse(readFileSync(join(runtime,'../package.json'),'utf8'));
assert.equal(packageData.version,version);
const entry=readFileSync(cli,'utf8').match(/\.\/chunk-[A-Z0-9]+\.js/);assert.ok(entry,'unique main bundle import');
const bundle=join(runtime,entry[0].slice(2));
const pause=ms=>new Promise(ok=>setTimeout(ok,ms));
const bounded=async(p,ms)=>{let t;try{return await Promise.race([p,new Promise(ok=>{t=setTimeout(()=>ok(null),ms);})]);}finally{clearTimeout(t);}};
async function quiet(events,pending){const until=performance.now()+1500;let n=events.length,last=performance.now();while(performance.now()<until){if(n!==events.length){n=events.length;last=performance.now();}if(!pending.size&&performance.now()-last>=200)return true;await pause(10);}return false;}
const listen=s=>new Promise((ok,no)=>{s.once('error',no);s.listen(0,'127.0.0.1',()=>ok('http://127.0.0.1:'+s.address().port));});
const send=(s,o,status=200)=>s.writeHead(status,{'Content-Type':'application/json'}).end(JSON.stringify(o));
const save=(p,o)=>writeFileSync(p,JSON.stringify(o,null,2)+'\n');
async function run(c){
 const d=join(root,'runs',c.id);mkdirSync(d,{recursive:true});const state=mkdtempSync(join(d,'state-'));
 const secret=randomBytes(24).toString('hex'),rt=randomBytes(24).toString('hex'),dc=randomBytes(24).toString('hex'),at=randomBytes(24).toString('hex');
 const events=[],pending=new Set(),stops=[];let sealed=false,postcloseQuiet=false,serverCloses=0,forcedShutdown=false;let a,b,resource;let child;let closedEvent=false;let captureErrors=0;let trustedPolicy,pinnedPolicyHash;
 const safe=handler=>(q,s)=>{const p=Promise.resolve().then(()=>handler(q,s)).catch(()=>{captureErrors++;stops.push({phase:'observer',code:'request_capture_failed'});events.push({type:'observer_error',reason:'request_capture_failed'});s.destroy();});pending.add(p);p.finally(()=>pending.delete(p));};
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
  }else args=[join(sourceRoot,'driver.mjs'),JSON.stringify(cfg)];
  child=spawn(node,args,{env,cwd:root,windowsHide:true,stdio:['pipe','pipe','pipe']});
  let stdout='',stderr='';child.stdout.on('data',x=>stdout+=x);child.stderr.on('data',x=>stderr+=x);
  const close=new Promise(ok=>child.once('close',(code,signal)=>{closedEvent=true;ok({code,signal});}));
  if(c.mode==='cli'||c.mode==='cli-device'){
   child.stdin.write(JSON.stringify({jsonrpc:'2.0',id:1,method:'initialize',params:{protocolVersion:'2025-11-25',capabilities:{},clientInfo:{name:'own-wrapper-fixture',version:'1'}}})+'\n');
   const end=Date.now()+4000;while(!closedEvent&&Date.now()<end&&!(c.requireResource?events.some(x=>x.role==='MCP'&&x.fixture_bearer):events.some(x=>x.path?.startsWith('/token')||x.path?.startsWith('/receipt-'))))await new Promise(ok=>setTimeout(ok,25));
   await new Promise(ok=>setTimeout(ok,150));child.stdin.end();
  }
  stop=await Promise.race([close,new Promise(ok=>setTimeout(()=>ok(null),10000))]);
  if(!stop){forcedShutdown=true;stops.push({phase:'target_shutdown',code:'forced_child_shutdown',reason:'No child close within10000ms'});child.kill();stop=await Promise.race([close,new Promise(ok=>setTimeout(()=>ok(null),3000))]);}
  assert.ok(stop&&closedEvent,'child close must be observed');
  postcloseQuiet=await quiet(events,pending);
  if(!postcloseQuiet)stops.push({phase:'observer_settlement',code:'postclose_settlement_timeout'});
  for(const server of [sa,sb,sm]){
   if(!server.listening)continue;
   const done=new Promise(ok=>server.close(err=>{if(!err)serverCloses++;else captureErrors++;ok(!err);} ));server.closeIdleConnections();
   if(!(await bounded(done,1500))){forcedShutdown=true;captureErrors++;stops.push({phase:'fixture_shutdown',code:'forced_fixture_shutdown'});server.closeAllConnections();await bounded(done,1000);}
  }
  if(pending.size)await bounded(Promise.allSettled([...pending]),1000);
  sealed=true;

  const line=stdout.split('\n').find(x=>x.startsWith('DRIVER_RESULT '));const driver=line?JSON.parse(line.slice(14)):null;
  const positiveSDKReceipt=c.mode==='sdk'&&events.some(x=>x.type==='request'&&(x.path==='/token'||x.path==='/receipt-token')&&(x.fixture_matches?.client_auth||x.fixture_matches?.client_secret));
  const scenarioReached=oracle.scenarioObserved(c,events,driver)||positiveSDKReceipt;
  if(driver?.returned===false)stops.push({phase:'SDK_control',code:driver.error_type,reason:driver.error_message});
  if(stop.code!==0)stops.push({phase:'target_exit',code:'target_nonzero',exit:stop.code,signal:stop.signal,reason:stderr.includes('Incompatible auth server: does not support dynamic client registration')?'Incompatible auth server: does not support dynamic client registration':stderr.includes('fixture terminal refusal')?'fixture terminal refusal':'Unclassified target error; sanitised stderr retained'});
  if(!scenarioReached)stops.push({phase:'scenario',code:'postcondition_not_reached'});
  const coverage={target_started:typeof child.pid==='number',observation_complete:closedEvent&&captureErrors===0&&!sa.listening&&!sb.listening&&!sm.listening,stimulus_observed:scenarioReached&&events.some(x=>x.role==='MCP')&&events.some(x=>x.path==='/prm'||x.path?.startsWith('/.well-known/'))};
  const security=settlement.finalize(trustedPolicy,events,{target_started:coverage.target_started,stimulus_observed:coverage.stimulus_observed,child_closed:closedEvent,servers_closed:!sa.listening&&!sb.listening&&!sm.listening,server_closes_observed:serverCloses===3,forced_shutdown:forcedShutdown,sealed,postclose_quiet:postcloseQuiet,pending_handlers:pending.size,observer_errors:captureErrors},pinnedPolicyHash);
  const sanitize=s=>[secret,rt,dc,at,Buffer.from('fixture-client:'+secret).toString('base64'),... [secret,rt,dc,at].map(encodeURIComponent)].reduce((x,v)=>x.split(v).join('[FIXTURE-CREDENTIAL]'),s);
  writeFileSync(join(d,'stdout.log'),sanitize(stdout));writeFileSync(join(d,'stderr.log'),sanitize(stderr));
  const result={version,case:c,reference_0165_expected:c.expected,stops,settlement:{sealed,server_close_callbacks_observed:serverCloses,forced_fixture_shutdown:forcedShutdown,postclose_quiet:postcloseQuiet,pending_handlers:pending.size,servers_closed:!sa.listening&&!sb.listening&&!sm.listening},security,coverage:security.coverage,scenario_postcondition_observed:scenarioReached,policy_sha256:pinnedPolicyHash,untrusted_discovery_issuer:c.selectB?b:a,expected_issuer:a,environment:{node:process.version,scope:'loopback-only',synthetic_credentials:true},origins:{A:a,B:b,MCP:resource},events,driver,child:stop,child_close_observed:closedEvent};
  save(join(d,'RESULT.json'),result);
  return result;
 }finally{
  if(child&&!closedEvent){forcedShutdown=true;child.kill();await new Promise(ok=>child.once('close',ok));}
  for(const s of [sa,sb,sm]){s.closeAllConnections();if(s.listening)await new Promise(ok=>s.close(ok));}
  const real=realpathSync(state),expected=realpathSync(d);assert.ok(real.startsWith(expected+sep)&&real.split(sep).at(-1).startsWith('state-'));rmSync(real,{recursive:true});
 }
}
const cases=JSON.parse(readFileSync(process.argv[2],'utf8'));const results=[];
for(const c of cases){const r=await run(c);results.push(r);console.log(JSON.stringify({id:c.id,version,security_verdict:r.security.verdict,violations:r.security.violations.length,expected:c.expected,expectation_met:r.security.verdict===c.expected,header_events:r.security.audit.filter(x=>x.authorization_present).map(x=>({recipient:x.recipient,scheme:x.authorization_scheme})),redirects:r.security.redirects}));}
save(join(root,'RESULTS-'+process.argv[2].split(/[\\/]/).at(-1)),results);
