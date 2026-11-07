import {readFileSync,writeFileSync,existsSync,unlinkSync} from 'node:fs';
import {resolve,dirname,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const required=(name)=>{const value=process.env[name];if(!value)throw Error(`Missing ${name}`);return resolve(value);};
const root=required('MCP_CASE_ROOT');
const runtime=required('MCP_RUNTIME_ROOT');
const fakeRoot=required('MCP_FAKE_SYSTEMROOT');
if(process.platform!=='win32')throw Error('F08 fake PowerShell recorder procedure requires Windows');
if(!existsSync(join(fakeRoot,'System32','WindowsPowerShell','v1.0','powershell.exe')))throw Error('Compile the recorder source into MCP_FAKE_SYSTEMROOT first');
const results=[];
function provider(){return {inTokenStorm:()=>false,ownsPendingFlow:()=>true,useDeviceCode:false,useClientCredentials:false,getAuthorizationServerMetadata:async()=>({}),applyScope:()=>{},applyAuthorizeParams:()=>{},preflightCachedDynamicClientRegistration:async()=>{},guardAgainstAuthorizationStorm:()=>{}}}
for(const [v,file] of [['0.16.3','chunk-VBHEG6AN.js'],['0.16.4','chunk-DFL3QVEJ.js']]){
 const {NodeOAuthClientProvider}=await import(pathToFileURL(join(runtime,v,'dist',file)).href);
 for(const [id,url] of [['loopback-http','http://127.0.0.1:37331/authorize?state=SYNTHETIC'],['link-local-http','http://169.254.169.254/latest/meta-data?state=SYNTHETIC'],['script-negative','javascript:alert(1)'],['mapped-ipv6-negative','http://[::ffff:127.0.0.1]/authorize']]){
  const capture=join(root,'runs',`F08-${v}-${id}.argv.txt`);if(existsSync(capture))unlinkSync(capture);
  const oldRoot=process.env.SYSTEMROOT,oldOut=process.env.MCP_RECORDER_OUTPUT;process.env.SYSTEMROOT=fakeRoot;process.env.MCP_RECORDER_OUTPUT=capture;
  const keepAlive=setInterval(()=>{},100); let result='returned',error=null;
  try{await NodeOAuthClientProvider.prototype.redirectToAuthorization.call(provider(),new URL(url))}catch(e){result='rejected';error=String(e)}
  finally{clearInterval(keepAlive);if(oldRoot===undefined)delete process.env.SYSTEMROOT;else process.env.SYSTEMROOT=oldRoot;if(oldOut===undefined)delete process.env.MCP_RECORDER_OUTPUT;else process.env.MCP_RECORDER_OUTPUT=oldOut}
  const captured=existsSync(capture)?readFileSync(capture,'utf8'):null;
  const lines=captured?.split(/\r?\n/)??[];const encodedIndex=lines.indexOf('-EncodedCommand');
  const decoded=encodedIndex>=0&&lines[encodedIndex+1]?Buffer.from(lines[encodedIndex+1],'base64').toString('utf16le'):null;
  results.push({version:v,case:id,input:url,result,error,actual_child_recorder_executed:captured!==null,encoded_command_decoded:decoded,recorder_argv:lines});
 }
}
writeFileSync(join(root,'runs','F08-METHOD-RESULTS.json'),JSON.stringify({node:process.version,source:'Unmodified official NodeOAuthClientProvider.redirectToAuthorization/openBrowser + installed sanitizer/open; fake SystemRoot only after Node startup routes package open child spawn to compiled local recorder, no browser/network',results},null,2)+'\n');
for(const x of results)console.log(JSON.stringify({version:x.version,case:x.case,result:x.result,error:x.error,actual_child_recorder_executed:x.actual_child_recorder_executed,encoded_command_decoded:x.encoded_command_decoded}));
