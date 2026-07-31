# Methodology and limitations

## Target lock

- Repository: `geelen/mcp-remote`
- Canonical URL: <https://github.com/geelen/mcp-remote>
- Reviewed version: `0.1.38`
- Reviewed commit: `02619aff36e79803d7c894e8c8ae7b34b2d11f8c`
- First review date: 2026-02-17
- Reverification date: 2026-05-03
- Current-main check: 2026-07-31

The npm `latest` tag and upstream `main` still resolved to the reviewed version
and commit on 2026-07-31.

## Review method

The review used:

- static source review of the OAuth discovery, callback, persistence, browser,
  and SSE transport paths;
- source-to-sink tracing for every server-controlled URL;
- review of every relevant `fetch()` call and redirect boundary;
- completeness analysis of the patch for CVE-2025-6514;
- dependency review of `strict-url-sanitise` and the MCP TypeScript SDK;
- localhost-only canary fixtures for the SSRF findings;
- a second clean-clone verification on 2026-05-03;
- current release, commit, and public-issue checks immediately before
  disclosure.

## Safety boundary

No deployed instance, third-party service, real credential, or real user data
was accessed. Dynamic validation was restricted to local fixtures controlled by
the researcher. This repository intentionally does not publish weaponized
exploit code.

## Evidence classification

- **Local PoC, reverified:** the source-to-sink behavior produced the expected
  request against a localhost-only canary on both verification dates.
- **Source review:** the path is present in the reviewed source, but no
  real-world target was contacted to demonstrate impact.
- **Conditional defense-in-depth:** the weakness becomes exploitable only if a
  named transport or redirect condition routes a request away from the
  authenticated origin.

## Duplicate and history check

The reviewed upstream commit and package release have not changed since
2026-02-05. Public issue searches performed on 2026-07-31 found OAuth
interoperability reports involving `resource_metadata` and
`authorization_servers`, but no public issue describing the SSRF, cloud-metadata,
MD5 collision, or redirect-validation mechanisms disclosed here.

Private reports are not visible, so complete duplicate exclusion is impossible.

## Important non-findings and corrections

The original review also considered missing OAuth `state` validation in the MCP
TypeScript SDK. After technical review, mandatory PKCE was recognized as a
substantial control against the classical authorization-code injection
scenario. That candidate was downgraded to a defense-in-depth recommendation
and is not part of this seven-advisory publication.

Three additional low-severity hardening observations were also excluded from
the CVE set. This disclosure counts only the seven findings listed in the main
index.
