# mcp-remote 0.15.2 and 0.16.0: the October procedure and two runtime follow-ups

Researcher: Alex Gercog (playb0t). The measurements and source comparisons in this folder were made on 3 November 2026. The figures below were recomputed from retained evidence before assembly. This follow-up records measured request paths and controls. It does not change an official affected range or state that a CVE is fixed or unfixed in these releases.

## What happened upstream

The maintainer published `0.15.2` to npm on 20 October 2026 at 17:19 UTC and `0.16.0` on 2 November at 05:25 UTC. These are registry publication times, not GitHub release times ([timestamps](data/npm-release-times.json)). The official registry URLs, archive SHA-256 and SHA-512 SRI values for `0.15.1`, `0.15.2` and `0.16.0` are in [the receipts](data/acquisition-receipts.json). All three SRI comparisons passed.

The published distribution changes from `0.15.1` to `0.15.2` are the version and an OAuth pending-flow reset when client information is invalidated. Version `0.16.0` also adds `--bind-host` and passes it through callback-server and sign-in coordination code; its default remains `127.0.0.1`. The flag was not supplied here. The full distribution comparison is retained below. A pin or unchanged helper does not establish exploitability in a product.

## Procedure

The CLI procedure of [9 October](../research-2026-10-09/REPRODUCIBILITY.md), used in the [15 October follow-up](../research-2026-10-15/README.md), was run on the two newer releases. The published `proxy.js` was launched through stdio against two researcher-owned loopback servers: `http-only` transport, `client-credentials` and synthetic static client information. Completed scenarios made `initialize`, `tools/list` and `tools/call`. All seven runtime `dist` members were compared with their archive copies; each CLI SHA-256 was checked against its selected version.

The two configuration substitutions of 15 October are the baseline path and version label. Earlier preparation copies also arranged the existing `resolve` import on a separate line; no assertion changed. The original complete source and the two-version path/label diff are now included. Earlier records are distinguished from the final three-attempt series. The original assertion that a scenario snapshot contains no Authorization header remains in force. Failed assertions have not been removed or converted into completed runs.

The 15 October folder did not contain `release_checks.cjs` or its `normalize_ast.cjs` import, only the pin-table diff. Both complete files were recovered from the retained 9 October archive, together with the sanitizer fixture, and checked against that archive's manifest. They are published here in full. This supplies the missing source step for reproducing the 15 October helper checks. The original [release_checks.original.cjs](procedures/release_checks.original.cjs), applied version and delta are included. Publication-only configuration changes are documented in [the procedure guide](procedures/README.md); syntax checking during assembly is not a new runtime run.

The recovered source files are included with these SHA-256 values: `release_checks.original.cjs`: `8822838d9f323534e20fae80ed3657bc44c2b4533b0d1a647c85e5d3ffec7b1f`; `normalize_ast.cjs`: `9be72ab286d3766931dce03595c04b915b7e100e75ecf24cc0613b75c91ad248`; `fixtures/strict-url-sanitise-0.0.1.js`: `6a45b869cd15501e796b91b516fb79ff9d77c87db13c33c0efb00c7fbe4951c3`. These are the distributed source bytes; the manifest lists them alongside the applied and portable copies.

The helper harness ran six checks twice on each of `0.14.3`, `0.15.1`, `0.15.2` and `0.16.0`: **48 of 48** passed ([results](data/release-checks-2026-11-03.json)). It executes exact hash-pinned functions in constructed contexts against its own loopback servers. It does not import the whole target bundle or open a browser. Sanitizer fixture checks contact none of their example URLs. VM contexts separate fixtures; they are not presented as a boundary for arbitrary code.

The runtime was Windows x64, Node v24.20.0, npm 11.19.0 and TypeScript 5.9.3. Both releases used the same resolved graph: `express@4.22.3`, `open@10.2.0`, `strict-url-sanitise@0.0.1`, `undici@7.30.0`. Installation used `--ignore-scripts --omit=dev`; the lockfile is distributed with the procedures ([environment](data/environment.json)). The dated current registry read is saved as [npm-view.json](data/npm-view.json) and [its time](data/npm-view-time.txt).

Public data and traces normalize local filesystem paths to placeholders. The CLI fixture logged Authorization presence, not its value. Follow-up OAuth parameters and token markers are synthetic. No header value was replaced to manufacture a negative result. Original and public trace hashes are in [trace provenance](data/raw-trace-provenance.json); assembly changes are in [source transformations](data/source-transforms.json). Dependencies, tarballs, transient sign-in state and the recorder binary are not distributed here.

## Results

**Scenario snapshots of the selected completed runs.** These are the final successful attempts, not retry totals.

| Version | Scenario | HTTP / canary / RPC replies / Authorization |
|---|---|---|
| 0.15.2 | header-selected-canary | 15 / 6 / 3 / 0 |
| 0.15.2 | header-redirect | 16 / 7 / 3 / 0 |
| 0.15.2 | same-origin-control | 10 / 0 / 3 / 0 |
| 0.16.0 | header-selected-canary | 15 / 6 / 3 / 0 |
| 0.16.0 | header-redirect | 18 / 9 / 3 / 0 |
| 0.16.0 | same-origin-control | 10 / 0 / 3 / 0 |

