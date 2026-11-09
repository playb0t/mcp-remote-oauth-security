# WinCC OA response: vendor case closed, upstream bridge issue remains

Recorded by Alex Gercog (playb0t), 9 November 2026.

WinCC OA accepted the report for its tracking and documentation, released **v1.5.3**, and closed **issue #40 after the documentation release shipped**. This does not record a fix in `mcp-remote`. The bridge pin remains `0.14.3`; the same static-Bearer behavior was measured in `0.14.3` and `0.16.5`.

## Vendor assessment

In the [maintainer response](https://github.com/winccoa/winccoa-ae-js-mcpserver/issues/40#issuecomment-6741767385), m-stadt clarified:

- Siemens notification **236904 corresponds to CVE-2026-51995 (F-02)** and lists 0.1.39 as the fix, citing upstream [PR #240](https://github.com/punkpeye/mcp-remote/pull/240). The maintainer said that change only touches scope handling. Given the reporter's reproductions, WinCC OA **no longer treats CVE-2026-51995 as resolved**.
- **CVE-2026-51994 (F-01) is not covered by that notification.** The maintainer stated that no fixed release exists.
- Both records will be reassessed in their vulnerability monitoring. Completion of that internal reassessment is not verified here.
- The pin stays at 0.14.3 until an upstream fix is verified; moving to 0.16.5 would not address the observed behavior.

This is a change in **the vendor's assessment and OSS documentation**. It is not a claim that a CNA changed the official CVE affected ranges. The private Siemens notification was not available to the researcher; its mapping and claimed fix are attributed to the maintainer.

## What shipped

[PR #41](https://github.com/winccoa/winccoa-ae-js-mcpserver/pull/41) merged at 13:56:24 UTC. [v1.5.3](https://github.com/winccoa/winccoa-ae-js-mcpserver/releases/tag/v1.5.3) was published at 13:57:12 UTC, 9 November 2026.

The release adds or updates the README security note, client guidance, QUICKSTART, TROUBLESHOOTING, OSS.md, CHANGELOG and SECURITY.md, with version/SBOM metadata. The manifest dependency map is unchanged from 1.5.2 and `mcp-remote` remains 0.14.3. The PR changes no JavaScript/TypeScript source files. Release assets were listed, not installed or executed in this follow-up.

The published [security note](https://github.com/winccoa/winccoa-ae-js-mcpserver/blob/v1.5.3/README.md#mcp-remote-security-note) describes metadata redirection and possible forwarding of the configured Bearer. It also states that the vendor has not independently verified the reporter's reproductions. The [OSS entry](https://github.com/winccoa/winccoa-ae-js-mcpserver/blob/v1.5.3/OSS.md) no longer treats CVE-2026-51995 as resolved.

## Closure and remaining risk

The [closure comment](https://github.com/winccoa/winccoa-ae-js-mcpserver/issues/40#issuecomment-6741905167) says the documentation changes shipped and the pin remains until a verified upstream fix. GitHub records issue #40 closed at 14:00:38 UTC.

**Closed:** this vendor interaction and delivery of revised documentation/status.

**Still unresolved:** the reported `mcp-remote` metadata/static-Bearer behavior. The documentation release is not a code repair or a verified fixed upstream release. The broader upstream research remains separate and open.

[Two-version traces, controls and procedure](../../research-2026-11-09-static-bearer/README.md) remain unchanged. This vendor-response record ran no new product tests and does not turn loopback evidence into a WinCC OA, desktop, TLS or production exploit demonstration.

For future security reports, the project's new [SECURITY.md](https://github.com/winccoa/winccoa-ae-js-mcpserver/blob/v1.5.3/SECURITY.md) directs reports to Siemens ProductCERT. No new vendor report or comment was sent as part of this record.

[Structured disposition](data/disposition.json) · [Comment source locators and summaries](data/maintainer-comments.json)
