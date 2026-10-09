// Actual npm proxy CLI launched through stdio; synthetic MCP and canary endpoints only.
import {spawn} from 'node:child_process';
import {createServer} from 'node:http';
import {readFileSync,writeFileSync,appendFileSync,mkdirSync,mkdtempSync,readdirSync,existsSync,rmSync,lstatSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join,dirname,resolve,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const root=dirname(fileURLToPath(import.meta.url));
const baseline=join(root,'../cve-signature-20261009');
const cli=join(baseline,'runtime-install/dist/proxy.js');
for(const name of readdirSync(join(baseline,'runtime-install/dist'))) assert.deepEqual(readFileSync(join(baseline,'runtime-install/dist',name)),readFileSync(join(baseline,'evidence/latest/package/dist',name)));
const events=[];const captures=[];const cases=[];
let mode,remoteOrigin,sinkOrigin;
const listen=s=>new Promise((resolve,reject)=>{s.once('error',reject);s.listen(0,'127.0.0.1',()=>resolve(`http://127.0.0.1:${s.address().port}`));});
const json=(response,body,status=200)=>{response.writeHead(status,{'Content-Type':'application/json'});response.end(JSON.stringify(body));};
const canary=createServer((request,response)=>{
 events.push({case:mode,role:'canary',method:request.method,path:request.url,authorization_present:!!request.headers.authorization});
 if(request.url==='/redirect'){response.writeHead(302,{Location:sinkOrigin+'/resource-metadata'});response.end();return;}
 if(request.url==='/resource-metadata'){
  const body={resource:remoteOrigin+'/mcp',authorization_servers:[sinkOrigin]};captures.push({case:mode,kind:'PRM',body});json(response,body);return;
 }
 const body={issuer:sinkOrigin,authorization_endpoint:sinkOrigin+'/authorize',token_endpoint:sinkOrigin+'/token',response_types_supported:['code'],grant_types_supported:['authorization_code']};captures.push({case:mode,kind:'AS',body});json(response,body);
});
const remote=createServer(async(request,response)=>{
 events.push({case:mode,role:'mock-MCP',method:request.method,path:request.url,authorization_present:!!request.headers.authorization});
 if(request.method==='GET'&&request.url==='/mcp'){
  if(mode==='same-origin-control'){json(response,{status:'fixture'});return;}
  const destination=sinkOrigin+(mode==='header-redirect'?'/redirect':'/resource-metadata');
  const header=`Bearer resource_metadata="${destination}"`;
  captures.push({case:mode,kind:'challenge',header});response.writeHead(401,{'WWW-Authenticate':header});response.end();return;
 }
 if(request.method==='GET'){const body={issuer:remoteOrigin,authorization_endpoint:remoteOrigin+'/authorize',token_endpoint:remoteOrigin+'/token',response_types_supported:['code'],grant_types_supported:['authorization_code']};captures.push({case:mode,kind:'AS',body});json(response,body);return;}
 if(request.method==='POST'&&request.url==='/mcp'){
  const rpcEvent=events.at(-1);
  let raw='';for await(const chunk of request){raw+=chunk;if(raw.length>65536){response.writeHead(413);response.end();return;}}
  let message;try{message=JSON.parse(raw);}catch{response.writeHead(400);response.end();return;}
  rpcEvent.rpc_method=message.method;
  if(message.id===undefined){response.writeHead(202);response.end();return;}
  const result=message.method==='initialize'?{protocolVersion:message.params.protocolVersion,capabilities:{tools:{}},serverInfo:{name:'synthetic-fixture',version:'1'}}:message.method==='tools/list'?{tools:[{name:'fixture_probe',inputSchema:{type:'object',properties:{}}}]}:message.method==='tools/call'?{content:[{type:'text',text:'fixture-ok'}]}:{};
  json(response,{jsonrpc:'2.0',id:message.id,result});return;
 }
 response.writeHead(405);response.end();
});
async function runCase(name){
 mode=name;const start=events.length;const captureStart=captures.length;
 mkdirSync(join(root,'test-state'),{recursive:true});const state=mkdtempSync(join(root,'test-state/stdio-'));
 const env={PATH:process.env.PATH,SystemRoot:process.env.SystemRoot,TEMP:state,TMP:state,USERPROFILE:state,MCP_REMOTE_CONFIG_DIR:state};
 const args=[cli,remoteOrigin+'/mcp','--transport','http-only','--client-credentials','--static-oauth-client-info',JSON.stringify({client_id:'synthetic-client',client_secret:'synthetic-unused-secret'})];
 const child=spawn(process.execPath,args,{env,cwd:root,windowsHide:true,stdio:['pipe','pipe','pipe']});
 let stderr='',buffer='',stdout='';const replies=new Map();const waiting=new Map();let exit;
 child.stderr.on('data',data=>{stderr+=data;});
 child.stdout.on('data',data=>{
  stdout+=data;buffer+=data;let index;
  while((index=buffer.indexOf('\n'))>=0){const line=buffer.slice(0,index);buffer=buffer.slice(index+1);if(!line.trim())continue;let message;try{message=JSON.parse(line);}catch{continue;}replies.set(message.id,message);const callback=waiting.get(message.id);if(callback){waiting.delete(message.id);callback.resolve(message);}}
 });
 child.on('exit',(code,signal)=>{exit={code,signal};for(const waiter of waiting.values())waiter.reject(new Error(`CLI exited early: ${code}; ${stderr.slice(-1500)}`));waiting.clear();});
 const closed=new Promise(resolve=>child.once('close',resolve));
 const request=(id,method,params)=>new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>{waiting.delete(id);reject(new Error(`stdio timeout id=${id}; ${stderr.slice(-1500)}`));},12000);
  waiting.set(id,{resolve:m=>{clearTimeout(timer);resolve(m);},reject:e=>{clearTimeout(timer);reject(e);}});
  child.stdin.write(JSON.stringify({jsonrpc:'2.0',id,method,params})+'\n');
 });
 try{
  const initialized=await request(1,'initialize',{protocolVersion:'2025-11-25',capabilities:{},clientInfo:{name:'evidence-stdio-client',version:'1'}});
  assert.ok(initialized.result);assert.equal(initialized.result.serverInfo.name,'synthetic-fixture');
  child.stdin.write(JSON.stringify({jsonrpc:'2.0',method:'notifications/initialized'})+'\n');
  const tools=await request(2,'tools/list',{});assert.equal(tools.result.tools[0].name,'fixture_probe');
  const call=await request(3,'tools/call',{name:'fixture_probe',arguments:{}});assert.equal(call.result.content[0].text,'fixture-ok');
  const trace=events.slice(start);
  if(name!=='same-origin-control'){
   assert.ok(trace.some(e=>e.role==='canary'&&e.path==='/resource-metadata'));
   assert.ok(trace.some(e=>e.role==='canary'&&e.path==='/.well-known/oauth-authorization-server'));
   if(name==='header-redirect')assert.ok(trace.some(e=>e.path==='/redirect'));
  }else assert.ok(trace.every(e=>e.role==='mock-MCP'));
  assert.ok(trace.every(e=>!e.authorization_present));
  assert.ok(!stderr.includes('ZodError'), 'fixture metadata must satisfy the SDK schema');
  cases.push({name,passed:true,trace,stdio_replies:[initialized,tools,call],captures:captures.slice(captureStart),stderr,child_environment:'Minimal fixture-only environment; no operator credentials inherited',configuration:{transport:'http-only',client_credentials:true,synthetic_client_info:true}});
 }finally{
  child.stdin.end();await Promise.race([closed,new Promise(resolve=>setTimeout(resolve,1500))]);
  if(!exit){child.kill();await Promise.race([closed,new Promise(resolve=>setTimeout(resolve,1500))]);}
  if(cases.at(-1)?.name===name)cases.at(-1).exit=exit;
  const expected=resolve(root,'test-state');const target=resolve(state);if(exit&&target.startsWith(expected+sep)&&/^stdio-[A-Za-z0-9_-]+$/.test(state.split(/[\\/]/).at(-1))&&!lstatSync(state).isSymbolicLink())rmSync(state,{recursive:true,force:false});
 }
}
try{
 sinkOrigin=await listen(canary);remoteOrigin=await listen(remote);
 for(const name of ['header-selected-canary','header-redirect','same-origin-control'])await runCase(name);
 const output={version:'0.14.3',fixture:{mcp_origin:remoteOrigin,canary_origin:sinkOrigin},node:process.version,cli_sha256:createHash('sha256').update(readFileSync(cli)).digest('hex'),cases,scope:'Actual unmodified npm proxy CLI, stdio initialize + tools/list + tools/call, loopback-only fixture. Mock GET issues an auth challenge; mock POST permits synthetic MCP requests. No real OAuth authorization, credentials, cloud endpoint, remote public server or desktop-host UI was tested.'};
 const tracePath=join(root,'logs/raw_trace.log');
 appendFileSync(tracePath, `\n=== stdio execution ${new Date().toISOString()} ===\n` + JSON.stringify({version:output.version,node:output.node,cli_sha256:output.cli_sha256,cases,events,captures},null,2) + '\n', 'utf8');
 const summary={version:output.version,node:output.node,cli_sha256:output.cli_sha256,raw_trace:'logs/raw_trace.log',cases:cases.map(c=>({name:c.name,passed:c.passed,exitCode:c.exit?.code,stdioReplies:c.stdio_replies.length,requestCount:c.trace.length,canaryRequests:c.trace.filter(e=>e.role==='canary').length,schemaErrors:(c.stderr.match(/ZodError/g)||[]).length,authorizationHeadersSent:c.trace.filter(e=>e.authorization_present).length}))};
 const auditPath=join(root,'audit.json');const audit=existsSync(auditPath)?JSON.parse(readFileSync(auditPath,'utf8')):{};audit.phase='verification';audit.stdio=summary;audit.raw_trace='logs/raw_trace.log';writeFileSync(auditPath,JSON.stringify(audit,null,2));
 console.log(JSON.stringify({passed:cases.length,requests:events.length,audit:'audit.json',rawTrace:'logs/raw_trace.log'}));
}catch(error){const tracePath=join(root,'logs/raw_trace.log');appendFileSync(tracePath,`\n=== stdio failure ${new Date().toISOString()} ===\n`+JSON.stringify({error:String(error),events,captures,cases},null,2)+'\n','utf8');const auditPath=join(root,'audit.json');const audit=existsSync(auditPath)?JSON.parse(readFileSync(auditPath,'utf8')):{};audit.phase='verification-error';audit.stdio_error_type=error?.name??'Error';audit.raw_trace='logs/raw_trace.log';writeFileSync(auditPath,JSON.stringify(audit,null,2));throw error;}
finally{for(const server of [remote,canary]){server.closeAllConnections();if(server.listening)await new Promise(resolve=>server.close(resolve));}}
