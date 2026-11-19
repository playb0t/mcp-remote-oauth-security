import {readFileSync,writeFileSync,mkdirSync,existsSync,readdirSync} from 'node:fs';
import {createServer} from 'node:http';
import {createHash,randomBytes} from 'node:crypto';
import {join,resolve} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
assert.ok(process.env.MCP_EXTRA_OUTPUT,'Explicit fresh MCP_EXTRA_OUTPUT required');
const root=resolve(process.env.MCP_EXTRA_OUTPUT);assert.ok(!existsSync(root),'Fresh output required');mkdirSync(root,{recursive:true});
assert.equal(process.version,'v24.20.0');
const [mode,version,variant='pair']=process.argv.slice(2);
assert.ok(['0.16.6','0.16.7'].includes(version),'Choose recorded version');
const variable=version==='0.16.7'?'MCP_RUNTIME_0167_DIST':'MCP_RUNTIME_0166_DIST';assert.ok(process.env[variable],variable+' required');
const dist=resolve(process.env[variable]);
const chunk=version==='0.16.7'?'chunk-M3H22C2S.js':'chunk-MKB2ICYW.js';
const artifact=join(dist,chunk),source=readFileSync(artifact,'utf8');
const mod=await import(pathToFileURL(artifact).href);
const digest=x=>createHash('sha256').update(x).digest('hex');
const id=mode+'-'+version+'-'+variant,out=join(root,'extra/output',id);mkdirSync(out,{recursive:true});
process.env.MCP_REMOTE_CONFIG_DIR=join(out,'state');
const hashStart=source.indexOf('function getServerUrlHash('),hashEnd=source.indexOf('\nfunction patternToRegex',hashStart);
assert.ok(hashStart>0&&hashEnd>hashStart);const getHash=new Function('crypto2',source.slice(hashStart,hashEnd)+';return getServerUrlHash;')({createHash});
const context={entry_point:mode==='env'?'published parseCommandLineArgs then NodeOAuthClientProvider.saveTokens':'published parseCommandLineArgs then NodeOAuthClientProvider.tokens proactive refresh',variant:id,auth_profile:'synthetic dynamic client / same OS principal',principal:'owned fixture client',grants:'synthetic fixture only',consumer:'owned filesystem and loopback HTTP receiver',state:mode==='env'?'same header template; two synthetic environment values':'expired issuer-A tokens; cached '+variant+' callback registration',backend:'Windows files and loopback HTTP',platform:process.platform+' / Node '+process.version,component:'mcp-remote '+version,validated_field:mode==='env'?'resolved header value and resulting cache prefix':'callback redirect URI; cached registration survival; refresh recipient',effective_resource:mode==='env'?'two actual token cache file prefixes':'selected B token endpoint'};
let result;
if(mode==='env'){
 const rows=[],url='http://127.0.0.1:1/mcp';
 for(const value of [randomBytes(24).toString('hex'),randomBytes(24).toString('hex')]){
  process.env.TEST_HEADER=value;
  const parsed=await mod.parseCommandLineArgs([url,'18001','--host','127.0.0.1','--header','Authorization: Bearer ${TEST_HEADER}'],'fixture');
  const provider=new mod.NodeOAuthClientProvider({serverUrl:url,serverUrlHash:parsed.serverUrlHash,host:parsed.host,callbackPort:parsed.callbackPort});
  await provider.saveTokens({access_token:randomBytes(24).toString('hex'),token_type:'Bearer',expires_in:3600});
  rows.push({hash:parsed.serverUrlHash,header_expanded:parsed.headers.Authorization==='Bearer '+value,derived_from_expanded:getHash(url,undefined,{Authorization:'Bearer '+value})===parsed.serverUrlHash});
 }
 const files=readdirSync(join(process.env.MCP_REMOTE_CONFIG_DIR,'mcp-remote-v1')).filter(x=>x.endsWith('_tokens.json'));
 const distinct=rows[0].hash!==rows[1].hash;
 result={rows,files,distinct,checks:[{id:'expanded_headers',passed:rows.every(x=>x.header_expanded)},{id:'namespace_diff_expected',passed:distinct===(version==='0.16.7')},{id:'materialized_prefix_count',passed:files.length===(version==='0.16.7'?2:1)}],effects:[{outcome:'none',property:'descriptive header expansion namespace comparison'}],completed:true,forced:false};
}else{
 assert.equal(mode,'registration');
 const secret=randomBytes(24).toString('hex'),refresh=randomBytes(24).toString('hex'),events=[],closes=[];let a,b;
 const reply=(s,v)=>s.writeHead(200,{'Content-Type':'application/json'}).end(JSON.stringify(v));
 const endpoint=role=>async(q,s)=>{let body='';for await(const c of q){body+=c;assert.ok(body.length<16384);}const p=new URLSearchParams(body);events.push({role,method:q.method,path:q.url,client_secret_match:p.get('client_secret')===secret,refresh_token_match:p.get('refresh_token')===refresh,authorization_present:!!q.headers.authorization});reply(s,{access_token:randomBytes(24).toString('hex'),token_type:'Bearer',expires_in:3600});};
 const sa=createServer(endpoint('A')),sb=createServer(endpoint('B'));
 const listen=s=>new Promise((ok,no)=>{s.once('error',no);s.listen(0,'127.0.0.1',()=>ok('http://127.0.0.1:'+s.address().port));});
 let parsed,registration_after_parse,tokens_returned=false,error=null,hash,clientFile;
 try{
  a=await listen(sa);b=await listen(sb);const resource=a+'/mcp';hash=getHash(resource);
  const dir=join(process.env.MCP_REMOTE_CONFIG_DIR,'mcp-remote-v1');mkdirSync(dir,{recursive:true});clientFile=join(dir,hash+'_client_info.json');
  const redirect=variant==='portless'?'http://127.0.0.1/oauth/callback':variant==='exact-port'?'http://127.0.0.1:18001/oauth/callback':'http://127.0.0.1:18002/oauth/callback';
  writeFileSync(clientFile,JSON.stringify({client_id:'fixture-client',client_secret:secret,token_endpoint_auth_method:'client_secret_post',redirect_uris:[redirect],issuer:a}));
  writeFileSync(join(dir,hash+'_tokens.json'),JSON.stringify({access_token:randomBytes(24).toString('hex'),refresh_token:refresh,token_type:'Bearer',expires_in:1,expires_at:Date.now()-1000,issuer:a}));
  parsed=await mod.parseCommandLineArgs([resource,'18001','--host','127.0.0.1'],'fixture');assert.equal(parsed.serverUrlHash,hash);
  registration_after_parse=existsSync(clientFile);
  const provider=new mod.NodeOAuthClientProvider({serverUrl:b,resourceServerUrl:resource,serverUrlHash:hash,host:parsed.host,callbackPort:parsed.callbackPort,authorizationServerMetadata:{issuer:b,token_endpoint:b+'/token',token_endpoint_auth_methods_supported:['client_secret_post']},protectedResourceMetadata:{resource,authorization_servers:[b]},staticOAuthClientMetadata:{token_endpoint_auth_method:'client_secret_post'}});
  try{tokens_returned=!!await provider.tokens();}catch(e){error=String(e);}
 }finally{for(const [role,s]of [['A',sa],['B',sb]]){s.closeAllConnections();await new Promise(ok=>s.close(e=>{closes.push({role,error:e?String(e):null});ok();}));}}
 const expectedSurvival=variant==='exact-port'||variant==='portless'&&version==='0.16.7';
 const received=events.some(x=>x.role==='B'&&x.client_secret_match&&x.refresh_token_match);
 result={events,closes,registration_after_parse,registration_after_refresh:existsSync(clientFile),tokens_returned,error,expected_survival:expectedSurvival,checks:[{id:'registration_survival',passed:registration_after_parse===expectedSurvival},{id:'recipient_observation',passed:received===expectedSurvival},{id:'resource_close',passed:closes.length===2&&closes.every(x=>x.error===null)}],effects:[{outcome:received?'forbidden':'none',property:'owner-A synthetic client secret and refresh token reached B'}],completed:closes.length===2&&closes.every(x=>x.error===null),forced:false};
}
result.id=id;result.measurement_context=context;result.artifact_sha256=digest(readFileSync(artifact));result.observer_sha256=digest(readFileSync(fileURLToPath(import.meta.url)));writeFileSync(join(root,'extra/output',id+'.json'),JSON.stringify(result,null,2));
console.log(JSON.stringify({id,completed:result.completed,checks:result.checks,distinct:result.distinct,registration_survived:result.registration_after_parse,events:result.events}));