**Full traces of the same runs.** The `0.15.2` trace holds **42 HTTP events, 14 canary events and one Authorization header**; `0.16.0` holds **44 HTTP events, 16 canary events and one Authorization header**. Each has nine retained RPC replies. Each extra Authorization event is a synthetic `POST /token` to the loopback authorization server named by the fixture's PRM, after the scenario snapshot. Header values and credential acceptance were not examined. Zero Authorization in a snapshot is not zero for the full run. This snapshot boundary also appeared on 15 October.

**All retained CLI execution records.** Eight distinct records remain in the cumulative traces: two earlier completed captures and the six-record final series. The final series completed once in three attempts on each version; the other four stopped at the original Authorization assertion. Duplicate saved copies are not extra runs. One failed attempt has an empty standalone capture, but its failure remains in the cumulative log ([attempt receipts](data/attempt-receipts.json)). Preparation failures, including missing output directories and wrong staging paths, are recorded separately and excluded from version results ([setup notes](data/setup-attempts.json)).

| Recorded run | Completed scenarios | Full HTTP | Canary | Authorization | Outcome |
|---|---:|---:|---:|---:|---|
| 0.15.2, earlier complete capture | 3 | 43 | 15 | 0 | exit 0 |
| 0.15.2, final series, attempt 1 | 0 | 16 | 7 | 1 | stopped by the assertion |
| 0.15.2, final series, attempt 2 | 0 | 16 | 7 | 1 | stopped by the assertion |
| 0.15.2, final series, attempt 3 | 3 | 42 | 14 | 1 | exit 0 |
| 0.16.0, earlier complete capture | 3 | 43 | 15 | 1 | exit 0 |
| 0.16.0, final series, attempt 1 | 1 | 35 | 17 | 2 | stopped by the assertion |
| 0.16.0, final series, attempt 2 | 0 | 16 | 7 | 1 | stopped by the assertion |
| 0.16.0, final series, attempt 3 | 3 | 44 | 16 | 1 | exit 0 |

Completed full traces lie within the 42 to 44 HTTP range retained on 15 October. This is a count comparison, not an explanation of scheduling. Partial runs stop before all scenarios and have different totals. No causal release change or failure frequency is inferred. The original CLI redirect fixture redirects between paths on the canary origin; the helper redirect check crosses from the fixture to the second loopback origin. A third distinct origin in that chain was not tested.

[0.15.2 projection](data/cli-scenarios-0.15.2.json), [0.16.0 projection](data/cli-scenarios-0.16.0.json), [all runs](data/all-cli-runs.json), [raw 0.15.2](data/raw/raw_trace-0.15.2.log), [raw 0.16.0](data/raw/raw_trace-0.16.0.log).

## The five records in 0.15.2 and 0.16.0

The first three rows retain the October evidence classes. The last two add the runtime observations below. The same result was obtained on each newer release.

| Record | Finding | Status in both releases | Evidence class and limit |
|---|---|---|---|
| CVE-2026-51994 | F-01 | request path present | Full CLI and exact helpers request server-named resource metadata and follow the controlled redirect. Two loopback origins; third origin and response exfiltration not measured. |
| CVE-2026-51995 | F-02 | request path present | Full CLI requests AS metadata at the origin selected by PRM; synthetic token POST retained in the full trace. No real OAuth login or production credentials. |
| CVE-2026-51996 | F-04 | code path present | Exact executed helper: chosen different tuples have the same serialized preimage and hash. No MD5 cryptanalysis, fixed-victim takeover, cache/session reuse or code execution shown. |
| CVE-2026-51997 | F-08 | code path present; opener route measured | Full CLI metadata URL reaches installed opener and controlled OS child recorder. No real browser, link-local request, browser-mediated effect or code execution shown. |
| CVE-2026-52001 | F-11 | code path present; tested cross-origin transfer not reproduced | Actual bundled SSE transport with a synthetic provider strips bearer on the tested cross-origin redirect and rejects a foreign endpoint. Not a full CLI OAuth sign-in or every dependency graph. |

[Per-version statuses and classes](data/five-path-statuses.json). These observations do not establish official applicability to later releases, exploitation in a product or an amended affected range.

## Two paths measured at runtime

**F-08: the route from a metadata URL to an OS opener process was reproduced; code execution was not shown.** Three full CLI cases per release used local MCP, PRM and AS servers. Loopback and link-local authorization URLs (`http://169.254.169.254/latest/meta-data`) reached the installed `sanitizeUrl` / `openBrowser` / `open` path. The `open` package performed its Windows command-building and child spawn. A test-only preload changed `SYSTEMROOT` inside the already-started child Node process so that the executable was a compiled local argv recorder instead of Windows PowerShell. The decoded `Start` command contained the current fixture URL and synthetic OAuth parameters. The recorder neither executed that command nor contacted the URL. Four positive CLI cases produced captures; the CLI processes were then deliberately terminated while awaiting authorization.

