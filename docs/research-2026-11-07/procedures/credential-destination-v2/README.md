# Credential destination criterion v2

This is a separate check; the original 216 CLI procedure and its failures remain in the main README tables.

Before launch the trusted controller chooses expected issuer A, credential context and exact permitted receivers (origin + pathname), methods and credential kinds. MCP metadata and redirects cannot add receivers. A policy hash pins that input but does not authenticate its provenance. An explicit prior delegation may allow another origin for issuer A. Resource Bearer has a separate permitted resource route; allowing it does not allow client credentials there.

The evaluator records Authorization presence/scheme and actual receiver address independently from its verdict. It checks client authentication, client secret, refresh token, device code, code/verifier and access token presence, including body/query. No credential values enter the security audit. The fixture derives receiver origin from its own listening socket, not Host or child-reported URLs.

PASS requires known policy/context, complete credential observations, healthy capture and observed scenario postconditions. A confirmed forbidden credential receipt gives FAIL; missing policy, body observation, context or coverage gives INCONCLUSIVE. Redirect facts are retained separately from a credential receipt. A stripped header with no forwarded credential body is not called disclosure by this criterion; a forwarded device code/secret still fails without Authorization.

## Controls versus observations

The 35 unit controls validate the detector, including expected client Authorization, foreign body credentials, wrong route/kind, distinct resource Bearer, missing observations, unknown policy/context and incomplete scenario stimulus. Their passing does not mean the product passed.

The actual 0.16.5 runtime row is separate: 11 loopback cases, 7 PASS / 4 FAIL, matching predeclared case expectations. The four FAIL cases record fixture-matching Basic, body client secret, 307-preserved secret and 307-preserved device code at forbidden B. Positive controls include expected A client authentication, approved same-origin redirect and resource Bearer; counter-controls include stripped Basic, 302 body removal and SDK issuer/redirect guards.

The first independent review found missing body observations could become PASS. The observer now explicitly records complete body observation on every receiver (including MCP) and unknowns remain INCONCLUSIVE. Scenario postconditions also prevent discovery-only success. Historical pre-correction measurements and intermediate INCONCLUSIVE SDK postcondition results are retained in the internal evidence; the published data is the corrected, repeated series. No old 216 result was reclassified.

## Reproduce in an isolated copy

The exact tested evaluator, unit controls and driver are supplied. The harness has declared configuration/prerequisite adaptations listed in summary.json; its portable copy was syntax-checked, not target-run during packaging.

Use the verified 0.16.5 runtime/dependency layout from the parent procedures README and recorded Node 24.20.0. Copy the package to an isolated directory, preserving its procedures/ and data/ relative layout. Run the commands below from procedures/credential-destination-v2 in that copy. Unit controls write UNIT-RESULTS.json alongside the script. For real fixture replay set MCP_SECURITY_RUNTIME_DIST to the verified dist directory and MCP_SECURITY_OUTPUT to a fresh nonexisting output directory, then run:

    node test-criterion-v2.cjs
    node harness-v2.mjs ../../data/credential-destination-v2/cases.json

All network fixtures bind to loopback and use generated synthetic credentials. The harness removes only its generated temporary state after observing child exit. It stores policies before target spawn, validates the known bundle/entrypoint hashes and never patches target fetch.

PASS concerns observed credential destinations, not general OAuth/redirect safety. This does not validate token cryptographic issuer/audience, TLS, DNS/rebinding, production discovery trust, unobserved traffic or every body encoding. Body formats outside the JSON/form fixture parser are incomplete observations. The observer and trusted input remain caller responsibilities. Fixtures have fixed nonsecret paths; logging is not a universal secret redactor.
