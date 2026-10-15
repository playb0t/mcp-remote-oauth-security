# mcp-remote 0.15.1: the 9 October procedure repeated, 15 October 2026

Researcher: Alex Gercog (playb0t). The bench run and its report are the work of the researcher's agent on 15 October 2026 (report recorded 06:43 UTC). An independent read-only review of the report and the evidence followed the same day. The figures below were recomputed from the evidence files before publication.

## What happened upstream

On 14 October 2026 the maintainer of `punkpeye/mcp-remote` published four releases between 18:27 and 22:36 UTC. They are the first since 0.14.3 of 21 September: 0.14.4 (npm 18:27 UTC), 0.14.5 (18:35), 0.15.0 (18:41) and 0.15.1 (22:36). Six commits sit between the tags v0.14.3 and v0.15.1, touching 19 files. Five of them are contributor pull requests (#370, #372, #373, #375, #376); one is the maintainer's own.

The changes are these. The OAuth error callback is served as plain text (#375). That fixes a reflected XSS reported by another researcher in issue #369. OAuth discovery state is persisted for the callback leg (#376). The callback port is released once a sign-in has finished (#372). OAuth retries stop after the follower timeout (#370). A `--auth-success-url` completion page was added (#373). The static OAuth client and its secret are no longer written to the credential store (commit b529ea1).

No release note, commit message or pull-request body names any of the five CVE records. No fixed release is stated. At 06:32 UTC on 15 October, `npm view mcp-remote dist-tags` returned `latest: 0.15.1` ([data/npm-view.json](data/npm-view.json), [time](data/npm-view-time.txt)).

## Procedure

The recorded procedure of 9 October was run again with its logic unchanged: [verify_stdio.mjs](../research-2026-10-09/procedures/cve-signature-sweep-20261009/verify_stdio.mjs). The 0.15.1 tarball came from the npm registry and was checked against its SRI, `sha512-znJhxnoQZTDx9AieHZrRYs8YqWKpyH1SKyFEFnMTMDUPpx6r9dSc/L4lKf18DdWMQqKpbwWbfIZfyiVg2RSXzg==`. Its seven `dist` members were compared byte for byte between the archive copy and the runtime copy. `dist/proxy.js` was then launched through stdio against two researcher-owned loopback servers, in the three scenarios of 9 October: `http-only` transport, `client-credentials` mode, synthetic static client information.

Two edits were made to the procedure, both outside its logic: the baseline path and the version label ([diff](procedures/verify_stdio.path-version.diff)). The helper-level checks of 9 October, `release_checks.cjs`, ran with 0.15.1 added to the pin table and 0.14.3 kept ([diff](procedures/release_checks.pins.diff)). The environment was Node v24.20.0 and npm 11.19.0; the runtime dependencies were installed from the published package's manifest with lifecycle scripts disabled ([data/environment.json](data/environment.json)). The 9 October run had used Node v24.19.0.

## Results

**Full CLI, per-scenario snapshots.** The three completed scenarios of 0.15.1 match 0.14.3 figure for figure.

| Scenario | 0.14.3, 9 October: HTTP / canary / RPC / Authorization | 0.15.1, 15 October: HTTP / canary / RPC / Authorization |
|---|---|---|
| Header-selected metadata location | 15 / 6 / 3 / 0 | 15 / 6 / 3 / 0 |
| Header-selected location returning HTTP 302 | 18 / 9 / 3 / 0 | 18 / 9 / 3 / 0 |
| Same-origin control | 10 / 0 / 3 / 0 | 10 / 0 / 3 / 0 |

Each scenario completed `initialize`, `tools/list` and `tools/call`. The recorded path is the one of 9 October. The client receives the challenge, selects the `resource_metadata` location from `WWW-Authenticate`, requests it from the second loopback service, reads `authorization_servers`, and requests authorization-server metadata there. The redirect fixture returned HTTP 302 and the client followed it. These are the request paths of F-01 (CVE-2026-51994) and F-02 (CVE-2026-51995). The projection in the 9 October schema: [data/cli-scenarios-0.15.1.json](data/cli-scenarios-0.15.1.json).

**Full trace of the same run.** The 9 October procedure closes a scenario's snapshot when its stdio calls complete. The complete trace of the 0.15.1 run holds one more event: a `POST /token` carrying an `Authorization` header. It went to the loopback canary, that is, to the token endpoint of the authorization server named by the server's own metadata. The full-trace totals are 44 HTTP events, 16 canary events, 9 RPC replies, 1 Authorization header. The run used the `client_credentials` grant with the fixture's synthetic static client. The header's content was not examined, only its presence and its destination. The same event appears in runs of 0.14.3 under the same environment. It is a boundary of the 9 October snapshot, not a change of behaviour in a new release.

**All twelve runs.** The 9 October procedure asserts that no Authorization header is observed. When the token request lands inside a snapshot, that assertion stops the run. Nothing was removed or rewritten; every run is kept ([data/all-cli-runs.json](data/all-cli-runs.json)).

| Run | Completed scenarios | HTTP | Canary | Authorization | Outcome |
|---|---:|---:|---:|---:|---|
| 0.14.3, current environment | 0 | 16 | 7 | 1 | stopped by the assertion |
| 0.14.3, sample 1 | 3 | 43 | 15 | 0 | exit 0 |
| 0.14.3, sample 2 | 3 | 44 | 16 | 1 | exit 0 |
| 0.14.4, sample 1 | 3 | 44 | 16 | 1 | exit 0 |
| 0.14.4, sample 2 | 3 | 43 | 15 | 0 | exit 0 |
| 0.14.5, sample 1 | 3 | 43 | 15 | 0 | exit 0 |
| 0.14.5, sample 2 | 3 | 42 | 14 | 0 | exit 0 |
| 0.15.0, sample 1 | 3 | 43 | 15 | 0 | exit 0 |
| 0.15.0, sample 2 | 3 | 43 | 15 | 0 | exit 0 |
| 0.15.1, first run | 0 | 16 | 7 | 1 | stopped by the assertion |
| 0.15.1, recheck | 3 | 44 | 16 | 1 | exit 0 |
| 0.15.1, sample 3 | 0 | 16 | 7 | 1 | stopped by the assertion |

The address-selection paths are present in every completed scenario of every version run. The count varies between 42 and 44 HTTP events, and the token request falls inside or outside a snapshot. Both happen on 0.14.3 as well as on the later releases. With two samples per intermediate version, no causal link to a particular commit is claimed.

**Helper functions.** The ten helper declarations selected on 9 October, `parseWWWAuthenticateHeader` through `getServerUrlHash`, are byte-identical between the 0.14.3 and 0.15.1 bundles. Nine of them sit at the same line numbers. `getServerUrlHash` moved fifty lines down, from 33955 to 34005, with the same hash ([data/helper-continuity.json](data/helper-continuity.json)). The six helper-level checks of 9 October ran twice on each version. 24 of 24 passed ([data/release-checks-0.15.1.json](data/release-checks-0.15.1.json)).

With the four releases of 14 October, the discovery path is recorded in all 62 stable releases from 0.1.32 to 0.15.1. Fifty-eight come from the executed helpers of the 9 October dossier. Four come from the full CLI runs above.

## The five records in 0.15.1

| Record | Finding | Status in 0.15.1 | Evidence class | Limit |
|---|---|---|---|---|
| CVE-2026-51994 | F-01 | request path present | full CLI and executed helpers: GET of the server-named resource metadata, controlled 302 followed | two loopback origins; a third distinct origin was not measured; no response exfiltration shown |
| CVE-2026-51995 | F-02 | request path present | full CLI and executed helpers: authorization-server metadata requested at the origin named by the resource metadata; in the full trace, a token request with an Authorization header to that origin | no real OAuth login or production credentials |
| CVE-2026-51996 | F-04 | code path present | executed helper plus code: `getServerUrlHash` unchanged; the normalization and delimiter checks of 9 October pass twice | the chosen serialization ambiguity only; no MD5 cryptanalysis, fixed-victim takeover or code execution |
| CVE-2026-51997 | F-08 | code path present | source only: `sanitizeUrl(authorizationUrl.toString())` into `openBrowser` into `open`, unchanged | browser not launched; no code execution claimed |
| CVE-2026-52001 | F-11 | code path present | source wrapper and the exact endpoint listener: the `eventSourceInit` fetch wrapper attaches the available bearer token; the transport's endpoint listener still rejects a cross-origin endpoint and accepts same-origin | bearer propagation across SSE redirects not measured at runtime |

The 0.15.1 bundle is `dist/chunk-KJCT2FXL.js`, SHA-256 `bd626c01947857ba2cb5f347659f8d6db7d99827732a187660bd2582741e4bf0`, 1,420,822 bytes. Line numbers and SHA-256 of each measured region: [data/five-path-statuses.json](data/five-path-statuses.json), [data/code-regions.json](data/code-regions.json). "Code path present" for F-08 and F-11 is not a full runtime run. This verification establishes that specific request paths are present in 0.15.1. It does not state that all five records were reproduced on 0.15.1. It does not extend any official affected range. It does not prove exploitation in a product.

## The SDK inside the bundle

Eight code fragments from six module sections of the 0.15.1 bundle match the official npm `dist` of `@modelcontextprotocol/client` 2.0.0 and `@modelcontextprotocol/core` 2.0.0 ([data/sdk-fragment-comparisons.json](data/sdk-fragment-comparisons.json), [data/sdk-analysis.json](data/sdk-analysis.json)). The lockfile at tag v0.15.1 pins the same versions. That corroborates the reading; it does not by itself prove the bundle.

Client 2.2.0 added issuer binding (GHSA-6qxp-vccf-f47h). In the bundle, the direct `fetchToken` lacks the added issuer-mismatch check before the token request, and the `checkedExpectedIssuer` function is absent. The 2.0.0 baseline checks are present: `discardIfIssuerMismatch`, the issuer stamp on saved client information, the callback discovery binding ([data/sdk-protective-code-locations.json](data/sdk-protective-code-locations.json)). Client 2.3.0 added a redirect policy (GHSA-6prh-2h8m-c8cw). `fetchWithinOrigin`, `fetchLeavingRedirects` and `redirectPolicy` are absent from the bundle's SDK fetch paths and transport wiring. Both are static readings of published code, not runtime tests of header or body propagation. The two SDK advisories are other researchers' findings and carry their own attribution.

## What the diff changes and what it does not

The 19 changed files between the tags do not change `authorization-server-metadata.ts` or `open-browser.ts`. `utils.ts` changes in the callback server and the authorization-code leg; its SSE fetch wrapper is byte-identical in both bundles ([data/code-regions.json](data/code-regions.json)). Pull request #376 writes the discovery the SDK resolved to `discovery_state_<state>.json` under the configuration directory: the authorization server URL, the resource metadata URL and both metadata documents. It writes them when the code verifier is saved and reads them back on the callback leg, so the SDK reuses the saved authorization server instead of discovering again. That is a consistency repair of the callback leg, not an allow-list of destinations. The maintainer's commit b529ea1 returns the configured static client with the issuer the SDK resolved, and removes an earlier saved copy of that client from `client_info.json`. It compares against no separately configured expected issuer. Pull request #375 serves the callback error page as `text/plain`; it first shipped in 0.14.4. The finding behind it, issue #369, is another researcher's.

## Not verified here

Official applicability of the five records to 0.15.1. A third distinct origin in the redirect chain. Real OAuth accounts, external servers or cloud metadata endpoints. Response exfiltration. A browser launch. Bearer propagation across SSE redirects at runtime. The full cross-process callback persistence flow. Runtime behaviour of the 2.2.0 and 2.3.0 SDK protections. The new `--auth-success-url` and discovery-persistence code, for flaws of their own. The cause of the timing variance between runs. The XSS of #369 was not reproduced. No issue, comment, letter, pull request or publication went to the maintainer as part of this run.

## Files

- [data/cli-scenarios-0.15.1.json](data/cli-scenarios-0.15.1.json): the 9 October projection schema for the completed 0.15.1 run, with the full-run events and totals added.
- [data/all-cli-runs.json](data/all-cli-runs.json): the twelve runs with their counters and the SHA-256 of each raw trace.
- [data/release-checks-0.15.1.json](data/release-checks-0.15.1.json): four helper-check runs, 24 checks.
- [data/helper-continuity.json](data/helper-continuity.json): the ten helper regions in both bundles with line ranges and hashes.
- [data/five-path-statuses.json](data/five-path-statuses.json), [data/code-regions.json](data/code-regions.json): per-record status and the measured code regions.
- [data/sdk-analysis.json](data/sdk-analysis.json), [data/sdk-fragment-comparisons.json](data/sdk-fragment-comparisons.json), [data/sdk-protective-code-locations.json](data/sdk-protective-code-locations.json): the SDK identification and the 2.2.0 / 2.3.0 comparison.
- [data/acquisition-receipts.json](data/acquisition-receipts.json): fetch receipts for the registry documents, tarballs, releases and commits, with cookie headers removed.
- [data/environment.json](data/environment.json), [data/npm-view.json](data/npm-view.json), [data/npm-view-time.txt](data/npm-view-time.txt).
- [procedures/](procedures/): the two diffs against the 9 October procedures. The procedures themselves live in [research-2026-10-09](../research-2026-10-09/REPRODUCIBILITY.md).
- [MANIFEST.json](MANIFEST.json): SHA-256 and size of every file in this folder.

Local working-tree paths in the exported data files are replaced by `<bench-root>` and `<local-path>`. The raw traces, extracted archives, installed dependencies and snippet files stay in the researcher's working tree and are identified here by hash.
