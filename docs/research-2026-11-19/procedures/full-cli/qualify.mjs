import {readFileSync} from 'node:fs';
const raw=JSON.parse(readFileSync(process.argv[2],'utf8'));
const forbidden=raw.security.violations.length>0;
console.log(JSON.stringify({id:raw.id,raw_harness_verdict:raw.security.verdict,channel_verdict:forbidden?'FAIL':'INCONCLUSIVE',body_and_header_observed:true,original_query_observed:false,reason:'Direct forbidden body receipts remain FAIL; missing query observations preclude complete no-credential PASS.'}));
