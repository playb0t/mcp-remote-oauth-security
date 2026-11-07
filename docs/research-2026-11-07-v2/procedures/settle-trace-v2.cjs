'use strict';
const oracle=require('./auth-destination-v2.cjs');
/** Final evaluation requires immutable post-child, post-handler, post-server evidence. */
function finalize(policy,events,state,pin){
 const missing=[];
 if(state.forced_shutdown!==false)missing.push('forced_shutdown');
 for(const k of ['child_closed','servers_closed','sealed','postclose_quiet','server_closes_observed'])if(state[k]!==true)missing.push(k);
 if(state.pending_handlers!==0)missing.push('pending_handlers');
 if(state.observer_errors!==0)missing.push('observer_errors');
 const coverage={target_started:state.target_started===true,observation_complete:missing.length===0,stimulus_observed:state.stimulus_observed===true};
 if(missing.length)return {criterion:'oauth-credential-destination-v2',verdict:'INCONCLUSIVE',finalization_ready:false,missing_finalization:missing,coverage,audit:[],violations:[],redirects:[]};
 return {...oracle.evaluate(policy,events,coverage,pin),finalization_ready:true};
}
module.exports={finalize};
