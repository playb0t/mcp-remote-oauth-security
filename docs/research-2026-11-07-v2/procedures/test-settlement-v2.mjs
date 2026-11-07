
import {connect} from 'node:net';
import {createServer} from 'node:http';
import {spawn} from 'node:child_process';
import {writeFileSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import oracle from './auth-destination-v2.cjs';
import settlement from './settle-trace-v2.cjs';
const root=dirname(fileURLToPath(import.meta.url)),results=[];
const full=()=>({client_secret:false,refresh_token:false,device_code:false,code:false,code_verifier:false,access_token:false});
for(const mode of ['allowed-basic','foreign-basic','foreign-body']){
 const events=[];let origin;
 const server=createServer(async(q,s)=>{let raw='';for await(const x of q)raw+=x;const f=full();f.client_secret=raw.includes('client_secret=fixture-only');events.push({type:'request',context_id:'control',address:origin+'/token',method:q.method,authorization_present:!!q.headers.authorization,authorization_scheme:q.headers.authorization?'Basic':null,credential_observation_complete:true,credential_fields:f,fixture_matches:{client_auth:!!q.headers.authorization,client_secret:f.client_secret}});s.end('ok');});
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));origin='http://127.0.0.1:'+server.address().port;
 const expected=mode==='allowed-basic'?origin:'http://127.0.0.1:1';
 const policy={schema_version:2,id:mode,context_id:'control',expected_issuer:expected,receivers:[{issuer:expected,address:expected+'/token',kinds:['client_auth','client_secret'],methods:['POST']}]},pin=oracle.policyHash(policy);
 const code="setTimeout(async()=>{await fetch("+JSON.stringify(origin+'/token')+",{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded',"+(mode==='foreign-body'?"":"'Authorization':'Basic Zml4dHVyZS1vbmx5',")+"},body:"+JSON.stringify(mode==='foreign-body'?'client_secret=fixture-only':'')+"});},150)";
 const child=spawn(process.execPath,['-e',code],{windowsHide:true,stdio:'ignore'});
 const early=settlement.finalize(policy,events,{target_started:true,stimulus_observed:true,server_closes_observed:true,forced_shutdown:false,child_closed:false,servers_closed:false,sealed:false,postclose_quiet:false,pending_handlers:0,observer_errors:0},pin);
 const oldSnapshot=events.every(x=>!x.authorization_present);
 assert.equal(early.verdict,'INCONCLUSIVE');assert.equal(events.length,0);
 await new Promise((ok,no)=>{child.once('error',no);child.once('close',code=>code===0?ok():no(Error('controlchild '+code)));});
 await new Promise(ok=>server.close(ok));
 const final=settlement.finalize(policy,events,{target_started:true,stimulus_observed:true,server_closes_observed:true,forced_shutdown:false,child_closed:true,servers_closed:true,sealed:true,postclose_quiet:true,pending_handlers:0,observer_errors:0},pin);
 const expectedVerdict=mode==='allowed-basic'?'PASS':'FAIL';assert.equal(final.verdict,expectedVerdict);assert.equal(events.length,1);
 for(const state of [{pending_handlers:1},{sealed:false},{observer_errors:1},{server_closes_observed:false},{forced_shutdown:true}]){
  const incomplete=settlement.finalize(policy,events,{target_started:true,stimulus_observed:true,server_closes_observed:true,forced_shutdown:false,child_closed:true,servers_closed:true,sealed:true,postclose_quiet:true,pending_handlers:0,observer_errors:0,...state},pin);assert.equal(incomplete.verdict,'INCONCLUSIVE');
 }
 results.push({mode,early_snapshot_events:0,legacy_early_header_absence:oldSnapshot,early_v2:'INCONCLUSIVE',final_events:events.length,final_verdict:final.verdict,expected:expectedVerdict,incomplete_state_controls:5});
}
// Real listener stopped accepting, but an open response prevents its close callback.
let callback=false,socketOnServer;
const hanging=createServer((q,s)=>{socketOnServer=q.socket;});
await new Promise(ok=>hanging.listen(0,'127.0.0.1',ok));
const socket=connect(hanging.address().port,'127.0.0.1');
await new Promise(ok=>socket.once('connect',ok));socket.write('GET / HTTP/1.1\r\nHost: fixture\r\n\r\n');
const deadline=performance.now()+2000;while(!socketOnServer&&performance.now()<deadline)await new Promise(ok=>setTimeout(ok,5));if(!socketOnServer){socket.destroy();hanging.closeAllConnections();await new Promise(ok=>hanging.close(ok));throw Error('close control HTTP request deadline');}
const closeDone=new Promise(ok=>hanging.close(()=>{callback=true;ok();}));
await new Promise(ok=>setTimeout(ok,50));
assert.equal(hanging.listening,false);assert.equal(callback,false);
const owner='http://127.0.0.1:1',p={schema_version:2,id:'close-timeout',context_id:'control',expected_issuer:owner,receivers:[{issuer:owner,address:owner+'/token',kinds:['client_auth'],methods:['POST']}]},pin=oracle.policyHash(p);
const pre=settlement.finalize(p,[],{target_started:true,stimulus_observed:true,child_closed:true,servers_closed:true,server_closes_observed:false,forced_shutdown:false,sealed:true,postclose_quiet:true,pending_handlers:0,observer_errors:0},pin);
assert.equal(pre.verdict,'INCONCLUSIVE');socket.destroy();socketOnServer.destroy();await closeDone;
const forced=settlement.finalize(p,[],{target_started:true,stimulus_observed:true,child_closed:true,servers_closed:true,server_closes_observed:true,forced_shutdown:true,sealed:true,postclose_quiet:true,pending_handlers:0,observer_errors:0},pin);assert.equal(forced.verdict,'INCONCLUSIVE');

writeFileSync(join(root,'SETTLEMENT-CONTROLS.json'),JSON.stringify({late_HTTP_subprocess_cases:3,barrier_negative_controls:15,real_close_timeout_controls:2,all_passed:true,results},null,2)+'\n');
console.log(JSON.stringify({late_HTTP_cases:3,barrier_negative_controls:15,real_close_timeout_controls:2,all_passed:true}));
