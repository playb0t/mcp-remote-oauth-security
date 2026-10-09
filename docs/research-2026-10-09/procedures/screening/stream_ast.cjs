'use strict';
// Bounded-memory fingerprints. Scanned JS is parsed as data, never loaded as a module.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {performance}=require('node:perf_hooks');
const ts=require('./typescript_runtime.cjs');
if(ts.version!=='5.9.3')throw new Error('Pinned parser mismatch');
const sha=raw=>crypto.createHash('sha256').update(raw).digest('hex');
const referenceFile=path.resolve(__dirname,'references/baseline-reference-functions.json');
const references=JSON.parse(fs.readFileSync(referenceFile,'utf8'));
const universe=new Map();
for(let i=0;i<references.length;i++){
  const r=references[i],counts=new Map();
  for(let j=0;j<=r.tokens.length-5;j++){const k=JSON.stringify(r.tokens.slice(j,j+5));counts.set(k,(counts.get(k)||0)+1);}
  r.total=Math.max(0,r.tokens.length-4);r.grams=counts;
  for(const [key,count]of counts){if(!universe.has(key))universe.set(key,[]);universe.get(key).push([i,count]);}
}

function analyze(source,filename,{allDigests=true}={}){
  filename=filename.replace(/\\/g,'/');
  const t0=performance.now();
  const sf=ts.createSourceFile(filename,source,ts.ScriptTarget.Latest,true);
  const parseMs=performance.now()-t0;
  if(sf.parseDiagnostics.length)return {status:'syntax-gap',parse_ms:parseMs,diagnostics:sf.parseDiagnostics.map(d=>({code:d.code,start:d.start,message:ts.flattenDiagnosticMessageText(d.messageText,' ')}))};
  const host={getSourceFile:n=>n===filename?sf:undefined,getDefaultLibFileName:()=>'',writeFile:()=>{},getCurrentDirectory:()=>'',getDirectories:()=>[],
    fileExists:n=>n===filename,readFile:n=>n===filename?source:undefined,getCanonicalFileName:n=>n,useCaseSensitiveFileNames:()=>true,getNewLine:()=> '\n'};
  const bindStart=performance.now();
  const program=ts.createProgram([filename],{noResolve:true,noLib:true,allowJs:true,target:ts.ScriptTarget.Latest},host);
  const checker=program.getTypeChecker();
  const bindMs=performance.now()-bindStart;
  const normalizationStart=performance.now();
  const output=[];let maxScore=0,functionCount=0,largestFunction=0;
  const isFunction=n=>(ts.isFunctionDeclaration(n)||ts.isFunctionExpression(n)||ts.isArrowFunction(n)||ts.isMethodDeclaration(n))&&n.body;
  function one(fn){
    const ids=new Map(),hash=crypto.createHash('sha256'),window=[],seenGrams=new Map(),matched=new Array(references.length).fill(0);
    let tokenCount=0;hash.update('[');
    function emit(token){
      if(tokenCount)hash.update(',');hash.update(JSON.stringify(token));tokenCount++;
      window.push(token);if(window.length>5)window.shift();
      if(window.length===5){const key=JSON.stringify(window),refs=universe.get(key);if(refs){const old=seenGrams.get(key)||0;
        let cap=0;for(const [index,count]of refs){if(old<count)matched[index]++;cap=Math.max(cap,count);}if(old<cap)seenGrams.set(key,old+1);}}
    }
    function binding(n){const sym=checker.getSymbolAtLocation(n);if(!sym)return 'global:'+n.text;if(!ids.has(sym))ids.set(sym,ids.size);return 'id:'+ids.get(sym);}
    function property(n){const p=n.parent;return p&&((ts.isPropertyAccessExpression(p)&&p.name===n)||((ts.isPropertyAssignment(p)||ts.isMethodDeclaration(p)||ts.isPropertyDeclaration(p))&&p.name===n));}
    function visit(root){
      const stack=[root];
      while(stack.length){let n=stack.pop();if(typeof n==='string'){emit(n);continue;}
        if(ts.isTypeNode(n))continue;
        if(ts.isParenthesizedExpression(n)||ts.isAsExpression(n)||ts.isTypeAssertionExpression(n)||ts.isNonNullExpression(n)){stack.push(n.expression);continue;}
        if(ts.isShorthandPropertyAssignment(n)){emit('(ShorthandPropertyAssignment');emit('property:'+n.name.text);emit(binding(n.name));stack.push(')');if(n.objectAssignmentInitializer)stack.push(n.objectAssignmentInitializer);continue;}
        if(ts.isIdentifier(n)){emit(property(n)?'property:'+n.text:binding(n));continue;}
        if(ts.isStringLiteral(n)||ts.isNoSubstitutionTemplateLiteral(n)){emit('string:'+n.text);continue;}
        if(ts.isNumericLiteral(n)){emit('number:'+Number(n.text));continue;}
        if(ts.isRegularExpressionLiteral(n)){emit('regex:'+n.text);continue;}
        if(ts.isTemplateHead(n)||ts.isTemplateMiddle(n)||ts.isTemplateTail(n)){emit('template:'+n.kind+':'+n.text);continue;}
        emit('('+ts.SyntaxKind[n.kind]);const children=[];ts.forEachChild(n,c=>{children.push(c);});stack.push(')');for(let i=children.length-1;i>=0;i--)stack.push(children[i]);
      }
    }
    emit(fn.modifiers?.some(m=>m.kind===ts.SyntaxKind.AsyncKeyword)?'async':'sync');emit(fn.asteriskToken?'generator':'ordinary');
    fn.parameters.forEach(visit);visit(fn.body);hash.update(']');
    const grams=Math.max(0,tokenCount-4),scores=matched.map((m,i)=>2*m/(grams+references[i].total));
    const score=Math.max(...scores);maxScore=Math.max(maxScore,score);
    const i=scores.indexOf(score),name=fn.name?.text||(ts.isVariableDeclaration(fn.parent)?fn.parent.name.getText(sf):'<anonymous>');
    return {name,line:sf.getLineAndCharacterOfPosition(fn.getStart(sf)).line+1,end_line:sf.getLineAndCharacterOfPosition(fn.end).line+1,
      source_span_utf16:fn.end-fn.getStart(sf),tokens:tokenCount,fingerprint:hash.digest('hex'),best_similarity:score,
      best_reference:references[i]?.name,match:score>0.85?{baseline_symbol:references[i].name,family:references[i].family,similarity:score}:null};
  }
  const stack=[sf];
  while(stack.length){const n=stack.pop();if(isFunction(n)){const result=one(n);functionCount++;largestFunction=Math.max(largestFunction,result.source_span_utf16);if(allDigests||result.match)output.push(result);}
    const children=[];ts.forEachChild(n,c=>{children.push(c);});for(let i=children.length-1;i>=0;i--)stack.push(children[i]);}
  return {status:'complete',parse_ms:parseMs,binding_ms:bindMs,normalization_ms:performance.now()-normalizationStart,
    function_count:functionCount,largest_function_utf16:largestFunction,best_similarity:maxScore,functions:output};
}

module.exports={analyze};