Two CLI cases used a `javascript:` authorization endpoint. The bundled OAuth metadata schema rejected it before the provider, with no recorder process. A separate direct call of the published provider method used explicit provider preconditions and installed opener: HTTP cases reached the recorder; `javascript:` and mapped IPv6 were rejected by the sanitizer. There are eight method cases, four per release. Browser, internal-service effect and arbitrary code execution remain unmeasured. Recorder source is included; its executable is not. [CLI results](data/f08-cli-results.json), [method results](data/f08-method-results.json).

**F-11: bearer transfer to a different origin after the tested redirect was not reproduced on the tested dependency graph.** The exported `connectToRemoteServer` from each published bundle ran its actual bundled `SSEClientTransport` and `EventSource`, with a provider supplied through the public parameter. The provider returned one synthetic marker. Its presence in the initial SSE request is the positive control.

Each release ran four cases (**4/4**): after a 302 to the other loopback origin, the canary GET contained no Authorization; after a redirect within the original origin, bearer remained; a foreign SSE `endpoint` was rejected before any canary endpoint call; without a token, Authorization was absent. These eight cases close the particular runtime measurement left open on 15 October. They do not claim a full CLI OAuth sign-in, another redirect policy, every provider or a different dependency graph. [Transport results](data/f11-results.json).

## The SDK inside the bundle

The [15 October evidence](../research-2026-10-15/data/sdk-analysis.json) identifies compared `0.15.1` SDK fragments as published client/core 2.0.0. That archive-identification exercise was not repeated. Complete newer distributions were compared with `0.15.1`; their SDK sections and measured regions did not change. Existing issuer checks, SSE endpoint-origin validation and sanitization remain present. Equal package ranges alone do not establish equal installed behaviour; the runtime graph actually used here is stated separately.

[SDK continuity and limits](data/sdk-analysis.json), [complete distribution comparison](data/all-dist-comparison.json), [distribution diff](data/all-dist.diff).

## What the diff changes and what it does not

Three official archives were parsed as data for the source comparison. Ten helper declarations matched published 15 October hashes in **all three versions, 0.15.1, 0.15.2 and 0.16.0: 10/10 each**. Full functions, surrounding code and complete distribution differences were inspected together.

The `0.15.2` main bundle changes its version and resets `pendingFlow` when client information is invalidated. Version `0.16.0` retains that change and adds callback/coordination bind-host handling. CLI entrypoints pass the new option and import the new chunk. The remaining four distribution members are byte-identical to `0.15.1`; runtime dependency declarations are unchanged. Selected metadata, hash, browser-helper and SSE-wrapper declarations are unchanged. Existing issuer checks, endpoint-origin validation and sanitizer controls are retained in this reading.

[Ten helper hashes](data/helper-continuity.json), [regions and hash schemes](data/code-regions.json), [all files](data/all-dist-comparison.json). Function hashes use `FunctionDeclaration.getText`; additional region hashes use trimmed range text. The two schemes are labeled and not equated.

## Not verified here

Official applicability of these records to later releases or a changed official affected range. Exploitation in a product or production exposure. Real OAuth accounts, credential acceptance or successful user sign-in. Response exfiltration or a third origin in the original metadata redirect chain. Fixed-victim cache takeover, cross-user session reuse or MD5 cryptanalysis. Real browser launch, actual internal/link-local HTTP request, browser-mediated effect or arbitrary code execution. SSE reconnect, other redirect conditions, every provider, other dependency graphs or operating systems. Non-default `--bind-host`. Causation or frequency of snapshot timing variance. Publication syntax checks are not new target runtime runs.

No maintainer issue, comment, letter or pull request was sent as part of these runs. Assembly does not alter the historical records.

## Files

- `data/acquisition-receipts.json`: three official registry/archive SRI receipts.
- `data/cli-scenarios-0.15.2.json`, `data/cli-scenarios-0.16.0.json`: final successful projections in the 15 October layout, full events and snapshot deltas.
- `data/all-cli-runs.json`, `data/attempt-receipts.json`, `data/setup-attempts.json`, `data/raw/`: all retained execution records and separately labeled preparation failures/gaps.
- `data/release-checks-2026-11-03.json`: eight helper runs and 48 checks.
- `data/helper-continuity.json`, `data/code-regions.json`, `data/all-dist-comparison.json`, `data/all-dist.diff`, `data/sdk-analysis.json`: static comparison and limits.
- `data/five-path-statuses.json`, `data/f08-cli-results.json`, `data/f08-method-results.json`, `data/f11-results.json`: scopes and runtime follow-ups.
- `data/environment.json`, `data/npm-view.json`, `data/npm-view-time.txt`, `data/npm-release-times.json`: environment and dated registry state.
- `data/raw-trace-provenance.json`, `data/source-transforms.json`: source identities and normalization.
- `procedures/`: complete sources, fixtures, lockfile and run instructions; the missing October helper sources are supplied here.
- `MANIFEST.json`: schema version 1, research date, size and SHA-256 of each distributed file except the manifest itself.
