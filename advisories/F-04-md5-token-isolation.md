# F-04 — MD5-based OAuth token-file isolation

## Summary

`mcp-remote` versions `0.1.16` through `0.1.38` use MD5-derived prefixes to
separate per-server OAuth state and token files.

## Security impact

MD5 does not provide collision resistance. Under a chosen-prefix collision
scenario, two distinct server identifiers may resolve to the same storage
namespace, creating a path to token-state confusion, poisoning, or disclosure.

## Preconditions and limitations

- The attacker must construct a colliding server identifier against a known
  trusted identifier.
- The practical complexity is materially higher than the network SSRF findings.
- This finding is based on source review; no real token was accessed.

## Classification

- CWE-328: Use of Weak Hash
- Suggested CVSS 3.1: `5.9 (AV:L/AC:H/PR:N/UI:R/S:U/C:H/I:H/A:N)`
- CVE: pending public-record binding

## Remediation

Replace MD5 with a collision-resistant construction such as SHA-256 and include
the full canonical server identity and configuration discriminator in the
namespace. Treat a hash as a filename encoding, not as proof of server identity.
