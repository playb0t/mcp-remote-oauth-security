// Filesystem preparation only: copies verified dist bytes; never imports target code.
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const [sourceArg,runtimeArg,...versions]=process.argv.slice(2);
assert.ok(sourceArg&&runtimeArg&&versions.length,'Usage: node prepare_runtime.cjs SOURCE_ROOT RUNTIME_ROOT VERSION...');
const sourceRoot=path.resolve(sourceArg),runtimeRoot=path.resolve(runtimeArg);
for(const version of versions){
 assert.ok(['0.14.3','0.15.1','0.15.2','0.16.0','0.16.3','0.16.4'].includes(version),'Unsupported package version');
 const src=path.join(sourceRoot,version,'package','dist');
 const dest=path.join(runtimeRoot,version);
 assert.ok(fs.statSync(src).isDirectory(),'Missing extracted package/dist');
 assert.ok(!fs.existsSync(dest),'Refuse to overwrite a runtime version directory');
 const names=fs.readdirSync(src);
 for(const name of names){
  assert.equal(path.basename(name),name);
  const info=fs.lstatSync(path.join(src,name));
  assert.ok(info.isFile()&&!info.isSymbolicLink(),'Only regular dist files are accepted');
 }
 fs.mkdirSync(path.join(dest,'dist'),{recursive:true});
 fs.writeFileSync(path.join(dest,'package.json'),JSON.stringify({private:true,type:'module'})+'\n');
 for(const name of names){
  const data=fs.readFileSync(path.join(src,name));
  fs.writeFileSync(path.join(dest,'dist',name),data,{flag:'wx'});
  assert.deepEqual(fs.readFileSync(path.join(dest,'dist',name)),data);
 }
 console.log(JSON.stringify({version,dist_files:names.length,byte_equal:true,target_executed:false}));
}
