import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import oracle from './auth-destination-v2.cjs';
const root=resolve(process.env.MCP_SECURITY_INPUTS??join(dirname(fileURLToPath(import.meta.url)),'inputs'));
const cases=JSON.parse(readFileSync(join(root,'cases.json'),'utf8'));
if(!process.env.MCP_DETECTOR_OUTPUT)throw Error('MCP_DETECTOR_OUTPUT required');
const output=resolve(process.env.MCP_DETECTOR_OUTPUT);mkdirSync(output,{recursive:false});
for(const c of cases){
 const policy=JSON.parse(readFileSync(join(root,'policies',c.id+'.json'),'utf8'));
 const a=policy.expected_issuer,b='http://127.0.0.1:'+(c.portBase+1);
 for(const [kind,expected]of [['positive','PASS'],['negative','FAIL'],['fault','INCONCLUSIVE']]){
  const fields=Object.fromEntries(['client_secret','refresh_token','device_code','code','code_verifier','access_token'].map(k=>[k,k==='client_secret'&&kind==='negative']));
  const events=[{type:'request',address:(kind==='negative'?b:a)+'/token',method:'POST',context_id:'fixture-owner-A',authorization_present:kind!=='negative',authorization_scheme:kind==='negative'?null:'Basic',credential_fields:fields,credential_observation_complete:kind!=='fault',fixture_matches:{client_auth:kind!=='negative',client_secret:kind==='negative'}}];
  const coverage={target_started:true,observation_complete:true,stimulus_observed:true};
  const security=oracle.evaluate(policy,events,coverage,oracle.policyHash(policy));
  if(security.verdict!==expected)throw Error('Detector failed '+c.id+'-'+kind);
  const raw={id:c.id+'-'+kind,detector_only:true,events,security,coverage,effect_outcome:kind==='positive'?'allowed':kind==='negative'?'forbidden':'unknown'};
  writeFileSync(join(output,raw.id+'.json'),JSON.stringify(raw,null,2)+'\n');
 }
}
console.log(JSON.stringify({detector_controls:cases.length*3,expectations_met:true,target_runs:0}));
