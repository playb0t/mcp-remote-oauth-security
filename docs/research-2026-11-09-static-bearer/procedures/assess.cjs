'use strict';
function assess(c){
 if(!c||!Array.isArray(c.events)||!c.exit||!Number.isInteger(c.exit.code)||c.exit.signal!==null||c.forced!==false||c.server_close_callbacks!==2)return {outcome:'unknown',healthy:false};
 const e=c.events;if(!e.some(x=>x.role==='controller-health'&&x.status===200)||!e.some(x=>x.role==='MCP-resource'&&x.status===401&&x.synthetic_bearer_matches===true))return {outcome:'unknown',healthy:false};
 for(let i=0;i<e.length;i++)if(e[i].seq!==i+1||typeof e[i].authorization_present!=='boolean'||typeof e[i].synthetic_bearer_matches!=='boolean')return {outcome:'unknown',healthy:false};
 const selected=e.filter(x=>x.role==='selected-resource-metadata'||x.role==='selected-AS-metadata');
 if(selected.some(x=>x.synthetic_bearer_matches&&(!x.authorization_present||x.authorization_scheme!=='Bearer')))return {outcome:'unknown',healthy:false};
 return {outcome:selected.some(x=>x.synthetic_bearer_matches)?'forbidden':'none',healthy:true,metadata_requests:selected.length,bearer_receipts:selected.filter(x=>x.synthetic_bearer_matches).length};
}
function qualify(actual){
 const chosen=structuredClone(actual);
 const positive=structuredClone(actual);positive.events=positive.events.filter(x=>!x.role.startsWith('selected-')).map((x,i)=>({...x,seq:i+1}));
 const fault=structuredClone(actual);delete fault.events[0].synthetic_bearer_matches;
 return {positive:assess(positive),negative:assess(chosen),fault:assess(fault)};
}
module.exports={assess,qualify};
