# mcp-remote 0.16.6: seven findings, credential destinations and cache state

All seven original findings remain present in mcp-remote 0.16.6. F-04 and F-11 remain hardening records; no cross-origin Bearer transfer was observed for F-11. The 11 November release constrains credential-bearing token/device redirects and requires HTTPS for those endpoints with an HTTP loopback exception. Server-selected authorization discovery remains, and the full CLI still sends the configured client secret to the server selected by MCP metadata, in both Basic authentication and a POST body.

Research by **Alex Gercog (playb0t)**. Measurements dated **14 November 2026**. Five findings have published CVE records. Two additional identifiers remain RESERVED without a confirmed F-09/F-10 mapping.

## Upstream changes

The comparison from 0.16.5 to 0.16.6 contains one commit, [e4dc3713b0d6a727cbeb21f38324d20a6692dc5f](https://github.com/punkpeye/mcp-remote/commit/e4dc3713b0d6a727cbeb21f38324d20a6692dc5f). The [release notes](https://github.com/punkpeye/mcp-remote/releases/tag/v0.16.6) name none of the five research CVE IDs. The bundled client remains 2.4.0. [Structured source observations](data/upstream.json).

Upstream requires HTTPS for credential-bearing device authorization and token endpoints, except HTTP loopback. Its `--allow-http` option concerns the MCP endpoint. This change does not establish a new HTTPS check on the displayed `verification_uri` or `verification_uri_complete` response fields. The scheme requirement is source/release evidence. Packaging added no device-network experiment.

## All seven findings on 0.16.6

| Finding | Recorded identifier | Evidence here | State and limit |
|---|---|---|---|
| F-01, server-selected resource metadata | CVE-2026-51994 | Full CLI against loopback fixtures | The CLI requests B/prm selected by the MCP header. No private/cloud endpoint experiment |
| F-02, authorization server discovery | CVE-2026-51995 | Full CLI against loopback fixtures | The CLI requests B authorization metadata. Matched synthetic client credentials reach B/token in Basic and form-body profiles |
| F-04, storage namespace | CVE-2026-51996 | Exact function extracted from the package | MD5 remains. Distinct tuples produce identical serialized input before hashing. This serialization ambiguity is separate from a cryptographic collision. No namespace takeover established |
| F-08, internal browser destination | CVE-2026-51997 | Provider method and full CLI to an inert recorder | Loopback and link-local HTTP URLs reach the recorder. Script URLs are rejected. Real browser navigation was outside the experiment |
| F-09, cleartext storage | No confirmed public-record binding | Package provider store methods, same-principal file read | Client secret, access/refresh tokens and PKCE verifier are stored in plaintext. No cross-user access or ACL bypass established |
| F-10, redirect validation | No confirmed public-record binding | Package discovery function with owned HTTP servers | PRM and AS-metadata cross-origin 302 requests reach B. Credential-bearing grant POSTs have a separate new redirect restriction |
| F-11, explicit token-origin hardening | CVE-2026-52001 | Package SSE transport with controlled provider | The wrapper-local comparison remains absent. The tested SDK/transport redirect and endpoint-origin controls prevent cross-origin Bearer receipt |

[Component observations](data/seven-findings/) include 19 conditions. [Full CLI foreign-issuer Basic](data/credential-v2/initial/foreign-issuer-basic.json) and [POST](data/credential-v2/initial/foreign-issuer-post.json) carry matched-credential booleans at B. The table describes observed mechanisms and corrected hardening classifications, without extending official affected ranges.

## Eleven credential-destination scenarios

A is the predeclared credential owner/receiver, B is a different unapproved loopback origin, and R is the permitted MCP resource. Policies are recorded before target spawn. Discovery and redirects cannot add recipients.

| Version | Scenarios | PASS | FAIL | INCONCLUSIVE |
|---|---:|---:|---:|---:|
| 0.16.5 reference | 11 | 7 | 4 | 0 |
| 0.16.6 | 11 | 9 | 2 | 0 |

Two cases change from FAIL to PASS: `redirect-secret-post307` and `device-code-body307-basic`. A returns a cross-origin 307 and the credential request is stopped before B receives it. `foreign-issuer-basic` and `foreign-issuer-post` remain FAIL. Same-origin redirect, permitted resource Bearer, SDK issuer and SDK redirect controls pass.

These are observed destination outcomes. They do not redefine any CVE record. PASS does not imply completed OAuth: the token fixture intentionally returns terminal refusals in some cases. Original expected fields remain, including `expectation_met=false` where new behavior refutes the 0.16.5 expectation. [Comparison](data/oauth-comparison.json), [0.16.5 reference](data/reference-0.16.5.json), [initial raw records](data/credential-v2/initial/).

The unchanged criterion passed 35 unit controls. Separately, 54 initial detector observations and nine per cache correction series matched positive/negative/fault expectations. These describe detector controls, not additional product coverage. [Unit controls](data/criterion-unit-controls.json), [named controls](data/detector-controls/).

## Old cache: separate synthetic-state observation

Cache cases seed `mcp-remote-v1` files in fresh isolated profiles.

- A valid access token without issuer is returned with its refresh token. Its file remains byte-identical.
- An old saved static client with the same client ID is removed. A different saved client remains.
- In final `cache-r3`, both the unbound expired cache and the cache explicitly naming issuer A send matched `client_secret` and `refresh_token` to B/token. Both are FAIL.
- The permitted same-issuer A refresh is PASS. Tokens return and the persisted record changes. The fixture intentionally returns the same access-token value, so value inequality is not a requirement.

Our initial seed omitted mandatory `redirect_uris` in client information, leaving three expiry cases INCONCLUSIVE. `cache-r2` corrected that shape and observed two forbidden receipts, but our postcondition incorrectly required a different access-token value. Its permitted control remained INCONCLUSIVE. `cache-r3` corrected that expectation before execution. Both errors were in our fixture preparation and expected postcondition. Original attempts remain available.

| Physical series | Attempts | PASS | FAIL | INCONCLUSIVE |
|---|---:|---:|---:|---:|
| Initial | 18 | 13 | 2 | 3 |
| cache-r2 | 3 | 0 | 2 | 1 |
| cache-r3 | 3 | 1 | 2 | 0 |

The 24 physical attempts answer 18 distinct questions. Selecting the 15 initially complete rows plus three `cache-r3` rows gives 14 PASS / 4 FAIL / 0 INCONCLUSIVE. This is a consolidated selection, not one clean 18-case execution. The eleven-scenario table uses only its original eleven rows.

[Final cache records](data/credential-v2/cache-r3/), [previous correction](data/credential-v2/cache-r2/), [initial records](data/credential-v2/initial/). Valid-cache and static-client cases are also in the initial directory. These component calls do not establish migration of a real user's profile.

## F-11: original 0.1.38 versus 0.16.6

The official 0.1.38 distribution used the original production lock graph, including bundled SDK 1.25.3 and external undici 7.12.0. Both versions used Node 24.20.0 on Windows.

| Same original transport scenario | 0.1.38 | 0.16.6 |
|---|---|---|
| Cross-origin 302 A to B | Follows to B without Authorization | Refuses before any B request |
| SSE advertises an endpoint on B | Rejects endpoint origin | Rejects endpoint origin |
| Same-origin 302 | Retains synthetic Bearer | Retains synthetic Bearer |
| No token | No Authorization | No Authorization |

All eight paired F-11 conditions are observed. Cross-origin Bearer receipt was not observed on either version. F-11 remains the hardening record documented in v1.0.1.

The original `f11.mjs` imports `connectToRemoteServer` with the actual SSE transport and controlled provider. It does not spawn the full CLI. Its function body is unchanged by version/path adaptation. [Old records](data/legacy-procedure/f11-old.json), [current records](data/legacy-procedure/f11-current.json), [body parity](data/legacy-procedure/body-parity.json).

## F-08: full CLI replay

The original procedure launches the unmodified 0.16.6 proxy with local MCP/PRM/AS metadata and an inert recorder selected by test-only environment preload. Loopback and link-local authorize URLs reach the recorder. `javascript:` is rejected earlier by SDK metadata validation with “URL cannot use javascript:, data:, or vbscript: scheme”.

The collector expected the earlier “Invalid url” message. Raw `checks.script=false` remains: the diagnostic predicate differs even though the CLI rejects the scheme. Two positive CLI processes are intentionally stopped with SIGTERM after argv capture while awaiting OAuth callback. The script-negative CLI exits naturally with code 1. These are bounded observations. [Full CLI records, stop states and stderr](data/legacy-procedure/f08-current.json).

## Reserved identifiers

Direct ID-state API reads on 14 November returned HTTP 200 and `state: RESERVED` for [CVE-2026-51998](https://cveawg.mitre.org/api/cve-id/CVE-2026-51998) and [CVE-2026-51999](https://cveawg.mitre.org/api/cve-id/CVE-2026-51999). Neither response establishes an F-09/F-10 mapping. [Recorded ID states](data/registered-identifiers.json).

## Redaction and provenance

Captured Authorization values, secrets and token values, including synthetic values, are replaced with `<redacted>`. OAuth state and PKCE query values in decoded recorder text are also redacted. Machine filesystem paths use placeholders. HTTP origins/routes, numeric counters, booleans and verdicts are preserved. Recorder commands are represented by decoded redacted text rather than captured encoded commands.

These are edited projections of retained local evidence. Fixture-match booleans retain the observer's comparison. A reader cannot recover redacted values from a public trace. Reproduction generates fresh synthetic values. The private source-to-output map stays with the author. `MANIFEST.json` binds every proposed public file except itself.

[0.16.6 acquisition](data/acquisition.json), [0.1.38 acquisition](data/acquisition-0.1.38.json), [summary](data/summary.json), [portable procedures](procedures/README.md). Portable projections were syntax-checked during packaging. No target scenario was rerun for this export. Separate code families preserve the initial cache fixture and both correction stages.

The supplied procedures now mark forced child shutdown as incomplete and preserve partial stdout/stderr with an incomplete diagnostic on collector timeout. [Failure-path regression tests](procedures/tests/test_failure_paths.py) exercise these branches with pure evaluator calls and a benign subprocess; recorded target observations are unchanged.

## Not verified here

Production/cloud endpoints, TLS/DNS/rebinding, real account access, cryptographic issuer/audience, actual browser navigation, practical namespace takeover, cross-user filesystem isolation, all grant/transport profiles and full reconnect lifetimes remain outside these measurements. The old F-11 procedure suppresses transport-close errors and does not retain typed callback errors. Its absence result is limited to the recorded startup/redirect/endpoint window. A detached recorder child-close callback was not separately captured.

Five published CVE records and prior corrections remain distinct from experimental outcomes. [Independent review](REVIEW.md).
