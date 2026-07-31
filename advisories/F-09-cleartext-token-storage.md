# F-09 — OAuth credentials stored in cleartext

## Summary

`mcp-remote` versions `0.1.16` through `0.1.38` persist OAuth access tokens,
refresh tokens, client secrets, and PKCE verifier material as cleartext files
under `~/.mcp-auth/`.

## Security impact

File permissions reduce cross-user access but do not protect credentials from
same-user malware, overly broad backup or sync tooling, or forensic acquisition
of the profile directory.

## Evidence and limitations

- Confirmed by source review.
- Later versions set restrictive permissions on individual files.
- The finding concerns encryption and secret-storage boundaries, not a bypass of
  operating-system user isolation.

## Classification

- CWE-312: Cleartext Storage of Sensitive Information
- Suggested CVSS 3.1: `5.5 (AV:L/AC:L/PR:L/UI:N/S:U/C:H/I:N/A:N)`
- CVE: pending public-record binding

## Remediation

Store long-lived OAuth credentials in the operating system's native secret
store. If a file fallback is unavoidable, use authenticated encryption with a
key protected outside the same directory and preserve restrictive permissions.
