# F-11 — SSE authorization injection lacks explicit origin binding

## Summary

The SSE transport wrapper in `mcp-remote` versions `0.1.16` through `0.1.38`
adds `Authorization: Bearer <token>` to wrapped requests without independently
checking that the destination origin matches the server for which the token was
issued.

## Security impact

If a redirect, SDK behavior change, or substituted transport causes the wrapper
to receive a cross-origin URL, the bearer token may be sent to an unintended
destination.

## Evidence and limitations

- Confirmed by source review.
- The reviewed SDK normally supplies server-relative transport URLs.
- Exploitability therefore depends on an additional redirect or transport
  condition. This is published as a conditional defense-in-depth finding, not as
  evidence of observed token theft.

## Classification

- CWE-200: Exposure of Sensitive Information
- CWE-20: Improper Input Validation
- Suggested CVSS 3.1: `5.3 (AV:N/AC:H/PR:N/UI:R/S:U/C:H/I:N/A:N)`
- CVE: pending public-record binding

## Remediation

Bind every token to its issuer, audience, resource, and expected destination
origin. Add the header only after comparing canonical origins, and strip
credentials before any redirect or cross-origin request.
