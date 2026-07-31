# F-02 — Blind SSRF via `authorization_servers[]`

## Summary

`mcp-remote` versions `0.1.16` through `0.1.38` derive an OAuth authorization
server origin from server-controlled Protected Resource Metadata and fetch
`/.well-known/oauth-authorization-server` without validating that origin.

## Security impact

Because the path is fixed but the origin is attacker-selected, the behavior
supports blind host discovery and internal service probing. It can be chained
with F-01 during the same OAuth discovery flow.

## Preconditions

- The attacker controls the MCP server or the Protected Resource Metadata.
- The client follows the advertised `authorization_servers[]` entry.
- The destination is reachable from the client host.

## Evidence

Reverified on 2026-05-03 using a localhost-only canary. The canary received
requests during both initial probing and transport setup.

## Classification

- CWE-918: Server-Side Request Forgery
- Suggested CVSS 3.1: `4.3 (AV:N/AC:L/PR:N/UI:R/S:U/C:L/I:N/A:N)`
- CVE: pending public-record binding

## Remediation

Validate authorization-server origins before discovery, apply private-address
and DNS-resolution controls, and preserve an auditable resource-to-authorization
server trust decision for the lifetime of the OAuth flow.
