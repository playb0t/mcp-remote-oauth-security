# Procedure v2: seven-version backfill, 7 November 2026

Procedure v2 is the primary local regression procedure from 7 November 2026. It evaluates credential destinations after the trace is settled and sealed. Original procedure 216 remains unchanged as v1. The earlier research-2026-11-07 package, including the 0.16.5 v1 row and all three stops, is preserved separately.

Researcher: **Alex Gercog (playb0t)**. Both requested series ran on seven official npm distributions, owned loopback fixtures and synthetic credentials.

## Criterion and finalization

Authorization presence and actual recipient address are recorded independently of the verdict. Before spawn, a trusted controller declares expected issuer, credential context, exact receiver origin/path, method and credential kinds. Metadata and Location cannot add receivers. Policy hashes bind the chosen input but do not authenticate its provenance.

Basic/client secrets belong at permitted token/device endpoints. Resource Bearer has a distinct permitted resource recipient. A forbidden credential receipt, including body credentials after redirect, is FAIL. Missing policy/context, incomplete body observation or unfinished evidence is INCONCLUSIVE.

The final barrier requires observed child close, successful close callbacks from every fixture server, no forced shutdown, no pending HTTP handlers, post-close quiet and a sealed trace. A stopped listener alone is insufficient. The RPC snapshot is never the final trace. Token-bearing scenarios wait for the token-branch stimulus before shutdown.

## Detector controls, separate from product observations

The detector passed **35 unit controls** for allowed client authentication, forbidden addresses/routes/kinds, body credentials, redirects, resource Bearer and unknown input. Settlement tests passed **3 real delayed HTTP subprocess cases**, **15 negative barrier-state controls** and **2 real HTTP close-timeout/forced-close controls**. The delayed requests arrive after an early empty snapshot: early v2 stays INCONCLUSIVE; the completed allowed case passes and foreign Basic/body cases fail.

Controls establish detector behavior under their conditions, not a product security score. [Detector controls](data/detector-controls.json), [settlement controls](data/settlement-controls.json), [exact sources and hashes](procedures/SOURCE-HASHES.json).

## Series A: original 216 scenarios, v1 versus v2

Both use the same response fixtures and three scenarios: header-selected canary, metadata redirect, same-origin control; stdio initialize, tools/list, tools/call. Three attempts per version were fixed in advance. v1 stops an attempt at its first assertion failure; v2 isolates cases, retains stops and continues the predeclared case list. The denominators are three v1 attempts versus nine v2 cases, not interchangeable success rates.

| Version | v1 complete / 3 attempts | v1 assertion stops / 3 | v2 cases | v2 security P / F / I | v2 execution stops |
|---|---:|---:|---:|---:|---:|
| 0.14.3 | 1 | 2 | 9 | 9 / 0 / 0 | 0 |
| 0.15.1 | 1 | 2 | 9 | 9 / 0 / 0 | 1 |
| 0.15.2 | 3 | 0 | 9 | 9 / 0 / 0 | 3 |
| 0.16.0 | 0 | 3 | 9 | 9 / 0 / 0 | 2 |
| 0.16.3 | 1 | 2 | 9 | 9 / 0 / 0 | 2 |
| 0.16.4 | 1 | 2 | 9 | 9 / 0 / 0 | 2 |
| 0.16.5 | 0 | 3 | 9 | 9 / 0 / 0 | 1 |

Fresh v1: **7 complete attempts / 14 original assertion stops**. All records remain, including successful snapshots with later events.

Final v2: **63 security PASS / 11 execution stops**. Security PASS means credentials went to the declared receiver; it does not erase a stopped execution. Every execution stop retains the original schema check: the inherited canary returns authorization-server-shaped data even at /token; a late OAuth branch can report ZodError. This response was preserved.

The settled traces contain **53 Authorization receipts** and **63 HTTP requests after the first RPC snapshot**. These are observed counts, not frequency estimates. The allowed-issuer rule handles expected token authentication while retaining its events. [Comparison](data/cli-comparison.json), [v1 records](data/cli-v1/), [v2 records](data/cli-v2/).

## Series B: eleven OAuth scenarios on seven versions

