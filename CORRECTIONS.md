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
  cover. The cover is visual orientation; the Mermaid map and advisory index
  remain the authoritative technical explanation.
- Replaced “upgrade guidance” with “mitigation guidance” because no later
  upstream release was known at disclosure time.
