const fs=require('fs'),path=require('path'),crypto=require('crypto');
const required=(name)=>{const value=process.env[name];if(!value)throw Error(`Missing ${name}`);return path.resolve(value);};
const ts=require(required('MCP_TYPESCRIPT_MODULE'));
if(ts.version!=='5.9.3')throw Error('Expected trusted TypeScript 5.9.3');
const root=required('MCP_SOURCE_ROOT');
const prior=JSON.parse(fs.readFileSync(process.env.MCP_PRIOR_CONTINUITY?path.resolve(process.env.MCP_PRIOR_CONTINUITY):path.join(__dirname,'baseline-helper-continuity-2026-10-15.json'),'utf8'));
const names=[...prior.functions.map(x=>x.name),'openBrowser','fetchToken','discardIfIssuerMismatch'];let outputs={};
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
for(const version of ['0.15.1','0.15.2','0.16.0']){
 const dir=path.join(root,version,'package/dist');const files=fs.readdirSync(dir).filter(n=>n.endsWith('.js'));
 const candidates=files.filter(n=>fs.readFileSync(path.join(dir,n),'utf8').includes('function parseWWWAuthenticateHeader('));if(candidates.length!==1)throw Error('main bundle ambiguous');
 const file=candidates[0],text=fs.readFileSync(path.join(dir,file),'utf8'),sf=ts.createSourceFile(file,text,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS),functions={};
 function walk(n){if(ts.isFunctionDeclaration(n)&&n.name&&names.includes(n.name.text)){const name=n.name.text;if(functions[name])throw Error('ambiguous '+name);const start=n.getStart(sf),end=n.end,source=n.getText(sf);functions[name]={file,start,end,line:sf.getLineAndCharacterOfPosition(start).line+1,end_line:sf.getLineAndCharacterOfPosition(end).line+1,sha256:sha(source),source};}ts.forEachChild(n,walk);}walk(sf);
 for(const f of prior.functions){if(!functions[f.name])throw Error('missing '+f.name);if(version==='0.15.1'&&functions[f.name].sha256!==f.latest.sha256)throw Error('baseline hash differs '+f.name);}
 outputs[version]={bundle:file,bundle_bytes:Buffer.byteLength(text),bundle_sha256:sha(text),functions};
 fs.writeFileSync(path.join(root,version,'FUNCTIONS.json'),JSON.stringify(functions,null,2)+'\n');
}
let continuity=prior.functions.map(f=>({name:f.name,baseline_sha256:outputs['0.15.1'].functions[f.name].sha256,versions:Object.fromEntries(['0.15.2','0.16.0'].map(v=>[v,{line:outputs[v].functions[f.name].line,sha256:outputs[v].functions[f.name].sha256,identical:outputs[v].functions[f.name].sha256===outputs['0.15.1'].functions[f.name].sha256}]))}));
fs.writeFileSync(path.join(root,'evidence','FUNCTION-CONTINUITY.json'),JSON.stringify({parser:'TypeScript '+ts.version,method:'Parse source as data; FunctionDeclaration.getText; no target imports/evaluation',versions:outputs,continuity},null,2)+'\n');
console.log(JSON.stringify({bundles:Object.fromEntries(Object.entries(outputs).map(([v,o])=>[v,{file:o.bundle,bytes:o.bundle_bytes,sha256:o.bundle_sha256}])),helpers:continuity.map(x=>({name:x.name,identical0152:x.versions['0.15.2'].identical,identical0160:x.versions['0.16.0'].identical}))}));