This is separate: one fixed run of each predeclared case per version. Scenarios, HTTP responses and credential setup are retained; only version/runtime/output bindings differ. The case expected field is the 0.16.5 reference, not an oracle forcing older versions to match.

| Version | OAuth cases | PASS | FAIL | INCONCLUSIVE | Cases with recorded stop |
|---|---:|---:|---:|---:|---:|
| 0.14.3 | 11 | 6 | 3 | 2 | 9 |
| 0.15.1 | 11 | 6 | 5 | 0 | 9 |
| 0.15.2 | 11 | 6 | 5 | 0 | 9 |
| 0.16.0 | 11 | 6 | 5 | 0 | 9 |
| 0.16.3 | 11 | 6 | 5 | 0 | 9 |
| 0.16.4 | 11 | 7 | 4 | 0 | 9 |
| 0.16.5 | 11 | 7 | 4 | 0 | 9 |

Total: **77 cases: 44 PASS / 31 FAIL / 2 INCONCLUSIVE**. Every FAIL positively matches a synthetic credential at the forbidden receiver. Stops and verdicts remain distinct: expected terminal refusals and SDK guards can stop the exchange with security PASS.

The SDK issuer control refuses the mismatch in all seven builds. The SDK redirect control forwards body client secret to B through 307 on 0.14.3 through 0.16.3; 0.16.4/0.16.5 stop before that receipt. These are fixture observations, not official affected-range conclusions.

The two 0.14.3 INCONCLUSIVE cases, foreign-issuer Basic/Post, stop before token receipt with “Incompatible auth server: does not support dynamic client registration”. They do not prove issuer protection. Other forbidden body/redirect cases remain measured, including forwarded device code despite stripped Basic.

[OAuth comparison and stop reasons](data/oauth-comparison.json), [cases](data/oauth-cases.json), [runtime records](data/oauth-v2/), [pre-run policies](data/policies.json).

## Preserved failures and review corrections

Earlier 216, F-08/F-11, 244 and research-2026-11-07 inputs were read only. These fresh tables do not replace old measurements.

Independent review found that listening=false did not prove close callback completion. v2 now requires every callback and rejects forced closure. A further defensive correction makes forced child termination sticky in both harnesses. Previous complete cohorts and sources remain in local delivery history; [all their stops](data/historical-stops.json) are exported separately, outside final table denominators. The final tables use the repeated corrected cohort. There was no retry-until-green selection.

One new close-timeout control initially sent literal CRLF escape text, so it hung before a valid HTTP request. The exact own process was stopped; input and deadline corrected; controls then passed. [Retained preparation failure](data/setup-failure.json). This is not a target result.

## Reproduction and provenance

All seven SHA-512 values match captured registry dist.integrity. [Archive and dist hashes](data/acquisition.json). Unmodified distributions used a copied locked dependency graph; no installation during measurements. Runtime: Windows x64, Node 24.20.0.

Use verified runtime directories with the supplied runtime manifest/lock and dependencies resolved from their parent graph. In an isolated copy with fresh output paths:

    node procedures/verify_stdio_v2.mjs VERSION RUNTIME_DIST FRESH_CLI_OUTPUT
    node procedures/oauth-controls-v2.mjs data/oauth-cases.json VERSION RUNTIME_DIST FRESH_OAUTH_OUTPUT

Tests write alongside their source; copy procedures to a writable isolated directory first:

    node procedures/test-criterion-v2.cjs
    node procedures/test-settlement-v2.mjs

Original v1 source retains its baseline directory layout. Source hashes, inverse-version checks, target hashes and declared filesystem-path normalization are machine-readable. HTTP(S) URLs, numbers and booleans are unchanged by export. Header/body credential values are absent from the security audit.

## Limits and delivery

The bench shows loopback behavior under these fixtures, versions, graph and timeouts. Security PASS concerns observed destinations, not complete OAuth success. Execution stops remain stops. INCONCLUSIVE is not a successful guard.

No cryptographic token issuer/audience, production discovery trust, TLS/DNS/rebinding, general SSRF, browser effect or official CVE applicability is established. Unsupported body formats remain incomplete. This fixed-fixture adapter is not a universal secret scrubber; fixture paths contain no secrets.

No repository, push, PR, external contact or publication was performed. Coordinator comparison and Alex's separate word precede push.
