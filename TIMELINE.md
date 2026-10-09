# Coordinated disclosure timeline

| Date | Event |
|---|---|
| 2026-02-05 | Upstream published `mcp-remote 0.1.38`, commit `02619aff36e79803d7c894e8c8ae7b34b2d11f8c`. |
| 2026-02-17 | Source review and initial localhost-only validation completed. |
| 2026-02-17 | Private advisory submitted to the upstream GitHub security channel. |
| 2026-05-03 | Clean-clone reverification completed after no maintainer acknowledgement or new release. |
| 2026-05-03 | F-02 promoted from source-review evidence to localhost-PoC verified; F-08 through F-11 added. |
| 2026-05-06 | Coordination request submitted to CERT/CC (VRF#26-05-BQXRZ); automated acknowledgement received, no further response. |
| 2026-05-18 | Original 90-day disclosure window elapsed. |
| 2026-07-17 | MITRE, acting as CNA, asked the author to verify the submitted details; the author confirmed them. |
| 2026-07-31 | Upstream release and commit checked again; public disclosure package `v1.0.0` published. |
| 2026-07-31 | Post-publication audit corrected affected ranges, provisional severity data, F-04/F-11 classifications, and the README diagram for `v1.0.1`. |
| 2026-09-24 | MITRE published CVE-2026-51994, CVE-2026-51995, CVE-2026-51996, CVE-2026-51997 and CVE-2026-52001, each referencing the `v1.0.1` advisory paths. |
| 2026-09-29 | Metadata release `v1.0.2`: author named, published records added to the advisories. |
| 2026-09-30 | Article published: "The Server Named the URL, the Client Went: Five mcp-remote CVE Records" (LinkedIn, Alex Gercog); mirrored in `docs/article-2026-09-30.md`. |
| 2026-09-30 | Update request sent to the CNA: researcher credit, the status of the two reserved identifiers, and structured affected data for the five records. |
| 2026-10-06 | CISA-ADP scored CVE-2026-52001 (CVSS 3.1 7.5 High, CWE-200); all five records now carry a CISA score. |
| 2026-10-09 | Research continuation published in `docs/research-2026-10-09/`: the published `0.14.3` CLI tested in full in three local stdio scenarios (the F-01 / F-02 request path, CVE-2026-51994 / CVE-2026-51995), selected discovery helpers executed across 58 stable releases (`0.1.32` through `0.14.3`), and a code distribution map of matching fragments under other package names; see the [research dossier](docs/research-2026-10-09/RESEARCH_DOSSIER.md). No fixed release identified; published CVE ranges unchanged. |

## Coordination status

- Maintainer acknowledgement: none received before disclosure.
- Fixed release: none known before disclosure.
- Current version at disclosure: `0.1.38`.
- Exploitation in the wild: not known.

The extended interval beyond the original 90-day window was used for CVE
coordination and publication preparation. Disclosure is intended to help users
evaluate exposure while giving upstream a concrete remediation baseline.
