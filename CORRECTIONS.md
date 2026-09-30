# Corrections in v1.0.1

`v1.0.1` is a corrective release of the research package. The original
`v1.0.0` tag remains an immutable historical snapshot.

## Version ranges

The original README applied `0.1.16–0.1.38` to all seven records. Full release
history shows that the relevant paths entered the package at different times:

| ID | Corrected relevant versions |
|---|---|
| F-01 | `0.1.32–0.1.38` |
| F-02 | `0.1.32–0.1.38` |
| F-04 | `0.0.14–0.1.38` |
| F-08 | `0.1.16–0.1.38` |
| F-09 | `0.0.11–0.1.38` |
| F-10 | `0.1.32–0.1.38` |
| F-11 | `0.0.18–0.1.38` |

For F-04 and F-11, these are the releases containing the relevant construction,
not a claim that every listed release is exploitable.

## Severity scores

The original package included researcher-proposed CVSS v3.1 scores. Three
displayed numbers did not match their vectors:

- F-04: published `5.9`; the vector calculates to `6.3`;
- F-08: published `5.4`; the vector calculates to `5.0`;
- F-10: published `7.5`; the vector calculates to `6.5`.

The corrective release removes all provisional numeric scores because the
demonstrated evidence does not independently establish every impact metric.
Future CNA records may assign or merge severity differently.

## Reclassified records

### F-04

The original practical collision claim confused a chosen-prefix collision with
a second-preimage problem against an already fixed trusted identifier. F-04 now
records MD5 namespace hardening; no practical token namespace takeover is
claimed.

### F-11

The pinned SDK checks SSE endpoint origin, and the pinned HTTP implementation
removes credentials on cross-origin redirects. F-11 now records an explicit
wrapper-level origin check as defense-in-depth; no current token-forwarding
exploit is claimed.

## Presentation

- Replaced the long horizontal “headline chain” with a compact vertical
  trust-boundary map.
- Replaced the original abstract eight-marker hero with a structured three-zone
  cover. The cover is visual orientation; the trust-boundary map and advisory index
  remain the authoritative technical explanation.
- Replaced “upgrade guidance” with “mitigation guidance” because no later
  upstream release was known at disclosure time.

## v1.0.2

Metadata release of 29 September 2026. The author is named in CITATION.cff and README.md as Alex Gercog (playb0t), and the five CVE records MITRE published on 24 September 2026 are added to the Classification blocks of F-01, F-02, F-04, F-08 and F-11, with CISA's scores where assigned; the F-04 CVSS line now points to CISA's assessment. No evidence class, version range or correction text changed. The v1.0.1 paths referenced by the CVE records are unchanged. Between the two tags the README's Mermaid map was also replaced by `assets/mcp-remote-trust-boundary-map.png` with two explanatory sentences (commit 96586453, 31 July 2026), and the advisory-index paragraph and the IMPORTANT note were reworded to state which advisories carry records.

## After v1.0.2 (main, 29 September 2026)

Wording fixes on the main branch after the v1.0.2 tag, none touching evidence, ranges or the tagged paths: the README calls `0.1.38` the release current at disclosure and dates the upstream-state section, adding the later releases `0.1.39` through `0.14.3` and the repository move; the sentence under the advisory index now states that the CVSS values on the CVE lines are CISA-ADP assessments reported as published; CITATION.cff drops the invalid top-level `type: report` (CFF 1.2.0 allows only software or dataset there) and carries the report citation in `preferred-citation`; TIMELINE.md gains the 24 and 29 September rows; METHODOLOGY.md dates its unchanged-upstream statement; the CVSS lines of F-01, F-02 and F-08 use the F-04 wording; F-11 names the `v1.0.0` text as the claim its controls refute.

Later on 29 September 2026 the README gained a dated «Registry status» section: the CISA-ADP scores with their dates, the NVD status, the state of the five records in the GitHub Advisory Database and in OSV, the empty structured `affected` field, and the KEV check. It is a status snapshot and will be re-dated when it changes.

30 September 2026: METHODOLOGY.md ties the «Local PoC, reverified» class to the dates each advisory states (F-02 received its canary on 3 May, not on both dates); the README «Registry status» section dates the affected-field request to the CNA (sent 30 September) instead of stating it as pending.
