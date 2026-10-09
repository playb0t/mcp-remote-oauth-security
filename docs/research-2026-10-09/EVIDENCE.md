# Evidence identities and accounting

The primary narrative is [RESEARCH_DOSSIER.md](RESEARCH_DOSSIER.md).
This index records the unit of each result, not a single additive exposure total.

| Canonical result group | Unit | Observations | Counted occurrences |
| --- | --- | ---: | ---: |
| published-cli | three configured CLI scenarios | 3 | 1 |
| release-history | 74 stable releases with 58 selected-helper executions | 74 | 1 |
| npm-selection | package/version archives | 48 | 1 |
| git-selection | file records | 232 | 1 |
| calibration | pinned artifacts | 10 | 1 |
| corporate | pinned artifacts | 33 | 1 |
| marketplace | pinned artifacts | 20 | 1 |

The release-history group contains 74 stable artifact records, with selected-helper
execution for 58. The complete CLI group contains three cases for 0.14.3.
The npm and Git groups retain separate package/version and file-record denominators.

The same source bytes appear in multiple retained research snapshots. Their hashes
are matched once in [input-receipts.json](data/input-receipts.json). The public
projections are purpose-specific data views, not new executions or byte-identical
copies of omitted full working logs. Data transformations are described by their scope
fields; original input hashes remain available.

The 10 + 33 + 20 screening cohorts contain 63 distinct artifact identities under the
recorded channel/name/version-or-commit/archive-hash keys. Their 8,057 source instances
are not globally deduplicated. [screening-cohorts.json](data/screening-cohorts.json)
retains those keys. [evidence-lineage.json](data/evidence-lineage.json) records reused
upstream archives and any archive overlap with the 48-package selection.

[analysis-limitations.json](data/analysis-limitations.json) distinguishes timeout flags,
process exit observations, memory failures and partial or failed parsing. It preserves
unconfirmed process-termination and whole-extension claims as false.

[ecosystem lineage](data/ecosystem-lineage.json) distinguishes repository fork metadata,
distribution-family evidence, declared adapters and shared helper structures.
[search-scope.json](data/search-scope.json) distinguishes modern web Code Search,
REST Search code and the local size counter.

All package files except the self-referential manifest and its seal are covered by
[MANIFEST.json](MANIFEST.json). [MANIFEST.sha256](MANIFEST.sha256) seals the manifest.
The validator reads these records and does not execute the retained target procedures.

## Revision r2 clarifications

The dossier names the researcher and uses author-led framing. RFC section references
are explicit linked labels. The corporate and Marketplace method is specified in
[analysis-limitations.json](data/analysis-limitations.json), including tool versions,
five-token multiset similarity, exclusive thresholds and wall-clock timing.
Cloud request conditions and their documentation receipts are recorded in
[standards.json](data/standards.json).

The existing mcp-remote-ultra row now carries the two normalized function matches,
the namespace result, member size and member checksum in
[ecosystem-lineage.json](data/ecosystem-lineage.json). This adds evidence detail to
the existing row, not another package or execution. Original experimental records,
their hashes and all cohort totals are retained.

## Revision r3: file evidence and portable screening sources

The [code distribution ledger](data/code-distribution.json) adds per-file projections
of the existing 48 npm records, 232 Git file records and 63 subsequent cohort identities.
It preserves all 8057 source instances from those three cohorts, including filtered
files and incomplete analysis. These projections are new views of saved results and
add no experimental observations. The npm reference-family method retains its recorded
statuses without receiving a new A/B/C classification.

The [portable screening source](procedures/screening/README.md) publishes the
AST-shingle pipeline separately from the recorded ast.mjs matcher. Source hashes,
adaptations, dependencies and the small offline control result are in
[data/screening-toolkit.json](data/screening-toolkit.json). The prior runtime procedures
and dependency inputs retain their bytes.
