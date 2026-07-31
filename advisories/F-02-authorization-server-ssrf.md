# F-02 — Blind SSRF via `authorization_servers[]`

## Summary

`mcp-remote` versions `0.1.32` through `0.1.38` derive an OAuth authorization
server origin from server-controlled Protected Resource Metadata and fetch
`/.well-known/oauth-authorization-server` without validating that origin.

## Security impact

Because the path is fixed but the origin is attacker-selected, the behavior can
support blind host discovery and internal service probing. It can occur after
F-01 during the same OAuth discovery flow. No response exfiltration was
demonstrated.

## Preconditions

- The attacker controls the MCP server or the Protected Resource Metadata.
- The client follows the advertised `authorization_servers[]` entry.
- The destination is reachable from the client host.

## Evidence

Reverified on 2026-05-03 using a localhost-only canary. The canary received
requests during both initial probing and transport setup.

## Classification

- CWE-918: Server-Side Request Forgery
- Evidence: localhost PoC, reverified
- CVSS: not assigned in this corrective release
- CVE: pending public-record binding

## Remediation

Validate authorization-server origins before discovery, apply private-address
and DNS-resolution controls, and preserve an auditable resource-to-authorization
server trust decision for the lifetime of the OAuth flow.
