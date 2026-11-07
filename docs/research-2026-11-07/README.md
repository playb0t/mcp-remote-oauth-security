# mcp-remote 0.16.3 and 0.16.4: the October procedure on the SDK 2.4.0 build, with runtime controls

Across the five follow-up releases `0.16.1` to `0.16.5` published by 7 November 2026, source comparisons show that the ten selected first-party discovery/hash helpers retain their bodies, and the inspected release notes do not name the five records or announce a release addressing them. With bundled client/core `2.4.0` in `mcp-remote 0.16.4`, the full published CLI still follows the F-01 / F-02 request paths and sends a token request with an Authorization header to the authorization server selected by MCP metadata. These execution results concern `0.16.3` and `0.16.4` on owned loopback fixtures; `0.16.5` was compared in source and distribution and was not run through the original five-record CLI procedure.

Researcher: **Alex Gercog (playb0t)**. Measurements were made on 7 November 2026. This folder records the original procedure's completed and stopped attempts, the two runtime controls and the source comparisons. It does not extend the official affected ranges of the five records. The ten first-party helpers above are distinct from the SDK declarations and callback-listener setup changes described below.

## What happened upstream

GitHub release and npm publication times are separate source fields. For example, `0.16.1` was released on GitHub at 20:42 UTC and published to npm at 20:45 UTC; `0.16.4` appears at 22:54 and 22:55 UTC respectively. The following table preserves both timestamps rather than substituting one for the other.

