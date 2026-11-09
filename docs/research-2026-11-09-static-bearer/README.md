# Static Bearer headers and server-selected metadata

Research by Alex Gercog (playb0t), 9 November 2026.

The published `mcp-remote@0.14.3` and `0.16.5` CLIs followed a server-selected protected-resource metadata URL even when configured with a static Authorization Bearer header. Initial metadata requests had no Authorization header. After the MCP POST received another 401 challenge, the metadata requests were repeated with the configured resource Bearer, and the second origin received its exact synthetic value.

No HTTP redirect is used in this new profile; earlier recorded redirect refusals remain separate controls. This is a distinct static-header profile. It is not the earlier `client-credentials` procedure and was not inferred from the presence of any Authorization header in those earlier runs.

## Comparison

| Version | Evidence used | Initial metadata requests without Authorization | Later metadata requests carrying exact Bearer | Selected-origin requests without the metadata challenge |
|---|---|---:|---:|---:|
| 0.14.3 | Preserved 9 November run; not rerun |2|2|0|
| 0.16.5 | New 9 November run, same scenario function |2|2|0|

One challenge case and one no-resource_metadata control per version. The two later receipts are a GET for protected-resource metadata and a GET for authorization-server metadata; they are not two independent tests. All four CLI processes exited naturally with code1 after the recorded authentication failure; none was forcibly killed. Each case records both fixture-server close callbacks.

## Request sequence

The CLI arguments are the resource URL, `--allow-http` and `--header "Authorization: Bearer <synthetic-token>"`. No `--client-credentials` or static OAuth client flags were added.

1. Origin A receives `GET /mcp` with the configured Bearer, and answers401 with `WWW-Authenticate: Bearer resource_metadata="<origin-B>/resource-metadata"`.
2. The CLI requests B's resource metadata and its selected authorization-server metadata without Authorization.
3. A also returns401 to the MCP POST. The subsequent discovery requests to both metadata endpoints on B carry the same configured Bearer. Events 7 and 8 in each challenge trace record these receipts.
4. The synthetic AS has no dynamic-client-registration endpoint. The CLI then fails with `Incompatible auth server: does not support dynamic client registration`. This later failure does not undo the already observed requests.
5. With the same header but no `resource_metadata` challenge field, the CLI does not contact the selected B endpoints. A healthy controller-only request to B is labelled separately and is excluded from target counts.

See [summary](data/summary.json), [0.14.3 events](data/results-0.14.3.json), [0.16.5 events](data/results-0.16.5.json), and the corresponding [0.14.3](data/identity-0.14.3.json) / [0.16.5](data/identity-0.16.5.json) distribution identities.

## Identity and reproduction

Both cached npm archives were checked against official registry SHA-512 integrity. All seven dist files plus package.json matched the runtime copies byte for byte. The CLI entry points used the same retained external-dependency directory. [Its inventory](data/dependency-inventory.json) was read after the new run; the full tree was not hashed before the earlier run, so identical bytes at both run times are not independently established. The inventory does not establish which files actually executed. Runtime Node versions and CLI entry hashes are recorded per case.

[probe.cjs](procedures/probe.cjs) is the portable source actually run for 0.16.5. Its scenario function is identical to the preserved 0.14.3 source after CRLF→LF normalization. Only the outer driver accepts version/CLI/output arguments and evaluates either possible outcome rather than assuming metadata traversal. [Source provenance](data/source-provenance.json) records those boundaries.

To replay with your own local copy of an identified published CLI and its dependencies:

```sh
node procedures/probe.cjs 0.16.5 /path/to/mcp-remote/dist/proxy.js ./local-output-0165
```

The procedure starts only researcher-owned loopback HTTP endpoints and uses a public synthetic sentinel, isolated temporary state, and no real service credentials. CLI binaries/node_modules are not bundled here. Reinstalling floating transitive dependencies is not an exact reconstruction of the recorded environment.

[Bundle source selectors](data/source-selectors.json) identify the initial discovery call, the fetch wrapper configured with custom headers, and the metadata-selection functions in both verified distributions. They are source locators, separate from the recorded HTTP receipts.

## Policy and controls

The expected receiver for the configured resource Bearer is A, the locally configured MCP resource origin. The endpoint advertised by a 401 response does not extend that receiver policy. The concrete A/B addresses are allocated by the fixture before child spawn; they are not imported from an external service.

The [header-recipient assessor](procedures/assess.cjs) checks exact sentinel matches, phase events, stimulus and cleanup. The [three detector controls](data/detector-controls.json) reuse recorded events: allowed-resource-only evidence, known forbidden B receipt, and a dropped match observation. Their outcomes are none/forbidden/unknown. These are detector checks, not additional target runs. Metadata traversal and Bearer receipt remain separate measurements.

## Limits and related records

This package measures two CLI releases on Windows with synthetic loopback HTTP peers. It does not test WinCC OA, a desktop client, TLS/DNS attacks, a real OAuth login, cloud metadata access or production exploitation. It does not test other releases or assert that all versions behave alike. Callback-port probes that timed out were not treated as proof of a closed port.

[CVE-2026-51994](https://www.cve.org/CVERecord?id=CVE-2026-51994) and [CVE-2026-51995](https://www.cve.org/CVERecord?id=CVE-2026-51995) describe related metadata-request paths. Their published affected ranges are not extended by this package. The static-header receipt is reported as observed credential-recipient behavior; no new CVE or severity is assigned.

The [9 October dossier](../research-2026-10-09/RESEARCH_DOSSIER.md) and [7 November procedure v2](../research-2026-11-07-v2/README.md) remain separate historical profiles. The 0.14.3 observation was also described in [WinCC OA issue #40](https://github.com/winccoa/winccoa-ae-js-mcpserver/issues/40); this package adds the explicit two-version comparison.
