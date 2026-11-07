# mcp-remote 0.16.3, 0.16.4 and 0.16.5: the October procedure on the SDK 2.4.0 build, with runtime controls

Across the five follow-up releases `0.16.1` to `0.16.5` published by 7 November 2026, source comparisons show that the ten selected first-party discovery/hash helpers retain their bodies, and the inspected release notes do not name the five records or announce a release addressing them. With bundled client/core `2.4.0` in `mcp-remote 0.16.4`, the full published CLI still follows the F-01 / F-02 request paths and sends a token request with an Authorization header to the authorization server selected by MCP metadata. These execution results cover `0.16.3`, `0.16.4` and `0.16.5` on owned loopback fixtures. All three original CLI attempts on `0.16.5` stopped at the unchanged no-Authorization assertion; their partial events and the separate helper/F-08/F-11 outcomes are retained below.

Researcher: **Alex Gercog (playb0t)**. Measurements were made on 7 November 2026. This folder records the original procedure's completed and stopped attempts, the two runtime controls and the source comparisons. It does not extend the official affected ranges of the five records. The ten first-party helpers above are distinct from the SDK declarations and callback-listener setup changes described below.

## What happened upstream

GitHub release and npm publication times are separate source fields. For example, `0.16.1` was released on GitHub at 20:42 UTC and published to npm at 20:45 UTC; `0.16.4` appears at 22:54 and 22:55 UTC respectively. The following table preserves both timestamps rather than substituting one for the other.

