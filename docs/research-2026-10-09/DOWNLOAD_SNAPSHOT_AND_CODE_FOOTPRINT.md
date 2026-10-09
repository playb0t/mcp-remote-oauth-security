# Download snapshot and observed code footprint

Researcher: Alex Gercog (playb0t)

This appendix records saved npm responses and counts selected matching files in two
existing research samples. The responses were read on **9 October 2026**, with
request timestamps from **15:36:34 through 15:36:38 UTC**. This publication uses that
saved snapshot; it makes no fresh download request.

## Downloads across all package versions

npm reported **19,060,907 downloads of all versions of mcp-remote** from
**17 February through 7 October 2026**. The start date is the recorded research
window, not the first affected release or the CVE publication date.

The range request asked for data through 9 October. Its response includes zero-valued
rows for 8 and 9 October, while the separate last-day response identifies 7 October
as the latest available day. Those two later rows are treated as unavailable data.
The sum through the availability boundary equals both the raw daily sum and the
separate point response: **19,060,907**.

| Saved measure | Count | Meaning |
| --- | ---: | --- |
| Available-period downloads | 19,060,907 | All package versions, 17 February through 7 October |
| Latest available day | 144,188 | All versions, 7 October |
| Dated last-week point response | 602,570 | All versions, 1 through 7 October |

These are npm download counts. They do not identify unique installations, users or
downloads exclusively of affected versions. Nine dates within the available period
have zero counts. The saved responses cannot distinguish genuine zeros from delayed
aggregation, and historical totals may be revised.

## Recent per-version snapshot

| Selection within the saved version response | Downloads |
| --- | ---: |
| All version labels | 602,570 |
| Union of stable versions in the recorded published CVE-description bands | 148,814 |
| The 58 stable releases studied in the historical helper run | 562,350 |

The latter two groups overlap. They must not be added together or used to assign
version shares to the historical total. Nonstable labels remain in the all-version
total and are excluded from the two selected stable-version groups.

The version API supplies **no start or end dates**. Its total equals the separate
dated last-week count, but that numerical agreement does not establish the version
response's exact dates. The [saved version selections](data/downloads-and-signature-footprint-2026-10-09/version-selection.json)
list the inclusive CVE-description bands and all 58 studied versions. These saved
counting definitions are separate from the repository's original advisory intervals
and any subsequent catalog changes.

## Observed matching files

A file occurrence is one selected file within a package/version archive or one
selected Git file record. Multiple matching functions in the same occurrence count once.
Distinct content is counted by the full file's SHA-256.

| Scope | File occurrences | Distinct file contents by SHA-256 |
| --- | ---: | ---: |
| 48 selected npm archives | 15 | See the combined registry |
| 232 selected GitHub file records | 9 | See the combined registry |
| Both samples, including upstream controls | 24 | 23 |
| Both samples, excluding upstream controls | 22 | 21 |

npm inclusion requires at least one of `reference-function-match`,
`md5-config-namespace` or `md5-input-with-oauth-storage-context`.
The Git count uses the separately reviewed delimiter-MD5 records, including structural
matches below the function-similarity threshold. The methods retain their own scope.

The [file registry](data/downloads-and-signature-footprint-2026-10-09/signature-footprint.json)
records package/version or repository/commit, member path, SHA-256, locator and the
upstream-control flag. One repeated SHA-256 accounts for the difference between 24
occurrences and 23 contents. Different compiled and source files can still represent
the same implementation.

These are selected signature matches in the named samples. They do not automatically
establish CVE applicability, unique products, installed copies or the total number of
copies on the internet. A package and its repository can also describe the same project.

## Sources and recalculation

The [data index](data/downloads-and-signature-footprint-2026-10-09/README.md) links all
responses, definitions and scripts. The [receipts](data/downloads-and-signature-footprint-2026-10-09/receipts.json)
retain each request URL, UTC reading time, HTTP status, byte count and SHA-256.
Raw response bytes and saved summaries are preserved. The offline calculator checks
the responses and reconstructs all 24 file records from the existing public ledgers.

[Offline verification result](data/downloads-and-signature-footprint-2026-10-09/RECOUNT.json) ·
[Source and adaptation provenance](data/downloads-and-signature-footprint-2026-10-09/provenance.json) ·
[Package checksums](MANIFEST.json)
