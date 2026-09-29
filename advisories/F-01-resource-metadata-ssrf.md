# F-01 — SSRF via unvalidated `resource_metadata`

## Summary

`mcp-remote` versions `0.1.32` through `0.1.38` accept a
`resource_metadata` URL from a remote MCP server's `WWW-Authenticate` header and
fetch it without an explicit protocol, hostname, or private-address policy.

## Security impact

An attacker-controlled MCP server can cause the client to issue an HTTP request
to localhost services, private network addresses, or cloud metadata endpoints
reachable from the user's machine. The localhost canary demonstrated request
issuance; it did not demonstrate response exfiltration.

## Preconditions

- A user configures or connects to an attacker-controlled MCP server.
- The server returns a `401` response containing a crafted
  `WWW-Authenticate` header.
- The selected destination is reachable from the client host.

## Evidence

- Confirmed with a localhost-only canary on 2026-02-17.
- Reconfirmed against `0.1.38` / `02619aff...` on 2026-05-03.
- No external service or real cloud metadata endpoint was contacted.

## Classification

- CWE-918: Server-Side Request Forgery
- Evidence: localhost PoC, reverified
- CVSS: not assigned by the researcher; CISA's assessment is on the CVE line
- CVE: CVE-2026-51994 (published 2026-09-24; CISA-ADP CVSS 3.1 9.1 Critical)

## Remediation

Apply a single outbound-destination policy before every OAuth discovery request:

- permit only expected HTTP(S) schemes;
- resolve and reject loopback, link-local, private, multicast, and reserved
  destinations;
- bind discovery to the expected resource origin unless the protocol explicitly
  authorizes a different origin;
- apply the same policy after DNS resolution and on every redirect hop.
