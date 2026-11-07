
'use strict';
// Parse verified distributions as data; never imports target JavaScript.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const [parserArg,baseArg,nextArg,outArg]=process.argv.slice(2);
assert.ok(parserArg&&baseArg&&nextArg&&outArg,'Usage: node compare_distribution.cjs TRUSTED_TYPESCRIPT BASE_ROOT NEXT_ROOT OUTPUT');
const ts=require(path.resolve(parserArg));assert.equal(ts.version,'5.9.3');
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
function normalize(s){const sc=ts.createScanner(ts.ScriptTarget.Latest,true,ts.LanguageVariant.Standard,s),out=[];for(let k=sc.scan();k!==ts.SyntaxKind.EndOfFileToken;k=sc.scan())out.push([k,k===ts.SyntaxKind.Identifier?sc.getTokenText().replace(/\d+$/,''):sc.getTokenText()]);return JSON.stringify(out);}
const names=['getServerUrlHash','discoverOAuthProtectedResourceMetadata','discoverAuthorizationServerMetadata','selectResourceURL','setupOAuthCallbackServerWithLongPoll'];
function inspect(arg){
 const root=path.resolve(arg),dir=path.join(root,'package/dist'),files=fs.readdirSync(dir);
 const main=files.filter(n=>n.endsWith('.js')&&fs.readFileSync(path.join(dir,n),'utf8').includes('function parseWWWAuthenticateHeader('));assert.equal(main.length,1);
 const text=fs.readFileSync(path.join(dir,main[0]),'utf8'),sf=ts.createSourceFile(main[0],text,ts.ScriptTarget.Latest,true),functions={};assert.equal(sf.parseDiagnostics.length,0);
 function visit(n){if(ts.isFunctionDeclaration(n)&&names.includes(n.name?.text)){
  assert.equal(functions[n.name.text],undefined);const source=n.getText(sf);functions[n.name.text]={line:sf.getLineAndCharacterOfPosition(n.getStart(sf)).line+1,sha256:sha(source),identifier_suffix_normalized_sha256:sha(normalize(source))};
 }ts.forEachChild(n,visit);}visit(sf);for(const n of names)assert.ok(functions[n],n);
 const headers=[...text.matchAll(/^\/\/ ((?:node_modules\/|src\/)[^\r\n]+|package\.json)/gm)],sdk={};
 for(let i=0;i<headers.length;i++){
  const h=headers[i][1];if(!/@modelcontextprotocol(?:\+|\/)(?:client|core)(?:@|\/)/.test(h))continue;
  const key=h.replace(/^node_modules\/\.pnpm\/[^/]+\/node_modules\//,'node_modules/'),source=text.slice(headers[i].index,i+1<headers.length?headers[i+1].index:text.length);
  assert.equal(sdk[key],undefined);sdk[key]={sha256:sha(source),identifier_suffix_normalized_sha256:sha(normalize(source))};
 }
 return {version:JSON.parse(fs.readFileSync(path.join(root,'package/package.json'),'utf8')).version,main_bundle:main[0],main_sha256:sha(text),proxy_sha256:sha(fs.readFileSync(path.join(dir,'proxy.js'))),client_marker_count:headers.filter(h=>/@modelcontextprotocol(?:\+|\/)client(?:@|\/)/.test(h[1])).length,functions,sdk_sections:sdk};
}
const a=inspect(baseArg),b=inspect(nextArg);
const helpers=names.map(name=>({name,baseline:a.functions[name],candidate:b.functions[name],raw_equal:a.functions[name].sha256===b.functions[name].sha256,identifier_suffix_normalized_equal:a.functions[name].identifier_suffix_normalized_sha256===b.functions[name].identifier_suffix_normalized_sha256}));
const sdk=[...new Set([...Object.keys(a.sdk_sections),...Object.keys(b.sdk_sections)])].sort().map(section=>({section,baseline:a.sdk_sections[section]??null,candidate:b.sdk_sections[section]??null,raw_equal:!!a.sdk_sections[section]&&!!b.sdk_sections[section]&&a.sdk_sections[section].sha256===b.sdk_sections[section].sha256,identifier_suffix_normalized_equal:!!a.sdk_sections[section]&&!!b.sdk_sections[section]&&a.sdk_sections[section].identifier_suffix_normalized_sha256===b.sdk_sections[section].identifier_suffix_normalized_sha256}));
const result={schema_version:1,scope:'Source/distribution parsing only; original five-record runtime procedure not executed on candidate',baseline:a.version,version:b.version,baseline_summary:{main_bundle:a.main_bundle,main_sha256:a.main_sha256,proxy_sha256:a.proxy_sha256,client_marker_count:a.client_marker_count},candidate_summary:{main_bundle:b.main_bundle,main_sha256:b.main_sha256,proxy_sha256:b.proxy_sha256,client_marker_count:b.client_marker_count},five_helpers:helpers,sdk_sections:sdk,all_five_helpers_equal_after_labeled_normalization:helpers.every(x=>x.identifier_suffix_normalized_equal),all_compared_sdk_sections_equal_after_labeled_normalization:sdk.length>0&&sdk.every(x=>x.identifier_suffix_normalized_equal),limits:'Identifier suffix normalization is not whole-program equivalence; SDK version/source-lock and section identity are separate fields.'};
fs.writeFileSync(path.resolve(outArg),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({baseline:a.version,candidate:b.version,helpers_equal:result.all_five_helpers_equal_after_labeled_normalization,sdk_sections:sdk.length,sdk_sections_equal:result.all_compared_sdk_sections_equal_after_labeled_normalization,markers:[a.client_marker_count,b.client_marker_count],proxy:b.proxy_sha256}));
