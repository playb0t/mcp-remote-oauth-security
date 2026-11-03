'use strict';
/** Isolated, pinned-function checks. Does NOT import the npm package or open a browser. */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const http = require('node:http');
const assert = require('node:assert/strict');
const {parser} = require('./normalize_ast.cjs');
const PINS = {
  "0.14.3": {
    "file": "chunk-CGVEK4Z7.js",
    "sha": "c2317039772cf79bdba4da9349bde030c7e7f83cef702321600f3cf2be755451"
  },
  "0.15.1": {
    "file": "chunk-KJCT2FXL.js",
    "sha": "bd626c01947857ba2cb5f347659f8d6db7d99827732a187660bd2582741e4bf0"
  },
  "0.15.2": {
    "file": "chunk-UZ6Y4QJH.js",
    "sha": "0e90204dfcf5f7892e119cf3d2ef451531a56355e1785f9b575dd8d8d58a883d"
  },
  "0.16.0": {
    "file": "chunk-K6DREQAS.js",
    "sha": "8b429f3fbbbba7471249d70f8ff8637c1b0c1f3766a4ae0412ffeaf26c82ccac"
  }
};
const sha = raw => crypto.createHash('sha256').update(raw).digest('hex');

function select(ts, source, filename, names) {
  const sf = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true);
  assert.equal(sf.parseDiagnostics.length, 0);
  const found = {};
  let endpoint;
  function visit(n) {
    if (ts.isFunctionDeclaration(n) && names.includes(n.name?.text)) {
      found[n.name.text] = {source: n.getText(sf), line: sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1,
        end_line: sf.getLineAndCharacterOfPosition(n.end).line + 1};
    }
    if (ts.isCallExpression(n) && ts.isPropertyAccessExpression(n.expression) &&
        n.expression.name.text === 'addEventListener' && n.arguments[0]?.text === 'endpoint' &&
        n.arguments[1]?.getText(sf).includes('Endpoint origin does not match connection origin')) {
      assert.equal(endpoint, undefined, 'ambiguous endpoint listener');
      endpoint = {source: n.arguments[1].getText(sf), line: sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1};
    }
    ts.forEachChild(n, visit);
  }
  visit(sf);
  for (const name of names) assert.ok(found[name], 'missing reviewed function ' + name);
  assert.ok(endpoint, 'missing positive-control endpoint listener');
  return {found, endpoint};
}

async function server(handler) {
  const instance = http.createServer(handler);
  await new Promise((resolve, reject) => { instance.once('error', reject); instance.listen(0, '127.0.0.1', resolve); });
  return {instance, origin: 'http://127.0.0.1:' + instance.address().port};
}

