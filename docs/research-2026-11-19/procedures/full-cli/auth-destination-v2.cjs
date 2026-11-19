
'use strict';
const crypto=require('node:crypto');
/** @typedef {'PASS'|'FAIL'|'INCONCLUSIVE'} Verdict */
/** @typedef {{address:string,issuer:string,kinds:string[],methods:string[]}} Receiver */
/** @typedef {{schema_version:number,id:string,context_id:string,expected_issuer:string,receivers:Receiver[]}} Policy */
/** @typedef {{type?:string,context_id?:string,address?:string,method?:string,authorization_present?:boolean,authorization_scheme?:string,credential_fields?:Object<string,boolean>,fixture_matches?:Object<string,boolean>,from?:string,to?:string,status?:number}} Event */
const KINDS=new Set(['client_auth','client_secret','refresh_token','device_code','authorization_code','code_verifier','access_token']);
const FIELD_KIND={client_secret:'client_secret',refresh_token:'refresh_token',device_code:'device_code',code:'authorization_code',code_verifier:'code_verifier',access_token:'access_token'};
/** Stable serialization is integrity binding, not operator authentication. */
function stable(v,depth=0){
 if(depth>20)throw Error('policy nesting limit');
 if(Array.isArray(v))return v.map(x=>stable(x,depth+1));
 if(v&&typeof v==='object'){const o=Object.create(null);for(const k of Object.keys(v).sort())o[k]=stable(v[k],depth+1);return o;}
 if(typeof v==='number'&&!Number.isFinite(v))throw Error('nonfinite policy number');
 if(v===null||['string','boolean','number'].includes(typeof v))return v;
 throw Error('unsupported policy value');
}
function policyHash(policy){return crypto.createHash('sha256').update(JSON.stringify(stable(policy))).digest('hex');}
/** Canonical socket-receiver route; query VALUES never enter the audit. */
function address(raw){
 if(typeof raw!=='string'||raw.length>8192)throw Error('invalid address');
 const u=new URL(raw);if(!['http:','https:'].includes(u.protocol)||u.username||u.password||u.hash)throw Error('invalid HTTP destination');
 return {key:u.origin+u.pathname,origin:u.origin,path:u.pathname,query_count:[...u.searchParams.keys()].length,sensitive_query_fields:[...new Set(u.searchParams.keys())].filter(x=>Object.hasOwn(FIELD_KIND,x)).sort()};
}
function issuer(raw){
 const u=new URL(raw);if(!['http:','https:'].includes(u.protocol)||u.username||u.password||u.search||u.hash)throw Error('invalid expected issuer');
 return u.href;
}
function validatePolicy(p,pinned){
 const errors=[];
 if(!p||typeof p!=='object')return ['trusted_policy_missing'];
 try{
  if(p.schema_version!==2||typeof p.id!=='string'||!p.id||typeof p.context_id!=='string'||!p.context_id)errors.push('invalid_policy_identity');
  const owner=issuer(p.expected_issuer);
  if(!Array.isArray(p.receivers)||!p.receivers.length||p.receivers.length>64)errors.push('receiver_list_missing');
  else for(const r of p.receivers){
   const route=address(r.address);
   if(route.query_count)errors.push('policy_receiver_query_not_allowed');
   if(issuer(r.issuer)!==owner)errors.push('receiver_owner_mismatch');
   if(!Array.isArray(r.kinds)||!r.kinds.length||r.kinds.some(k=>!KINDS.has(k)))errors.push('invalid_receiver_kinds');
   if(!Array.isArray(r.methods)||!r.methods.length||r.methods.some(m=>typeof m!=='string'||!/^[A-Z]+$/.test(m)))errors.push('invalid_receiver_methods');
  }
  if(typeof pinned!=='string'||!/^[0-9a-f]{64}$/.test(pinned)||policyHash(p)!==pinned)errors.push('policy_hash_missing_or_changed');
 }catch{errors.push('policy_invalid');}
 return errors;
}
/** @param {Policy|null} trustedPolicy @param {Event[]} events */
function evaluate(trustedPolicy,events,coverage,pinnedHash){
 const errors=validatePolicy(trustedPolicy,pinnedHash),audit=[],violations=[],redirects=[],unknown=[];
 if(errors.length)return {criterion:'oauth-credential-destination-v2',verdict:'INCONCLUSIVE',policy_errors:errors,audit,violations,redirects};
 if(!Array.isArray(events)||events.length>100000)return {criterion:'oauth-credential-destination-v2',verdict:'INCONCLUSIVE',policy_errors:['events_invalid'],audit,violations,redirects};
 const receivers=trustedPolicy.receivers.map(r=>({...r,key:address(r.address).key}));
 for(let i=0;i<events.length;i++){
  const e=events[i];
  if(!e||typeof e!=='object'){unknown.push({event:i,reason:'malformed_event'});continue;}
  if(e.type==='redirect'){
   try{
    const from=address(e.from),to=address(e.to);
    if(!Number.isInteger(e.status)||e.status<300||e.status>399)throw Error('redirect status invalid');
    redirects.push({event:i,from:from.key,to:to.key,status:e.status,cross_origin:from.origin!==to.origin,target_preapproved:receivers.some(r=>r.key===to.key)});
   }catch{unknown.push({event:i,reason:'redirect_address_invalid'});}
   continue;
  }
  if(e.type!=='request'){unknown.push({event:i,reason:'unrecognized_event_type'});continue;}
  let dest;try{dest=address(e.address);}catch{unknown.push({event:i,reason:'request_address_invalid'});continue;}
  const kinds=new Set();
  if(typeof e.authorization_present!=='boolean')unknown.push({event:i,reason:'authorization_presence_unobserved'});
  const method=typeof e.method==='string'&&/^[A-Z]{1,16}$/.test(e.method)?e.method:null;
  if(!method)unknown.push({event:i,reason:'request_method_invalid'});
  const safeScheme=e.authorization_scheme==='Basic'?'Basic':e.authorization_scheme==='Bearer'?'Bearer':'Other';
  if(e.authorization_present){
   if(safeScheme==='Basic')kinds.add('client_auth');
   else if(safeScheme==='Bearer')kinds.add('access_token');
   else kinds.add('authorization_unknown');
  }
  const validFields=e.credential_fields!==null&&typeof e.credential_fields==='object'&&!Array.isArray(e.credential_fields);
  if(e.credential_observation_complete!==true||!validFields)unknown.push({event:i,reason:'credential_observation_incomplete'});
  const fields=validFields?e.credential_fields:{};
  for(const field of Object.keys(FIELD_KIND))if(typeof fields[field]!=='boolean')unknown.push({event:i,reason:'credential_presence_unobserved'});
  for(const [field,kind] of Object.entries(FIELD_KIND)){if(Object.hasOwn(fields,field)&&typeof fields[field]!=='boolean')unknown.push({event:i,reason:'credential_presence_malformed'});if(fields[field]===true)kinds.add(kind);}
  for(const field of dest.sensitive_query_fields)kinds.add(FIELD_KIND[field]);
  const safeMatches={};for(const kind of KINDS)if(typeof e.fixture_matches?.[kind]==='boolean')safeMatches[kind]=e.fixture_matches[kind];
  const record={event:i,recipient:dest.key,query_count:dest.query_count,sensitive_query_fields:dest.sensitive_query_fields,method,authorization_present:e.authorization_present===true,authorization_scheme:e.authorization_present?safeScheme:null,credential_kinds:[...kinds].sort(),expected_issuer:trustedPolicy.expected_issuer,context_id:trustedPolicy.context_id,context_matches_policy:e.context_id===trustedPolicy.context_id,fixture_matches:safeMatches};
  audit.push(record);
  if(!kinds.size)continue;
  if(e.context_id!==trustedPolicy.context_id){unknown.push({event:i,reason:'credential_context_unknown'});continue;}
  for(const kind of kinds){
   const candidates=receivers.filter(r=>r.key===dest.key);
   if(kind==='authorization_unknown'&&candidates.length){unknown.push({event:i,reason:'authorization_kind_unknown'});continue;}
   const allowed=candidates.some(r=>r.kinds.includes(kind)&&r.methods.includes(method));
   if(!allowed)violations.push({event:i,recipient:dest.key,kind,expected_issuer:trustedPolicy.expected_issuer,reason:!candidates.length?'unapproved_credential_recipient':'credential_kind_or_method_not_allowed',known_fixture_match:kind==='client_auth'?e.fixture_matches?.client_auth===true:e.fixture_matches?.[kind]===true});
  }
 }
 for(const r of redirects){
  r.credential_violation_observed_at_target=violations.some(v=>v.event>r.event&&v.recipient===r.to);
  r.request_observed_at_target=audit.some(v=>v.event>r.event&&v.recipient===r.to);
 }
 const healthy=coverage?.target_started===true&&coverage?.observation_complete===true&&coverage?.stimulus_observed===true;
 const verdict=violations.length?'FAIL':(!healthy||unknown.length?'INCONCLUSIVE':'PASS');
 return {criterion:'oauth-credential-destination-v2',verdict,policy_id:trustedPolicy.id,policy_sha256:pinnedHash,expected_issuer:trustedPolicy.expected_issuer,coverage_healthy:healthy,coverage:{target_started:coverage?.target_started===true,observation_complete:coverage?.observation_complete===true,stimulus_observed:coverage?.stimulus_observed===true},unknown,audit,violations,redirects,limits:'PASS applies only to observed credential destination rules. A cross-origin request without credentials is recorded, not called credential disclosure. Policy provenance and observer health are caller responsibilities; hash is not authority.'};
}
/** Fixture-specific completion check; absence of a credential step is not success. */
function scenarioObserved(c,events,driver){
 const req=events.filter(x=>x.type==='request');
 if(c.mode==='sdk'){
  if(driver?.returned!==false)return false;
  if(c.selectB)return driver.error_type==='AuthorizationServerMismatchError'&&req.some(x=>x.role==='B'&&x.path?.startsWith('/.well-known/'))&&!req.some(x=>x.role==='B'&&(x.authorization_present||Object.values(x.credential_fields??{}).some(x=>x===true)));
  return !!c.redirect&&driver.error_type==='OAuthError2'&&/^HTTP 307:/.test(driver.error_message??'')&&events.some(x=>x.type==='redirect'&&x.status===307)&&!req.some(x=>x.role==='B');
 }
 if(!['cli','cli-device'].includes(c.mode))return false;
 const reached=c.requireResource?req.some(x=>x.role==='MCP'&&x.fixture_bearer):req.some(x=>x.path==='/token'||x.path==='/receipt-token');
 return reached&&(!c.redirect||events.some(x=>x.type==='redirect'));
}
module.exports={policyHash,evaluate,address,scenarioObserved};
