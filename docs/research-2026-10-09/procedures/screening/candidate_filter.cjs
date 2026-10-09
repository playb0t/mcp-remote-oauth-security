'use strict';
/** Portable adapter for the historical corporate and Marketplace candidate gates. */
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const {analyze} = require('./stream_ast.cjs');
const {structure} = require('./structure.cjs');
const sha = raw => crypto.createHash('sha256').update(raw).digest('hex');
const PROFILES = Object.freeze({corporate: 0.85, marketplace: 0.80});
/** @param {string} source @param {string} filename @param {'corporate'|'marketplace'} profile */
function evaluate(source, filename, profile) {
  if (!(Object.hasOwn(PROFILES, profile))) throw new Error('Unknown screening profile');
  const ast = analyze(source, filename, {allDigests: true});
  if (ast.status !== 'complete') return {status:'UNRESOLVED', completeness:'incomplete',
    ast_status:ast.status, reasons:['ast-gap'], diagnostics:ast.diagnostics || [], classification:null};
  const threshold = PROFILES[profile];
  const refs = require('./references/baseline-reference-functions.json');
  const matches = ast.functions.filter(f => f.best_similarity > threshold).map(f => ({
    candidate_symbol:f.name, line:f.line, end_line:f.end_line, normalized_sha256:f.fingerprint,
    baseline_symbol:f.best_reference, family:refs.find(r=>r.name===f.best_reference).family,
    similarity:f.best_similarity, reference_fingerprint:refs.find(r=>r.name===f.best_reference).fingerprint,
    exact_normalized:f.fingerprint===refs.find(r=>r.name===f.best_reference).fingerprint}));
  const signals = structure(source, filename), reasons = [];
  if (matches.length) reasons.push('normalized-lineage-above-threshold');
  if (signals.md5_delimited) reasons.push('structural-md5-delimited-namespace');
  if (signals.metadata && signals.network) reasons.push('structural-oauth-discovery-network');
  return {status:reasons.length?'CANDIDATE':'AST_NOT_SELECTED', completeness:'ast-complete',
    ast_status:'complete', reasons, matches, signals, best_similarity:ast.best_similarity,
    function_count:ast.function_count, classification:null,
    note:'Candidate screening only. No A/B/C classification, reachability or exposure verdict.'};
}
/** Reject escaping/symlinked inputs and retain repository-relative provenance. */
function sourcePath(root, relative) {
  if (typeof relative !== 'string' || !relative || path.isAbsolute(relative) ||
      /^(?:[A-Za-z]:|[\\/])/.test(relative)) throw new Error('Relative source path required');
  const absolute = fs.realpathSync(path.resolve(root, relative));
  const contained = path.relative(fs.realpathSync(root), absolute);
  if (contained === '..' || contained.startsWith('..'+path.sep) || path.isAbsolute(contained))
    throw new Error('Source path escapes input root');
  return absolute;
}
function run(manifestPath, output, profile) {
  if (!(Object.hasOwn(PROFILES, profile))) throw new Error('Profile must be corporate or marketplace');
  const rawManifest=fs.readFileSync(manifestPath), manifest=JSON.parse(rawManifest);
  if (!Array.isArray(manifest.files)) throw new Error('Manifest files array required');
  const root=path.dirname(path.resolve(manifestPath)), rows=[];
  for (const item of manifest.files) {
    const row={artifact:item.artifact || manifest.artifact, path:item.path, member:item.member || item.path,
      sha256:item.sha256, classification:null};
    if (!row.artifact || !row.artifact.name || !(row.artifact.version || row.artifact.commit))
      throw new Error('Every source requires artifact name and version or commit');
    try {
      if (!/^[a-f0-9]{64}$/.test(item.sha256)) throw new Error('Invalid expected SHA-256');
      const raw=fs.readFileSync(sourcePath(root,item.path));
      if (sha(raw)!==item.sha256) throw new Error('Input integrity mismatch');
      row.bytes=raw.length;
      Object.assign(row,evaluate(new TextDecoder('utf-8',{fatal:true}).decode(raw), item.path, profile));
    } catch(error) {
      Object.assign(row,{status:'UNRESOLVED',completeness:'incomplete',reasons:['ast-or-input-error'],
        error_kind:error.name, note:'Check input hash, UTF-8 encoding, parser resources and relative path.'});
    }
    rows.push(row);
  }
  const report={schema_version:1, method:'function-level AST-5gram-multiset-Dice', profile,
    ast_threshold_exclusive:PROFILES[profile], semgrep_file_wall_timeout_seconds:15,
    parser:'typescript@5.9.3', manifest_sha256:sha(rawManifest),
    reference_sha256:sha(fs.readFileSync(path.join(__dirname,'references/baseline-reference-functions.json'))),
    files:rows, counts:{total:rows.length,candidates:rows.filter(r=>r.status==='CANDIDATE').length,
      not_selected:rows.filter(r=>r.status==='AST_NOT_SELECTED').length,
      unresolved:rows.filter(r=>r.status==='UNRESOLVED').length}};
  fs.mkdirSync(path.dirname(path.resolve(output)),{recursive:true});
  fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n',{flag:'wx'});
  return report;
}
module.exports={evaluate,run,sourcePath,PROFILES};
if (require.main===module) {
  try {
    const [input,output,profile]=process.argv.slice(2);
    if (!input || !output || !profile) throw new Error('Usage: node candidate_filter.cjs MANIFEST OUTPUT corporate|marketplace');
    const result=run(input,output,profile);console.log(JSON.stringify(result.counts));
    if(result.counts.unresolved) process.exitCode=2;
  } catch(error) {console.error(error.message);process.exitCode=2;}
}
