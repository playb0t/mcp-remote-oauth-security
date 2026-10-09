# Saved download and signature-footprint data

Snapshot date: 9 October 2026. Package: mcp-remote.

[The appendix](../../DOWNLOAD_SNAPSHOT_AND_CODE_FOOTPRINT.md) defines the metrics and
their limits. All nine supplied JSON files below are byte-identical copies of the
saved source. No npm endpoint was queried to prepare this publication.

| File | Role |
| --- | --- |
| [summary.json](summary.json) | Historical all-version totals, availability boundary and zero-valued dates |
| [daily.json](daily.json) | Raw daily response, including the unavailable 8–9 October zero rows |
| [point.json](point.json) | Raw aggregate response for the requested historical interval |
| [last-day.json](last-day.json) | Raw latest-available-day response |
| [last-week.json](last-week.json) | Raw weekly response with dates |
| [versions-week.json](versions-week.json) | Raw version counts without dates |
| [recent-version-counts.json](recent-version-counts.json) | Saved stable-version subtotals and their limits |
| [signature-footprint.json](signature-footprint.json) | The 24 included file occurrences and deduplication totals |
| [receipts.json](receipts.json) | Request URLs, reading times and exact raw-response hashes |
| [version-selection.json](version-selection.json) | Explicit stable intervals, selected release labels and ledger hashes |
| [RECOUNT.json](RECOUNT.json) | Offline recalculation result |
| [provenance.json](provenance.json) | Source identities and script adaptation notes |
| [source-manifest.json](source-manifest.json) | Original source-directory hashes, before script adaptation |
| [counter-captions.json](counter-captions.json) | Proposed counter labels, with the same definitions; no site change |

The source manifest describes the original input files, including the original
scripts. It is not a checksum manifest for the adapted public scripts. Their current
hashes are recorded in the [research package manifest](../../MANIFEST.json).

## Offline calculation

Run from this directory with Python 3.10 or newer; only the standard library is used:

```sh
python -B summarize_footprint.py
```

The calculator checks all five response receipts, daily/point agreement, availability,
the recorded stable-version bands, the exact 58-release set, and full row equality
against the [npm file ledger](../code-distribution.json) and [Git registry](../git-232.json).
It also checks the SHA-256 of those ledgers and the [release matrix](../release-history.json).
The public matrix uses `helper_runtime_status == "passed"`; this corresponds to the
saved private procedure's `three_runtime_checks_passed` status.

The script reads the saved snapshot and does not write into it. Optional
`--output NEW_FILE.json` writes a result only if that file does not exist.
No source file being counted is executed.

## Optional collection into a new dated directory

[collect.py](collect.py) retains the original five query URLs, including the fixed
17 February through 9 October requested range. It requires an explicit new output
directory and refuses an existing one:

```sh
python -B collect.py --output ../NEW-DATED-SNAPSHOT
```

This command would make network requests and was not used for live collection in this publication. Its output-preservation and failure handling were checked with local fixtures.
A later request may return revised historical values or a different latest-day/week
response. Keep those responses in their own dated snapshot. If a required response is missing, the collector preserves the partial responses and
receipts, exits nonzero and emits no numeric summary. A successful collection writes
raw responses, receipts and an intermediate aggregate summary; it does not replace
the reviewed file registry or manufacture version-response dates.
