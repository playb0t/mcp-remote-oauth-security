import {createServer} from 'node:http';
import {mkdirSync,readFileSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {randomBytes,createHash} from 'node:crypto';
const bundle=join(process.env.MCP_RUNTIME_DIST,'chunk-M3H22C2S.js');
const mod=await import(pathToFileURL(bundle).href);
const hash=s=>createHash('sha256').update(s).digest('hex');
const listen=s=>new Promise((ok,no)=>{s.once('error',no);s.listen(0,'127.0.0.1',()=>ok('http://127.0.0.1:'+s.address().port));});
const reply=(s,v)=>s.writeHead(200,{'Content-Type':'application/json'}).end(JSON.stringify(v));
async function stored(){
 const seed=Object.fromEntries(['secret','access','refresh','verifier'].map(k=>[k,randomBytes(24).toString('hex')]));
 const root=process.env.MCP_REMOTE_CONFIG_DIR;mkdirSync(root,{recursive:true});
 const prefix=hash('f09-isolated');
 const provider=new mod.NodeOAuthClientProvider({serverUrl:'http://127.0.0.1:1',resourceServerUrl:'http://127.0.0.1:1/mcp',serverUrlHash:prefix,host:'127.0.0.1',callbackPort:18001,authorizationServerMetadata:{issuer:'http://127.0.0.1:1',token_endpoint:'http://127.0.0.1:1/token'},staticOAuthClientMetadata:{scope:'fixture.read'}});
 await provider.saveClientInformation({client_id:'own-fixture',client_secret:seed.secret,redirect_uris:[]});
 await provider.saveTokens({access_token:seed.access,refresh_token:seed.refresh,token_type:'Bearer',expires_in:3600});
 await provider.saveCodeVerifier(seed.verifier);
 const folder=join(root,'mcp-remote-v1');const files=readdirSync(folder).filter(x=>x.startsWith(prefix));
 const contents=files.map(x=>readFileSync(join(folder,x),'utf8'));
 const observed=Object.fromEntries(Object.entries(seed).map(([k,v])=>[k,contents.some(x=>x.includes(v))]));
 return {checks:Object.entries(observed).map(([id,passed])=>({id,passed})),effects:[{outcome:Object.values(observed).every(Boolean)?'forbidden':'unknown',property:'synthetic credentials persisted as plaintext, readable by same OS principal'}],events:files.map(path=>({type:'file',path,sha256:hash(readFileSync(join(folder,path)))})),observed,completed:true,forced:false,error:null};
}
async function redirectCase(kind){
 const events=[];let a,b,r;const redirect=(s,url)=>s.writeHead(302,{Location:url}).end();
 const record=(role,q)=>events.push({type:'request',role,path:q.url,method:q.method,authorization_present:!!q.headers.authorization});
 const metadata=()=>({issuer:a,authorization_endpoint:a+'/authorize',token_endpoint:a+'/token',registration_endpoint:a+'/register',response_types_supported:['code']});
 const sb=createServer((q,s)=>{record('B',q);reply(s,kind==='prm'?{resource:r+'/mcp',authorization_servers:[a]}:metadata());});
 const sa=createServer((q,s)=>{record('A',q);if(q.url==='/prm'){if(kind==='prm')redirect(s,b+'/final-prm');else if(kind==='same')redirect(s,a+'/final-prm');else reply(s,{resource:r+'/mcp',authorization_servers:[a]});return;}if(q.url==='/final-prm'){reply(s,{resource:r+'/mcp',authorization_servers:[a]});return;}if(q.url.startsWith('/.well-known/')){if(kind==='as')redirect(s,b+'/final-as');else reply(s,metadata());return;}s.writeHead(404).end();});
 const sr=createServer((q,s)=>{record('MCP',q);s.writeHead(401,{'WWW-Authenticate':'Bearer resource_metadata="'+a+'/prm"'}).end();});
 const closed=[];
 try{
  a=await listen(sa);b=await listen(sb);r=await listen(sr);
  const result=await mod.discoverOAuthServerInfo(r+'/mcp',{});
  return {kind,origins:{A:a,B:b,MCP:r},events,result_received:!!result,canary_get:events.some(x=>x.role==='B'&&x.method==='GET'),same_final_get:events.some(x=>x.role==='A'&&x.path==='/final-prm'),closed};
 }finally{
  for(const [role,s]of [['A',sa],['B',sb],['MCP',sr]]){s.closeAllConnections();if(s.listening)await new Promise((ok,no)=>s.close(e=>{closed.push({role,error:e?String(e):null});e?no(e):ok();}));}
 }
}
export async function run(mode){
 if(mode==='f09')return stored();
 if(mode!=='f10')throw Error('Unknown extras mode');
 const trials=[];for(const k of ['prm','as','same'])trials.push(await redirectCase(k));
 const checks=trials.map(x=>({id:x.kind,passed:x.kind==='same'?x.same_final_get&&!x.canary_get:x.canary_get}));
 const complete=trials.every(x=>x.closed.length===3&&x.closed.every(c=>c.error===null));
 return {checks,effects:[{outcome:checks.every(x=>x.passed)?'forbidden':'unknown',property:'cross-origin redirects on first-party discovery reached owned B, same-origin control retained'}],trials,events:trials.flatMap(x=>x.events),completed:complete,forced:false,error:null};
}
