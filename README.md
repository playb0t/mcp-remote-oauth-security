<p align="center">
  <img src="assets/mcp-remote-trust-boundaries.png"
       alt="Stylized OAuth trust-boundary cover for mcp-remote security research"
       width="100%">
</p>

<h1 align="center">mcp-remote OAuth Trust-Boundary Security Advisories</h1>

<p align="center">
  <strong>Seven evidence-bounded advisory records for
  <code>geelen/mcp-remote</code>. Relevant versions differ by finding and extend
  through the reviewed release, <code>0.1.38</code>.</strong>
</p>

<p align="center">
  <a href="TIMELINE.md"><img alt="Disclosure date" src="https://img.shields.io/badge/disclosure-2026--07--31-8b5cf6"></a>
  <a href="METHODOLOGY.md"><img alt="Research scope" src="https://img.shields.io/badge/scope-public_source_%2B_local_fixtures-2563eb"></a>
  <a href="https://github.com/geelen/mcp-remote"><img alt="Reviewed upstream release" src="https://img.shields.io/badge/reviewed_upstream-0.1.38-b91c1c"></a>
  <img alt="Advisories" src="https://img.shields.io/badge/advisories-7-f59e0b">
  <a href="CORRECTIONS.md"><img alt="Corrective release" src="https://img.shields.io/badge/release-v1.0.1-58a6ff"></a>
</p>

```text
REMOTE METADATA IS NOT PASSIVE DATA.
Every URL, redirect, origin, and credential handoff is a trust decision.
```

## Executive summary

`mcp-remote` bridges stdio-only MCP clients to remote MCP servers and performs
OAuth discovery on their behalf. This makes remote-server metadata a security
boundary: the client must not treat server-selected URLs, redirects, or
credential destinations as trusted merely because they appear during OAuth
discovery.

The earlier [CVE-2025-6514](https://nvd.nist.gov/vuln/detail/CVE-2025-6514)
fixed command injection in the browser-launch path in version `0.1.16`.
Our review identified adjacent OAuth discovery, local persistence, browser, and
transport-boundary concerns in the current release, `0.1.38`. The relevant code
paths entered the release history at different times; the exact range is stated
in each advisory.

The reviewed trust boundaries are summarized below:

<p align="center">
  <a href="assets/mcp-remote-trust-boundary-map.png">
    <img
      src="assets/mcp-remote-trust-boundary-map.png"
      alt="OAuth trust-boundary map for seven mcp-remote security advisory records"
      width="100%">
  </a>
</p>

The image is a control and data-dependency map, not a packet-level sequence
diagram. Full finding names, version ranges, and evidence classes remain in the
index below.

Two findings were reverified with localhost-only canaries. Three remain bounded
source-review findings. Two stable IDs now document defense-in-depth or
corrected claims. These evidence classes are intentionally not collapsed.

> [!NOTE]
> `v1.0.1` corrects the blanket version range, removes unsupported provisional
> severity scores, and narrows F-04 and F-11. See
> [CORRECTIONS.md](CORRECTIONS.md).

## Advisory index

The identifiers below are stable research IDs. If a public CVE record is issued
for an eligible mechanism, it is added to the corresponding file. On 24 September
2026 MITRE published CVE records for F-01, F-02, F-04, F-08 and F-11; each of those
advisories names its record in its Classification block, with CISA's score where
one has been assigned.

| Research ID | Advisory | Relevant versions | Evidence |
|---|---|---|---|
| [F-01](advisories/F-01-resource-metadata-ssrf.md) | SSRF via unvalidated `resource_metadata` URL | `0.1.32–0.1.38` | Local PoC, reverified |
| [F-02](advisories/F-02-authorization-server-ssrf.md) | Blind SSRF via `authorization_servers[]` | `0.1.32–0.1.38` | Local PoC, reverified |
| [F-04](advisories/F-04-md5-token-isolation.md) | MD5-based storage namespace hardening | `0.0.14–0.1.38` | Defense-in-depth / corrected |
| [F-08](advisories/F-08-browser-url-validation.md) | Incomplete internal-address validation before browser launch | `0.1.16–0.1.38` | Source review |
| [F-09](advisories/F-09-cleartext-token-storage.md) | OAuth credentials stored in cleartext | `0.0.11–0.1.38` | Source review |
| [F-10](advisories/F-10-redirect-validation-bypass.md) | Redirect following bypasses one-time URL validation | `0.1.32–0.1.38` | Source review |
| [F-11](advisories/F-11-sse-token-origin-scope.md) | Explicit token-origin binding as transport hardening | `0.0.18–0.1.38` | Defense-in-depth / corrected |

No numeric CVSS score is asserted in this corrective release. A CNA may assign
or merge records differently after reviewing the demonstrated mechanisms and
their impact.

> [!IMPORTANT]
> The `F-*` identifiers are stable research IDs. A CVE identifier appears in an
> advisory only once a public CVE record binds it to that advisory; F-09 and F-10
> carry none.

## Current upstream state

- Reviewed release: `0.1.38`
- Reviewed and revalidated commit:
  `02619aff36e79803d7c894e8c8ae7b34b2d11f8c`
- Initial verification: 2026-02-17
- Reverification: 2026-05-03
- Current-main check: 2026-07-31
- Later upstream release: none known as of disclosure
- Known exploitation in the wild: none observed or claimed

## Responsible-disclosure summary

The initial private advisory was submitted on 2026-02-17. The findings were
revalidated on 2026-05-03 after no maintainer response or new release. Public
disclosure follows an extended coordination period and is intended to give
users concrete mitigation, isolation, and monitoring guidance.

See [TIMELINE.md](TIMELINE.md) for the complete chronology and
[METHODOLOGY.md](METHODOLOGY.md) for scope, validation, and limitations.

## Repository map

```text
.
├── README.md                 Research overview and advisory index
├── METHODOLOGY.md            Scope, evidence classes, and limitations
├── TIMELINE.md               Coordinated-disclosure chronology
├── SECURITY.md               Publication corrections and upstream routing
├── CORRECTIONS.md            Changes made after the v1.0.0 audit
├── CITATION.cff              Stable research citation
├── assets/                   Repository visual identity
└── advisories/               One bounded technical record per finding
```

## Use and citation

Defenders, maintainers, and vulnerability databases may cite the stable
advisory URLs in this repository. Please preserve the finding ID, affected
version range, evidence class, and limitations when summarizing a record.

Machine-readable citation metadata is available in [`CITATION.cff`](CITATION.cff).

## Researcher

Discovered and reported by Alex Gercog ([playb0t](https://github.com/playb0t)).
