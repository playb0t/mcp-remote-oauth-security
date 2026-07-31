# F-08 — Incomplete internal-address validation before browser launch

## Summary

The `0.1.16` fix for CVE-2025-6514 added URL sanitization before invoking the
user's browser. In the reviewed `0.1.38` dependency set, the validation accepted
HTTP(S) URLs but did not reject loopback, private, link-local, or cloud metadata
destinations.

## Security impact

An attacker-selected OAuth authorization endpoint can open an internal URL in
the user's browser, potentially enabling internal-service interaction,
reconnaissance, or browser-mediated CSRF where the target service itself lacks
appropriate protections.

## Evidence and limitations

- Confirmed by source and dependency review.
- No internal or cloud service was contacted.
- Browser security controls and the behavior of the destination service affect
  practical impact.

## Classification

- CWE-20: Improper Input Validation
- Related class: CWE-918
- Evidence: source review
- CVSS: not assigned in this corrective release
- CVE: pending public-record binding

## Remediation

Apply explicit destination classification before browser launch. Reject
loopback, private, link-local, multicast, reserved, and metadata-service
destinations after DNS resolution, and surface the final origin to the user
before navigation.
