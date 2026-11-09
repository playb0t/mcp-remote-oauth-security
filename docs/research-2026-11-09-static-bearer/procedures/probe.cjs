const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{spawn}=require('node:child_process'),assert=require('node:assert/strict');
const [version,cliArg,outArg]=process.argv.slice(2);assert(version&&cliArg&&outArg,'version cli-entry output-directory required');
const cli=path.resolve(cliArg),out=path.resolve(outArg);fs.mkdirSync(out,{recursive:true});
const TOKEN='SYNTHETIC-251-STATIC-BEARER-ONLY';
const save=(n,v)=>fs.writeFileSync(path.join(out,n),JSON.stringify(v,null,2)+'\n');
const listen=s=>new Promise((ok,no)=>{s.once('error',no);s.listen(0,'127.0.0.1',()=>ok('http://127.0.0.1:'+s.address().port));});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function runCase(name,challenge){
 const events=[];let origin,sinkOrigin,closed=0,forced=false,stdout='',stderr='';
 const record=(role,q,status)=>events.push({seq:events.length+1,at:new Date().toISOString(),role,method:q.method,path:q.url,status,authorization_present:!!q.headers.authorization,authorization_scheme:q.headers.authorization?.split(' ')[0]??null,synthetic_bearer_matches:q.headers.authorization==='Bearer '+TOKEN});
 const json=(s,status,v)=>{s.writeHead(status,{'content-type':'application/json'});s.end(JSON.stringify(v));};
 const sink=http.createServer((q,s)=>{q.resume();
  if(q.url==='/observer-health'){record('controller-health',q,200);return json(s,200,{healthy:true});}
  if(q.url==='/resource-metadata'){record('selected-resource-metadata',q,200);return json(s,200,{resource:origin+'/mcp',authorization_servers:[sinkOrigin]});}
  if(q.url.startsWith('/.well-known/')){record('selected-AS-metadata',q,200);return json(s,200,{issuer:sinkOrigin,authorization_endpoint:sinkOrigin+'/authorize',token_endpoint:sinkOrigin+'/token',response_types_supported:['code'],code_challenge_methods_supported:['S256']});}
  record('unexpected-sink-path',q,400);return json(s,400,{error:'owned-fixture-terminal-refusal'});
 });
 const remote=http.createServer((q,s)=>{q.resume();
  if(q.url==='/mcp'){record('MCP-resource',q,401);s.writeHead(401,challenge?{'WWW-Authenticate':'Bearer resource_metadata="'+sinkOrigin+'/resource-metadata"'}:{'WWW-Authenticate':'Bearer'});return s.end();}
  record('resource-default-metadata',q,404);return json(s,404,{error:'fixture-no-default-metadata'});
 });
 let exit,child;
 try{
  sinkOrigin=await listen(sink);origin=await listen(remote);
  assert((await fetch(sinkOrigin+'/observer-health')).ok);
  const state=path.join(out,'state-'+name);fs.mkdirSync(state,{recursive:true});
  const args=[cli,origin+'/mcp','--allow-http','--header','Authorization: Bearer '+TOKEN];
  const env={PATH:process.env.PATH,SystemRoot:process.env.SystemRoot,WINDIR:process.env.WINDIR,USERPROFILE:state,HOME:state,TEMP:state,TMP:state,MCP_REMOTE_CONFIG_DIR:state};
  child=spawn(process.execPath,args,{env,cwd:state,windowsHide:true,stdio:['pipe','pipe','pipe']});
  child.stdin.on('error',()=>{});
  child.stdout.on('data',b=>stdout+=b.toString());child.stderr.on('data',b=>stderr+=b.toString());
  const done=new Promise((res,rej)=>{child.once('error',rej);child.once('close',(code,signal)=>res({pid:child.pid,code,signal}));});
  child.stdin.write(JSON.stringify({jsonrpc:'2.0',id:1,method:'initialize',params:{protocolVersion:'2025-03-26',capabilities:{},clientInfo:{name:'owned-static-bearer-check',version:'1'}}})+'\n');
  const timer=setTimeout(()=>{forced=true;child.kill();},10000);
  try{exit=await done;}finally{clearTimeout(timer);}
  await sleep(150);
 }finally{
  if(child&&child.exitCode===null&&child.signalCode===null){forced=true;child.kill();}
  for(const server of [remote,sink])if(server.listening)await new Promise((res,rej)=>server.close(e=>{if(e)rej(e);else{closed++;res();}}));
 }
 fs.writeFileSync(path.join(out,name+'.stdout.txt'),stdout.split(TOKEN).join('[SYNTHETIC_BEARER_REDACTED]'));
 fs.writeFileSync(path.join(out,name+'.stderr.txt'),stderr.split(TOKEN).join('[SYNTHETIC_BEARER_REDACTED]'));
 const result={name,challenge,node:process.version,node_executable:process.execPath,cli,cli_sha256:crypto.createHash('sha256').update(fs.readFileSync(cli)).digest('hex'),argv_profile:['proxy.js',origin+'/mcp','--allow-http','--header','Authorization: Bearer [synthetic]'],extra_oauth_flags:[],remote_origin:origin,metadata_origin:sinkOrigin,events,exit,forced,server_close_callbacks:closed,metadata_request_observed:events.some(x=>x.role==='selected-resource-metadata'),AS_metadata_observed:events.some(x=>x.role==='selected-AS-metadata'),bearer_on_MCP_observed:events.some(x=>x.role==='MCP-resource'&&x.synthetic_bearer_matches),bearer_on_selected_metadata_observed:events.some(x=>x.role.startsWith('selected-')&&x.synthetic_bearer_matches),terminal_guard:stderr.includes('dynamic client registration')?'DCR unsupported':null,limits:['Syntheticloopback401, no realWinCCOA/desktop/TLS/login','No registrationendpoint inASfixture, so auth shouldstop beforebrowser','NonzeroCLIexit afterdiscovery is retained separately from requestreceipt']};
 save(name+'.json',result);return result;
}
(async()=>{
 const a=await runCase('bearer-with-resource-metadata',true),b=await runCase('bearer-without-resource-metadata',false);
 const result={schema:'mcp-remote-static-bearer-401-check/1',version,cases:[a,b],profile:'URL --allow-http --header AuthorizationBearer; no extra OAuthflags'};
 save('RESULT.json',result);
 // Qualify execution and preserve either observed outcome; do not assume a leak in another release.
 assert(a.bearer_on_MCP_observed&&b.bearer_on_MCP_observed,'static header stimulus absent');
 assert(!b.metadata_request_observed&&!b.AS_metadata_observed,'negative control touched unadvertised origin');
 assert(!a.forced&&!b.forced&&a.server_close_callbacks===2&&b.server_close_callbacks===2,'capture/cleanup incomplete');
 assert(a.exit&&b.exit&&a.exit.signal===null&&b.exit.signal===null,'missing close event');
 console.log(JSON.stringify({version,cases:[a,b].map(x=>({name:x.name,metadata:x.metadata_request_observed,AS_metadata:x.AS_metadata_observed,bearer_at_selected_metadata:x.bearer_on_selected_metadata_observed,CLI_exit:x.exit,forced:x.forced,server_closes:x.server_close_callbacks,terminal_guard:x.terminal_guard}))}));
})().catch(e=>{save('HARNESS-ERROR.json',{error:String(e),stack:e.stack});console.error(e.stack);process.exitCode=1});
