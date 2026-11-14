
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {policyHash,evaluate}=require('./auth-destination-v2.cjs');
const A='https://issuer-a.example',B='https://other.example',R='https://resource.example';
const policy={schema_version:2,id:'trusted-fixture-policy',context_id:'owner-A',expected_issuer:A,receivers:[
 {issuer:A,address:A+'/token',kinds:['client_auth','client_secret','refresh_token','device_code','authorization_code','code_verifier'],methods:['POST']},
 {issuer:A,address:R+'/mcp',kinds:['access_token'],methods:['GET','POST']}
]};
const healthy={target_started:true,observation_complete:true,stimulus_observed:true};
const request=(address,auth,scheme,fields={})=>({type:'request',context_id:'owner-A',address,method:'POST',authorization_present:auth,authorization_scheme:scheme,credential_observation_complete:true,credential_fields:{client_secret:false,refresh_token:false,device_code:false,code:false,code_verifier:false,access_token:false,...fields},fixture_matches:{}});
const results=[];
function check(id,p,e,expected,coverage=healthy,pin=p?policyHash(p):null){
 const out=evaluate(p,e,coverage,pin);assert.equal(out.verdict,expected,id);results.push({id,expected,observed:out.verdict});return out;
}
const authA=[request(A+'/token',true,'Basic')];
const bodyB=[request(B+'/token',false,null,{client_secret:true})];
check('expected client Authorization allowed',policy,authA,'PASS');
check('foreign Authorization rejected',policy,[request(B+'/token',true,'Basic')],'FAIL');
check('body secret rejected even without Authorization',policy,bodyB,'FAIL');
check('refresh body rejected',policy,[request(B+'/token',false,null,{refresh_token:true})],'FAIL');
check('device code rejected',policy,[request(B+'/token',false,null,{device_code:true})],'FAIL');
check('resource bearer allowed at distinct resource origin',policy,[request(R+'/mcp',true,'Bearer')],'PASS');
check('client authentication cannot be sent to resource receiver',policy,[request(R+'/mcp',true,'Basic')],'FAIL');
check('same issuer origin wrong endpoint rejected',policy,[request(A+'/unapproved',true,'Basic')],'FAIL');
check('unknown issuer does not become green',null,authA,'INCONCLUSIVE');
check('missing positive observation coverage does not become green',policy,[], 'INCONCLUSIVE',{target_started:true,observation_complete:true,stimulus_observed:false});
check('unknown credential context does not become green',policy,[{...request(A+'/token',true,'Basic'),context_id:'unclassified'}],'INCONCLUSIVE');
check('unknown Authorization kind not silently accepted',policy,[request(A+'/token',true,'Other')],'INCONCLUSIVE');
const delegated=JSON.parse(JSON.stringify(policy));delegated.receivers.push({issuer:A,address:B+'/token',kinds:['client_secret'],methods:['POST']});
check('trusted issuer may explicitly delegate token endpoint to other origin',delegated,bodyB,'PASS');
check('changed receiver policy after pinned config is rejected',delegated,bodyB,'INCONCLUSIVE',healthy,policyHash(policy));
const redirects=[{type:'redirect',from:A+'/token',to:B+'/token',status:307},...bodyB];
const rd=check('redirect transfer detected from actual final receipt',policy,redirects,'FAIL');assert.ok(rd.redirects[0].credential_violation_observed_at_target);
check('redirect blocked or stripped without credential receipt is not called disclosure',policy,[{type:'redirect',from:A+'/token',to:B+'/token',status:307},request(B+'/token',false,null)],'PASS');
const marker='UNIT-SENSITIVE-NOT-FOR-AUDIT';
const auditSafe=check('unrelated event metadata is not copied',policy,[{...request(A+'/token',true,'Basic'),fixture_matches:{client_auth:true,raw_secret:marker}}],'PASS');
assert.ok(!JSON.stringify(auditSafe).includes(marker));
const unknownScheme=check('malformed scheme is not echoed',policy,[request(A+'/token',true,'Basic '+marker)],'INCONCLUSIVE');assert.ok(!JSON.stringify(unknownScheme).includes(marker));
const querySafe=check('query value omitted from address audit',policy,[request(A+'/token?client_secret='+marker,false,null)],'PASS');assert.ok(!JSON.stringify(querySafe).includes(marker));
check('malformed credential-presence field cannot become green',policy,[request(A+'/token',false,null,{client_secret:'invalid-field'})],'INCONCLUSIVE');
check('unknown event schema cannot become green',policy,[{address:A+'/token',authorization_present:false}],'INCONCLUSIVE');

for(const fields of [undefined,null,'unobserved',[],{}]){
 const e=request(A+'/token',false,null);e.credential_fields=fields;
 check('missing or malformed credential observation '+String(fields),policy,[e],'INCONCLUSIVE');
}
check('explicit incomplete credential observation cannot become green',policy,[{...request(A+'/token',false,null),credential_observation_complete:false}],'INCONCLUSIVE');
check('client secret sent to MCP body is detected',policy,[request(R+'/mcp',false,null,{client_secret:true})],'FAIL');

const {scenarioObserved}=require('./auth-destination-v2.cjs');
for(const [id,c,events,driver,expected]of [
 ['discovery alone not CLI completion',{mode:'cli'},[{type:'request',role:'MCP',path:'/mcp'},{type:'request',role:'A',path:'/prm'}],null,false],
 ['token receipt reaches CLI stimulus',{mode:'cli'},[{type:'request',role:'A',path:'/token'}],null,true],
 ['redirect stimulus requires actual redirect',{mode:'cli',redirect:307},[{type:'request',role:'A',path:'/token'}],null,false],
 ['resource control requires bearer receipt',{mode:'cli-device',requireResource:true},[{type:'request',role:'MCP',path:'/mcp',fixture_bearer:false}],null,false],
 ['SDK unrelated error not guarded completion',{mode:'sdk',selectB:true},[],{returned:false,error_type:'TypeError'},false],
 ['SDK owner mismatch guard recognized',{mode:'sdk',selectB:true},[{type:'request',role:'B',path:'/.well-known/oauth-authorization-server',credential_fields:{}}],{returned:false,error_type:'AuthorizationServerMismatchError'},true],
 ['SDK redirect refusal requires observed redirect',{mode:'sdk',redirect:307},[{type:'redirect',status:307}],{returned:false,error_type:'OAuthError2',error_message:'HTTP 307: fixture'},true]
]){
 const observed=scenarioObserved(c,events,driver);assert.equal(observed,expected,id);results.push({id,expected,observed});
}

const oldExpected=authA.every(e=>!e.authorization_present),oldBody=bodyB.every(e=>!e.authorization_present);
assert.equal(oldExpected,false);assert.equal(oldBody,true);
fs.writeFileSync(path.join(__dirname,'UNIT-RESULTS.json'),JSON.stringify({tests:results.length,all_passed:true,old_criterion_counterexamples:{expected_A_Authorization_old_result:oldExpected,foreign_body_secret_old_result:oldBody},results},null,2)+'\n');
console.log(JSON.stringify({tests:results.length,all_passed:true,old_false_positive_and_false_negative_demonstrated:true}));
