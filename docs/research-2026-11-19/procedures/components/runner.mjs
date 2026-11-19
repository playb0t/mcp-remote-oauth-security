import {createServer} from 'node:http';
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
import {join,dirname,resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {run as extras} from './extras.mjs';
import {evaluate} from './criterion.mjs';
assert.ok(process.env.MCP_COMPONENT_OUTPUT&&process.env.MCP_RUNTIME_DIST,'Explicit runtime and fresh output required');
const root=resolve(process.env.MCP_COMPONENT_OUTPUT);
assert.ok(!existsSync(root),'Output must be fresh');
const dist=resolve(process.env.MCP_RUNTIME_DIST),bundle=join(dist,'chunk-M3H22C2S.js');
process.env.MCP_RUNTIME_DIST=dist;
assert.equal(process.version,'v24.20.0');
const mod=await import(pathToFileURL(bundle).href),source=readFileSync(bundle,'utf8');
const digest=x=>crypto.createHash('sha256').update(x).digest('hex');
export function context(id){return {entry_point:id==='f04'?'exact getServerUrlHash extracted from official bundle':id==='f08'?'official redirectToAuthorization with own method receiver, installed open and inert recorder':id==='f11'?'official connectToRemoteServer with controlled provider and local SSE':'official NodeOAuthClientProvider store methods / discoverOAuthServerInfo',variant:id,validated_field:'original advisory property',effective_resource:'owned fixture files, recorder or HTTP receivers',auth_profile:'synthetic local fixture',principal:'test process under current OS principal',grants:'own fixture only',consumer:'controlled recorder, local filesystem or loopback server',state:'fresh isolated fixture',component:'mcp-remote 0.16.7',backend:'Windows local filesystem and loopback HTTP',platform:'win32 / Node v24.20.0'};}
async function f04(){
 const start=source.indexOf('function getServerUrlHash('),end=source.indexOf('\nfunction patternToRegex',start);
 assert.ok(start>0&&end>start);const code=source.slice(start,end);
 const fn=new Function('crypto2',code+'; return getServerUrlHash;')(crypto);
 const a=['https://own.invalid/a|https://own.invalid/b','https://own.invalid/c'];
 const b=['https://own.invalid/a','https://own.invalid/b|https://own.invalid/c'];
 for(const x of [...a,...b])assert.equal(new URL(x).protocol,'https:');
 const same=fn(...a)===fn(...b),different=fn('https://own.invalid/other')!==fn(a[0],a[1]);
 const headerOrder=fn('https://own.invalid/a',undefined,{a:'1',b:'2'})===fn('https://own.invalid/a',undefined,{b:'2',a:'1'});
 return {checks:[{id:'ambiguous_tuple',passed:same},{id:'distinct_control',passed:different},{id:'header_order_control',passed:headerOrder}],effects:[{outcome:same?'forbidden':'none',property:'namespace serialization ambiguity, not second-preimage or cache takeover'}],hashes:[fn(...a),fn(...b)],extracted_sha256:digest(code),completed:true,forced:false};
}
async function f08(){
 const provider={inTokenStorm:()=>false,ownsPendingFlow:()=>true,useDeviceCode:false,useClientCredentials:false,getAuthorizationServerMetadata:async()=>({}),applyScope:()=>{},applyAuthorizeParams:()=>{},preflightCachedDynamicClientRegistration:async()=>{},guardAgainstAuthorizationStorm:()=>{}};
 const tests=[['https-positive','https://own.invalid/authorize'],['loopback-http','http://127.0.0.1:37331/authorize'],['link-local-http','http://169.254.169.254/latest/meta-data'],['script-negative','javascript:alert(1)'],['mapped-ipv6-negative','http://[::ffff:127.0.0.1]/authorize']];
 const rows=[];const old=process.env.SYSTEMROOT;
 try{for(const [id,url]of tests){
  const capture=join(root,'output',id+'.argv.txt');assert.ok(process.env.MCP_FAKE_SYSTEMROOT,'MCP_FAKE_SYSTEMROOT required for F08');process.env.SYSTEMROOT=process.env.MCP_FAKE_SYSTEMROOT;process.env.MCP_RECORDER_OUTPUT=capture;
  const alive=setInterval(()=>{},100);let error=null;
  try{await mod.NodeOAuthClientProvider.prototype.redirectToAuthorization.call(provider,new URL(url));}catch(e){error=String(e);}finally{clearInterval(alive);}
  const captured=existsSync(capture),argv=captured?readFileSync(capture,'utf8').split(/\r?\n/):[];
  const k=argv.indexOf('-EncodedCommand');const decoded=k>=0?Buffer.from(argv[k+1],'base64').toString('utf16le'):null;
  rows.push({id,url,captured,error,decoded});
 }}finally{if(old===undefined)delete process.env.SYSTEMROOT;else process.env.SYSTEMROOT=old;delete process.env.MCP_RECORDER_OUTPUT;}
 const reached=rows.filter(x=>['loopback-http','link-local-http'].includes(x.id)).some(x=>x.captured);
 return {checks:rows.map(x=>({id:x.id,passed:x.id.includes('negative')?!x.captured&&!!x.error:x.captured})),effects:[{outcome:reached?'forbidden':'none',property:'internal-address URL reached inert opener boundary; browser not executed'}],rows,completed:true,forced:false};
}
const listen=s=>new Promise((ok,no)=>{s.once('error',no);s.listen(0,'127.0.0.1',()=>ok('http://127.0.0.1:'+s.address().port));});
async function f11(){
 const rows=[];
 for(const mode of ['redirect-cross','redirect-same','endpoint-cross','no-token']){
  const events=[];let a,b,transport,timeout;
  const token=crypto.randomBytes(20).toString('hex');
  const record=(role,q)=>events.push({role,path:q.url,method:q.method,authorization_present:!!q.headers.authorization,synthetic_bearer_received:q.headers.authorization==='Bearer '+token});
  const sse=(s,url)=>{s.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache','Connection':'keep-alive'});s.write('event: endpoint\ndata: '+url+'\n\n');};
  const sb=createServer((q,s)=>{record('B',q);if(q.url==='/sse')sse(s,'/messages');else s.writeHead(404).end();});
  const sa=createServer((q,s)=>{record('A',q);if(q.url==='/sse'){if(mode==='redirect-cross'){s.writeHead(302,{Location:b+'/sse'}).end();return;}if(mode==='redirect-same'){s.writeHead(302,{Location:a+'/stream'}).end();return;}sse(s,mode==='endpoint-cross'?b+'/messages':'/messages');return;}if(q.url==='/stream')sse(s,'/messages');else s.writeHead(404).end();});
  const closes=[];let status,error=null;
  try{a=await listen(sa);b=await listen(sb);const provider={tokens:async()=>mode==='no-token'?undefined:{access_token:token},token:async()=>mode==='no-token'?undefined:token};
   transport=await Promise.race([mod.connectToRemoteServer(null,a+'/sse',provider,{},async()=>{throw Error('unexpected auth');},'sse-only'),new Promise((_,no)=>{timeout=setTimeout(()=>no(Error('fixture timeout')),6000);})]);status='connected';
  }catch(e){status='rejected';error=String(e);}finally{clearTimeout(timeout);await transport?.close?.();for(const [role,s]of [['A',sa],['B',sb]]){s.closeAllConnections();await new Promise((ok,no)=>s.close(e=>{closes.push({role,error:e?String(e):null});e?no(e):ok();}));}}
  rows.push({mode,status,error,events,closes});
 }
 const leaked=rows.some(x=>x.events.some(e=>e.role==='B'&&e.synthetic_bearer_received));
 const checks=rows.map(x=>({id:x.mode,passed:x.mode==='redirect-same'?x.events.some(e=>e.role==='A'&&e.path==='/stream'&&e.synthetic_bearer_received):x.mode==='endpoint-cross'?x.status==='rejected'&&!x.events.some(e=>e.role==='B'&&e.method==='POST'):!x.events.some(e=>e.role==='B'&&e.synthetic_bearer_received)}));
 return {checks,effects:[{outcome:leaked?'forbidden':'none',property:'tested cross-origin bearer forwarding'}],rows,completed:rows.every(x=>x.closes.length===2&&x.closes.every(c=>c.error===null)&&!x.error?.includes('fixture timeout')),forced:false};
}
async function main(){
 const mode=process.argv[2];const out=join(root,'output');mkdirSync(out,{recursive:true});
 process.env.MCP_REMOTE_CONFIG_DIR=join(out,'state-'+mode);
 let raw;
 try{raw=mode==='f04'?await f04():mode==='f08'?await f08():mode==='f11'?await f11():await extras(mode);}catch(e){raw={completed:false,forced:false,error:String(e),effects:[{outcome:'unknown'}],checks:[]};}
 raw.id=mode;raw.measurement_context=context(mode);raw.artifact_sha256=digest(readFileSync(bundle));raw.observer_sha256=digest(readFileSync(fileURLToPath(import.meta.url)));
 raw.assessment=evaluate(raw);writeFileSync(join(out,mode+'.json'),JSON.stringify(raw,null,2));
 console.log(JSON.stringify({id:mode,assessment:raw.assessment,completed:raw.completed,checks:raw.checks}));
 if(!raw.completed)process.exitCode=1;
}
if(process.argv[2])await main();
