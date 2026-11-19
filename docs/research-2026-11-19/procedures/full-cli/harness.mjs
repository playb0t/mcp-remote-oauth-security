import {createServer} from 'node:http';
import {createConnection} from 'node:net';
import {spawn} from 'node:child_process';
import {createHash,randomBytes} from 'node:crypto';
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {join,dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import oracle from './auth-destination-v2.cjs';
const procedureRoot=dirname(fileURLToPath(import.meta.url));
const inputRoot=join(procedureRoot,'inputs');
assert.ok(process.env.MCP_CLI_OUTPUT,'Fresh MCP_CLI_OUTPUT required');
const C=resolve(process.env.MCP_CLI_OUTPUT);assert.ok(!existsSync(C),'Output must be fresh');mkdirSync(C,{recursive:true});
const identity=JSON.parse(readFileSync(join(inputRoot,'IDENTITY.json'),'utf8'));
assert.equal(process.version,'v24.20.0');
const hash=x=>createHash('sha256').update(x).digest('hex');
const save=(p,v)=>writeFileSync(p,JSON.stringify(v,null,2)+'\n');
export function context(c){return {entry_point:'unmodified published dist/proxy.js child, stdio initialize and real HTTP discovery',variant:c.id,auth_profile:'cached dynamic client, expired access and refresh token bound to issuerA',principal:'fixture-client under current OS principal',grants:'own synthetic fixtures only',consumer:c.selectB?'discovery-selected unapproved loopbackB token endpoint':'predeclared permitted loopbackA token endpoint',state:'preseeded '+c.variant+' callback registration; metadata read over HTTP by CLI',backend:'Windows isolated auth files and three owned HTTP fixtures',platform:process.platform+' / Node '+process.version,component:'mcp-remote '+c.version,validated_field:'persisted credential owner and actual refresh receiver',effective_resource:c.selectB?'B/token selected by MCP401 PRM and AS discovery':'A/token selected by MCP401 PRM and AS discovery'};}
const listen=(s,p)=>new Promise((ok,no)=>{s.once('error',no);s.listen(p,'127.0.0.1',()=>ok('http://127.0.0.1:'+s.address().port));});
const probePort=()=>new Promise(ok=>{const socket=createConnection({host:'127.0.0.1',port:18001});let result;const done=value=>{if(result!==undefined)return;result=value;socket.destroy();ok(value);};socket.once('connect',()=>done('open'));socket.once('error',e=>done(e.code==='ECONNREFUSED'?'refused':e.code??'unknown'));socket.setTimeout(1000,()=>done('timeout'));});
async function trial(c){
 const out=join(C,'runs',c.id);assert.ok(!existsSync(out),'fresh result required');mkdirSync(out,{recursive:true});
 const state=join(out,'state');mkdirSync(state);const authdir=join(state,'mcp-remote-v1');mkdirSync(authdir);
 const a='http://127.0.0.1:'+c.portBase,b='http://127.0.0.1:'+(c.portBase+1),resource='http://127.0.0.1:'+(c.portBase+2)+'/mcp',selected=c.selectB?b:a;
 const secret=randomBytes(24).toString('hex'),refresh=randomBytes(24).toString('hex'),oldAccess=randomBytes(24).toString('hex'),newAccess=randomBytes(24).toString('hex');
 const prefix=createHash('md5').update(resource).digest('hex'),clientFile=join(authdir,prefix+'_client_info.json'),tokensFile=join(authdir,prefix+'_tokens.json');
 const redirect=c.variant==='portless'?'http://127.0.0.1/oauth/callback':c.variant==='wrong-port'?'http://127.0.0.1:18002/oauth/callback':'http://127.0.0.1:18001/oauth/callback';
 const client={client_id:'fixture-client',client_secret:secret,token_endpoint_auth_method:'client_secret_post',redirect_uris:[redirect],issuer:a};
 const tokens={access_token:oldAccess,refresh_token:refresh,token_type:'Bearer',expires_in:1,expires_at:Date.now()-60000,issuer:a};
 save(clientFile,client);save(tokensFile,tokens);const beforeTokens=readFileSync(tokensFile);const beforeClient=readFileSync(clientFile);
 const policy=JSON.parse(readFileSync(join(inputRoot,'policies',c.id+'.json'),'utf8'));const pin=oracle.policyHash(policy);save(join(out,'POLICY.json'),policy);save(join(out,'SEED.json'),{recorded_before_target:true,owner:a,selected_metadata_issuer:selected,serverUrlHash:prefix,callback:redirect,client_sha256:hash(beforeClient),token_sha256:hash(beforeTokens),expires_at:tokens.expires_at,contains_synthetic_values_only:true,policy_sha256:pin});
 const events=[],closes=[];let inFlight=0,captureErrors=0,child,childClosed=false,stop=null,forced=false,stdout='',stderr='',initialCache=null,stdioInitialize=false,terminalAt=null;
 const recorder=join(out,'unexpected-opener.argv');
 const reply=(s,v,status=200)=>s.writeHead(status,{'Content-Type':'application/json'}).end(JSON.stringify(v));
 const inspect=(q,role,origin,body)=>{
  let fields=Object.fromEntries(['client_secret','refresh_token','device_code','code','code_verifier','access_token'].map(k=>[k,false])),params=new URLSearchParams(),complete=true;
  if(body){if((q.headers['content-type']??'').includes('application/x-www-form-urlencoded')){params=new URLSearchParams(body);for(const [k,v]of params)if(k in fields)fields[k]=v!=='';}else if((q.headers['content-type']??'').includes('application/json')){try{const value=JSON.parse(body);for(const k in fields)fields[k]=typeof value[k]==='string'&&value[k]!=='';}catch{complete=false;}}else complete=false;}
  const path=new URL(q.url,origin).pathname;
  const e={type:'request',role,path,address:origin+path,method:q.method,context_id:'fixture-owner-A',authorization_present:!!q.headers.authorization,authorization_scheme:q.headers.authorization?.startsWith('Basic ')?'Basic':q.headers.authorization?.startsWith('Bearer ')?'Bearer':null,credential_fields:fields,credential_observation_complete:complete,fixture_matches:{client_auth:q.headers.authorization==='Basic '+Buffer.from('fixture-client:'+secret).toString('base64'),client_secret:params.get('client_secret')===secret,refresh_token:params.get('refresh_token')===refresh,access_token:q.headers.authorization==='Bearer '+newAccess},old_access_received:q.headers.authorization==='Bearer '+oldAccess,grant:params.get('grant_type')};events.push(e);return e;
 };
 const safe=handler=>(q,s)=>{inFlight++;Promise.resolve().then(async()=>{let body='';for await(const part of q){body+=part;if(Buffer.byteLength(body)>65536)throw Error('body limit');}await handler(q,s,body);}).catch(e=>{captureErrors++;events.push({type:'observer_error',reason:e.message});s.destroy();}).finally(()=>{inFlight--;});};
 const endpoint=role=>safe(async(q,s,body)=>{
  const origin=role==='A'?a:b,e=inspect(q,role,origin,body);
  if(e.path==='/prm'){reply(s,{resource,authorization_servers:[selected]});return;}
  if(e.path.startsWith('/.well-known/')){reply(s,{issuer:selected,authorization_endpoint:selected+'/authorize',token_endpoint:selected+'/token',registration_endpoint:selected+'/register',token_endpoint_auth_methods_supported:['client_secret_post'],response_types_supported:['code'],grant_types_supported:['authorization_code','refresh_token']});return;}
  if(e.path==='/token'){terminalAt=Date.now();if(e.grant==='refresh_token'&&e.fixture_matches.client_secret&&e.fixture_matches.refresh_token){reply(s,{access_token:newAccess,token_type:'Bearer',expires_in:3600});return;}reply(s,{error:'invalid_grant',error_description:'controlled unmatched request'},400);return;}
  if(e.path==='/register'){terminalAt=Date.now();reply(s,{error:'invalid_client_metadata',error_description:'controlled terminal DCR refusal; no new client issued'},400);return;}
  s.writeHead(404).end();
 });
 const sa=createServer(endpoint('A')),sb=createServer(endpoint('B'));
 const sr=createServer(safe(async(q,s,body)=>{
  if(initialCache===null)initialCache={client_exists:existsSync(clientFile),same_client_bytes:existsSync(clientFile)&&hash(readFileSync(clientFile))===hash(beforeClient),tokens_still_seed:existsSync(tokensFile)&&hash(readFileSync(tokensFile))===hash(beforeTokens)};
  const e=inspect(q,'MCP',new URL(resource).origin,body);
  if(!e.fixture_matches.access_token){s.writeHead(401,{'WWW-Authenticate':'Bearer resource_metadata="'+selected+'/prm"'}).end();return;}
  if(q.method==='GET'){s.writeHead(405).end();return;}
  if(q.method==='DELETE'){s.writeHead(200).end();return;}
  const msg=JSON.parse(body);if(msg.id===undefined){s.writeHead(202).end();return;}
  if(msg.method==='initialize'){e.initialize_request=true;reply(s,{jsonrpc:'2.0',id:msg.id,result:{protocolVersion:msg.params.protocolVersion,capabilities:{},serverInfo:{name:'owned-cache-fixture',version:'1'}}});return;}
  reply(s,{jsonrpc:'2.0',id:msg.id,result:{}});
 }));
 let childClosePromise;
 try{
  assert.equal(await probePort(),'refused','callback port must be free before trial');
  await listen(sa,c.portBase);await listen(sb,c.portBase+1);await listen(sr,c.portBase+2);
  const v=identity.versions[c.version],runtimeKey=c.version==='0.16.6'?'MCP_CLI_RUNTIME_0166':'MCP_CLI_RUNTIME_0167';assert.ok(process.env[runtimeKey],runtimeKey+' required');const runtime=resolve(process.env[runtimeKey]),cli=join(runtime,'dist/proxy.js');assert.equal(hash(readFileSync(cli)),v.proxy_sha256);assert.equal(hash(readFileSync(join(runtime,'dist',v.chunk))),v.bundle_sha256);
  const env={PATH:dirname(process.execPath)+';'+process.env.PATH,SYSTEMROOT:process.env.SYSTEMROOT??process.env.SystemRoot,USERPROFILE:state,APPDATA:state,TEMP:state,TMP:state,MCP_REMOTE_CONFIG_DIR:state,MCP_FAKE_SYSTEMROOT:resolve(process.env.MCP_FAKE_SYSTEMROOT),MCP_RECORDER_OUTPUT:recorder,NODE_OPTIONS:'--require '+join(procedureRoot,'opener-preload.cjs')};
  const args=[cli,resource,'18001','--host','127.0.0.1','--transport','http-only','--auth-timeout','3'];
  save(join(out,'LAUNCH.json'),{executable:process.execPath,executable_sha256:identity.node_sha256,argv:args,environment:env,metadata_injected:false,target_source_modified:false,policy_recorded_before_spawn:true});
  child=spawn(process.execPath,args,{cwd:out,env,windowsHide:true,stdio:['pipe','pipe','pipe']});childClosePromise=new Promise(ok=>child.once('close',(code,signal)=>{childClosed=true;stop={code,signal};ok(stop);}));
  child.on('error',e=>{captureErrors++;stderr+='spawn error: '+e.message;});child.stdout.on('data',d=>{stdout+=d;for(const line of stdout.split(/\r?\n/)){try{const m=JSON.parse(line);if(m.id===1&&m.result?.serverInfo?.name==='owned-cache-fixture')stdioInitialize=true;}catch{}}});child.stderr.on('data',d=>{stderr+=d;});
  child.stdin.on('error',e=>{if(e.code!=='EPIPE')captureErrors++;});
  child.stdin.write(JSON.stringify({jsonrpc:'2.0',id:1,method:'initialize',params:{protocolVersion:'2025-11-25',capabilities:{},clientInfo:{name:'owned-cli-observer',version:'1'}}})+'\n');
  const deadline=Date.now()+12000;
  while(!childClosed&&!stdioInitialize&&!existsSync(recorder)&&Date.now()<deadline)await new Promise(ok=>setTimeout(ok,25));
  if(!childClosed){await new Promise(ok=>setTimeout(ok,150));child.stdin.end();await Promise.race([childClosePromise,new Promise(ok=>setTimeout(ok,3000))]);}
  if(!childClosed){forced=true;child.kill();await Promise.race([childClosePromise,new Promise(ok=>setTimeout(ok,3000))]);}
  assert.ok(childClosed,'CLI close not observed');
 }finally{
  if(child&&!childClosed){forced=true;child.kill();await childClosePromise;}
  for(const [role,s]of [['A',sa],['B',sb],['MCP',sr]]){s.closeAllConnections();if(s.listening)await new Promise(ok=>s.close(e=>{closes.push({role,error:e?String(e):null});ok();}));}
 }
 const callback_after=await probePort();
 const discovery=events.some(e=>e.role==='MCP')&&events.some(e=>e.address===selected+'/prm')&&events.some(e=>e.address===selected+'/.well-known/oauth-authorization-server');
 const tokenReceipts=events.filter(e=>e.path==='/token'),matched=tokenReceipts.filter(e=>e.fixture_matches?.client_secret&&e.fixture_matches?.refresh_token),foreign=matched.some(e=>e.role==='B');
 const register=events.filter(e=>e.path==='/register');
 const terminal=stdioInitialize||register.length>0||matched.length>0;
 const complete=childClosed&&!forced&&captureErrors===0&&inFlight===0&&closes.length===3&&closes.every(x=>x.error===null)&&callback_after==='refused'&&!existsSync(recorder)&&discovery&&terminal;
 const coverage={target_started:typeof child?.pid==='number',observation_complete:complete,stimulus_observed:discovery&&terminal};const security=oracle.evaluate(policy,events,coverage,pin);
 const redact=s=>[secret,refresh,oldAccess,newAccess,Buffer.from('fixture-client:'+secret).toString('base64')].reduce((text,value)=>text.split(value).join('<redacted>'),s);
 writeFileSync(join(out,'stdout.log'),redact(stdout));writeFileSync(join(out,'stderr.log'),redact(stderr));
 const tokenAfter=existsSync(tokensFile)?JSON.parse(readFileSync(tokensFile,'utf8')):null;
 const result={id:c.id,case:c,measurement_context:context(c),artifact_sha256:identity.versions[c.version].proxy_sha256,observer_sha256:hash(readFileSync(fileURLToPath(import.meta.url))),policy_sha256:pin,seed_recorded_before_target:true,initial_cache_at_first_mcp_request:initialCache,events,discovery_complete:discovery,matched_refresh_receipts:matched.map(e=>({role:e.role,path:e.path,client_secret_match:true,refresh_token_match:true})),foreign_credentials_received:foreign,registration_requests:register.length,stdio_initialize_received:stdioInitialize,cache_after:{client_exists:existsSync(clientFile),tokens_exists:existsSync(tokensFile),tokens_changed:existsSync(tokensFile)&&hash(readFileSync(tokensFile))!==hash(beforeTokens),new_access_persisted:tokenAfter?.access_token===newAccess},child:{pid:child?.pid,close_observed:childClosed,...stop},forced_stop:forced,callback_port_after_close:callback_after,unexpected_opener:existsSync(recorder),server_close_callbacks:closes,in_flight_after_close:inFlight,capture_errors:captureErrors,coverage,security,expected_observation_matches:{retention:initialCache?.client_exists===c.expected_retained,foreign_receipt:foreign===(c.expected_retained&&c.selectB),mcp_initialize:stdioInitialize===c.expected_retained},completed:complete,channel_assessment:{query_observed:false,verdict:security.verdict==='FAIL'?'FAIL':'INCONCLUSIVE',reason:'Original query strings are not retained; direct forbidden body receipts remain FAIL.'}};
 save(join(out,'RESULT.json'),result);console.log(JSON.stringify({id:c.id,security:security.verdict,retained_at_discovery:initialCache?.client_exists,matched_receipts:result.matched_refresh_receipts,registrations:register.length,initialize:stdioInitialize,close:stop,forced,completed:complete}));
 return result;
}
if(process.argv[2]==='run'){
 const rows=[];for(const c of JSON.parse(readFileSync(join(inputRoot,'cases.json'),'utf8')))rows.push(await trial(c));save(join(C,'RESULTS.json'),rows);
}
