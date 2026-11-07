import {createServer} from 'node:http';
import {writeFileSync} from 'node:fs';
import {resolve,dirname,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const required=(name)=>{const value=process.env[name];if(!value)throw Error(`Missing ${name}`);return resolve(value);};
const root=required('MCP_CASE_ROOT');
const runtime=required('MCP_RUNTIME_ROOT');
const listen=(s)=>new Promise((ok,no)=>{s.once('error',no);s.listen(0,'127.0.0.1',()=>ok(`http://127.0.0.1:${s.address().port}`));});
async function caseRun(connect,version,mode){
 const events=[];let resourceOrigin,canaryOrigin;const token='SYNTHETIC-F11-'+version;
 const record=(role,q)=>events.push({role,method:q.method,path:q.url,authorization_present:!!q.headers.authorization,synthetic_bearer_received:q.headers.authorization===`Bearer ${token}`});
 const serveSSE=(s,endpoint)=>{s.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache','Connection':'keep-alive'});s.write(`event: endpoint\ndata: ${endpoint}\n\n`);};
 const canary=createServer((q,s)=>{record('canary',q);if(q.url==='/sse'){serveSSE(s,'/messages');return}s.writeHead(404).end()});
 const resource=createServer((q,s)=>{record('resource',q);if(q.url==='/sse'){
  if(mode==='redirect-cross'){s.writeHead(302,{Location:canaryOrigin+'/sse'}).end();return}
  if(mode==='redirect-same'){s.writeHead(302,{Location:resourceOrigin+'/stream'}).end();return}
  serveSSE(s,mode==='endpoint-cross'?canaryOrigin+'/messages':'/messages');return
 }if(q.url==='/stream'){serveSSE(s,'/messages');return}s.writeHead(404).end()});
 canaryOrigin=await listen(canary);resourceOrigin=await listen(resource);
 const provider={tokens:async()=>mode==='no-token'?undefined:{access_token:token},token:async()=>mode==='no-token'?undefined:token};
 let result='pending',error=null,transport=null;
 try{
  transport=await Promise.race([connect(null,resourceOrigin+'/sse',provider,{},async()=>{throw Error('Unexpected auth initializer')},'sse-only'),new Promise((_,reject)=>setTimeout(()=>reject(Error('connection timeout')),6000))]);result='connected';
 }catch(e){result='rejected';error=String(e)}
 finally{try{await transport?.close?.()}catch{};for(const server of [resource,canary]){server.closeAllConnections();await new Promise(ok=>server.close(ok))}}
 return {version,mode,resource_origin:resourceOrigin,canary_origin:canaryOrigin,result,error,events};
}
const all=[];
for(const [v,file] of [['0.16.3','chunk-VBHEG6AN.js'],['0.16.4','chunk-DFL3QVEJ.js'],['0.16.5','chunk-EL3EX2HH.js']]){
 const mod=await import(pathToFileURL(join(runtime,v,'dist',file)).href);assert.equal(typeof mod.connectToRemoteServer,'function');
 for(const mode of ['redirect-cross','redirect-same','endpoint-cross','no-token'])all.push(await caseRun(mod.connectToRemoteServer,v,mode));
}
const output={node:process.version,scope:'Actual published bundle connectToRemoteServer + bundled SSEClientTransport/EventSource + installed dependencies; synthetic provider and loopback servers.',results:all};
writeFileSync(join(root,'runs','F11-RESULTS.json'),JSON.stringify(output,null,2)+'\n');
for(const r of all)console.log(JSON.stringify({version:r.version,mode:r.mode,result:r.result,error:r.error,events:r.events}));
