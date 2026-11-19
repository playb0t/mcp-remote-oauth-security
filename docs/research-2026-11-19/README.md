# mcp-remote 0.16.7: seven findings and two cache changes

All seven original findings remain in their recorded states and evidence classes on mcp-remote 0.16.7, measured on 19 November 2026. The eleven credential-destination scenarios record 9 PASS / 2 FAIL / 0 INCONCLUSIVE; those counts and the three cache-series counts match 0.16.6. The release changes cache behavior in two places. One extends the old-cache path recorded on 14 November: a saved client registration with a portless loopback callback is removed by 0.16.6 but retained by 0.16.7, and in the component control the second authorization server receives the client secret and refresh token assigned to the first.

Research by **Alex Gercog (playb0t)**. F-04 and F-11 remain corrected hardening records. No cross-origin Bearer transfer was observed in either F-11 repeat. The initial portless control calls the published parser and provider with second-server metadata supplied directly; its boundary is detailed below. A separate [full-CLI follow-up](FULL-CLI-ADDENDUM.md) now records actual discovery, matched refresh credentials at B and a returned MCP initialize result, with an explicit query-observation correction. This is a local Windows/loopback assessment, with official CVE ranges unchanged by these measurements.

## Upstream changes

The [release notes](https://github.com/punkpeye/mcp-remote/releases/tag/v0.16.7) list two changes:

- [aa0c219b, #395](https://github.com/punkpeye/mcp-remote/commit/aa0c219b19e9f299fba599fe14df88b14d1e21a8) expands header environment variables before computing `serverUrlHash`.
- [83a7f708, #394](https://github.com/punkpeye/mcp-remote/commit/83a7f7087d060a2230ff64f76a7205b61e6f1f4b) retains a loopback client registration whose stored callback omits a port.

The tag comparison changes `src/lib/utils.ts` and its test. The emitted client marker remains `@modelcontextprotocol/client` 2.4.0. The release notes name none of the five research CVE IDs. [Primary-source observations](data/upstream.json) and the [official bundle comparison](data/source-review.diff) accompany this summary. The bundle comparison also contains the version-string change.

## All seven findings: 0.16.6 and 0.16.7

| Finding / recorded identifier | 0.16.6, 14 November | 0.16.7, 19 November | Evidence class and limit |
|---|---|---|---|
| F-01 / CVE-2026-51994 | MCP header selects B resource metadata | Same request path to B/prm | Full CLI and actual loopback HTTP; no private/cloud endpoint experiment |
| F-02 / CVE-2026-51995 | PRM selects B authorization metadata; configured credentials reach B | Same metadata path and matched Basic/form-body credentials at B/token | Full CLI and predeclared owner/receiver policy; no production-account claim |
| F-04 / CVE-2026-51996 | MD5 namespace; distinct tuples serialize identically | Same construction and ambiguity; environment-header inputs now differ | Exact package function and source; hardening record. No cryptographic collision, second-preimage or namespace takeover established |
| F-08 / CVE-2026-51997 | Internal HTTP URL reaches inert opener | Loopback/link-local HTTP still reaches recorder; scheme controls reject | Provider method and full CLI to recorder boundary; real browser navigation outside the experiment |
| F-09 / no confirmed public-record binding | Four credential classes readable in stored files by the same principal | Client secret, access/refresh tokens and PKCE verifier still readable | Actual store methods and same-principal file reads; no cross-user access or ACL bypass established |
| F-10 / no confirmed public-record binding | Discovery redirects reach B; grant POST redirect is constrained | Same PRM/AS-metadata redirects and separate grant POST behavior | Component HTTP plus CLI grant controls; no claim covering every redirect or transport |
| F-11 / CVE-2026-52001 | Wrapper-local origin comparison absent; tested transport controls hold | Same wrapper construction; no cross-origin Bearer receipt | Source plus two transport procedures; hardening record, bounded to recorded startup/redirect/endpoint windows |

[Five component groups](data/seven-findings/) contain **19 planned conditions**, all reached. Property verdicts are FAIL for F-04/F-08/F-09/F-10 and PASS for the tested F-11 recipient boundary; reaching a condition is separate from a security PASS. [Foreign-issuer Basic](data/credential-v2/initial/foreign-issuer-basic.json) and [POST](data/credential-v2/initial/foreign-issuer-post.json) preserve the exact fixture-match booleans at B.

Five identifier bindings above come from prior research. This pass made no CVE-registry status query and assigns no public record to F-09/F-10. The [14 November package](https://github.com/playb0t/mcp-remote-oauth-security/tree/d98ed2edd73014e18446f73c63bd563e74aeeac6/docs/research-2026-11-14) retains the earlier identifier-state observations.

## Eleven credential-destination scenarios and old cache

A is the predeclared credential owner and approved receiver. B is a different, unapproved loopback origin. R is the permitted MCP resource. Receiver policies are recorded before target spawn; metadata and redirects do not extend them.

| Version | Scenarios | PASS | FAIL | INCONCLUSIVE |
|---|---:|---:|---:|---:|
| 0.16.6 reference | 11 | 9 | 2 | 0 |
| 0.16.7 | 11 | 9 | 2 | 0 |

`foreign-issuer-basic` and `foreign-issuer-post` remain FAIL. Cross-origin 307 requests carrying a client-secret or device-code body stop before B. Same-origin Basic, an explicit token endpoint and permitted resource Bearer controls retain their recorded behavior. A terminal token-fixture refusal can coexist with an observed credential receipt; PASS is not a claim of completed OAuth. [Per-case comparison](data/oauth-comparison.json).

The initial cache seed and its later corrections were repeated as separate, unchanged families:

| Physical series | Attempts | PASS | FAIL | INCONCLUSIVE |
|---|---:|---:|---:|---:|
| Initial | 18 | 13 | 2 | 3 |
| cache-r2 | 3 | 0 | 2 | 1 |
| cache-r3 | 3 | 1 | 2 | 0 |

The three initial INCONCLUSIVE expiry cases repeat the known missing-`redirect_uris` seed defect from 14 November. `cache-r2` retains the known erroneous `old_access_returned=false` postcondition even though the fixture returns the same access canary. Its three postconditions remain false; two directly observed forbidden receipts remain FAIL and its permitted A control remains INCONCLUSIVE. These are the same fixture/postcondition defects, not new target behavior. `cache-r3` retains the corrected predeclared returned-token and changed-file predicates: both B cases are FAIL, while the permitted A refresh is PASS.

In final `cache-r3`, matched client secret and refresh token reach B both without stored issuer and with issuer A stored in client/token records. Valid legacy tokens and static-client cache controls retain the initial results. All 24 issuer/cache child closes and 72 server-close callbacks were recorded without forced stops or callback errors.

The 24 physical attempts contain 14 PASS / 6 FAIL / 4 INCONCLUSIVE and answer 18 distinct questions. Selecting the 15 initially complete rows plus three `cache-r3` rows gives **14 PASS / 4 FAIL / 0 INCONCLUSIVE**. This is a consolidated selection, not one clean 18-case execution. [Initial records](data/credential-v2/initial/), [cache-r2](data/credential-v2/cache-r2/), [cache-r3](data/credential-v2/cache-r3/), [summary](data/summary.json).

The unchanged 35-condition criterion unit suite was replayed three times; that is 35 unique unit conditions. The 54 initial and nine-per-cache-series detector controls matched their positive/negative/fault expectations. These 72 detector executions are separate from target coverage. [Unit controls](data/criterion-unit-controls.json), [named detector controls](data/detector-controls/).

## F-11: two repeats on 0.16.7

| Recorded transport condition | Component procedure | Original transport procedure |
|---|---|---|
| Cross-origin SSE 302 A to B | Rejected before B | Rejected before B |
| SSE advertises endpoint on B | Endpoint origin rejected; no POST B | Endpoint origin rejected; no POST B |
| Same-origin 302 | Synthetic Bearer retained on A | Synthetic Bearer retained on A |
| No token | No Authorization | No Authorization |

Both four-condition repeats reach their controls. Neither observes cross-origin Bearer receipt. F-11 remains the corrected hardening record. The original procedure imports published `connectToRemoteServer` with its actual SSE transport and controlled provider; it does not launch the full CLI. The wrapper-local comparison remains absent while the tested SDK/transport restrictions act. [Component records](data/seven-findings/f11.json), [original procedure records](data/legacy-procedure/f11-current.json). The historical 0.1.38 pair was not rerun for this update.

## F-08: full CLI repeat

The original procedure launches unmodified 0.16.7 `proxy.js` with local MCP/PRM/AS metadata and a test-only preload selecting an inert recorder. Loopback and link-local HTTP authorization URLs reach the recorder. `javascript:` is rejected earlier by SDK metadata validation with a ZodError.

The inherited collector expects the text `Invalid url`, so raw **`checks.script=false`** remains even though the CLI rejects the scheme. The two recorder-reaching CLI processes are intentionally stopped with SIGTERM while awaiting OAuth callback; their close events are recorded. The script-negative CLI exits naturally with code 1. This is the same bounded result as 14 November. [Rows, stop states and diagnostic text](data/legacy-procedure/f08-current.json).

## Cache change: environment-expanded header

The published `parseCommandLineArgs` is called twice with one `Authorization: Bearer ${TEST_HEADER}` template and two different synthetic environment values. Actual provider `saveTokens` calls materialize their namespace prefixes in the same isolated profile.

| Version | Both header values expanded | Distinct namespace prefixes | Actual token-cache files |
|---|---|---|---:|
| 0.16.6 | Yes | No | 1 |
| 0.16.7 | Yes | Yes | 2 |

The changed order makes the expanded header value part of the namespace input. MD5 and the F-04 serialization property remain. This does not establish a practical collision or another user's cache access. These counts concern token-file prefixes within one profile directory, not two separate physical profile directories. [0.16.6 rows](data/cache-changes/env-0.16.6-pair.json), [0.16.7 rows](data/cache-changes/env-0.16.7-pair.json).

## Cache change: portless loopback callback

Each fixture seeds a dynamic `client_info` record and expired tokens naming issuer A. The published `parseCommandLineArgs` runs with callback `http://127.0.0.1:18001/oauth/callback`, then `NodeOAuthClientProvider.tokens` runs with current metadata for B supplied directly to the provider.

| Stored callback | 0.16.6 | 0.16.7 |
|---|---|---|
| `http://127.0.0.1/oauth/callback`, no port | Registration removed; no refresh B | Registration retained; matched A client secret and refresh token received by B/token |
| `http://127.0.0.1:18002/oauth/callback`, wrong port | Registration removed; no refresh B | Registration removed; no refresh B |
| `http://127.0.0.1:18001/oauth/callback`, exact port | Registration retained; both credentials received by B | Registration retained; both credentials received by B |

This control executes **parser to provider**. Discovery, dynamic client registration and the full CLI were not executed in this control. Only `127.0.0.1` was measured among loopback names. Removal of the registration stops the later path before the refresh recipient; the empty B trace in those rows is not evidence of an issuer-binding check. The retained portless registration in 0.16.7 extends the observed old-cache path, as the exact-port and `cache-r3` controls show. Each of the six registration groups records two successful server-close callbacks. [All eight additional groups](data/cache-changes/) retain their original checks and errors.

## Full CLI follow-up and query qualification

The [same-day addendum](FULL-CLI-ADDENDUM.md) records seven full published CLI cases. Portless 0.16.7 follows actual MCP401/PRM/AS discovery to B, sends matched issuer-A client secret and refresh token there, persists the returned access token and completes initialize. Exact-port controls reach B on both versions; portless 0.16.6 and wrong-port controls remove the registration and reach a controlled DCR refusal. A same-issuer-A control completes permitted refresh.

The new full-CLI observer omits original query strings. Its original 3 FAIL / 4 PASS are retained, while the channel-qualified assessment is 3 FAIL / 4 INCONCLUSIVE. Positive forbidden body receipts remain directly observed; no-receipt cases do not prove absence in unrecorded query fields. This is separate from the original eleven-case/cache-series counts above. [Data](data/full-cli/) and [qualification details](FULL-CLI-ADDENDUM.md#query-observation-correction).

## Supply, redaction and reproduction

The [official 0.16.7 archive](https://registry.npmjs.org/mcp-remote/-/mcp-remote-0.16.7.tgz) has SHA-256 `5886c7cabf92199e4dfe9aa0f7cc5518d16e7907dc4b3bfcd7882874f9934582`; SHA-512 matches the saved npm registry integrity. Bundle `chunk-M3H22C2S.js` has SHA-256 `f199a4b8c42b23a6bdbf88274426464c70f11dde7edce6accd1ca8bf26bdceb4`. [Acquisition](data/acquisition.json), [runtime identity](data/runtime-identity.json), [manifest](MANIFEST.json).

Node 24.20.0 and the retained 0.16.6 lockfile were used with `npm ci --ignore-scripts --omit=dev --no-audit --no-fund`. The graph includes express 4.22.3, open 10.2.0, strict-url-sanitise 0.0.1 and undici 7.30.0. All 898 runtime files retained their hashes after execution; all 889 dependency files match the 14 November baseline.

Captured Authorization values, secrets and token values, including synthetic values, are replaced with `<redacted>`. OAuth state and PKCE query values in decoded recorder text are also redacted. Local filesystem roots use placeholders. Numeric fields, booleans, verdicts and HTTP origins/routes are preserved. Encoded recorder argv files are not exported. Fixture-match booleans preserve the observer's comparison without disclosing the compared value.

The original internal environment-variable name is replaced consistently with neutral `TEST_HEADER` in public procedures and data. New reproductions generate fresh synthetic values. Public traces are edited projections of retained local evidence; they are not byte-identical raw files. The private source/output map remains with the author. `MANIFEST.json` binds every package file except itself and separately records the upstream source-artifact hashes quoted above.

[Portable procedures](procedures/README.md) preserve the initial/cache-r2/cache-r3 code families. Their syntax and configuration transformations were checked during packaging; no target measurement was rerun for this export. A syntax check does not establish a new successful reproduction.

## Not verified here

Production/cloud endpoints, TLS/DNS/rebinding, real accounts, cryptographic issuer/audience validation, actual browser navigation, practical namespace takeover, cross-user filesystem isolation, other grant/transport configurations and full reconnect lifetimes are outside these measurements. F-09 same-principal reads do not establish ACL bypass. The initial parser/provider control alone does not establish a full client path. The separate full-CLI follow-up covers actual discovery, reuse, refresh and initialize with a preseeded registration; successful new DCR enrollment remains unmeasured. `localhost`, `[::1]` and other callback paths were not measured. Its original URL query strings were not retained.

The original F-11 helper suppresses transport-close errors and does not retain the typed server-close callback error. Its absence result concerns the recorded startup/redirect/endpoint window. The component F-08 recorder's detached child-close callback was not separately captured. F-08 planned SIGTERM and diagnostic-predicate mismatch, initial/cache-r2 fixture defects and their incomplete outcomes remain explicit. These observations do not alter official CVE descriptions, ranges or scores. No current CVE-registry status or upstream deployment was measured in this pass.
