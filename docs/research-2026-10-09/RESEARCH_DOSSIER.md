# Protected Resource Metadata in mcp-remote

Researcher: Alex Gercog (playb0t)

## Author-led security research: Phase 1 evidence baseline

Research date: **9 October 2026**. Domain: **Software Supply Chain Security and AppSec**.

This research connects three results: observed CLI behavior, continuity across releases
and copies of selected implementation fragments in published code. It combines
source-level reverse engineering, custom structural matching, distribution-integrity
verification and isolated dynamic fixtures.

**Published CLI `0.14.3`.** The unchanged proxy CLI followed a metadata destination
selected through a synthetic server response, including a controlled HTTP 302 redirect.
It ran over stdio with `http-only` transport, `client-credentials` mode and synthetic
static client information. Mock GET requests received a challenge; mock POST requests
permitted synthetic MCP operations. Three completed scenarios recorded **43 HTTP
events, 15 local canary events and nine RPC replies**. This establishes discovery and
message handling in that configuration. A real OAuth login and desktop UI session
were not tested.

The local tests of the published mcp-remote 0.14.3 CLI reproduce the server-selected
resource-metadata request behavior documented in
[F-01](https://github.com/playb0t/mcp-remote-oauth-security/blob/main/advisories/F-01-resource-metadata-ssrf.md)
([CVE-2026-51994](https://www.cve.org/CVERecord?id=CVE-2026-51994)), including the
subsequent authorization-server metadata request documented in
[F-02](https://github.com/playb0t/mcp-remote-oauth-security/blob/main/advisories/F-02-authorization-server-ssrf.md)
([CVE-2026-51995](https://www.cve.org/CVERecord?id=CVE-2026-51995)). These results
establish the recorded request behavior under the stated fixture conditions; they do
not by themselves establish disclosure of sensitive information or change the
published CVE ranges.

**History of 58 stable releases.** The selected first-party discovery chain is present
from **0.1.32 through 0.14.3** in an integrity-checked inventory of **74 stable archives**.
Selected helpers from each of those 58 releases were executed separately against a
researcher-owned local fixture, recording **290 HTTP events**. Full CLI execution
was tested only at 0.14.3.

**Published code under other names and inside bundles.** Selected implementation
fragments were found under other package names and within bundled code. Structural
signatures helped identify these relationships despite renaming and packaging
differences. Searching only for the original package name therefore gives incomplete
coverage. The [code distribution map](CODE_DISTRIBUTION.md) links each retained
observation to its package version or commit, file, function or rule, checksum and
coverage status. These observations establish published code relationships; they do
not measure propagation speed, installations or execution inside companies.

## 1. Defect qualification

**CWE-918: Server-Side Request Forgery during Protected Resource Metadata discovery.**
The trust-boundary failure is the transfer of a server-provided metadata location into
an outbound request made from the client process without a destination policy at the
inspected dereferencing boundary.

**Qualification: Missing Defense.** The selected boundary lacks local host/destination
validation and redirect-policy enforcement. A previously complete repair of this same
path has not been established; the history therefore supports neither a regression nor a proven Incomplete Fix.
The later fetch-option change is recorded as a functional change; its presence alone
does not establish a security repair.

The demonstrated consequence is a destination-selected client request. Production
exposure depends on the executed branch, configuration and network policy. Broader
consequences are not inferred from code presence or from this fixture.

Cloud credential access was not tested. On AWS instances configured with
`HttpTokens=required`, metadata requests require a valid IMDSv2 session token
obtained through a separate PUT request.
[AWS IMDS documentation](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/configuring-instance-metadata-service.html).
GCP metadata v1 requires the `Metadata-Flavor: Google` header.
[Google Cloud metadata documentation](https://docs.cloud.google.com/compute/docs/metadata/querying-metadata).
A basic discovery GET lacking these elements does not establish credential access.
Configurations permitting IMDSv1 and other request conditions require separate evaluation.
Cloud metadata endpoints were not queried in these experiments. These conditions
limit the evaluated request scenario; they do not establish universal cloud isolation.

[RFC 9728 §7.7](https://www.rfc-editor.org/rfc/rfc9728.html#section-7.7) identifies the
discovery-related request risk and calls for appropriate precautions.
[Standards and classification](data/standards.json).

## 2. Published CLI 0.14.3: controlled verification

The original execution used Node `v24.19.0` and the dependency lock retained in this
package. All **seven dist files** in the runtime copy were compared byte for byte with
the integrity-checked published distribution. The CLI entry point was `dist/proxy.js`;
its SHA-256 and file-parity records are in [cli-scenarios.json](data/cli-scenarios.json).

| Scenario | HTTP events | Local canary events | RPC replies | Authorization headers observed |
| --- | ---: | ---: | ---: | ---: |
| Header-selected metadata location | 15 | 6 | 3 | 0 |
| Header-selected location returning HTTP 302 | 18 | 9 | 3 | 0 |
| Same-origin control | 10 | 0 | 3 | 0 |
| Total | 43 | 15 | 9 | 0 |

Each case completed `initialize`, `tools/list` and `tools/call` through stdio.
The recorded path was the challenge response, selection of `resource_metadata`,
a request to the second local service, reading `authorization_servers` and an
authorization-server metadata request. The redirect fixture returned HTTP 302.
The fifteen canary events occurred within these three scenarios and provide no
installation count.

The test-mode conditions stated in the opening result apply to all three cases.
Observed absence of Authorization headers is confined to these cases. The illustrative
address `http://mock-service.local` denotes a local fixture role. The recorded
procedure binds to loopback; this label supplies no production destination.

The source procedure and dependency lock are retained for technical review. This
dossier assembly did not execute the program again.
[Recorded CLI procedure](procedures/cve-signature-sweep-20261009/verify_stdio.mjs).

## 3. Continuity over 58 releases

All **74 stable archives** in the inspected `0.1.16–0.14.3` interval were acquired
and integrity-checked. The first-party helper chain occurs in 58 releases.

| Stable interval | Releases | Static observation | Selected-helper execution |
| --- | ---: | --- | --- |
| 0.1.16 through 0.1.31 | 16 | Selected first-party helper set absent | Not executed with this helper set |
| 0.1.32 through 0.1.38 | 7 | Selected chain present | Completed |
| 0.1.39 through 0.14.3 | 51 | Selected chain persists; fetch option changes | Completed |

The 58 per-release helper executions recorded **290 local HTTP events**. The fixture
tested a header-selected location, a redirect and a same-origin control. Its fetch
wrapper permits only the fixture's local origin; the redirect stays within that origin.
Full CLI coverage remains limited to 0.14.3. The 58 historical runs executed the
selected helpers, and the absence of those helpers in the earlier 16 releases leaves
other SDK paths in those releases unevaluated.

The first-party file was introduced in commit
`d20f595891a04a31191dbb1640ca529fd6ea8cf2`. The author date is 28 November 2025;
the committer date and npm 0.1.32 publication date are 17 December 2025.
Version 0.1.39 adds `Accept-Encoding: identity` to the selected fetch helper without
adding local destination validation or an explicit redirect override. Authorization-server
metadata URL construction changes in 0.1.48. An explicitly configured endpoint can
avoid discovery in some configurations.

The Git comparison contains 178 commits. Release heads 0.1.23 and 0.1.28 are on
side branches and were resolved separately. Continuity of the selected path does not
mean an immutable OAuth architecture or a single linear history for all release heads.

The matrix preserves release, artifact hash, registry integrity, commit, source member,
location and function fingerprints. Different normalizers retain distinct semantics.
[JSON matrix](data/release-history.json) · [CSV](data/release-history.csv) ·
[Recorded historical procedure](procedures/cve-history-enterprise-20261009/verify_history_runtime.mjs).

## 4. Comparison cohort and analyzer limits

The corporate and Marketplace screening pipeline combines a custom TypeScript 5.9.3
AST-shingle filter with targeted Semgrep 1.180.0 rules. Function comparisons and
structural candidate rules select files for Semgrep. Timeouts and engine errors
remain explicit coverage gaps.

Similarity uses multiset Sørensen–Dice over five-token AST shingles:
`D(A,B) = 2 * Σ_g min(c_A(g), c_B(g)) / (Σ_g c_A(g) + Σ_g c_B(g))`.
Bound local identifiers are normalized before comparison. Each reported percentage describes one function. Package-wide similarity and
detection accuracy were not measured. Additional structural routes include combined metadata/network indicators
and delimiter-MD5 namespace patterns. The comparisons use the strict thresholds `>0.85` and `>0.80`. The watchdog
limits each Semgrep invocation to 15 seconds of elapsed wall-clock time rather than
CPU time. The 48-archive npm reference-family matcher remains a separate method.
[Recorded method and limits](data/analysis-limitations.json).

The [portable screening source](procedures/screening/README.md) includes the
AST-shingle analyzer, candidate filter, Semgrep rules, reference inputs, watchdog and
small positive and negative controls. It is separate from the retained `ast.mjs`
reference-family matcher. Historical procedures remain unchanged. Packaging
adaptations and the clean-directory control results are recorded in
[screening-toolkit.json](data/screening-toolkit.json).

The public corporate comparison cohort contains **33 artifacts / 1,325 source instances**:
11 npm archives, two VSIX archives and 20 pinned Git repository snapshots.

| Publisher grouping | Artifacts | Source instances |
| --- | ---: | ---: |
| Adobe | 5 | 724 |
| Microsoft | 4 | 191 |
| Capital One | 24 | 410 |

After targeted provenance review the categories are **A=0, B=1, C=32**. Category A
requires the specific first-party discovery/request route. Category B records a shared
component or narrower structure. Category C means the selected indicators were not
found in the processed scope. Each category applies only to the processed scope. B can coexist with coverage
gaps; C does not rate the overall security of a product.

**A false-positive rate was not measured.** Zero confirmed Category A results does
not establish 0% false positives. The cohort lacks independently complete ground-truth
labels, and one full-bundle analysis gap remains. The AST-shingle filter excluded
1,324 files from Semgrep selection; Semgrep was invoked for one candidate and did
not complete its full parse.

### Azure Resources boundary case

For `ms-azuretools.vscode-azureresourcegroups@0.13.2`, source review localized server-side
metadata and challenge-response helpers. The extracted `buildWwwAuthenticateHeader`
constructs a response header. Four extracted helpers have no direct outbound network
call in the inspected slices. This supports **Category B** for the extracted server-side helpers. The result
establishes neither the client-side discovery-to-fetch route nor network isolation
of the whole extension.

The full bundle retains a syntax-analysis gap involving class static initialization
blocks. In the complete forced-control set, **21** controls received partial analysis
and **three** controls without the construct were scanned. All 24 processes returned
exit code zero. Nine problematic cases belong only to the narrower minimal-controls
subset. A successful process exit is not evidence of complete semantic analysis.

### Additional engine outcomes

The Marketplace pass contains 11 Semgrep invocations: one completed scan,
six timeout flags and four engine-error records. The four errors consist of
**one Out of memory, two Syntax error and one PartialParsing** classifications.

Of the six timeout-flagged records, five record exit `-9` and one records exit `0`
for `anthropic.claude-code@2.1.89`. A timeout flag does not itself prove forced
termination. Independent signal-delivery receipts and confirmation that all descendant
processes exited are absent. These distinctions do not change the cohort categories.

[Analysis outcome records](data/analysis-limitations.json) ·
[Cohort details](data/screening-cohorts.json).

## 5. Code distribution and the relationships established

The [code distribution map](CODE_DISTRIBUTION.md) provides a direct path from
package or repository identity to file and function evidence. The npm selection
contains **48 package/version archives** selected from 411 package identities. Its results are **nine reference-function-positive records, four namespace-only
records, four generic discovery records and 31 unmatched records**. The 13 records in
the first two groups include upstream `mcp-remote` as a control.

| Package | Version | Artifact role | Reference matches |
| --- | --- | --- | ---: |
| @abluva/mcp-remote | 2.1.0 | upstream-family-distribution | 8 |
| mcp-remote | 0.14.3 | upstream-control | 10 |
| @ignatov.dev/mcp-remote | 0.1.40 | upstream-family-distribution | 9 |
| @thespeakup/mcp-remote | 0.1.43-thespeakup.0 | upstream-family-distribution | 9 |
| @zgeoff/mcp-remote | 0.1.38 | upstream-family-distribution | 9 |
| @automattic/mcp-remote | 0.1.50 | upstream-family-distribution | 9 |
| @beeper/mcp-remote | 0.0.2 | namespace-pattern-candidate | 0 |
| @computec/mcp-remote | 0.1.32 | namespace-pattern-candidate | 0 |
| mcp-remote-alibaba-cloud | 0.1.38 | cloud-labelled-distribution | 9 |
| @automattic/mcp-wordpress-remote | 0.5.1 | declared-wordpress-adapter | 0 |
| @neworange/neworange-mcp-remote | 0.1.39 | upstream-family-distribution | 9 |
| mcp-remote-ultra | 1.0.0 | upstream-family-distribution | 2 |
| mcp-search-package | 1.0.13 | namespace-pattern-candidate | 0 |

A repository fork relationship, a renamed distribution, an adapter's declared purpose,
a package alias and a shared algorithm are different relationships. No alias or formal
Git fork relationship is assigned solely because code is similar.

- The retained GitHub metadata identifies `Ashesh3/mcp-remote-entra` and
  `explorium-ai/mcp-remote` as forks with `punkpeye/mcp-remote` as parent. These
relationships support the provenance record and add no npm observations.
- `@automattic/mcp-remote@0.1.50` has nine reference matches.
  `@automattic/mcp-wordpress-remote@0.5.1` declares a WordPress proxy purpose but
  has zero reference matches and four namespace matches in this selection.
  The latter is not promoted to the same demonstrated discovery lineage.
- `mcp-remote-alibaba-cloud@0.1.38` is a cloud-labelled distribution with nine
  reference matches. Its name and declared repository do not establish corporate
  ownership, internal deployment or the behavior of an installed product.
- `krafton-ai/KIRA` at commit
  `652dacbf14d29ea93a83c496ee91e0e5ba286721` contains a Category B namespace-helper
  match in `KiraClaw/apps/desktop/lib/register-ipc.js`, starting at line 262.
  Function similarity is 0.907563. This is an observation about one helper;
  the complete discovery route and product exposure remain unestablished.

- `mcp-remote-ultra@1.0.0` contains normalized reference matches relative to
  `0.1.38` for `getServerUrlHash` and `fetchAuthorizationServerMetadata`,
  alongside one `md5-config-namespace` structural result. These function-level
  observations support its upstream-family classification. They do not establish
  the package's complete discovery behavior or deployment context, and the remaining
  components may be independently implemented. The inspected member is
  `package/dist/chunk-M36YVINN.js`, 760,846 bytes, SHA-256
  `62c5296bd778c8829280ab2a1a38deb70c193451eb5a0c2710e1ee1ed42f6630`.
  The declared `cobach/mcp-remote` repository is retained as declared provenance metadata.
  [Function-level evidence](data/ecosystem-lineage.json).

The separate Git corpus contains **232 file records, 221 repositories and 225 unique
Git blobs**. It includes 222 JS/TS files and ten non-runtime records. Categories are
**A=0, B=9, C=223**. Nine files, including an upstream file, contain the selected
delimiter-joined namespace structure; six exceeded the function-similarity threshold
and three were retained by structural rules. These nine file observations do not establish nine downstream defects and must
not be added to the 13 npm records as a count of unique products.

The three additional screening cohorts contain **63 distinct pinned artifact identities**:
21 npm archives, 22 VSIX archives and 20 Git snapshots. They contain **8,057 source
instances**. Files were not deduplicated globally, and these identities supply no
count of deployed products.
Current categories are **A=0, B=4, C=51, UNRESOLVED=8**.

| Additional cohort | Pinned artifacts | Source instances | A | B | C | UNRESOLVED |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Calibration | 10 | 3033 | 0 | 0 | 9 | 1 |
| Corporate pilot, after targeted review | 33 | 1325 | 0 | 1 | 32 | 0 |
| Marketplace | 20 | 3699 | 0 | 3 | 10 | 7 |
| Total | 63 | 8057 | 0 | 4 | 51 | 8 |

Zero Category A observations in these cohorts do not cancel matching code in the
separately inspected npm and Git material. All three Marketplace B artifacts retain
coverage gaps, as does the targeted Azure B result. The Marketplace component
covers VS Code Marketplace only; Open VSX and separate Cursor-served builds were
not inspected in that pass.

[48-package map](data/npm-48.json) · [232-file map](data/git-232.json) ·
[Lineage classification](data/ecosystem-lineage.json).

## 6. Search-index coverage boundaries

Two documented GitHub search surfaces and the local measurement use different limits:

| Surface | Documented or measured condition |
| --- | --- |
| Current web Code Search | Files over 350 KiB are excluded; generated and vendored code is excluded |
| REST Search code | Files smaller than 384 KB are searchable |
| Local inventory counter | 202 Marketplace files exceed 384 KiB, exactly 393,216 bytes |

The first two rows describe indexing policies. Neither defines a physical limit
of JavaScript analysis. The KB label in the REST documentation is not converted into an
asserted implementation byte boundary. The local counter is a separate measurement.

| Inspected artifact member | Bytes |
| --- | ---: |
| mcp-remote 0.1.38 main bundle | 755586 |
| mcp-remote 0.14.3 main bundle | 1413594 |
| Cline Chinese 4.1.23 extension bundle | 26994702 |

These particular members exceed both documented search boundaries. An indexed
negative cannot establish absence of embedded code from the published archive.
Smaller source files or manifests may remain discoverable. These observations
establish a gap in the specified indexes, without assessing every available analyzer. Direct artifact acquisition addresses
this coverage gap while local parsing and engine limits remain explicit.

[Current Code Search documentation](https://docs.github.com/en/search-github/github-code-search/about-github-code-search#limitations) ·
[REST Search code documentation](https://docs.github.com/en/rest/search/search?apiVersion=2022-11-28#search-code) ·
[Recorded scope and units](data/search-scope.json).

## 7. Engineering recommendations

**Recommended application policy: Operator-Approved Issuer Allowlist, combined with
resource and destination binding.** Establish approved resource-to-issuer relationships
out of band or through an explicit administrative decision.

The policy must also validate the first resource-metadata destination before any
request: issuer approval alone does not cover a request made before issuer selection.
Apply the destination policy to each redirect and to the address used by the actual
connection. Check the declared resource and issuer consistently. Necessary local
access should be a narrow configured exception. Preserve allowed discovery scenarios
in regression checks and test compatibility with the intended deployment environment.

[RFC 9728 §7.6](https://www.rfc-editor.org/rfc/rfc9728.html#section-7.6) makes
authorization-server selection application dependent;
[RFC 9728 §7.7](https://www.rfc-editor.org/rfc/rfc9728.html#section-7.7)
recommends precautions against unwanted internal requests. The proposed allowlist is
a concrete policy consistent with that context. The RFC permits application-specific
choices, and this research has not implemented a patch.

## 8. Bounded catalog interval

For the specific first-party path, the evidence-supported stable-version interval is
**`>=0.1.32, <=0.14.3`**. The lower bound is material: the earlier 16 inspected
releases did not contain the selected first-party helper set. An unbounded
`<=0.14.3` label would include releases not supported by this observation.

This is a research recommendation for the evaluated mechanism. It neither modifies
official affected-version records nor identifies a fixed release. Prereleases and
versions after 0.14.3 were not evaluated. The interval must not be copied automatically
to every research finding or published CVE record.

## 9. Evidence accounting and Phase 1 status

The package uses seven canonical result groups. Repeated copies or later summaries
of a source are counted once. A targeted classification update changes an existing
cohort row rather than adding an artifact. Reuse of the 0.14.3 archive across release,
CLI and package-selection views is identified explicitly.

[Evidence accounting](EVIDENCE.md) and [machine-readable lineage](data/evidence-lineage.json)
separate artifact identity, file-instance counts and execution results. A second source
review is not relabelled as a new runtime experiment. Global installation and product
totals are not inferred.

Revision r3 preserves the recorded experiments and adds portable scanning sources
and a reviewable code distribution map. Assembly checks cover saved counts, source
identities, distribution parity, document links and publication consistency. The
small screening controls parse source as data; they do not execute the target program.
Fresh installation, external reproduction of the runtime experiments and catalog
changes remain outside this verification.

[Reproduction inputs](REPRODUCIBILITY.md) · [input receipts](data/input-receipts.json) ·
[validation](VALIDATION.json) · [package manifest](MANIFEST.json).
