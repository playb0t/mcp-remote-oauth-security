'use strict';
const ts=require('./typescript_runtime.cjs');
function structure(source,filename){
  const sf=ts.createSourceFile(filename,source,ts.ScriptTarget.Latest,true);
  if(sf.parseDiagnostics.length)throw new Error('AST structure parse gap');
  const signals={metadata:false,network:false,md5_delimited:false};const stack=[sf];
  const str=(n,s)=>n&&(ts.isStringLiteral(n)||ts.isNoSubstitutionTemplateLiteral(n))&&n.text===s;
  const callProp=(n,name)=>ts.isCallExpression(n)&&ts.isPropertyAccessExpression(n.expression)&&n.expression.name.text===name;
  while(stack.length){const n=stack.pop();
    if((ts.isIdentifier(n)||ts.isStringLiteral(n))&&['resource_metadata','resourceMetadataUrl','authorization_servers'].includes(n.text))signals.metadata=true;
    if(ts.isCallExpression(n)){
      const callee=n.expression;
      if((ts.isIdentifier(callee)&&callee.text==='fetch')||(ts.isPropertyAccessExpression(callee)&&['fetch','request'].includes(callee.name.text)))signals.network=true;
      if(callProp(n,'digest')&&str(n.arguments[0],'hex')){
        const update=n.expression.expression;
        if(callProp(update,'update')){
          const join=update.arguments[0],hash=update.expression.expression;
          if(join&&callProp(join,'join')&&str(join.arguments[0],'|')&&ts.isCallExpression(hash)&&str(hash.arguments[0],'md5'))signals.md5_delimited=true;
        }
      }
    }
    ts.forEachChild(n,c=>{stack.push(c);});
  }
  return signals;
}

module.exports={structure};