async function checkVersion(ts, root, version, run) {
  const pin = PINS[version];
  const filename = path.join(root, 'releases', version, 'package', 'dist', pin.file);
  const raw = fs.readFileSync(filename);
  assert.equal(sha(raw), pin.sha);
  const names = ['parseWWWAuthenticateHeader', 'buildProtectedResourceMetadataUrls',
    'fetchProtectedResourceMetadataFromUrl', 'discoverProtectedResourceMetadata',
    'getAuthorizationServerUrl', 'fetchAuthorizationServerMetadata', 'getServerUrlHash'];
  if (version === '0.1.38') names.push('getMetadataUrl', 'discoverOAuthServerInfo');
  else names.push('getMetadataUrls', 'fetchMetadataFrom', 'discoverOAuthServerInfo2');
  const selected = select(ts, raw.toString('utf8'), filename, names);
  const hits = [];
  let mode = 'direct';
  let fixture;
  const canary = await server((req, res) => {
    hits.push({server: 'canary', path: req.url, authorization_present: Boolean(req.headers.authorization)});
    res.writeHead(200, {'Content-Type': 'application/json'});
    if (req.url.startsWith('/.well-known/')) res.end(JSON.stringify({issuer: canary.origin}));
    else res.end(JSON.stringify({resource: fixture.origin + '/mcp', authorization_servers: [canary.origin]}));
  });
  fixture = await server((req, res) => {
    hits.push({server: 'fixture', path: req.url});
    if (req.url === '/mcp') {
      res.writeHead(401, {'WWW-Authenticate': `Bearer resource_metadata="${mode === 'redirect' ? fixture.origin + '/redirect' : mode === 'control' ? fixture.origin + '/prm' : canary.origin + '/prm'}"`});
      res.end();
    } else if (req.url === '/redirect') {
      res.writeHead(302, {Location: canary.origin + '/redirected'}); res.end();
    } else if (req.url === '/prm') {
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({resource: fixture.origin + '/mcp', authorization_servers: [fixture.origin]}));
    } else {
      res.writeHead(200, {'Content-Type': 'application/json'}); res.end(JSON.stringify({issuer: fixture.origin}));
    }
  });
  // The only endpoints served in this test are ephemeral loopback canaries.
  // Native fetch's redirect behavior is exercised against OUR controlled Location.
  const safeFetch = (input, init) => {
    const url = new URL(input);
    assert.ok([fixture.origin, canary.origin].includes(url.origin), 'fixture escaped loopback scope');
    return fetch(url, init);
  };
  const context = vm.createContext({URL, Headers, AbortSignal, fetch: safeFetch, fetch2: safeFetch,
    crypto2: crypto, debugLog: () => {}, log: () => {}});
  vm.runInContext(Object.values(selected.found).map(x => x.source).join('\n'), context, {timeout: 1000});
  const discover = context[version === '0.1.38' ? 'discoverOAuthServerInfo' : 'discoverOAuthServerInfo2'];
  const checks = [];
  try {
    await discover(fixture.origin + '/mcp');
    const direct = hits.filter(x => x.server === 'canary');
    assert.ok(direct.some(x => x.path === '/prm'));
    assert.ok(direct.some(x => x.path === '/.well-known/oauth-authorization-server'));
    checks.push({id: 'F01-F02-direct-loopback', passed: true, hits: direct});
    hits.length = 0; mode = 'redirect';
    await discover(fixture.origin + '/mcp');
    assert.ok(hits.some(x => x.server === 'canary' && x.path === '/redirected'));
    checks.push({id: 'F01-302-cross-origin-loopback', passed: true, hits: [...hits]});
    hits.length = 0; mode = 'control';
    await discover(fixture.origin + '/mcp');
    assert.equal(hits.filter(x => x.server === 'canary').length, 0);
    checks.push({id: 'F01-F02-negative-control', passed: true, canary_hits: 0});
    const hash = context.getServerUrlHash;
    const urlPairs = [
      ['https://server.example/foo/../bar', 'https://server.example/bar'],
      ['https://SERVER.example/mcp', 'https://server.example/mcp'],
      ['https://server.example/mcp?a=1&b=2', 'https://server.example/mcp?b=2&a=1'],
    ];
    for (const [a, b] of urlPairs) assert.notEqual(hash(a), hash(b));
    checks.push({id: 'F04-raw-URL-normalization-does-not-collide', passed: true, pairs: urlPairs});
    const left = ['https://server.example/x|https://resource.example/a', 'https://resource.example/b'];
    const right = ['https://server.example/x', 'https://resource.example/a|https://resource.example/b'];
    for (const url of [...left, ...right]) assert.equal(new URL(url).protocol, 'https:');
    assert.equal(hash(...left), hash(...right));
    checks.push({id: 'F04-ambiguous-delimiter-preimage', passed: true, left, right,
      hash: hash(...left), limitation: 'Two chosen configurations, identical serialization; NOT MD5 cryptanalysis, fixed-victim takeover or RCE.'});
    let rejected = 0; let resolved = 0; let closed = 0;
    const transport = {_url: new URL('https://mcp.example/sse'), close: () => { closed++; }, onerror: () => {}};
    const endpointContext = vm.createContext({URL, reject: () => { rejected++; }, resolve: () => { resolved++; }, transport});
    vm.runInContext('function listenerFactory() { return (' + selected.endpoint.source + '); } globalThis.listener = listenerFactory.call(transport);', endpointContext, {timeout: 1000});
    endpointContext.listener({data: 'https://other.example/messages'});
    assert.equal(rejected, 1); assert.equal(resolved, 0); assert.equal(closed, 1);
    endpointContext.listener({data: '/messages'});
    assert.equal(resolved, 1);
    checks.push({id: 'F11-SSE-endpoint-origin-control', passed: true, line: selected.endpoint.line,
      cross_origin_rejected: true, same_origin_accepted: true});
  } finally {
    fixture.instance.closeAllConnections(); canary.instance.closeAllConnections();
    await Promise.all([new Promise(r => fixture.instance.close(r)), new Promise(r => canary.instance.close(r))]);
  }
  return {version, run, file: filename, sha256: pin.sha,
    execution_scope: 'Exact extracted functions only, actual loopback HTTP, injected logging/fetch; NOT full installed CLI.',
    source_ranges: Object.fromEntries(Object.entries(selected.found).map(([k,v]) => [k, {line:v.line, end_line:v.end_line, sha256:sha(v.source)}])), checks};
}

async function main() {
  const [evidenceRoot, typescript, output] = process.argv.slice(2);
  assert.ok(evidenceRoot && typescript && output, 'Usage: node release_checks.cjs EVIDENCE_ROOT TRUSTED_TYPESCRIPT OUTPUT');
  const ts = parser(typescript);
  const sanitizerPath = path.join(__dirname, 'fixtures', 'strict-url-sanitise-0.0.1.js');
  const sanitizerRaw = fs.readFileSync(sanitizerPath);
  assert.equal(sha(sanitizerRaw), '6a45b869cd15501e796b91b516fb79ff9d77c87db13c33c0efb00c7fbe4951c3');
  const sf = ts.createSourceFile(sanitizerPath, sanitizerRaw.toString('utf8'), ts.ScriptTarget.Latest, true);
  const sanitizerContext = vm.createContext({URL, encodeURIComponent});
  vm.runInContext(sf.statements.filter(n => ts.isFunctionDeclaration(n)).map(n => n.getText(sf)).join('\n'), sanitizerContext, {timeout:1000});
  const accepted = ['http://127.0.0.1/canary', 'http://10.0.0.1/canary', 'http://169.254.169.254/canary'];
  for (const url of accepted) assert.equal(sanitizerContext.sanitizeUrl(url), url);
  assert.throws(() => sanitizerContext.sanitizeUrl('javascript:alert(1)'));
  assert.throws(() => sanitizerContext.sanitizeUrl('http://[::ffff:127.0.0.1]/canary'));
  const report = {schema_version: 1, node: process.version, parser: ts.version,
    sanitizer: {version:'0.0.1', sha256:sha(sanitizerRaw), accepted_without_network:accepted,
      script_scheme_rejected:true, mapped_ipv6_rejected:true, browser_opened:false}, runs: []};
  for (let run = 1; run <= 2; run++) for (const version of Object.keys(PINS)) report.runs.push(await checkVersion(ts, evidenceRoot, version, run));
  fs.mkdirSync(path.dirname(output), {recursive:true});
  fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({output, runs: report.runs.length, checks: report.runs.reduce((n,r) => n+r.checks.length,0), passed:true}));
}
main().catch(error => {console.error(error);process.exitCode=1;});
