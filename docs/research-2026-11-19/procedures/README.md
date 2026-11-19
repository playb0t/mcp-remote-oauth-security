# Reproduction procedures

These sources accompany the recorded observations. Packaging performed syntax and metadata checks. Target measurements were not repeated during packaging. Use Node 24.20.0 on Windows for the recorded environment.

## Runtime layout

Prepare distributions outside this package and verify their archive integrity and file hashes against the acquisition records before importing them. Retain each version's dependency graph.

~~~text
work/
  runtime0167/
    package.json
    package-lock.json
    node_modules/
    0.16.7/
      package.json
      dist/
  recorder/System32/WindowsPowerShell/v1.0/powershell.exe
  output/
~~~

For 0.16.7, use runtime/0.16.7/package.json and its npm lockfile, then install the graph with scripts disabled. Copy the verified distribution's dist files to the version directory and put {"type":"module"} in that directory's package.json.

The current graph uses undici 7.30.0 and the emitted client marker is 2.4.0. The old 0.1.38 pair was not repeated.

Compile the supplied legacy/opener-recorder.rs into the dedicated recorder directory. The executable writes its arguments and exits. It does not interpret the captured command. This executable is prepared locally and is excluded from this package.

## Credential destination v2 and the three cache series

credential-v2/initial, credential-v2/cache-r2 and credential-v2/cache-r3 preserve the separate recorded configurations. Each contains its own cases and predeclared receiver policies under inputs/. Keep the directories separate.

- initial has 18 cases. The first 11 are the previously published OAuth scenarios. Its three expired-cache cases preserve the missing redirect_uris seed error.
- cache-r2 has three cases and adds redirect_uris to the seed. Its old-access inequality postcondition remains as recorded.
- cache-r3 has three cases and retains that valid seed. Its postcondition observes returned tokens and changed token-file bytes because the fixture returns the same access canary.

Set absolute paths in the environment before launching Node. With PowerShell, for example:

~~~powershell
$env:MCP_SECURITY_RUNTIME_DIST = '<work>/runtime0167/0.16.7/dist'
$env:MCP_SECURITY_INPUTS = '<procedures>/credential-v2/initial/inputs'
$env:MCP_SECURITY_OUTPUT = '<fresh-output>/v2-initial'
& '<node-24.20.0>' '<procedures>/credential-v2/initial/harness-v2.mjs' '<procedures>/credential-v2/initial/inputs/cases.json'
~~~

Repeat with the matching cache-r2/cache-r3 directories and a fresh output. Ports are predeclared per case. Run the series sequentially. A port conflict is an execution failure and must be retained.

The criterion unit controls are separate from target observations:

~~~text
node credential-v2/initial/test-criterion-v2.cjs
~~~

They write UNIT-RESULTS.json alongside the script. Copy procedures to a writable isolated directory. The named policy controls additionally need MCP_SECURITY_INPUTS and a fresh absolute MCP_DETECTOR_OUTPUT before running that family's detector-controls.mjs.

Generated credential values are used only to compare the observed recipient with the declared policy. The portable v2 harness writes captured credential placeholders as `<redacted>`. Result presence flags and match booleans remain available.

## Nineteen component conditions

components/runner.mjs retains the five groups f04, f08, f09, f10 and f11 from the seven-finding assessment. Set MCP_RUNTIME_DIST externally before starting Node. The static import in extras.mjs is evaluated before the runner body.

~~~powershell
$env:MCP_RUNTIME_DIST = '<work>/runtime0167/0.16.7/dist'
$env:MCP_COMPONENT_OUTPUT = '<fresh-output>/component-f04'
$env:MCP_FAKE_SYSTEMROOT = '<work>/recorder'
& '<node-24.20.0>' '<procedures>/components/runner.mjs' f04
~~~

Use a different absent MCP_COMPONENT_OUTPUT for each group. F08 needs the compiled recorder. F09 deliberately produces local files containing newly generated test credentials, so those raw files require a redacted projection before publication. F10 and F11 bind their own HTTP listeners to loopback.

The runner's criterion concerns the named observed property. Its outcome is not a general product security score. F04 concerns namespace construction and serialization. F08 stops at the recorder. F09 reads files under the test principal. F11 uses the bundled transport with a synthetic provider.

## Original F11 transport and F08 full CLI

legacy/collector.py selects only f11-current and f08-current on 0.16.7. Set MCP_NODE_BINARY, MCP_RUNTIME_0167, MCP_FAKE_SYSTEMROOT and a fresh MCP_LEGACY_OUTPUT. The runtime root contains 0.16.7/dist and a module package.json, with the retained dependency graph. Run python -B legacy/collector.py. Dormant old-version branches inherited from the earlier collector are not selected.

The F11 helper imports connectToRemoteServer with a controlled provider; it is not the CLI. F08 launches published proxy.js and uses a test-only preload selecting the inert recorder. The inherited preload binding uses a path without additional quoting: use an isolated work path without spaces. The two positive F08 children are stopped while awaiting callback. The old Invalid url diagnostic predicate remains; checks.script=false is retained for the observed SDK metadata rejection. F11 suppresses transport-close errors and does not retain typed server-close callback errors.

## Two cache changes

extra.mjs is a separate configuration projection of the new component procedure. Set MCP_EXTRA_OUTPUT to a fresh absent absolute directory on every invocation, plus MCP_RUNTIME_0166_DIST and MCP_RUNTIME_0167_DIST to verified distribution directories with their recorded graphs. Run:

~~~text
node extra.mjs env 0.16.6 pair
node extra.mjs env 0.16.7 pair
node extra.mjs registration 0.16.6 portless
node extra.mjs registration 0.16.7 portless
~~~

Also invoke registration with wrong-port and exact-port for each version, using a fresh output every time. The neutral environment-variable name is TEST_HEADER. Header/token canaries in new reproductions are generated afresh instead of repeating captured fixture literals. The result checks are preserved. The registration control passes B metadata directly to the real provider after parsing callback options; it does not perform discovery, DCR or a full CLI flow. Only 127.0.0.1 is selected.

## Projection provenance

SOURCE-PROJECTIONS.json binds source and projected procedure hashes. CONFIGURATION.diff records the configuration and fresh-canary adaptations. Original unredacted observations are retained locally. Syntax checks are recorded in SYNTAX-CHECKS.json. No target measurement was rerun during packaging. New reproduction outputs can contain freshly generated values and local paths; project captured values to <redacted> before sharing them.
