# F-09 — OAuth credentials stored in cleartext

## Summary

`mcp-remote` versions `0.0.11` through `0.1.38` persist OAuth access tokens,
refresh tokens, client secrets, and PKCE verifier material as cleartext files
under `~/.mcp-auth/`.

## Security impact

File permissions reduce cross-user access but do not protect credentials from
same-user malware, overly broad backup or sync tooling, or forensic acquisition
of the profile directory.

## Evidence and limitations

- Confirmed by source review.
- Restrictive `0o600` permissions were added in `0.1.37`.
- The finding concerns encryption and secret-storage boundaries, not a bypass of
  operating-system user isolation.

## Classification

- CWE-312: Cleartext Storage of Sensitive Information
- Evidence: source review
- CVSS: not assigned in this corrective release
- CVE: pending public-record binding

## Remediation

Store long-lived OAuth credentials in the operating system's native secret
store. If a file fallback is unavoidable, use authenticated encryption with a
key protected outside the same directory and preserve restrictive permissions.
