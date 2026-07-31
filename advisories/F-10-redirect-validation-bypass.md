# F-10 — Redirect following bypasses one-time URL validation

## Summary

OAuth discovery requests in `mcp-remote` versions `0.1.16` through `0.1.38`
inherit the Fetch API's automatic redirect behavior. Redirect hops are followed
without an application-level destination check on each hop.

## Security impact

A public attacker-controlled URL can redirect the client to localhost, a private
network, or a cloud metadata endpoint. This bypasses a remediation that validates
only the initial URL.

## Preconditions

- The client makes an OAuth discovery request to an attacker-controlled URL.
- The endpoint returns a redirect to a destination reachable by the client.
- The application does not revalidate the new origin and resolved address.

## Evidence and limitations

The behavior was confirmed by source review of the discovery fetch paths. No
external or cloud target was contacted.

## Classification

- CWE-918: Server-Side Request Forgery
- CWE-601: URL Redirection to Untrusted Site
- Suggested CVSS 3.1: `7.5 (AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:N/A:N)`
- CVE: pending public-record binding

## Remediation

Use manual redirect handling. Resolve, classify, and authorize every destination
before sending the next request. Enforce a small redirect budget and stop when
the origin or address class violates policy.
