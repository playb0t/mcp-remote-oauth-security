# F-04 — MD5-based storage namespace hardening

## Summary

`mcp-remote` versions `0.0.14` through `0.1.38` use MD5-derived prefixes to
separate per-server OAuth state and token files.

## Security relevance

MD5 does not provide modern collision resistance and is an unsuitable primitive
for a security-sensitive namespace. Replacing it would reduce the chance of
future namespace ambiguity and make the construction easier to reason about.

## Correction and limitations

The original `v1.0.0` text overstated the practical mechanism. A chosen-prefix
collision lets an attacker construct suffixes for two attacker-chosen prefixes;
it does not demonstrate a practical collision against an already fixed trusted
identifier. That latter claim would require a second-preimage result. No token
namespace takeover or real-token access was demonstrated.

## Classification

- CWE-328: Use of Weak Hash
- Evidence: defense-in-depth / corrected claim
- CVSS: not applicable to the current evidence
- CVE: no public record claimed

## Remediation

Replace MD5 with a collision-resistant construction such as SHA-256 and include
the full canonical server identity and configuration discriminator in the
namespace. Treat a hash as a filename encoding, not as proof of server identity.
