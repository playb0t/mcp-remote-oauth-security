# Reproduction procedures

These sources accompany the recorded observations. Packaging performed syntax and metadata checks. Target measurements were not repeated during packaging. Use Node 24.20.0 on Windows for the recorded environment.

## Runtime layout

Prepare distributions outside this package and verify their archive integrity and file hashes against the acquisition records before importing them. Retain each version's dependency graph.

~~~text
work/
  runtime0138/
    package.json
    pnpm-lock.yaml
    node_modules/
    0.1.38/
      package.json
      dist/
  runtime0166/
    package.json
    package-lock.json
    node_modules/
    0.16.6/
      package.json
      dist/
  recorder/System32/WindowsPowerShell/v1.0/powershell.exe
  output/
~~~

For 0.16.6, use runtime/0.16.6/package.json and its npm lockfile, then install the graph with scripts disabled. Copy the verified distribution's dist files to the version directory and put {"type":"module"} in that directory's package.json.

For 0.1.38, obtain the original package.json from the verified official archive. It is retained locally during reproduction. Use the supplied runtime/0.1.38/pnpm-lock.yaml from the recorded source commit, and install production dependencies with frozen-lockfile and ignore-scripts. Copy the verified old dist files into the version directory with a module package.json. The old graph uses undici 7.12.0 and the distribution embeds SDK 1.25.3. The 0.16.6 graph uses undici 7.30.0 and embeds client 2.4.0.

Compile the supplied legacy/opener-recorder.rs into the dedicated recorder directory. The executable writes its arguments and exits. It does not interpret the captured command. This executable is prepared locally and is excluded from this package.

## Credential destination v2 and the three cache series

credential-v2/initial, credential-v2/cache-r2 and credential-v2/cache-r3 preserve the separate recorded configurations. Each contains its own cases and predeclared receiver policies under inputs/. Keep the directories separate.

- initial has 18 cases. The first 11 are the previously published OAuth scenarios. Its three expired-cache cases preserve the missing redirect_uris seed error.
- cache-r2 has three cases and adds redirect_uris to the seed. Its old-access inequality postcondition remains as recorded.
- cache-r3 has three cases and retains that valid seed. Its postcondition observes returned tokens and changed token-file bytes because the fixture returns the same access canary.

Set absolute paths in the environment before launching Node. With PowerShell, for example:

~~~powershell
$env:MCP_SECURITY_RUNTIME_DIST = '<work>/runtime0166/0.16.6/dist'
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
$env:MCP_RUNTIME_DIST = '<work>/runtime0166/0.16.6/dist'
$env:MCP_COMPONENT_OUTPUT = '<fresh-output>/component-f04'
$env:MCP_FAKE_SYSTEMROOT = '<work>/recorder'
& '<node-24.20.0>' '<procedures>/components/runner.mjs' f04
~~~

Use a different absent MCP_COMPONENT_OUTPUT for each group. F08 needs the compiled recorder. F09 deliberately produces local files containing newly generated test credentials, so those raw files require a redacted projection before publication. F10 and F11 bind their own HTTP listeners to loopback.

The runner's criterion concerns the named observed property. Its outcome is not a general product security score. F04 concerns namespace construction and serialization. F08 stops at the recorder. F09 reads files under the test principal. F11 uses the bundled transport with a synthetic provider.

## Historical F11 pair and F08 through the CLI

legacy/f11.mjs retains the transport procedure's caseRun function. It imports the real connectToRemoteServer export. legacy/f08-cli.mjs retains the original once function and launches proxy.js in a child process with a test-only recorder preload. These two procedures have different entry points.

The portable legacy/collector.py selects the original 0.1.38 graph for the old F11 run, the 0.16.6 graph for the current F11 run, and the full CLI F08 run on 0.16.6. Set all of these absolute bindings before launching it:

~~~text
MCP_NODE_BINARY=<node-24.20.0>
MCP_RUNTIME_0138=<work>/runtime0138
MCP_RUNTIME_0166=<work>/runtime0166
MCP_FAKE_SYSTEMROOT=<work>/recorder
MCP_LEGACY_OUTPUT=<fresh-output>/legacy
~~~

Then run python -B legacy/collector.py. The inherited NODE_OPTIONS require binding in the F08 procedure uses the preload path without additional quoting. Use an isolated workspace path without spaces for this recorded procedure.

F08 stops the two recorder-reaching CLI processes while they await an OAuth callback. The script case exits naturally after schema rejection. Its inherited summary predicate expects the earlier text Invalid url; the recorded 0.16.6 response has an earlier metadata-schema message, so checks.script=false remains in the data. The collector preserves that predicate and the stop states.

## Projection provenance

SOURCE-PROJECTIONS.json records source and portable file hashes and their configuration transformations. CONFIGURATION.diff shows differences after normalizing private absolute paths in its recorded side. The preserved private sources remain in the local research cases. Syntax results are in SYNTAX-CHECKS.json.

The copied procedures retain their observations and error handling. Portable copies were not target-run during preparation. Local output from a new reproduction can contain its own filesystem paths, generated credentials and callback values. Apply the public data projection and replace captured values with `<redacted>` before sharing those results.