| Release | GitHub release UTC | npm publication UTC | Recorded change |
|---|---|---|---|
| `0.16.1` | 2026-11-05T20:42:05Z | 2026-11-05T20:45:11.485Z | Build dependency update to zod 4.6.6 or later (#387). |
| `0.16.2` | 2026-11-06T22:30:06Z | 2026-11-06T22:31:21.094Z | Empty bind-host uses loopback default (#391); cached registration read before scope comparison (#392). |
| `0.16.3` | 2026-11-06T22:38:12Z | 2026-11-06T22:40:18.606Z | IPv6 loopback callback host (#390); bundled client 2.0.0. |
| `0.16.4` | 2026-11-06T22:54:07Z | 2026-11-06T22:55:22.622Z | Build against SDK 2.4.0; client marker count changes from 6 to 7. |
| `0.16.5` | 2026-11-07T04:48:34Z | 2026-11-07T04:49:49.299Z | Refresh redemption coordinated once per host after 401; discard only the refused token (#389). Source and distribution compared; original five-record procedure not run. |

The `0.16.5` source comparison is the one-commit change `533159a925e964055b4b0cb3877285e33041a566`. It changes refresh-token coordination and conditional token-file removal. The selected ten helper bodies and source `package.json` / `pnpm-lock.yaml` are unchanged against `0.16.4`. The verified distribution comparison is described separately below; neither comparison is a five-record runtime result for `0.16.5`.

[Release metadata and source comparison](data/upstream-release-state.json), [npm timestamps](data/npm-release-times.json), [registry snapshot](data/npm-view.json). The four official archives used for the baseline/target/distribution comparisons (`0.16.0`, `0.16.3`, `0.16.4` and `0.16.5`) match their registry SHA-512 SRI; full archive/file hashes are in [acquisition receipts](data/acquisition-receipts.json).

## Procedure

The original October procedure used for the 3 November measurements was repeated on `0.16.3` and `0.16.4`. Its assertions, fixture responses and timeouts were retained. Only the helper PINS table and declared path/version bindings changed. Three CLI attempts per version were selected in advance. No observer variant replaced the original no-Authorization assertion.

The helper checker retained its four earlier pins and added the two targets: **72/72 recorded checks**, six versions × two runs × six checks; **24** checks belong to the two new targets. The versions are `0.14.3`, `0.15.1`, `0.15.2`, `0.16.0`, `0.16.3` and `0.16.4`. The original sanitizer controls also remain in the procedure. [Checker output](data/release-checks-2026-11-07.json).

Runtime: Windows x64, Node **24.20.0**, TypeScript **5.9.3** and the retained lockfile graph: express **4.22.3**, open **10.2.0**, strict-url-sanitise **0.0.1**, undici **7.30.0**. The CLI used `http-only` transport, `client-credentials` mode and synthetic static client information. No `--bind-host` argument was supplied. [Environment](data/environment.json), [complete procedures and provenance](procedures/README.md).

## Results

### All six original CLI attempts

Counts in this table come from each saved full event list, not a whole-file text search that would also count events repeated in scenario snapshots.

| Version | Attempt | Outcome | Completed scenarios | Full trace HTTP / canary / Authorization |
|---|---:|---|---:|---:|
| `0.16.3` | 1 | completed | 3/3 | 43 / 15 / 1 |
| `0.16.3` | 2 | stopped by original assertion | 0/3 | 16 / 7 / 1 |
| `0.16.3` | 3 | stopped by original assertion | 0/3 | 16 / 7 / 1 |
| `0.16.4` | 1 | stopped by original assertion | 0/3 | 16 / 7 / 1 |
| `0.16.4` | 2 | completed | 3/3 | 44 / 16 / 1 |
| `0.16.4` | 3 | completed | 3/3 | 44 / 16 / 1 |

The three stops retain the original `trace.every(e => !e.authorization_present)` assertion. Empty `cases` in those failure records means that the script stopped before appending its first case; it does not establish an outcome for the remaining scenarios. The failed attempts remain failed. Their data and raw records are retained separately from the three completed attempts. [All attempts](data/all-cli-runs.json), [attempt receipts](data/attempt-receipts.json).

### Snapshots and full traces

| Version / completed attempt | Scenario snapshots: HTTP / canary / RPC replies / Authorization | Full trace HTTP / canary / Authorization |
|---|---|---:|
| 0.16.3 / 1 | header-selected 14/5/3/0; header-redirect 17/8/3/0; same-origin 10/0/3/0 | 43/15/1 |
| 0.16.4 / 2 | header-selected 15/6/3/0; header-redirect 18/9/3/0; same-origin 10/0/3/0 | 44/16/1 |
| 0.16.4 / 3 | header-selected 15/6/3/0; header-redirect 18/9/3/0; same-origin 10/0/3/0 | 44/16/1 |

**Each of the three completed full traces contains one synthetic `POST /token` with an Authorization header to the loopback authorization server named by the fixture MCP metadata.** Only header presence was captured; no Authorization value is published.

The published `0.16.0` baseline has snapshots 15/6, 18/9 and 10/0 (HTTP/canary) and a full trace of 44/16/1. The `0.16.4` completed traces have those same counts; `0.16.3` has 14/5, 17/8 and 10/0 with a full trace of 43/15/1. The difference is recorded without assigning a cause. Snapshot and full-trace totals remain separate.

[0.16.3 projection](data/cli-scenarios-0.16.3.json), [0.16.4 projection](data/cli-scenarios-0.16.4.json), [0.16.0 baseline](data/baseline-cli-0.16.0.json), [raw provenance](data/raw-trace-provenance.json). The `0.16.4` public raw file holds both completed records; stopped attempts have separate raw files under `data/raw/failed/`.

## The five records in 0.16.3 and 0.16.4

| Record | Research ID | 0.16.3 | 0.16.4 | Scope |
|---|---|---|---|---|
| CVE-2026-51994 | F-01 | request path present | request path present | Full CLI and exact helpers request the server-selected metadata URL, including the controlled redirect. |
| CVE-2026-51995 | F-02 | request path present | request path present | Full CLI requests AS metadata selected by PRM; synthetic token POST is retained in the full trace. |
| CVE-2026-51996 | F-04 | code path present | code path present | Exact hash helper and chosen serialization/normalization controls. No real cache/session takeover measured. |
| CVE-2026-51997 | F-08 | code path present; opener route measured | code path present; opener route measured | Full CLI reaches the installed opener and controlled OS child recorder. |
| CVE-2026-52001 | F-11 | code path present; cross-origin 302 followed without bearer at canary | code path present; cross-origin 302 refused before canary | Bundled SSE transport controls; bearer transfer to the other origin was not observed. |

The `0.16.0` runtime reference shows the same classes for F-01/F-02/F-04/F-08 and the same tested F-11 cross-origin redirect outcome as `0.16.3`. The changed `0.16.4` outcome is stated as a transport observation, not a CVE applicability verdict. [Per-version statuses](data/five-path-statuses.json).

## Two paths measured at runtime

**F-08: an authorization URL reaches the OS opener boundary.** On both releases, loopback and link-local HTTP authorization URLs reached the real package's sanitizer/opener code and a controlled child recorder. A preload changed SYSTEMROOT only inside the already-started test Node process, selecting the recorder instead of Windows PowerShell. The recorder wrote argv and exited; it did not interpret the encoded command, open a browser or contact the URL. Four positive CLI cases produced captures; the waiting CLI processes were deliberately terminated after capture.

The two `javascript:` CLI cases were rejected by OAuth metadata schema before the provider. Direct provider-method controls produced four HTTP captures and four sanitizer rejections for script/mapped-IPv6 inputs. These are **6 CLI cases** and **8 method cases**, kept distinct. [CLI results](data/f08-cli-results.json), [method results](data/f08-method-results.json). The distributed recorder is source only.

**F-11: the cross-origin 302 outcome differs.** In `0.16.3`, the initial SSE GET carries the synthetic bearer and the redirect reaches the other loopback origin without Authorization. In `0.16.4`, the transport reports `redirectPolicy: 'same-origin'` and refuses the redirect before the canary request. Both releases retain bearer on same-origin redirect, reject a foreign SSE endpoint and omit Authorization in the no-token control. There are **4 recorded modes per release**, eight total.

The F-11 runner asserts export availability and records the mode results; its exit 0 alone is not an eight-assertion security result. The observations above are read from the recorded request events and outcomes. The transport uses the real bundled SSE/EventSource implementation with a synthetic provider supplied through its public parameter. [Transport results](data/f11-results.json).

## The SDK inside the bundle

The `0.16.3` build uses client/core **2.0.0**; `0.16.4` uses **2.4.0**. Client section markers increase from **6 to 7**. Source locks and bundle headers support this comparison; the older 2.0.0 archive-identification exercise remains attributed to the previous published research.

The bundled `discoverAuthorizationServerMetadata` changes one fallback condition: from `response.status >= 400 && response.status < 500 || response.status === 502` to `response.status < 500 || response.status === 502`. The first-party callback helper resolves an empty bind-host to the default and passes that resolved address to `app.listen`. This listener binding is separate from the SDK condition. `getServerUrlHash`, `discoverOAuthProtectedResourceMetadata` and `selectResourceURL` retain their compared declarations after the labeled normalization.

Published client ranges for [CVE-2026-104850](https://github.com/advisories/GHSA-6qxp-vccf-f47h) are `>=2.0.0, <2.2.0`; for [CVE-2026-111769](https://github.com/advisories/GHSA-6prh-2h8m-c8cw), `>=2.0.0, <2.3.0`. Client 2.0.0 is within both ranges and client 2.4.0 is outside both. This is SDK package-version data, not a conclusion about the five records or every application-owned OAuth path. [SDK analysis](data/sdk-analysis.json).

### 0.16.5 distribution comparison

Version `0.16.5` was also acquired from npm. Its SHA-512 matches registry `dist.integrity`; the archive, entrypoint and file SHA-256 values are retained in the receipts. The five compared declarations (`getServerUrlHash`, `discoverOAuthProtectedResourceMetadata`, `discoverAuthorizationServerMetadata`, `selectResourceURL` and `setupOAuthCallbackServerWithLongPoll`) are byte-identical to `0.16.4`. Client section markers remain **7** and the source dependency manifest/lock still identify client/core **2.4.0**.

Eight of nine compared SDK sections are byte-identical. The remaining section has 13 emitted `tokenRequestParams2` identifier occurrences and three expanded object/destructuring shorthand forms. The raw mismatch is retained; a separate, explicitly listed reversible projection makes that section's text equal. This is not reported as whole-program byte identity or silently included in the raw-equal count. [Distribution evidence](data/distribution-0.16.5.json), [SDK emission diff](data/sdk-emission-0.16.4-0.16.5.diff), [full archive comparison](data/all-dist-comparison-0.16.4-0.16.5.json), [archive diff](data/all-dist-0.16.4-0.16.5.diff).

Thus `0.16.5` was compared in source and distribution: the five record-helper declarations match `0.16.4`, and the bundled SDK remains version 2.4.0 with the declared emission difference. It was **not run through the original five-record CLI procedure**. No 0.16.5 row is added to the six CLI attempts or 72 helper checks above.

## What the diff changes and what it does not

The complete 0.16.0 to 0.16.4 published archive comparison pairs the renamed main chunks and includes all **10 regular archive files**. Source comparisons of the five subsequent tags show the same ten selected first-party helper bodies. In compiled output, **7/10 raw helper hashes** match baseline 0.16.0 on each new version; **10/10** match the separately labeled identifier-suffix-normalized hashes. Those hash schemes are not equated and do not establish whole-program equivalence.

The callback-listener change and the bundled SDK metadata fallback condition are recorded separately; they are not hidden by the first-party helper count. `0.16.5` changes refresh coordination/token removal but not the selected helpers, source package manifest or source lock against 0.16.4. Its original five-record CLI procedure has not been run here. [Helper continuity](data/helper-continuity.json), [code regions](data/code-regions.json), [archive comparison](data/all-dist-comparison.json), [complete diff](data/all-dist.diff), [upstream source comparison](data/upstream-release-state.json).

## Not verified here

A changed official affected range or universal applicability of a record to a later package. Real OAuth accounts, production credentials or their acceptance. Third-origin response disclosure in the original metadata chain. Chosen-victim cache takeover, cross-user session reuse or MD5 cryptanalysis. Actual browser navigation, access to internal/link-local services or arbitrary code execution in these runs. Other SSE conditions, every provider/redirect policy/dependency graph/OS, non-default bind-host, or a cause/frequency for the count difference. The original five-record CLI procedure on `0.16.1`, `0.16.2` or `0.16.5`.

Publication adaptation did not execute these portable runtime entry points, HTTP fixtures, recorder or browser. Static parsing and syntax checks are publication-preparation checks, not new runtime observations. Separate later research lines are not part of this folder.

## Files

- `data/acquisition-receipts.json`: official 0.16.0/0.16.3/0.16.4/0.16.5 archive SRI and file identities.
- `data/cli-scenarios-0.16.3.json` and `-0.16.4.json`: selected completed scenario projections; all completed records remain in public raw logs.
- `data/all-cli-runs.json`, `attempt-receipts.json` and `raw/`: all six attempts, including three original assertion stops.
- `data/release-checks-2026-11-07.json`: 12 helper runs, 72 recorded checks, 24 on targets.
- `data/helper-continuity.json`, `code-regions.json`, `all-dist-comparison.json`, `all-dist.diff`, `sdk-analysis.json`, `upstream-release-state.json`: static comparisons and limits.
- `data/f08-cli-results.json`, `f08-method-results.json` and `f11-results.json`: runtime observations.
- `data/environment.json`, `npm-view.json`, `npm-view-time.txt` and `npm-release-times.json`: environment and registry snapshot.
- `data/raw-trace-provenance.json` and `source-transforms.json`: publication transformations. No Authorization value was captured; filesystem paths use placeholders.
- `data/distribution-0.16.5.json` and the 0.16.4/0.16.5 comparison/diff files: source-and-distribution supplement, not a five-record runtime run.
- `procedures/`: original/applied/portable sources, exact version copies, diffs, tooling/lock and recorder source.
- `MANIFEST.json`: schema 1, research_date 2026-11-07, every file's byte count and SHA-256, excluding itself.
