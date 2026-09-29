# F-11 — Explicit token-origin binding as transport hardening

## Summary

The SSE transport wrapper is present in `mcp-remote` versions `0.0.18` through
`0.1.38`. The wrapper adds `Authorization: Bearer <token>` to wrapped requests
without performing its own origin comparison.

## Current positive controls

In the reviewed dependency set, `@modelcontextprotocol/sdk@1.25.3` checks that
the SSE endpoint origin matches the connection origin. The pinned
`undici@7.12.0` redirect implementation also removes authorization and cookie
credentials on a cross-origin redirect. These controls refute the original
claim of a current token-forwarding exploit path.

## Defense-in-depth relevance

An explicit origin check at the wrapper boundary would protect against a future
SDK behavior change or a substituted transport that lacks the current positive
controls. No token theft or current cross-origin bearer forwarding was
demonstrated.

## Classification

- Evidence: defense-in-depth / corrected claim
- CVSS: not applicable to the current evidence
- CVE: CVE-2026-52001 (published 2026-09-24)

## Remediation

Bind every token to its issuer, audience, resource, and expected destination
origin. Add the header only after comparing canonical origins, and strip
credentials before any redirect or cross-origin request.
