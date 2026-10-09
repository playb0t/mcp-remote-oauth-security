"use strict";
// Static fixture checks. None of the fixture functions is called or imported.
const assert = require("node:assert/strict"), fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const {analyze}=require("./stream_ast.cjs"), {evaluate,run,sourcePath}=require("./candidate_filter.cjs");
const sha=raw=>crypto.createHash("sha256").update(raw).digest("hex");
const output=path.resolve(process.argv[2] || "out-controls");
fs.mkdirSync(output,{recursive:true});
const checks=[];
function check(id, fn) {fn();checks.push({id,passed:true});}
for (const invalidProfile of ["constructor", "toString", "__proto__", "corproate"]) {
 check("evaluate-rejects-profile:"+invalidProfile,()=>assert.throws(
  ()=>evaluate("function f(x){return x;}","invalid-profile.js",invalidProfile), /Unknown screening profile/));
 check("manifest-gate-rejects-profile:"+invalidProfile,()=>assert.throws(
  ()=>run("unused-manifest.json","unused-output.json",invalidProfile), /Profile must be corporate or marketplace/));
}
check("bound-local-rename-invariance",()=>{
 const a=analyze("function a(x){const y=x;return y;}","a.js");
 const b=analyze("function b(q){const z=q;return z;}","b.js");
 assert.equal(a.functions[0].fingerprint,b.functions[0].fingerprint);
});
check("selected-reference-exact-match",()=>{
 const r=analyze(fs.readFileSync(path.join(__dirname,"controls/reference-hash.js"),"utf8"),"reference-hash.js");
 const f=r.functions.find(f=>f.name==="getServerUrlHash");
 const ref=require("./references/baseline-reference-functions.json").find(f=>f.name==="getServerUrlHash");
 assert.equal(f.fingerprint,ref.fingerprint);assert.equal(f.best_similarity,1);
});
check("reference-token-digests",()=>{
 for(const ref of require("./references/baseline-reference-functions.json"))
  assert.equal(sha(JSON.stringify(ref.tokens)),ref.fingerprint);
});
check("negative-prefilter",()=>assert.equal(evaluate(fs.readFileSync(path.join(__dirname,"controls/negative.js"),"utf8"),"negative.js","corporate").status,"AST_NOT_SELECTED"));
check("corporate-marketplace-threshold-separation",()=>{
 const text=fs.readFileSync(path.join(__dirname,"controls/threshold-boundary.js"),"utf8");
 const corporate=evaluate(text,"threshold-boundary.js","corporate");
 const marketplace=evaluate(text,"threshold-boundary.js","marketplace");
 assert.ok(corporate.best_similarity>0.80 && corporate.best_similarity<=0.85);
 assert.equal(corporate.status,"AST_NOT_SELECTED");
 assert.equal(marketplace.status,"CANDIDATE");
 assert.deepEqual(marketplace.reasons,["normalized-lineage-above-threshold"]);
});
check("malformed-is-unresolved",()=>assert.equal(evaluate("function (","bad.js","corporate").status,"UNRESOLVED"));
check("path-traversal-rejected",()=>assert.throws(()=>sourcePath(__dirname,"../../README.md")));
const files=["hash.js","metadata.js","reference-hash.js","negative.js","malformed.js.txt"].map(name=>({
 artifact:{kind:"synthetic-control",name:"research-screening-controls",version:"r3"},
 path:"controls/"+name,member:name,sha256:sha(fs.readFileSync(path.join(__dirname,"controls",name)))}));
const manifest={schema_version:1,files};
const manifestPath=path.join(__dirname,"controls-manifest.json");
assert.deepEqual(JSON.parse(fs.readFileSync(manifestPath,"utf8")), manifest);
for(const profile of ["corporate","marketplace"]){
 const r=run(manifestPath,path.join(output,"plan-"+profile+".json"),profile);
 check(profile+"-counts",()=>assert.deepEqual(r.counts,{total:5,candidates:3,not_selected:1,unresolved:1}));
 check(profile+"-unclassified",()=>assert.ok(r.files.every(f=>f.classification===null)));
}
const result={schema_version:1,passed:true,checks,parser:"typescript@5.9.3",inputs_executed:false,
 control_scope:"five-file pipeline plus a threshold-boundary fixture, local renaming, reference token digests and traversal rejection"};
fs.writeFileSync(path.join(output,"ast-controls.json"),JSON.stringify(result,null,2)+"\n");
console.log(JSON.stringify({passed:true,checks:checks.length,controls:files.length}));
