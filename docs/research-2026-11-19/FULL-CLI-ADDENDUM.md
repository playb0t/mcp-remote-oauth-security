# Full CLI follow-up and query-observation correction

The published 0.16.7 CLI retains the seeded portless loopback registration, follows actual MCP resource and authorization-server discovery to B, and sends B the issuer-A client secret and refresh token. B matches both synthetic values; the CLI persists the returned access token and returns the MCP initialize result. This closes the earlier parser-to-provider execution gap for the stated local conditions.

Research by **Alex Gercog (playb0t)**. Measurements and follow-up dated **19 November 2026**. These are seven separate full-CLI cases on the recorded Node 24.20.0 Windows environment. The previous component observations and their counters remain historical observations. No new target run was performed while preparing this public addendum.

## Full published client path

The fixture seeds a saved dynamic client registration and expired token record naming issuer A, before spawning the unmodified published `proxy.js`. It sends only an MCP `initialize` request over stdio. Metadata reaches the client over its actual HTTP path:

~~~text
proxy.js starts with the saved client/token profile
  -> MCP request / 401 resource_metadata challenge
  -> B /prm
  -> B /.well-known/oauth-authorization-server
  -> B /token, matched issuer-A client_secret + refresh_token
  -> returned access token persisted
  -> MCP initialize result returned over stdio
~~~

A and B are distinct owned loopback origins. The receiver policy approves A and the MCP resource before child spawn. Neither discovery metadata nor a redirect can expand that policy. The observer compares generated values at the actual receiving server; the public data keeps booleans, not the values. Metadata and provider functions were not injected into the target process. A test-only preload selects an inert recorder if the client unexpectedly invokes an opener; no recorder was invoked in these seven cases.

## Comparison and controls

| Version / cached callback / selected issuer | Registration present at first MCP request | Matched client secret + refresh at token receiver | MCP initialize result | Natural child exit | Raw harness verdict | Query-qualified verdict |
|---|---|---|---|---:|---|---|
| 0.16.6 / portless / B | No | No `/token` request; B receives `/register` | No | 1 | PASS | INCONCLUSIVE |
| 0.16.6 / wrong port / B | No | No `/token` request; B receives `/register` | No | 1 | PASS | INCONCLUSIVE |
| 0.16.6 / exact port / B | Yes | Both at B | Yes | 0 | FAIL | FAIL |
| 0.16.7 / portless / B | Yes | Both at B | Yes | 0 | FAIL | FAIL |
| 0.16.7 / wrong port / B | No | No `/token` request; B receives `/register` | No | 1 | PASS | INCONCLUSIVE |
| 0.16.7 / exact port / B | Yes | Both at B | Yes | 0 | FAIL | FAIL |
| 0.16.7 / portless / A | Yes | Both at permitted A | Yes | 0 | PASS | INCONCLUSIVE |

The saved portless callback is `http://127.0.0.1/oauth/callback`; the current callback uses port 18001, and the wrong-port control stores port 18002. The exact-port case already reaches B on 0.16.6. The version change retains the portless registration and admits that additional saved-registration shape to the same observed credential path.

When the registration has been removed, the client still performs discovery and attempts a new dynamic registration at B. The owned fixture returns a controlled HTTP 400 without issuing a client. Exit 1 is natural for that refusal. The observation is no refresh POST to B `/token`, rather than no traffic to B or an issuer-binding protection. The successful reuse cases do not require a fresh DCR registration; successful enrollment of a new client was not measured.

[Seven raw-result projections](data/full-cli/), [summary](data/full-cli/summary.json), [channel assessments](data/full-cli/assessments/), [validation](data/full-cli/validation.json).

## Query-observation correction

The full-CLI harness retained request origin and pathname, headers and parsed form/JSON bodies. It did **not** retain the original URL query string: its address recorder constructs `origin + pathname`. A postprocessor initially marked every target request `query_observed=true`. That statement was unsupported and was corrected before accepting the full-CLI research record. The target harness and its original output are preserved; only qualification of the recorded evidence changed.

The original full-CLI harness yields **3 FAIL / 4 PASS**. With the missing query channel explicit, the seven-case assessment is **3 FAIL / 4 INCONCLUSIVE**, and all seven complete-channel coverage rows remain limited. Direct matched forbidden form-body receipts at B remain FAIL. The other four cases cannot establish absence of credentials in every URL channel. The same-issuer control still establishes a permitted body receipt and subsequent initialize, with query visibility unmeasured.

Each public `assessments/*.json` keeps the original raw verdict and the additional channel-qualified verdict. [Offline qualifier](procedures/full-cli/qualify.mjs) makes that distinction reproducible from the saved records. The portable harness retains its original address/query omission and raw criterion and emits a separate `channel_assessment`; it does not pretend to recover missing queries. This correction applies to this new full-CLI observer. It does not reclassify the earlier eleven-case v2/cache series, whose observations came from a different harness.

## Completion, identity and limits

All seven harness operations completed: seven natural child closes, four exit 0 and three controlled DCR-refusal exit 1. There were 21 successful owned HTTP server close callbacks, zero forced stops, zero capture errors and zero unexpected opener invocations. The callback port was refused after each close. The two 898-file runtime trees matched their recorded identities; both versions used the retained lock graph. Thirty-five unit controls and 21 detector controls are separate from the seven target cases.

The runtime bytes were unchanged. The locally seeded client/token records and all values were synthetic; the fixture B returned a synthetic access token. The experiment covers Windows, Node 24.20.0, `127.0.0.1`, HTTP discovery, saved-registration reuse, refresh and the recorded initialize window. It does not establish production access, real account use, cryptographic issuer/audience validation, TLS/DNS behavior, other callback hostnames, successful new DCR enrollment or complete reconnect lifetimes. The original query channel remains unobserved.

The existing [F-11 observations](README.md#f-11-two-repeats-on-0167) remain separate: no cross-origin Bearer receipt was observed there. This follow-up neither adds a CVE nor changes official record descriptions, ranges or scores. Captured credential values and machine paths are redacted under the package's existing projection policy. [Portable configuration](procedures/README.md#full-cli-follow-up).
