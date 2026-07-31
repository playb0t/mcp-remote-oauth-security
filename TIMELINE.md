# Coordinated disclosure timeline

| Date | Event |
|---|---|
| 2026-02-05 | Upstream published `mcp-remote 0.1.38`, commit `02619aff36e79803d7c894e8c8ae7b34b2d11f8c`. |
| 2026-02-17 | Source review and initial localhost-only validation completed. |
| 2026-02-17 | Private advisory submitted to the upstream GitHub security channel. |
| 2026-05-03 | Clean-clone reverification completed after no maintainer acknowledgement or new release. |
| 2026-05-03 | F-02 promoted from source-review evidence to localhost-PoC verified; F-08 through F-11 added. |
| 2026-05-18 | Original 90-day disclosure window elapsed. |
| 2026-07-31 | Upstream release and commit checked again; public disclosure package `v1.0.0` published. |
| 2026-07-31 | Post-publication audit corrected affected ranges, provisional severity data, F-04/F-11 classifications, and the README diagram for `v1.0.1`. |

## Coordination status

- Maintainer acknowledgement: none received before disclosure.
- Fixed release: none known before disclosure.
- Current version at disclosure: `0.1.38`.
- Exploitation in the wild: not known.

The extended interval beyond the original 90-day window was used for CVE
coordination and publication preparation. Disclosure is intended to help users
evaluate exposure while giving upstream a concrete remediation baseline.