| Release | GitHub release UTC | npm publication UTC | Recorded change |
|---|---|---|---|
| `0.16.1` | 2026-11-05T20:42:05Z | 2026-11-05T20:45:11.485Z | Build dependency update to zod 4.6.6 or later (#387). |
| `0.16.2` | 2026-11-06T22:30:06Z | 2026-11-06T22:31:21.094Z | Empty bind-host uses loopback default (#391); cached registration read before scope comparison (#392). |
| `0.16.3` | 2026-11-06T22:38:12Z | 2026-11-06T22:40:18.606Z | IPv6 loopback callback host (#390); bundled client 2.0.0. |
| `0.16.4` | 2026-11-06T22:54:07Z | 2026-11-06T22:55:22.622Z | Build against SDK 2.4.0; client marker count changes from 6 to 7. |
| `0.16.5` | 2026-11-07T04:48:34Z | 2026-11-07T04:49:49.299Z | Refresh redemption coordinated once per host after 401; discard only the refused token (#389). Source/distribution compared; three original CLI assertion stops, plus helper/F-08/F-11 outcomes retained. |

The `0.16.5` source comparison is the one-commit change `533159a925e964055b4b0cb3877285e33041a566`. It changes refresh-token coordination and conditional token-file removal. The selected ten helper bodies and source `package.json` / `pnpm-lock.yaml` are unchanged against `0.16.4`. The distribution comparison and the later original-procedure runtime attempts are reported separately below.

[Release metadata and source comparison](data/upstream-release-state.json), [npm timestamps](data/npm-release-times.json), [registry snapshot](data/npm-view.json). The four official archives used for the baseline/target/distribution comparisons (`0.16.0`, `0.16.3`, `0.16.4` and `0.16.5`) match their registry SHA-512 SRI; full archive/file hashes are in [acquisition receipts](data/acquisition-receipts.json).

## Procedure

The original October procedure used for the 3 November measurements was repeated on `0.16.3`, `0.16.4` and `0.16.5`. Its assertions, fixture responses and timeouts were retained. Only the helper PINS table and declared path/version bindings changed. Three CLI attempts per version were selected in advance. No observer variant replaced the original no-Authorization assertion.

The helper checker retained its earlier pins and added the three targets: **84/84 recorded checks**, seven versions x two runs x six checks; **36** checks belong to the three target versions. The versions are `0.14.3`, `0.15.1`, `0.15.2`, `0.16.0`, `0.16.3`, `0.16.4` and `0.16.5`. The original sanitizer controls also remain in the procedure. [Checker output](data/release-checks-2026-11-07.json).

Runtime: Windows x64, Node **24.20.0**, TypeScript **5.9.3** and the retained lockfile graph: express **4.22.3**, open **10.2.0**, strict-url-sanitise **0.0.1**, undici **7.30.0**. The CLI used `http-only` transport, `client-credentials` mode and synthetic static client information. No `--bind-host` argument was supplied. [Environment](data/environment.json), [complete procedures and provenance](procedures/README.md).

## Results

### All nine original CLI attempts

Counts in this table come from each saved full event list, not a whole-file text search that would also count events repeated in scenario snapshots.

| Version | Attempt | Outcome | Completed scenarios | Full trace HTTP / canary / Authorization |
|---|---:|---|---:|---:|
| `0.16.3` | 1 | completed | 3/3 | 43 / 15 / 1 |
| `0.16.3` | 2 | stopped by original assertion | 0/3 | 16 / 7 / 1 |
| `0.16.3` | 3 | stopped by original assertion | 0/3 | 16 / 7 / 1 |
| `0.16.4` | 1 | stopped by original assertion | 0/3 | 16 / 7 / 1 |
| `0.16.4` | 2 | completed | 3/3 | 44 / 16 / 1 |
| `0.16.4` | 3 | completed | 3/3 | 44 / 16 / 1 |
| `0.16.5` | 1 | stopped by original assertion | 0/3 | 16 / 7 / 1 |
| `0.16.5` | 2 | stopped by original assertion | 0/3 | 16 / 7 / 1 |
| `0.16.5` | 3 | stopped by original assertion | 1/3 | 35 / 17 / 2 |

The six stops retain the original `trace.every(e => !e.authorization_present)` assertion. Empty `cases` in a failure record means that the script stopped before appending its first case; it does not establish an outcome for the remaining scenarios. The failed attempts remain failed. Their data and raw records are retained separately from the three completed attempts. The third 0.16.5 attempt records one completed scenario before its later stop; this is not a completed three-scenario run. [All attempts](data/all-cli-runs.json), [attempt receipts](data/attempt-receipts.json).

### Snapshots and full traces

| Version / completed attempt | Scenario snapshots: HTTP / canary / RPC replies / Authorization | Full trace HTTP / canary / Authorization |
|---|---|---:|
| 0.16.3 / 1 | header-selected 14/5/3/0; header-redirect 17/8/3/0; same-origin 10/0/3/0 | 43/15/1 |
| 0.16.4 / 2 | header-selected 15/6/3/0; header-redirect 18/9/3/0; same-origin 10/0/3/0 | 44/16/1 |
| 0.16.4 / 3 | header-selected 15/6/3/0; header-redirect 18/9/3/0; same-origin 10/0/3/0 | 44/16/1 |

**Each of the three completed full traces contains one synthetic `POST /token` with an Authorization header to the loopback authorization server named by the fixture MCP metadata.** Only header presence was captured; no Authorization value is published.

For `0.16.5` there is no completed-run projection. Attempts 1/2 stop in the first scenario. Attempt 3 retains a completed header-selected snapshot of **15/6/3/0**, reaches the metadata redirect and then stops in that scenario. Its full saved event list is **35/17/2**. The same-origin CLI control was not reached. No successful scenario or total is copied from an earlier version. [All 0.16.5 attempts and partial snapshot](data/cli-scenarios-0.16.5.json).

The three stopped 0.16.5 full event lists contain **1, 1, 2** synthetic token POSTs with Authorization presence. These are saved counts under the original procedure, not a frequency or causal claim. They do not alter the one-event statement for the three completed 0.16.3/0.16.4 traces.

The published `0.16.0` baseline has snapshots 15/6, 18/9 and 10/0 (HTTP/canary) and a full trace of 44/16/1. The `0.16.4` completed traces have those same counts; `0.16.3` has 14/5, 17/8 and 10/0 with a full trace of 43/15/1. The difference is recorded without assigning a cause. Snapshot and full-trace totals remain separate.

[0.16.3 projection](data/cli-scenarios-0.16.3.json), [0.16.4 projection](data/cli-scenarios-0.16.4.json), [0.16.0 baseline](data/baseline-cli-0.16.0.json), [raw provenance](data/raw-trace-provenance.json). The `0.16.4` public raw file holds both completed records; stopped attempts have separate raw files under `data/raw/failed/`.

## The five records in 0.16.3, 0.16.4 and 0.16.5

| Record | Research ID | 0.16.3 | 0.16.4 | 0.16.5 | Scope |
|---|---|---|---|---|---|
| CVE-2026-51994 | F-01 | request path present | request path present | request path observed before assertion stops | Full CLI and exact helpers request the server-selected metadata URL, including the controlled redirect. |
| CVE-2026-51995 | F-02 | request path present | request path present | request path observed before assertion stops | Full CLI requests AS metadata selected by PRM; synthetic token POST is retained in the full trace. |
| CVE-2026-51996 | F-04 | code path present | code path present | code path present; helper controls passed | Exact hash helper and chosen serialization/normalization controls. No real cache/session takeover measured. |
| CVE-2026-51997 | F-08 | code path present; opener route measured | code path present; opener route measured | code path present; opener route measured | Full CLI reaches the installed opener and controlled OS child recorder. |
| CVE-2026-52001 | F-11 | code path present; cross-origin 302 followed without bearer at canary | code path present; cross-origin 302 refused before canary | code path present; cross-origin 302 refused before canary | Bundled SSE transport controls; bearer transfer to the other origin was not observed. |

The `0.16.0` runtime reference shows the same classes for F-01/F-02/F-04/F-08 and the same tested F-11 cross-origin redirect outcome as `0.16.3`. The shared `0.16.4` / `0.16.5` redirect-refusal outcome is stated as a transport observation, not a CVE applicability verdict. [Per-version statuses](data/five-path-statuses.json).

## Two paths measured at runtime

**F-08: an authorization URL reaches the OS opener boundary.** On all three releases, loopback and link-local HTTP authorization URLs reached the real package's sanitizer/opener code and a controlled child recorder. A preload changed SYSTEMROOT only inside the already-started test Node process, selecting the recorder instead of Windows PowerShell. The recorder wrote argv and exited; it did not interpret the encoded command, open a browser or contact the URL. Six positive CLI cases produced captures; the waiting CLI processes were deliberately terminated after capture.

The three `javascript:` CLI cases were rejected by OAuth metadata schema before the provider. Direct provider-method controls produced six HTTP captures and six sanitizer rejections for script/mapped-IPv6 inputs. These are **9 CLI cases** and **12 method cases**, kept distinct. [CLI results](data/f08-cli-results.json), [method results](data/f08-method-results.json). The distributed recorder is source only. An initial 0.16.5 F-08 controller failed before target spawn because its test-state parent was missing; that setup log is retained. After creating the directory, the identical script completed its three cases. [Setup record](data/setup-attempts.json).

**F-11: the cross-origin 302 outcome differs.** In `0.16.3`, the initial SSE GET carries the synthetic bearer and the redirect reaches the other loopback origin without Authorization. In `0.16.4` and `0.16.5`, the transport reports `redirectPolicy: 'same-origin'` and refuses the redirect before the canary request. All three releases retain bearer on same-origin redirect, reject a foreign SSE endpoint and omit Authorization in the no-token control. There are **4 recorded modes per release**, twelve total.

The F-11 runner asserts export availability and records the mode results; its exit 0 alone is not a twelve-assertion security result. The observations above are read from the recorded request events and outcomes. The transport uses the real bundled SSE/EventSource implementation with a synthetic provider supplied through its public parameter. [Transport results](data/f11-results.json).

## The SDK inside the bundle

The `0.16.3` build uses client/core **2.0.0**; `0.16.4` uses **2.4.0**. Client section markers increase from **6 to 7**. Source locks and bundle headers support this comparison; the older 2.0.0 archive-identification exercise remains attributed to the previous published research.

The bundled `discoverAuthorizationServerMetadata` changes one fallback condition: from `response.status >= 400 && response.status < 500 || response.status === 502` to `response.status < 500 || response.status === 502`. The first-party callback helper resolves an empty bind-host to the default and passes that resolved address to `app.listen`. This listener binding is separate from the SDK condition. `getServerUrlHash`, `discoverOAuthProtectedResourceMetadata` and `selectResourceURL` retain their compared declarations after the labeled normalization.

Published client ranges for [CVE-2026-104850](https://github.com/advisories/GHSA-6qxp-vccf-f47h) are `>=2.0.0, <2.2.0`; for [CVE-2026-111769](https://github.com/advisories/GHSA-6prh-2h8m-c8cw), `>=2.0.0, <2.3.0`. Client 2.0.0 is within both ranges and client 2.4.0 is outside both. This is SDK package-version data, not a conclusion about the five records or every application-owned OAuth path. [SDK analysis](data/sdk-analysis.json).

### 0.16.5 distribution comparison

Version `0.16.5` was also acquired from npm. Its SHA-512 matches registry `dist.integrity`; the archive, entrypoint and file SHA-256 values are retained in the receipts. The five compared declarations (`getServerUrlHash`, `discoverOAuthProtectedResourceMetadata`, `discoverAuthorizationServerMetadata`, `selectResourceURL` and `setupOAuthCallbackServerWithLongPoll`) are byte-identical to `0.16.4`. Client section markers remain **7** and the source dependency manifest/lock still identify client/core **2.4.0**.

Eight of nine compared SDK sections are byte-identical. The remaining section has 13 emitted `tokenRequestParams2` identifier occurrences and three expanded object/destructuring shorthand forms. The raw mismatch is retained; a separate, explicitly listed reversible projection makes that section's text equal. This is not reported as whole-program byte identity or silently included in the raw-equal count. [Distribution evidence](data/distribution-0.16.5.json), [SDK emission diff](data/sdk-emission-0.16.4-0.16.5.diff), [full archive comparison](data/all-dist-comparison-0.16.4-0.16.5.json), [archive diff](data/all-dist-0.16.4-0.16.5.diff).

Thus `0.16.5` was compared in source and distribution: the five record-helper declarations match `0.16.4`, and the bundled SDK remains version 2.4.0 with the declared emission difference. It was subsequently run through the original five-record procedure. All three CLI attempts stopped at the unchanged assertion; helper and F-08/F-11 outcomes are reported above. The distribution comparison remains a separate static observation.

## What the diff changes and what it does not

The complete 0.16.0 to 0.16.4 published archive comparison pairs the renamed main chunks and includes all **10 regular archive files**. Source comparisons of the five subsequent tags show the same ten selected first-party helper bodies. In compiled output, **7/10 raw helper hashes** match baseline 0.16.0 on each new version; **10/10** match the separately labeled identifier-suffix-normalized hashes. Those hash schemes are not equated and do not establish whole-program equivalence.

The callback-listener change and the bundled SDK metadata fallback condition are recorded separately; they are not hidden by the first-party helper count. `0.16.5` changes refresh coordination/token removal but not the selected helpers, source package manifest or source lock against 0.16.4. Its original-procedure attempts and their stops are retained above. [Helper continuity](data/helper-continuity.json), [code regions](data/code-regions.json), [archive comparison](data/all-dist-comparison.json), [complete diff](data/all-dist.diff), [upstream source comparison](data/upstream-release-state.json).

## Separate credential-destination criterion v2

The original CLI tables above still use unchanged procedure 216, including all six assertion stops. The new criterion does not replace that procedure or retroactively reclassify its traces.

**Detector validation:** 35 synthetic unit controls passed their expected outcomes. They cover allowed client Authorization to the trusted issuer, forbidden recipients/routes/kinds, body credentials without a header, redirects, distinct resource Bearer, and missing policy/body/context/coverage becoming INCONCLUSIVE. This establishes the behavior of the supplied detector within those controls; it is not a product security result.

**Observed on the product:** a separate corrected series on the official 0.16.5 distribution produced the following row. Every case reached its stated postcondition and the observation completed.

| Product | Runtime cases | Criterion PASS | Criterion FAIL | INCONCLUSIVE |
|---|---:|---:|---:|---:|
| mcp-remote 0.16.5 | 11 | 7 | 4 | 0 |

The four FAIL cases recorded fixture-matching credentials at forbidden B: Basic client authentication, body client secret, a secret preserved through 307, and a device code preserved through 307 after Basic was stripped. Expected client authentication to A and separately permitted MCP resource Bearer passed. Header stripping, 302 body removal and SDK guard controls remain visible. All eleven results matched the predeclared case expectations; four are still security FAIL outcomes.

Expected issuer and receiver policy are trusted pre-run inputs, independent of MCP metadata. Hash pinning detects policy changes but is not authentication. The receiver is recorded at the actual listening fixture; both headers and credential-bearing bodies are observed. A cross-origin request without credential transfer is recorded without being labeled disclosure by this criterion.

[Exact evaluator, controls and replay instructions](procedures/credential-destination-v2/README.md), [detector controls](data/credential-destination-v2/unit-controls.json), [0.16.5 observations](data/credential-destination-v2/runtime-0.16.5.json), [predeclared cases](data/credential-destination-v2/cases.json), [policies bound before launch](data/credential-destination-v2/policies.json), [summary and source bindings](data/credential-destination-v2/summary.json).

This separate section does not change the five-record status table or official affected ranges. Its PASS concerns observed credential destination rules on the listed loopback fixtures; unknown trust/context/coverage is INCONCLUSIVE, and token authenticity, production behavior and broader OAuth safety remain outside this check.

## Not verified here

A changed official affected range or universal applicability of a record to a later package. Real OAuth accounts, production credentials or their acceptance. Third-origin response disclosure in the original metadata chain. Chosen-victim cache takeover, cross-user session reuse or MD5 cryptanalysis. Actual browser navigation, access to internal/link-local services or arbitrary code execution in these runs. Other SSE conditions, every provider/redirect policy/dependency graph/OS, non-default bind-host, or a cause/frequency for the count difference. The original five-record CLI procedure on `0.16.1` or `0.16.2`, and a completed three-scenario CLI run or same-origin CLI control on `0.16.5`.

Publication adaptation did not execute the portable runtime copies. The added 0.16.5 runs used the retained original procedures, not the portable variants. Static parsing and syntax checks are publication-preparation checks, not new runtime observations. The separately labeled credential-destination criterion is included below the original results; other later research lines are not part of this folder.

## Files

- `data/acquisition-receipts.json`: official 0.16.0/0.16.3/0.16.4/0.16.5 archive SRI and file identities.
- `data/cli-scenarios-0.16.3.json` and `-0.16.4.json`: selected completed projections; `-0.16.5.json` explicitly records no completed run and the genuine partial snapshot.
- `data/all-cli-runs.json`, `attempt-receipts.json` and `raw/`: all nine attempts, including six original assertion stops.
- `data/release-checks-2026-11-07.json`: 14 helper runs, 84 recorded checks, 36 on targets.
- `data/helper-continuity.json`, `code-regions.json`, `all-dist-comparison.json`, `all-dist.diff`, `sdk-analysis.json`, `upstream-release-state.json`: static comparisons and limits.
- `data/f08-cli-results.json`, `f08-method-results.json` and `f11-results.json`: runtime observations.
- `data/environment.json`, `npm-view.json`, `npm-view-time.txt` and `npm-release-times.json`: environment and registry snapshot.
- `data/raw-trace-provenance.json` and `source-transforms.json`: publication transformations. No Authorization value was captured; filesystem paths use placeholders.
- `data/distribution-0.16.5.json` and the 0.16.4/0.16.5 comparison/diff files: source-and-distribution comparison, separate from the added original-procedure runtime attempts.
- `procedures/`: original/applied/portable sources, exact version copies, diffs, tooling/lock and recorder source.
- `MANIFEST.json`: schema 1, research_date 2026-11-07, every file's byte count and SHA-256, excluding itself.
