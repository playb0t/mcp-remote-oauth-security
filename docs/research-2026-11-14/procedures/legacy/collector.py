from pathlib import Path
import hashlib,json,subprocess,os,sys
C=Path(__file__).resolve().parent
if not os.environ.get('MCP_NODE_BINARY'):
 raise RuntimeError('MCP_NODE_BINARY required')
NODE=Path(os.environ['MCP_NODE_BINARY']).resolve()
GROUPS=['f11-old','f11-current','f08-current']
def artifact(i):
 return Path(os.environ['MCP_RUNTIME_0138'])/'0.1.38/dist/chunk-65X3S4HB.js' if i=='f11-old' else Path(os.environ['MCP_RUNTIME_0166'])/'0.16.6/dist/chunk-MKB2ICYW.js'
def context(i):
 v='0.1.38' if i=='f11-old' else '0.16.6'
 return dict(entry_point='original F08 proxy.js subprocess procedure' if i=='f08-current' else 'original F11 connectToRemoteServer procedure',variant=i,validated_field='SSE token origin or full CLI browser destination',effective_resource='owned HTTP receivers and inert recorder',auth_profile='synthetic provider tokens' if i.startswith('f11') else 'synthetic static client registration',principal='test process under current OS principal',grants='own fixture only',consumer='local SSE servers or inert recorder',state='fresh isolated fixture',component='mcp-remote '+v,backend='Windows local filesystem and loopback HTTP',platform='win32 / Node v24.20.0')
def execute(i):
 if not os.environ.get('MCP_LEGACY_OUTPUT'):
  raise RuntimeError('MCP_LEGACY_OUTPUT required')
 out=Path(os.environ['MCP_LEGACY_OUTPUT']).resolve()/i
 assert not out.exists(),'Fresh directory required'
 out.mkdir(parents=True)
 old=i=='f11-old';version='0.1.38' if old else '0.16.6';runtime=Path(os.environ['MCP_RUNTIME_0138' if old else 'MCP_RUNTIME_0166']).resolve()
 env=dict(os.environ,MCP_CASE_ROOT=str(out),MCP_RUNTIME_ROOT=str(runtime),MCP_NODE_BINARY=str(NODE),MCP_FAKE_SYSTEMROOT=os.environ['MCP_FAKE_SYSTEMROOT'],MCP_TEST_VERSION=version,MCP_TEST_CHUNK='chunk-65X3S4HB.js' if old else 'chunk-MKB2ICYW.js')
 name='f08-cli.mjs' if i=='f08-current' else 'f11.mjs'
 (out/'runs').mkdir()
 p=subprocess.run([str(NODE),str(C/name)],env=env,cwd=C,capture_output=True,timeout=100)
 (out/'stdout.log').write_bytes(p.stdout);(out/'stderr.log').write_bytes(p.stderr)
 rawfile=out/'runs'/('F08-CLI-RESULTS.json' if i=='f08-current' else 'F11-RESULTS.json')
 rows=json.loads(rawfile.read_bytes())['results'] if rawfile.exists() else []
 if i.startswith('f11'):
  checks=[dict(id=r['mode'],passed=(r['result']=='connected' and any(x['role']=='resource' and x['synthetic_bearer_received'] for x in r['events'])) if r['mode']=='redirect-same' else r['result']=='rejected' and not any(x['role']=='canary' and x['method']=='POST' for x in r['events']) if r['mode']=='endpoint-cross' else not any(x['synthetic_bearer_received'] for x in r['events']) if r['mode']=='no-token' else not any(x['role']=='canary' and x['synthetic_bearer_received'] for x in r['events'])) for r in rows]
  leaked=any(x['role']=='canary' and x['synthetic_bearer_received'] for r in rows for x in r['events'])
  complete=p.returncode==0 and len(rows)==4 and all('connection timeout' not in (r.get('error') or '') for r in rows)
  effects=[dict(outcome='forbidden' if leaked else 'none',property='cross-origin bearer receipt')]
  forced=False
 else:
  checks=[dict(id=r['mode'],passed=r['recorded'] if r['mode']!='script' else not r['recorded'] and 'Invalid url' in r['stderr_tail']) for r in rows]
  effects=[dict(outcome='forbidden' if any(r['recorded'] for r in rows if r['mode'] in ['loopback','link-local']) else 'unknown',property='full CLI internal-address URL reached inert recorder')]
  complete=p.returncode==0 and len(rows)==3 and all(not r['stop'].get('timeout') for r in rows)
  forced=any(r['stop'].get('signal') is not None or r['stop'].get('code') not in [0,None] for r in rows)
 result=dict(id=i,checks=checks,effects=effects,completed=complete,forced=forced,procedure_exit=p.returncode,rows=rows,measurement_context=context(i),artifact_sha256=hashlib.sha256((C/artifact(i)).read_bytes()).hexdigest(),observer_sha256=hashlib.sha256(Path(__file__).read_bytes()).hexdigest())
 path=Path(os.environ['MCP_LEGACY_OUTPUT']).resolve()/(i+'.json');path.write_text(json.dumps(result,indent=2))
 print(json.dumps({'id':i,'exit':p.returncode,'completed':complete,'forced_child_stop':forced,'checks':checks}))
 if p.returncode:raise SystemExit(p.returncode)
if __name__=='__main__':
 for i in GROUPS:execute(i)
